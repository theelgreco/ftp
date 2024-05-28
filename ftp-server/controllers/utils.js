const {Writable} = require("stream");
const bcrypt = require("bcrypt")

exports.formatPath = (data, pathKey, nameKey, index) => {
    if (index >= 0) {
        return data[pathKey] === '/' ? `${data[pathKey]}${data[nameKey][index]}` : `${data[pathKey]}/${data[nameKey][index]}`
    }
    return data[pathKey] === '/' ? `${data[pathKey]}${data[nameKey]}` : `${data[pathKey]}/${data[nameKey]}`
}

exports.ResponseWritable = class extends Writable {
    constructor(response) {
        super();
        this.response = response;
    }

    _write(chunk, encoding, callback) {
        this.response.write(chunk, encoding, callback);
    }

    _final(callback) {
        this.response.end(callback);
    }
}

exports.hashPassword = async (password) => {
    return await bcrypt.hash(password, 10)
}

exports.verifyPassword = async (passwordAttempt, storedPassword) => {
    return await bcrypt.compare(passwordAttempt, storedPassword);
}