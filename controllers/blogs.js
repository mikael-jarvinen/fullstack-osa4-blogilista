const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1})
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body
  const token = request.token

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  if(!body.title || !body.url){
    return response.status(400).end()
  }

  let blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  if(!body.likes){
    blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: 0,
      user: user._id
    })
  }

  logger.info(blog)

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.json(savedBlog.toJSON())
  } catch (e) {
    next(e)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const blog = await Blog.findById(id)

    if(decodedToken.id === blog.user.toString()) {
      blog.remove()
      response.status(204).end()
    } else {
      response.status(400).json({ error: 'invalid token' })
    }
  } catch (e) {
    next(e)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const id = request.params.id
    const body = request.body

    let blog = {
      body: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    }

    if(!body.likes){
      blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: 0
      }
    }

    const newBlog = await Blog.findByIdAndUpdate(id, blog, { new: true})
    response.status(204).json(newBlog.toJSON())
  } catch (e) {
    next(e)
  }
})

module.exports = blogsRouter
