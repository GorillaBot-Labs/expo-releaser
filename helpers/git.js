const git = require('simple-git')

module.exports = {
    status: (callback) => git().status(callback)
}
