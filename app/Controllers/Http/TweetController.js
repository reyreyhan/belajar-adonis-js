'use strict'
const Tweet = use('App/Models/Tweet')
const Reply = use('App/Models/Reply')
const Like = use('App/Models/Favorite')
class TweetController {

    async tweet({ request, auth, response }) {
        const user = auth.current.user
        const tweet = await Tweet.create({
            user_id: user.id,
            tweet: request.input('tweet')
        })

        //await tweet.loadMany(['user', 'favorites', 'replies'])

        return response.json({
          status: 'success',
          message: 'Tweet posted!',
          data: tweet
        })

    }

    async all({ auth, response }) {
      try{
          const user = auth.current.user
          const tweet = await Tweet.query()
            .where('user_id', user.id)
            .with('user')
            .with('replies')
            .with('replies.user')
            .with('favorites')
            .fetch()

          return response.json({
            status: 'success',
            data: tweet
          })
      } catch {
          return response.status(404).json({
              status: 'error',
              massage: 'Tweet not found'
          })
      }
    }

    async show({ params, response }) {
      try{
          const tweet = await Tweet.query()
            .where('id', params.id)
            .with('user')
            .with('replies')
            .with('replies.user')
            .with('favorites')
            .with('favorites.user')
            .firstOrFail()

          return response.json({
            status: 'success',
            data: tweet
          })
      } catch {
          return response.status(404).json({
              status: 'error',
              massage: 'Tweet not found'
          })
      }
    }

    async reply({ request, auth, params, response }) {
        const user = auth.current.user

        const tweet = await Tweet.find(params.id)

        if(tweet == null) {
            return response.status(404).json({
              status: 'error',
              massage: 'Tweet not found'
            })
        }

        const reply = await Reply.create({
            user_id: user.id,
            tweet_id: params.id,
            reply: request.input('reply')
        })

        await reply.loadMany(['user'])

        return response.json({
            status: 'success',
            massage: 'Reply Posted!',
            data: reply
        })
    }

    async like({ auth, params, response }) {
        const user = auth.current.user

        const tweet = await Tweet.find(params.id)

        if (tweet == null) {
            return response.status(404).json({
              status: 'error',
              massage: 'Tweet not found'
            })
        }

        const like = await Like.findOrCreate(
            { user_id: user.id, tweet_id: params.id },
            { user_id: user.id, tweet_id: params.id }
        )

        return response.json({
            status: 'success',
            data: like
        })
    }

    async unlike({ params, auth, response }) {

        const user = auth.current.user

        const tweet = await Tweet.find(params.id)

        if (tweet == null) {
          return response.status(404).json({
            status: 'error',
            massage: 'Tweet not found'
          })
        }

        await Like.query()
            .where('user_id', user.id)
            .where('tweet_id', params.id)
            .delete()

        return response.json({
            status: 'success',
            data: null,
        })

    }
}

module.exports = TweetController
