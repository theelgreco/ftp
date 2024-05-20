require('dotenv').config()

// module imports
const express = require('express')
const cors = require("cors")

// local imports
const {postConnect, getFiles} = require("./controllers.js")

// setup
const app = express()
const PORT = 8080

// middleware
app.use(cors())
app.use(express.json())

// endpoints
app.post("/api/connect", postConnect)
app.get("/api/files", getFiles)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})