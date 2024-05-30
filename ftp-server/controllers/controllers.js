const {Readable} = require("stream")

const {validateAndClean} = require("./validation.js")
const {formatPath, ResponseWritable, hashPassword} = require("./utils");
const {getUserServers, createServer, deleteServer} = require("../models/models");

exports.validateJWT = async (request, response) => {
    response.status(200).send({msg: "Your JWT is valid"})
}

exports.getServers = async (request, response, next) => {
    const {user} = request

    try {
        const servers = await getUserServers(user.slug)
        response.status(200).send({results: servers})
    } catch (error) {
        next(error)
    }
}

exports.postServers = async (request, response, next) => {
    const validData = {
        host: {
            type: String,
            default: "localhost",
            required: true
        },
        port: {
            type: Number,
            default: 21,
            required: false
        },
        user: {
            type: String,
            default: "",
            required: false,
        },
        password: {
            type: String,
            default: "",
            required: false
        },
        secure: {
            type: Boolean,
            default: true,
            required: false
        }
    }

    const {user: requestUser} = request

    try {
        const cleanedData = validateAndClean(validData, request.body)
        let {host, port, user, password, secure} = cleanedData

        // password = await hashPassword(password)

        // const {slug, timestamp, options} = await createSession(cleanedData)

        const server = await createServer(host, port, user, password, secure, requestUser.slug)
        response.status(200).send(server)

        // response.status(200).send({slug, timestamp, options})
    } catch (error) {
        next(error)
    }
}

exports.deleteServer = async (request, response, next) => {
    try {
        await deleteServer(request.user.slug, request.params.server)
        response.status(204).send({msg: "OK"})
    } catch (error) {
        next(error)
    }
}

exports.getFiles = async (request, response, next) => {
    const validData = {
        path: {
            type: String,
            required: false
        }
    }

    try {
        // validData.path.default = await request.ftpClient.pwd()

        const cleanedData = validateAndClean(validData, request.query)

        await request.ftpClient.cd(cleanedData.path)
        const files = await request.ftpClient.list(cleanedData.path)

        response.status(200).send({files, path: cleanedData.path})
    } catch (error) {
        next(error)
    }
}

exports.postFiles = async (request, response, next) => {
    const validData = {
        path: {
            type: String,
            required: true
        }
    }

    try {
        const cleanedData = validateAndClean(validData, {path: request.body.path})

        for (let i = 0; i < request.files.length; i++) {
            const file = request.files[i]

            const path = `${cleanedData.path}${file.originalname}`

            const readable = Readable.from(file.buffer)

            await request.ftpClient.uploadFrom(readable, path)
        }

        response.status(200).send({msg: `${request.files.length} files uploaded successfully to ${cleanedData.path}`})
    } catch (error) {
        next(error)
    }
}

exports.deleteFiles = async (request, response, next) => {
    const validData = {
        path: {
            type: String,
            required: false,
        },
        filenames: {
            type: Array,
            required: true,
            comparator(value) {
                return value.every((val) => {
                    return typeof val === "string" || val instanceof String
                })
            },
        }
    }

    try {
        const cleanedData = validateAndClean(validData, request.body)

        for (let i = 0; i < cleanedData.filenames.length; i++) {
            const path = formatPath(cleanedData, 'path', 'filenames', i)
            await request.ftpClient.remove(path)
        }

        response.status(200).send({msg: `${cleanedData.filenames.length} files removed successfully from ${cleanedData.path}`})
    } catch (error) {
        next(error)
    }
}

exports.postRenameFiles = async (request, response, next) => {
    const validData = {
        currentPath: {
            type: String,
            required: true,
        },
        newPath: {
            type: String,
            required: true,
        },
    }

    try {
        // const cwd = await request.ftpClient.pwd()
        // validData.currentPath.default = cwd
        // validData.newPath.default = cwd

        const cleanedData = validateAndClean(validData, request.body)

        const {currentPath, newPath} = cleanedData

        await request.ftpClient.rename(currentPath, newPath)

        response.status(200).send({success: `${currentPath} renamed to ${newPath}`})
    } catch (error) {
        next(error)
    }
}

exports.getDownloadFiles = async (request, response, next) => {
    const validData = {
        path: {
            type: String,
            required: false
        },
        filename: {
            type: String,
            required: true,
        }
    }

    try {
        const cleanedData = validateAndClean(validData, request.query)

        response.setHeader('Content-Disposition', `attachment; filename="${cleanedData.filename}"`);
        response.setHeader('Content-Type', 'application/octet-stream');

        const writable = new ResponseWritable(response)

        const path = formatPath(cleanedData, 'path', 'filename')

        await request.ftpClient.downloadTo(writable, path)
    } catch (error) {
        next(error)
    }
}

exports.postCreateDirectories = async (request, response, next) => {
    const validData = {
        path: {
            type: String,
            required: true,
        },
    }

    try {
        const cleanedData = validateAndClean(validData, request.body)

        await request.ftpClient.ensureDir(cleanedData.path)

        response.status(200).send({msg: `Directory ${cleanedData.path} created successfully.`})
    } catch (error) {
        next(error)
    }
}

exports.deleteDirectories = async (request, response, next) => {
    const validData = {
        path: {
            type: String,
            required: false,
        },
        dirnames: {
            type: Array,
            required: true,
            comparator(value) {
                return value.every((val) => {
                    return typeof val === 'string' || val instanceof String
                })
            },
        }
    }

    try {
        // validData.path.default = await request.ftpClient.pwd()

        const cleanedData = validateAndClean(validData, request.body)

        for (let i = 0; i < cleanedData.dirnames.length; i++) {
            const path = formatPath(cleanedData, 'path', 'dirnames', i)
            await request.ftpClient.removeDir(path)
        }

        response.status(200).send({
            msg: `${cleanedData.dirnames.length} directories removed successfully from ${cleanedData.path}`
        })
    } catch (error) {
        next(error)
    }
}
