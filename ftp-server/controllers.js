const {clean, validate} = require("./validation.js")
const {createSession, getSession} = require("./sessions.js")

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
    let {path} = request.body

    try {
        const session = getSession(sessionid)
        const cwd = await session.client.pwd()
        if(!path) path = cwd
        const files = await session.client.list(path)
        response.status(200).send({files, cwd})
    } catch (err) {
        response.status(403).send({"msg": "Unauthorised"})
    }
}
