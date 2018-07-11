const app = require('../../index')
const request = require('supertest')(app)
const bcrypt = require('bcrypt')
const { User } = require('../../models/user')

describe('auth middleware', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request
      .get('/users/me')
      .set('x-auth-token', '')

    expect(res.status).toBe(401)
  })
//
  it('should return 400 if token is invalid', async () => {
    const res = await request
      .get('/users/me')
      .set('x-auth-token', 'a')

    expect(res.status).toBe(400)
  })

  it('should return 200 if token is valid', async () => {
    const res = await request
      .get('/users/me')
      .set('x-auth-token', new User().generateAuthToken())

    expect(res.status).toBe(200)
  })
})


describe('POST /', () => {
  beforeEach(async () => {
    const user = new User({
      email: 'user@test.com',
      password: 'password123',
      settings: {
        cigsInPack: 20,
        cigsPerDay: 20,
        packCost: 15,
        quitDate: 'abcefg'
      }
    })
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
    await user.save()
  })

  afterEach(async () => {
    await User.deleteMany({})
  })

  it('should return 400 if email does not match', async () => {
    const res = await request.post('/auth').send({ email: 'user2@test.com', password: 'password123' })
    expect(res.status).toBe(400)
  })

  it('should return 400 if password does not match', async () => {
    const res = await request.post('/auth').send({ email: 'user@test.com', password: 'password321' })
    expect(res.status).toBe(400)
  })

  it('should return user and token if password and email match', async () => {
    const res = await request
      .post('/auth')
      .send({ email: 'user@test.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.header['x-auth-token']).toBeTruthy()
    expect(res.body).toHaveProperty('_id')
  })
})
