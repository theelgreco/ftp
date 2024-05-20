const e = require("express");
const {isBooleanable, boolean} = require("boolean")
const validate = (validData, requestData) => {
    for (const key in validData) {
        if (requestData.hasOwnProperty(key)) {
            const {type} = validData[key]
            const value = requestData[key]

            switch (type) {
                case Number:
                    if (value !== "0" && !Number(value)) {
                        throw new Error(`${key} must be a valid number.`)
                    }
                    break;
                case Boolean:
                    if (!isBooleanable(value)) {
                        throw new Error(`${key} must be a boolean.`)
                    }
                    break;
                case Array:
                    if (!Array.isArray(JSON.parse(value))) {
                        throw new Error(`${key} must be a valid array.`)
                    }
                    break;
                case Object:
                    if (Object.prototype.toString.call(JSON.parse(value)) !== '[object Object]') {
                        throw new Error(`${key} must be a valid object.`)
                    }
                    break;
                default:
                    break;
            }
        } else if (validData[key].required) {
            throw new Error(`${key} is required but was not provided.`)
        }
    }
}

const clean = (validData, requestData) => {
    const response = {}

    for (const key in validData) {
        if (!requestData.hasOwnProperty(key)) {
            response[key] = validData[key].default
        } else {
            const {type} = validData[key]
            let value = requestData[key]

            if (type !== String) value = JSON.parse(value)

            switch (type) {
                case Number:
                    response[key] = Number(value)
                    break;
                case Boolean:
                    response[key] = boolean(value)
                    break;
                default:
                    response[key] = value;
            }
        }
    }

    return response
}

module.exports = {clean, validate}