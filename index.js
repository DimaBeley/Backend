const express = require('express')
const fs = require('fs')
const app = express()
const port = 7000

app.get('/hello', (req, res) => res.send({message: 'Hello World!'}))

app.get('/dog', (req, res) => {
  fs.readFile(`${__dirname}/public/dog.png`, (err, data) => {
    if (err) throw err;
    res.setHeader('Content-Type', 'image/png')
    return res.write(data)
  });
})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))