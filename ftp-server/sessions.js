const {v4: uuidv4} = require("uuid")
const {access} = require("./ftp/ftp.js")

sessions = {}

const createSessionSlug = () => {
    const slug = uuidv4()

    if (sessions[slug]) {
        return createSession(options)
    }

    return slug
}

const createSession = async (options) => {
    const slug = createSessionSlug()
    const timestamp = new Date()
    const session = {
        slug,
        timestamp,
        options,
    }

    try {
        session.client = await access(options)
    } catch (err) {
        throw err
    }

    sessions[slug] = session
    return session
}

const getSession = (slug) => {
    const session = sessions[slug]

    if (!session) {
        throw new Error("That session does not exist!")
    }

    return session
}

const endSession = (slug) => {
    try {
        getSession(slug)
        delete sessions[slug]
    } catch (err) {
        throw err
    }
}

// TO-DO:
// Create a Session class, with log of actions etc. etc.

module.exports = {createSession, getSession, endSession}