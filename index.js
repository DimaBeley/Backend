const bodyParser = require('body-parser')
const express = require('express')
const fetch = require('node-fetch')
const sharp = require('sharp')
const fs = require('fs')
const app = express()
const port = 7000

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
  res.write('<div style="margin: 100px;">\n' +
      '  <span style="color: darkseagreen">http://10.10.10.10:7000/dog</span> - dog example\n' +
      '  <form action="//10.10.10.10:7000/threshold" method="post">\n' +
      '    <input type="number" placeholder="threshold" name="threshold"><br>\n' +
      '    <input type="text" placeholder="URL" name="url"><br>\n' +
      '    <input type="submit" value="Submit">\n' +
      '  </form>\n' +
      '</div>')
  res.end('')
})


app.listen(port, () => console.log(`App listening at http://10.10.10.10:${port}`))