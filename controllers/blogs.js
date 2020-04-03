const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  if(!body.title || !body.url){
    return response.status(400).end()
  }

  let blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  })

  if(!body.likes){
    blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: 0
    })
  }

  logger.info(blog)

  try {
    const savedBlog = await blog.save()
    response.json(savedBlog.toJSON())
  } catch (e) {
    next(e)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const id = request.params.id
    await Blog.findByIdAndDelete(id)
    response.status(204).end()
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
