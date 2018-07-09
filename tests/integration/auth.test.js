const app = require('../../index')
const request = require('supertest')(app)
const { User } = require('../../models/user')

describe('auth middleware', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request
      .get('/users/me')
      .set('x-auth-token', '')

    expect(res.status).toBe(401)
  })

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