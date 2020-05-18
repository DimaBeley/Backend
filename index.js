const bodyParser = require('body-parser')
const express = require('express')
const fetch = require('node-fetch')
const sharp = require('sharp')
const fs = require('fs')
const md5 = require('md5');
const app = express()
const port = 7000
const cachePath = `${__dirname}/cache`

const cacheWrapper = (filename, path, cb) => {
  return new Promise((resolve, reject) => {
    const filePath = `${cachePath}/${path}/${filename}.png`

    fs.readFile(filePath, (err, data) => {
      if (err) {
        cb();
        return reject(err)
      }
      resolve(data)
    })
  })
}

const saveFile = (name, path, file) => {
  const fullPath = `${cachePath}/${path}/${name}.png`

  fs.writeFile(fullPath, file, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log(`The file was saved to cache/${path} !`)
  });
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/hello', (req, res) => res.send({message: 'Hello World!'}))

app.get('/dog', (req, res) => {
  fs.readFile(`${__dirname}/public/dog.png`, (err, data) => {
    if (err) throw err
    res.setHeader('Content-Type', 'image/png')
    return res.end(data)
  })
})

app.post('/threshold', (req, res) => {
  const { threshold, url } = req.body
  const hashUrl = md5(url)
  const hashThreshold = md5(`${hashUrl}${+threshold}`)

  cacheWrapper(hashUrl, 'web', () => fetch(url)
      .then(data => data.buffer())
      .then(buffer => {
        saveFile(hashUrl, 'web', buffer)

        return sharp(buffer).threshold(+threshold).toBuffer()
      })
      .then(sharped => {
        saveFile(hashThreshold, 'threshold', sharped)
        res.writeHead(200, {
          'Content-Length': Buffer.byteLength(sharped),
          'Content-Type': 'image/png'
        })

        return res.end(sharped)
      })
      .catch(e => console.log(e, 'error'))
  )
    .then((data) => { // png from cache
      cacheWrapper(hashThreshold, 'threshold', () => {
        sharp(data).threshold(+threshold).toBuffer()
            .then(data => {
              saveFile(hashThreshold, 'threshold', data)
              res.writeHead(200, {
                'Content-Length': Buffer.byteLength(data),
                'Content-Type': 'image/png'
              })

              return res.end(data)
            }).catch(e => console.log(e, 'ERROR'))
      })
          .then(data => { // png with threshold from cache
            res.writeHead(200, {
              'Content-Length': Buffer.byteLength(data),
              'Content-Type': 'image/png'
            })

            return res.end(data)
          })
          .catch(e => console.log(e, 'ERRPR'))

    })
      .catch(e => console.log(e, 'ERROR'))
})

app.get('/threshold', (req, res) => {
  res.sendFile(`${__dirname}/index.html`)
})


app.listen(port, () => console.log(`App listening at http://127.0.0.1:${port}`))