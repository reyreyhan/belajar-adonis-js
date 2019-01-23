'use strict'
const User = use('App/Models/User')
const Hash = use('Hash')

class UserController {
    async signup({ request, auth, response }) {
        const userData = request.only(['name', 'username', 'email', 'password'])

        try {
          const user = await User.create(userData)
          const token = await auth.generate(user)

          return response.json({
              status: 'success',
              token: token,
              user: user,
          })
        } catch (error) {
              return response.status(400).json({
                  status: 'error',
                  message: 'create user failed, please try again'
              })
        }
    }

    async login({ request, auth, response }) {

      try{
          const token = await auth.attempt(
              request.input('email'),
              request.input('password')
          )

          return response.json({
              status: 'success',
              data: token,
          })
      } catch (error) {
          response.status(400).json({
              status: 'error',
              message: 'invalid email / password'
          })
      }
    }

    async me({ auth, response }) {
        const user = await User.query()
            .where('id', auth.current.user.id)
            .with('tweet', builders => {
                builders.with('user')
                builders.with('favorites')
                builders.with('replies')
            })
            .with('following')
            .with('followers')
            .with('favorites')
            .with('favorites.tweet', builder => {
                builder.with('user')
                builder.with('favorites')
                builder.with('replies')
            })
            .firstOrFail()

            return response.json({
                status: 'success',
                data : user
            })
    }

    async updateProfile({ request, auth, response }) {
        try {
            const user = auth.current.user

            user.name = request.input('name')
            user.username = request.input('username')
            user.email = request.input('email')
            user.location = request.input('location')
            user.bio = request.input('bio')
            user.website_url = request.input('website_url')
            await user.save()

            return response.json({
                status: 'success',
                message: 'Profile Update!',
                data: user,
            })
        } catch (error) {
            return response.json({
                status: 'error',
                message: 'profile update failed, please try again'
            })
        }
    }

    async changePassword({ request, auth, response }) {
        const user = auth.current.user

        const verifyPassword = await Hash.verify(
            request.input('password'),
            user.password
        )

        if (!verifyPassword) {
            return response.status(400).json({
                status: 'error',
                message: 'Current password could not be verified! Please try again.'
            })
        }

        //user.password = await Hash.make(request.input('new_password'))
        user.password = request.input('new_password')
        await user.save()
        return response.status(200).json({
              status: 'success',
              message: 'success update new password!'
        })
    }

    async showProfile({ params, response }) {
        try {
          const user = await User.query()
              .where('username', params.username)
              .with('tweet', builders => {
                  builders.with('user')
                  builders.with('favorites')
                  builders.with('replies')
              })
              .with('following')
              .with('followers')
              .with('favorites')
              .with('favorites.tweet', builder => {
                  builder.with('user')
                  builder.with('favorites')
                  builder.with('replies')
              })
              .firstOrFail()

              return response.json({
                  status: 'success',
                  data : user
              })
        } catch (error) {
            return response.json({
              status: 'error',
              message: 'show profile failed, please try again'
            })
        }
    }

    async userToFollow({ params, auth, response }) {
        const user = auth.current.user
        const userAlreadyFollowing = await user.following().ids()

        const userToFollow = await User.query()
            .whereNot('id', user.id)
            .whereNotIn('id', userAlreadyFollowing)
            .pick(3)

        return response.json({
            status: 'success',
            data: userToFollow
        })
    }

    async follow({ request, auth, response, params }) {
        const user = auth.current.user
        await user.following().attach(request.input('user_id'))
        await user.followers().attach(user.id)

        return response.json({
            status: 'success',
            data: user
        })
    }
}

module.exports = UserController
