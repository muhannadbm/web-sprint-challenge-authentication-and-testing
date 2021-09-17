const jwt = require('jsonwebtoken')
const secret = process.env.SECRET || 'shh'

module.exports = (req, res, next) => {
  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
 const token = req.headers.authorization
 if(!token){
   next({status: 404, message: "token required"})
 }
 jwt.verify(
   token,
  secret,
  (err, decoded) => {
    if(err) return next({
      status: 400, message: 'token invalid'
    })
  req.decoded = decoded
  next()
  }
 )

};
