// Write your tests here
const request = require('supertest')
const server = require('./server')
const db = require('../data/dbConfig')
const bcrypt = require('bcryptjs')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

// beforeEach(async () => {
//   await db.migrate.rollback()
//   await db.migrate.latest()
// })

test('sanity', () => {
  expect(true).toBe(true)
})

describe("[POST] /api/auth/registers", ()=>{
  test('user is added to DB after successful registeration', async()=> {
    let result = await request(server).post('/api/auth/register').send({username: "Moe", password: "1234"})
    let expected = await db("users").where('id',result.body.id).first()
    expect(expected).toMatchObject(result.body)
  })

  test('password is being hashed properly', async()=> {
    let result = await request(server).post('/api/auth/register').send({id: 2, username: "Moe1", password: "1234"})
    let comparison = bcrypt.compareSync("1234", result.body.password)
    expect(comparison).toBeTruthy()
  })

})

describe("[POST] /api/auth/login", ()=>{
  test('token is generated upon successful login', async()=> {
    await request(server).post('/api/auth/register').send({username: "Moe", password: "1234"})
    let result = await request(server).post('/api/auth/login').send({username: "Moe", password: "1234"})
    expect(result.body).toHaveProperty('token')
  })

  test('error message returned upon invalid credentials', async()=> {
    let result = await request(server).post('/api/auth/login').send({username: "Moeee", password: "1234"})
    expect(result.body).not.toHaveProperty('token')
    expect(result.body).toMatchObject({message:"invalid credentials"})
  })

})


describe("[get] /api/jokes", ()=>{
  test('Error message when token doesnt exist in Auth header', async()=> {
    let getResults = await request(server).get('/api/jokes')
    expect(getResults.body).toMatchObject({message: "token required"})
  })
  test('Jokes are returned when token is valid', async()=> {
    await request(server).post('/api/auth/register').send({username: "Moe", password: "1234"})
    let user = await request(server).post('/api/auth/login').send({username: "Moe", password: "1234"})
    expect(user.body).toHaveProperty('token')
    let jokeslist = await request(server).get('/api/jokes').set('Authorization', user.body.token)
    expect(jokeslist.body).toEqual([
      {
        "id": "0189hNRf2g",
        "joke": "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later."
      },
      {
        "id": "08EQZ8EQukb",
        "joke": "Did you hear about the guy whose whole left side was cut off? He's all right now."
      },
      {
        "id": "08xHQCdx5Ed",
        "joke": "Why didn’t the skeleton cross the road? Because he had no guts."
      },
    ])
  })

 

  test('Returns the right number of jokes after successful login', async()=> {
    let user = await request(server).post('/api/auth/login').send({username: "Moe", password: "1234"})
    let res = await request(server).get('/api/jokes').set('Authorization', user.body.token)
    expect(res.body).toHaveLength(3)
  })

})
