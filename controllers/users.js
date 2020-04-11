const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
  const body = request.body

  if(!body.username || !body.password){
    return response.status(400).json({
      error: 'missing username and/or password'
    })
  } else if (body.password.length < 3){
    return response.status(400).json({
      error: 'too short password'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)


  try {
    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    })
  
    const savedUser = await user.save()
  
    response.json(savedUser)
  } catch (e) {
    next(e)
  }
})

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('Note', { title: 1, author: 1 })

  response.json(users.map(u => u.toJSON()))
})

usersRouter.get('/:id', async (request, response, next) => {
  const id = request.params.id

  try {
    const user = await User.findById(id)
    response.json(user.toJSON())
  } catch (e) {
    next(e)
  }
})

module.exports = usersRouter