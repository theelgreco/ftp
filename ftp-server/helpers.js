exports.formatPath = (data, key, index) => {
    if (index >= 0) {
        return data.path === '/' ? `${data.path}${data[key][index]}` : `${data.path}/${data[key][index]}`
    }
    return data.path === '/' ? `${data.path}${data[key]}` : `${data.path}/${data[key]}`
}