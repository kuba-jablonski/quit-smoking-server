const app = require('../../index')
const request = require('supertest')(app)
const { User } = require('../../models/user')

const userData = {
  email: 'test@test.com',
  password: 'password123',
  settings: {
    cigsInPack: 20,
    cigsPerDay: 20,
    packCost: 15,
    quitDate: 'abcefg'
  }
}

describe('/users', () => {
  afterEach(async () => {
    await User.deleteMany({})
  })

  describe('POST /', () => {
    it('should return 400 if input is invalid', async () => {
      const res = await request
        .post('/users')
        .send({ email: 'bb', password: 'bb' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('msg')
    })

    it('should return 400 if user with a given email already exists', async () => {
      const user = new User(userData)

      await user.save()

      const res = await request
        .post('/users')
        .send(userData)

      expect(res.status).toBe(400)
    })

    it('should save a user to the database', async () => {
      await request
        .post('/users')
        .send(userData)

      const user = await User.find({ email: userData.email })
      expect(user).toBeTruthy()
    })

    it('should send user object and token in response', async () => {
      const res = await request
        .post('/users')
        .send(userData)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('_id')
      expect(res.headers['x-auth-token']).toBeDefined()
    })
  })

  describe('GET /me', () => {
    it('should send a user', async () => {
      const user = new User(userData)
      await user.save()
      const token = user.generateAuthToken()

      const res = await request
        .get('/users/me')
        .set('x-auth-token', token)

      expect(res.body).toHaveProperty('_id')
    })
  })

  describe('PUT /users/me/profile', () => {
    it('should return 400 when input is invalid', async () => {
      let res = await request
        .put('/users/me/profile')
        .set('x-auth-token', new User().generateAuthToken())
        .send({ username: 'ab' })

      expect(res.status).toBe(400)

      res = await request
        .put('/users/me/profile')
        .set('x-auth-token', new User().generateAuthToken())
        .send({ username: Array(12).join('a') })

      expect(res.status).toBe(400)
    })

    it('should update the profile', async () => {
      let user = new User(userData)
      await user.save()
      const token = user.generateAuthToken()

      const profile = { username: 'abcd' }

      await request
        .put('/users/me/profile')
        .set('x-auth-token', token)
        .send(profile)

      user = await User.findOne({ profile })

      expect(user).toBeTruthy()
    })

    it('should return updated profile', async () => {
      const user = new User(userData)
      await user.save()
      const token = user.generateAuthToken()

      const profile = { username: 'abcd' }

      const res = await request
        .put('/users/me/profile')
        .set('x-auth-token', token)
        .send(profile)

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject(profile)
    })
  })

  describe('PUT /users/me/settings', () => {
    it('should return 400 if input is invalid', async () => {
      const res = await request
        .put('/users/me/settings')
        .set('x-auth-token', new User().generateAuthToken())
        .send({
          cigsInPack: 101,
          cigsPerDay: 20,
          packCost: 15,
          quitDate: 'abcefg'
        })

      expect(res.status).toBe(400)
    })

    it('should update the settings', async () => {
      let user = new User(userData)
      await user.save()
      const token = user.generateAuthToken()

      const updatedSettings = {
        cigsInPack: 30,
        cigsPerDay: 20,
        packCost: 15,
        quitDate: 'abcefg'
      }

      await request
        .put('/users/me/settings')
        .set('x-auth-token', token)
        .send(updatedSettings)

      user = await User.findOne({ email: userData.email })

      expect(user.settings).toMatchObject(updatedSettings)
    })

    it('should return updated settings', async () => {
      const user = new User(userData)
      await user.save()
      const token = user.generateAuthToken()

      const updatedSettings = {
        cigsInPack: 30,
        cigsPerDay: 20,
        packCost: 15,
        quitDate: 'abcefg'
      }

      const res = await request
        .put('/users/me/settings')
        .set('x-auth-token', token)
        .send(updatedSettings)

      expect(res.body).toMatchObject(updatedSettings)
    })
  })
})