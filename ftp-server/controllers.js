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
    const {sessionid} = request.headers
    let {path} = request.query

    try {
        const session = getSession(sessionid)

        if (!path) {
            path = await session.client.pwd()
        }

        await session.client.cd(path)
        const files = await session.client.list(path)
        response.status(200).send({files, path})
    } catch (err) {
        response.status(403).send({"msg": "Unauthorised"})
    }
}

exports.postFile = async (request, response) => {
    const {sessionid} = request.headers
    const {files} = request

    try {
        const session = getSession(sessionid)
        const cwd = await session.client.pwd()

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const path = `${cwd}/${file.originalname}`
            const readable = Readable.from(file.buffer)
            await session.client.uploadFrom(readable, path)
        }

        response.status(200).send({msg: "all done"})
    } catch (err) {
        console.error(err)
        response.status(403).send({"msg": err.message})
    }
}