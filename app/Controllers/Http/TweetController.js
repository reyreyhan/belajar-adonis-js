'use strict'
const Tweet = use('App/Models/Tweet')
class TweetController {

    async tweet({ request, auth, response }) {
        const user = auth.current.user
        const tweet = await Tweet.create({
            user_id: user.id,
            tweet: request.input('tweet')
        })

        await tweet.loadMany(['user', 'favorites', 'replies'])

        return response.json({
          status: 'success',
          message: 'Tweet posted!',
          data: tweet
        })

    }
}

module.exports = TweetController
