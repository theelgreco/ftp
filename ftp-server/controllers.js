const {clean, validate} = require("./validation.js")
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
        validate(validData, request.body)
        const cleanedData = clean(validData, request.body)

        const {slug, timestamp, options} = await createSession(cleanedData)

        response.status(200).send({slug, timestamp, options})
    } catch (err) {
        console.error(err)
        response.status(400).send(err)
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

        validate(validData, request.query)
        const cleanedData = request.query

        await session.client.cd(cleanedData.path)
        const files = await session.client.list(cleanedData.path)

        response.status(200).send({files, path: cleanedData.path})
    } catch (err) {
        response.status(403).send({"msg": "Unauthorised"})
    }
}

exports.postFile = async (request, response) => {
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
        validate(validData, request.body)

        const cleanedData = clean(validData, request.body)

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const path = `${cleanedData.path}/${file.originalname}`
            console.log(path)
            const readable = Readable.from(file.buffer)
            await session.client.uploadFrom(readable, path)
        }

        response.status(200).send({msg: `${files.length} files uploaded successfully to ${cleanedData.path}`})
    } catch (err) {
        console.error(err)
        response.status(403).send({"msg": err.message})
    }
}

exports.postRemove = async (request, response) => {
    const validData = {
        path: {
            type: String,
            required: false,
        },
        filenames: {
            type: Array,
            required: true,
            comparator(value) {
                console.log(value)
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

        validate(validData, request.body)
        const cleanedData = clean(validData, request.body)

        for (let i = 0; i < cleanedData.filenames.length; i++) {
            const path = cleanedData.path === '/'
                ? `${cleanedData.path}${cleanedData.filenames[i]}`
                : `${cleanedData.path}/${cleanedData.filenames[i]}`

            await session.client.remove(path)
        }

        response.status(200).send({msg: `${cleanedData.filenames.length} files removed successfully from ${cleanedData.path}`})
    } catch (err) {
        console.error(err)
        response.status(400).send({msg: err.message})
    }
}