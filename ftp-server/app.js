require('dotenv').config()

// module imports
const express = require('express')
const cors = require("cors")
const multer = require("multer")

// local imports
const {
    postConnect,
    getFiles,
    postFiles,
    deleteFiles,
    postCreateDirectory,
    deleteDirectories
} = require("./controllers")

// setup
const app = express()
const PORT = 8080
const upload = multer({storage: multer.memoryStorage()})

// middleware
app.use(cors())
app.use(express.json())

// endpoints
app.post("/api/connect", postConnect)

app.get("/api/files", getFiles)
app.post("/api/files", upload.array("files", 1000), postFiles)
app.delete("/api/files", deleteFiles)

app.post("/api/directories", postCreateDirectory)
app.delete("/api/directories", deleteDirectories)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})