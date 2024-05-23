exports.formatPath = (data, key, index) => {
    return data.path === '/' ? `${data.path}${data[key][index]}` : `${data.path}/${data[key][index]}`
}