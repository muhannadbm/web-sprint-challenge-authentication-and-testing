const jwt = require('jsonwebtoken')
const secret = process.env.SECRET || 'shh'

module.exports = function(user) {
    const payload = {
        subject: user.id,
        username: user.username,
    }
    const options = {
        expiresIn: '1d'
    }
    const token = jwt.sign(
        payload,
        secret,
        options,
    )
    return token
}