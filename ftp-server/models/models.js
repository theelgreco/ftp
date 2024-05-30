const {db} = require("../db/connect")
const crypto = require('crypto')

exports.createUser = async (authSlug) => {
    try {
        const user = await db.query(`
            INSERT INTO users (slug, auth_slug)
            VALUES ($1, $2) RETURNING *;
        `, [crypto.randomUUID(), authSlug])

        return user.rows[0]
    } catch (err) {
        throw err
    }
}

exports.getUser = async (authSlug) => {
    try {
        const userRows = await db.query(`
            SELECT *
            FROM users
            WHERE auth_slug = $1;
        `, [authSlug])

        return userRows.rows[0]
    } catch (err) {
        throw err
    }
}

exports.getUserServers = async (userSlug) => {
    try {
        const serversRows = await db.query(`
            SELECT *
            FROM ftp_connections
            WHERE user_slug = $1;
        `, [userSlug])

        return serversRows.rows
    } catch (err) {
        throw err
    }
}

exports.getServer = async (userSlug, serverSlug) => {
    try {
        const serversRows = await db.query(`
            SELECT *
            FROM ftp_connections
            WHERE user_slug = $1
              AND slug = $2;
        `, [userSlug, serverSlug])

        return serversRows.rows[0]
    } catch (err) {
        throw err
    }
}

exports.createServer = async (host, port, user, password, secure, user_slug) => {
    try {
        const server = await db.query(`
            INSERT INTO ftp_connections (slug, host, port, "user", password, secure, user_slug)
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        `, [crypto.randomUUID(), host, port, user, password, secure, user_slug])

        return server.rows[0]
    } catch (err) {
        throw err
    }
}

exports.deleteServer = async (userSlug, serverSlug) => {
    try {
        const deletedRow = await db.query(`
            DELETE
            FROM ftp_connections
            WHERE user_slug = $1
              AND slug = $2
            RETURNING *;
        `, [userSlug, serverSlug])
        return deletedRow.rows
    } catch (err) {
        throw err
    }
}