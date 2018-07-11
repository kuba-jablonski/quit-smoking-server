const app = require('../../index')
const request = require('supertest')(app)
const { User } = require('../../models/user')



describe('/users', () => {
  describe('POST /', () => {
    let userData;

    beforeEach(() => {
      userData = {
        email: 'user@test.com',
        password: 'password123',
        settings: {
          cigsInPack: 20,
          cigsPerDay: 20,
          packCost: 15,
          quitDate: 'abcefg'
        }
      }
    })

    afterEach(async () => {
      await User.deleteMany({})
    })

    const exec = () => {
      return request.post('/users').send(userData)
    }

    it('should return 400 if email is invalid', async () => {
      userData.email = 'usertest.com'
      const res = await exec()
      expect(res.status).toBe(400)
    })

    it('should return 400 if password is less than 5 characters', async () => {
      userData.password = '1234'
      const res = await exec()
      expect(res.status).toBe(400)
    })

    it('should return 400 if user with a given email already exists', async () => {
      const user = new User(userData)
      await user.save()
      const res = await exec()
      expect(res.status).toBe(400)
    })

    it('should save a user to the database', async () => {
      await exec()
      const user = await User.find({ email: userData.email })
      expect(user).toBeTruthy()
    })

    it('should send user object and token in response', async () => {
      const res = await exec()
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('_id')
      expect(res.headers['x-auth-token']).toBeDefined()
    })
  })

  describe('GET /me', () => {
    let token

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
      await user.save()
      token = user.generateAuthToken()
    })

    afterEach(async () => {
      await User.deleteMany({});
    })

    it('should send a user', async () => {
      const res = await request
        .get('/users/me')
        .set('x-auth-token', token)

      expect(res.body).toHaveProperty('_id')
    })
  })

  describe('PUT /users/me/profile', () => {
    let token

    beforeEach(async () => {
      const user = new User({
        email: 'user@test.com',
        password: 'password123',
        settings: {
          cigsInPack: 20,
          cigsPerDay: 20,
          packCost: 15,
          quitDate: 'abcefg'
        },
        profile: {
          username: 'user1'
        }
      })
      await user.save()
      token = user.generateAuthToken()
    })

    afterEach(async () => {
      await User.deleteMany({})
    })

    it('should return 400 when username is less than 3 characters', async () => {
      const res = await request
        .put('/users/me/profile')
        .set('x-auth-token', token)
        .send({ username: 'ab' })

      expect(res.status).toBe(400)
    })

    it('should return 400 when username is more than 10 characters', async () => {
      const res = await request
        .put('/users/me/profile')
        .set('x-auth-token', new User().generateAuthToken())
        .send({ username: new Array(12).join('a') })

      expect(res.status).toBe(400)
    })    

    it('should update the profile', async () => {
      const profile = { username: 'abcd' }

      await request
        .put('/users/me/profile')
        .set('x-auth-token', token)
        .send(profile)

      user = await User.findOne({ profile })

      expect(user).toBeTruthy()
      expect(user.profile).toHaveProperty('username', 'abcd');
    })

    it('should return updated profile', async () => {
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
    let token, settings

    beforeEach(async () => {
      settings = {
        cigsInPack: 20,
        cigsPerDay: 20,
        packCost: 15,
        quitDate: 'abcefg'
      }

      const user = new User({
        email: 'user@test.com',
        password: 'password123',
        settings,
        profile: {
          username: 'user1'
        }
      })
      await user.save()
      token = user.generateAuthToken()
    })

    afterEach(async () => {
      await User.deleteMany({})
    })

    const exec = () => {
      return request
        .put('/users/me/settings')
        .set('x-auth-token', token)
        .send(settings)
    }

    it('should return 400 if cigsPerDay is less than 1', async () => {
      settings.cigsPerDay = 0;
      const res = await exec()
      expect(res.status).toBe(400);
    })

    it('should return 400 if cigsPerDay is more than 100', async () => {
      settings.cigsPerDay = 101;
      const res = await exec()
      expect(res.status).toBe(400);
    })

    it('should return 400 if cigsPerDay is not a number', async () => {
      settings.cigsPerDay = '';
      const res = await exec()
      expect(res.status).toBe(400);
    })
//
    it('should return 400 if cigsInPack is not a number', async () => {
      settings.cigsInPack = '';
      const res = await exec()
      expect(res.status).toBe(400);
    })

    it('should return 400 if cigsInPack is less than 1', async () => {
      settings.cigsInPack = 0;
      const res = await exec()
      expect(res.status).toBe(400);
    })

    it('should return 400 if cigsInPack is more than 100', async () => {
      settings.cigsInPack = 101;
      const res = await exec()
      expect(res.status).toBe(400);
    })

    it('should update the settings', async () => {
      settings = {
        cigsInPack: 30,
        cigsPerDay: 10,
        packCost: 20,
        quitDate: 'abcefg'
      }
      await exec();
      user = await User.findOne({ email: 'user@test.com' })
      expect(user.settings).toMatchObject(settings)
    })

    it('should return updated settings', async () => {
      settings = {
        cigsInPack: 30,
        cigsPerDay: 10,
        packCost: 20,
        quitDate: 'abcefg'
      }
      const res = await exec();
      expect(res.body).toMatchObject(settings)
    })
  })
})
