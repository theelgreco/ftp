const {Client} = require("basic-ftp")

const access = async (options) => {
    const client = new Client()

    try {
        await client.access(options)
        return client
    } catch (err) {
        throw err
    }
}

module.exports = {access}