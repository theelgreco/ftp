require('dotenv').config()

// module imports
const express = require('express')
const cors = require("cors")
const multer = require("multer")

// local imports
const {authenticateJWT} = require("./jwt/jwt");
const {
    postConnect,
    getFiles,
    postFiles,
    deleteFiles,
    getDownloadFiles,
    postCreateDirectories,
    deleteDirectories, postRenameFiles
} = require("./controllers/controllers")
const {
    handleCustomErrors,
    handlePostgresErrors,
    handle500Errors
} = require("./errors/middleware");

// setup
const app = express()
const PORT = process.env.PORT ?? 8080
const upload = multer({storage: multer.memoryStorage()})

// middleware
app.use(cors())
app.use(express.json())
app.use(authenticateJWT)

// endpoints
app.post("/api/connect", postConnect)

app.get("/api/files", getFiles)

app.post("/api/files", upload.array("files", 1000), postFiles)

app.delete("/api/files", deleteFiles)

app.get("/api/files/download", getDownloadFiles)

app.post("/api/files/rename", postRenameFiles)

app.post("/api/directories", postCreateDirectories)

app.delete("/api/directories", deleteDirectories)

// error-handling middleware
app.use(handleCustomErrors)
app.use(handlePostgresErrors)
app.use(handle500Errors)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})