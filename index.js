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
    return res.write(data)
  })
})

app.post('/threshold', (req, res) => {
  console.log('start')
  const { threshold, url } = req.body
  let formated = 'test'
  res.setHeader('Content-Type', 'image/png')
  fetch(url)
      .then(data => data.buffer())
      .then(buffer => sharp(buffer).threshold(+threshold).toBuffer())
      .then(sharped => formated = sharped)
      .catch(e => console.log(e, 'error'))
  res.end(formated)
})

app.get('/threshold', (req, res) => {
  res.sendFile(`${__dirname}/index.html`)
})


app.listen(port, () => console.log(`App listening at http://10.10.10.10:${port}`))