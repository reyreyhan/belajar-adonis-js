'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})

Route.post('/signup', 'UserController.signup')
Route.post('/login', 'UserController.login')
Route.get('/:username', 'UserController.showProfile')

Route.group(() => {
    Route.get('/me', 'UserController.me')
    Route.put('/me', 'UserController.updateProfile')
    Route.put('/me/password', 'UserController.changePassword')
})
    .prefix('account')
    .middleware(['auth:jwt'])

Route.group(() => {
    Route.get('/users_to_follow', 'UserController.userToFollow')
    Route.post('/follow/:id', 'UserController.follow')
    Route.delete('/unfollow/:id', 'UserController.unfollow')
})
    .prefix('users')
    .middleware(['auth:jwt'])

Route.group(() => {
    Route.post('/', 'TweetController.tweet')
    Route.get('/all', 'TweetController.all')
    Route.get('/:id', 'TweetController.show')
    Route.post('/:id/reply', 'TweetController.reply')
    Route.post('/:id/like', 'TweetController.like')
    Route.delete('/:id/unlike', 'TweetController.unlike')
})
    .prefix('tweet')
    .middleware(['auth:jwt'])
