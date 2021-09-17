const router = require('express').Router();
const token_builder = require('./token-builder')
const db = require('../../data/dbConfig')
const bcrypt = require('bcryptjs')

router.post('/register', async (req, res) => {
  let myUser = req.body
  if(!myUser.username || !myUser.password) return res.status(400).json("username and password required").end()
  let potential_user = await db("users").where("username", req.body.username).first()
  if(potential_user) return res.status(400).json("username taken").end()

  let hashed = bcrypt.hashSync(req.body.password, 8)
  myUser.password = hashed
  let id = await db("users").insert(myUser)
  let created = await db("users").where('id', id).first()
  res.status(201).json(created)
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', async(req, res) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
  let myUser = req.body
  if(!myUser.username || !myUser.password) return res.status(400).json("username and password required").end()
  let potential_user = await db("users").where("username", req.body.username).first()
  // res.status(404).json(potential_user)
  if(potential_user && bcrypt.compareSync(myUser.password, potential_user.password)){
    let token = token_builder(myUser)
    res.status(200).json({
      message: `welcome, ${potential_user.username}`,
      token: token
    })
  }
  else{
    res.status(404).json({message: "invalid credentials"})
  }


});

module.exports = router;
