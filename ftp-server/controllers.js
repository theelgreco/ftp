const {validateAndClean} = require("./validation.js")
const {createSession, getSession} = require("./sessions.js")
const {Readable} = require("stream")

exports.postConnect = async (request, response) => {
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

    try {
        const cleanedData = validateAndClean(validData, request.body)

        const {slug, timestamp, options} = await createSession(cleanedData)

        response.status(200).send({slug, timestamp, options})
    } catch (error) {
        console.error(error)
        response.status(400).send({msg: error.message})
    }
}

exports.getFiles = async (request, response) => {
    const validData = {
        path: {
            type: String,
            required: false
        }
    }

    const {sessionid} = request.headers

    try {
        const session = getSession(sessionid)
        validData.path.default = await session.client.pwd()

        const cleanedData = validateAndClean(validData, request.query)

        await session.client.cd(cleanedData.path)
        const files = await session.client.list(cleanedData.path)

        response.status(200).send({files, path: cleanedData.path})
    } catch (error) {
        response.status(403).send({msg: error.message})
    }
}

exports.postFiles = async (request, response) => {
    const validData = {
        path: {
            type: String,
            required: false
        }
    }

    const {sessionid} = request.headers
    const {files} = request

    try {
        const session = getSession(sessionid)

        validData.path.default = await session.client.pwd()

        const cleanedData = validateAndClean(validData, request.body)

        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            const path = `${cleanedData.path}/${file.originalname}`

            const readable = Readable.from(file.buffer)

            await session.client.uploadFrom(readable, path)
        }

        response.status(200).send({msg: `${files.length} files uploaded successfully to ${cleanedData.path}`})
    } catch (error) {
        console.error(error)
        response.status(403).send({"msg": error.message})
    }
}

exports.deleteFiles = async (request, response) => {
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
                    return typeof val === 'string' || val instanceof String
                })
            },
        }
    }

    const {sessionid} = request.headers

    try {
        const session = getSession(sessionid)

        validData.path.default = await session.client.pwd()

        const cleanedData = validateAndClean(validData, request.body)

        for (let i = 0; i < cleanedData.filenames.length; i++) {
            const path = cleanedData.path === '/'
                ? `${cleanedData.path}${cleanedData.filenames[i]}`
                : `${cleanedData.path}/${cleanedData.filenames[i]}`

            await session.client.remove(path)
        }

        response.status(200).send({msg: `${cleanedData.filenames.length} files removed successfully from ${cleanedData.path}`})
    } catch (error) {
        console.error(error)
        response.status(400).send({msg: error.message})
    }
}

exports.postCreateDirectory = async (request, response) => {
    const validData = {
        path: {
            type: String,
            required: true,
        },
    }

    const {sessionid} = request.headers

    try {
        const session = getSession(sessionid)

        validData.path.default = await session.client.pwd()

        const cleanedData = validateAndClean(validData, request.body)

        await session.client.ensureDir(cleanedData.path)
        await session.client.cd(validData.path.default)

        response.status(200).send({msg: `Directory ${cleanedData.path} created successfully.`})
    } catch (error) {
        console.error(error)
        response.status(400).send(error.message)
    }
}

exports.deleteDirectories = async (request, response) => {
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

    const {sessionid} = request.headers

    try {
        const session = getSession(sessionid)

        validData.path.default = await session.client.pwd()

        const cleanedData = validateAndClean(validData, request.body)

        for (let i = 0; i < cleanedData.dirnames.length; i++) {
            const path = cleanedData.path === '/'
                ? `${cleanedData.path}${cleanedData.dirnames[i]}`
                : `${cleanedData.path}/${cleanedData.dirnames[i]}`

            await session.client.removeDir(path)
        }

        response.status(200).send({
            msg: `${cleanedData.dirnames.length} directories removed successfully from ${cleanedData.path}`
        })
    } catch (error) {
        console.error(error)
        response.status(400).send({msg: error.message})
    }
}