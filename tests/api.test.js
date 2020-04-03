const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('api tests', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const blogTitle = helper.initialBlogs[0].title
    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(titles).toContain(blogTitle)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('"id" field is defined', async () => {
    const response = await api.get('/api/blogs')

    const promiseArray = response.body.map(blog => expect(blog.id).toBeDefined())

    await Promise.all(promiseArray)
  })

  test('a blog can be succesfully added', async () => {
    const newBlog = {
      title: 'test blog',
      author: 'test author',
      url: 'test url',
      likes: '1'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const blogsAfter = helper.notesInDb()

    const titles = (await blogsAfter).map(blog => blog.title)
    expect(titles).toContain('test blog')
    expect(titles).toHaveLength(helper.initialBlogs.length + 1)
  })
})

afterAll(() => {
  mongoose.connection.close()
})