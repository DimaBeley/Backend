const express = require('express')
const app = express()
const port = 7000

app.get('/hello', (req, res) => res.send({message: 'Hello World!'}))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))