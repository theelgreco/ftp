exports.formatPath = (data, pathKey, nameKey, index) => {
    if (index >= 0) {
        return data[pathKey] === '/' ? `${data[pathKey]}${data[nameKey][index]}` : `${data[pathKey]}/${data[nameKey][index]}`
    }
    return data[pathKey] === '/' ? `${data[pathKey]}${data[nameKey]}` : `${data[pathKey]}/${data[nameKey]}`
}