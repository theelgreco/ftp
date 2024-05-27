const {db} = require("./connect")

const createTables = async () => {
    // Drop the tables
    if(process.env.NODE_ENV !== "production") {
        try {
            await db.query(`
                DROP TABLE IF EXISTS ftp_connections;
            `)
            console.log("DROPPED TABLE ftp_connections")
        } catch (err){
            console.error(err)
        }

        try {
            await db.query(`
                DROP TABLE IF EXISTS users;
            `)
            console.log("DROPPED TABLE users")
        } catch (err){
            console.error(err)
        }
    }

    // Create users table if it does not exist
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                slug VARCHAR(36) PRIMARY KEY,
                auth_slug VARCHAR(36) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (auth_slug)
            );`
        )
    } catch (err){
        console.error(err)
    }

    // Create ftp_connections table if it does not exist
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS ftp_connections (
                slug VARCHAR(36) PRIMARY KEY,
                host VARCHAR(200) NOT NULL,
                port INT NOT NULL,
                "user" VARCHAR(200) NOT NULL DEFAULT '',
                password VARCHAR(200) NOT NULL DEFAULT '',
                secure BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                user_slug VARCHAR(36) NOT NULL,
                CONSTRAINT fk_user_slug
                    FOREIGN KEY (user_slug)
                    REFERENCES users(slug)
                    ON DELETE CASCADE,
                UNIQUE (host, "user", user_slug)
            );`
        )
    } catch (err){
        console.error(err)
    }
}

module.exports = createTables