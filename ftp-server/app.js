require('dotenv').config()
require('./db/connect')
require('./db/initialise')()

// module imports
const express = require('express')
const cors = require("cors")
const multer = require("multer")

// local imports
const {authenticateJWT} = require("./jwt/jwt");
const {
    getServers,
    postServers,
    getFiles,
    postFiles,
    deleteFiles,
    getDownloadFiles,
    postCreateDirectories,
    deleteDirectories,
    postRenameFiles,
    deleteServer
} = require("./controllers/controllers")
const {
    handleCustomErrors,
    handlePostgresErrors,
    handle500Errors
} = require("./errors/middleware");
const {
    ftpClose,
    ftpConnect
} = require("./ftp/middleware");

// setup
const app = express()
const PORT = process.env.PORT ?? 8080
const upload = multer({storage: multer.memoryStorage()})

// middleware
app.use(cors())
app.use(express.json())
app.use(authenticateJWT)

// endpoints
app.get("/api/servers", getServers)

app.post("/api/servers", postServers)

app.delete("/api/servers/:server", deleteServer)

app.get("/api/servers/:server/files", ftpConnect, getFiles)

app.post("/api/servers/:server/files", ftpConnect, upload.array("files", 1000), postFiles)

app.delete("/api/servers/:server/files", ftpConnect, deleteFiles)

app.get("/api/servers/:server/files/download", ftpConnect, getDownloadFiles)

app.post("/api/servers/:server/files/rename", ftpConnect, postRenameFiles)

app.post("/api/servers/:server/directories", ftpConnect, postCreateDirectories)

app.delete("/api/servers/:server/directories", ftpConnect, deleteDirectories)

app.use(ftpClose)

// error-handling middleware
app.use(handleCustomErrors)
app.use(handlePostgresErrors)
app.use(handle500Errors)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}.`)
})