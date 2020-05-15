const bodyParser = require('body-parser')
const express = require('express')
const fetch = require('node-fetch')
const sharp = require('sharp')
const fs = require('fs')
const md5 = require('md5');
const app = express()
const port = 7000

const cacheWrapper = (filename, cb) => {
  fs.writeFile(`${__dirname}/cache/web/${filename}.txt`, 'Hey there! test', function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/hello', (req, res) => res.send({message: 'Hello World!'}))

app.get('/dog', (req, res) => {
  fs.readFile(`${__dirname}/public/dog.png`, (err, data) => {
    if (err) throw err
    res.setHeader('Content-Type', 'image/png')
    res.write(data)
    return res.end('')
  })
  cacheWrapper('test')
})

app.post('/threshold', async (req, res) => {
  console.log('start')
  const { threshold, url } = req.body
  await fetch(url)
      .then(data => data.buffer())
      .then(buffer => sharp(buffer).threshold(+threshold).toBuffer())
      .then(sharped => {
       res.writeHead(200, {
          'Content-Length': Buffer.byteLength(sharped),
          'Content-Type': 'image/png'
        })
        return res.end(sharped)
      })
      .catch(e => console.log(e, 'error'))
})

app.get('/threshold', (req, res) => {
  res.sendFile(`${__dirname}/index.html`)
})


app.listen(port, () => console.log(`App listening at http://10.10.10.10:${port}`))