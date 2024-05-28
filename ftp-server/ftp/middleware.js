const {access} = require("./ftp");
const {getServer} = require("../models/models");
const {ForbiddenError} = require("../errors/classes");

exports.ftpConnect = async (request, response, next) => {
    const {server: serverSlug} = request.params
    const {user: requestUser} = request

    try {
        const server = await getServer(requestUser.slug, serverSlug)

        if (!server) {
            throw new ForbiddenError("You don't have permission to view that server.")
        }

        const {host, port, user, password, secure} = server

        request.ftpClient = await access({host, port, user, password, secure})
        next()
    } catch (error) {
        next(error)
    }
}

exports.ftpClose = async (error, request, response, next) => {
    if (request.ftpClient) {
        request.ftpClient.close()
    }

    if (error) next(error)

    next()
}