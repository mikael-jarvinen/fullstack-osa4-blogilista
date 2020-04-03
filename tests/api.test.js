const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

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
    
    const blogsAfter = helper.blogsInDb()

    const titles = (await blogsAfter).map(blog => blog.title)
    expect(titles).toContain('test blog')
    expect(titles).toHaveLength(helper.initialBlogs.length + 1)
  })

  test('default value for field "likes" is assigned', async () => {
    const newBlog = {
      title: 'value-test blog',
      author: 'test author',
      url: 'test url'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)

    const returnedBlog = (await helper.blogsInDb())
      .find(blog => blog.title === 'value-test blog')
    expect(returnedBlog.likes).toBe(0)
  })

  test('malformatted blog can not be succesfully added', async () => {
    const newBlog = {
      likes: 12
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })

  test('a blog can be deleted', async () => {
    const blogs = await helper.blogsInDb()
    const id = blogs[0].id

    await api
      .delete(`/api/blogs/${id}`)
      .expect(204)

    const blogsAfter = await helper.blogsInDb()
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length - 1)
  })

  test('a blog can be edited', async () => {
    const blogs = await helper.blogsInDb()
    const id = blogs[0].id

    const newBlog = {
      title: 'edited blog',
      author: 'new author',
      url: 'edited url'
    }

    await api
      .put(`/api/blogs/${id}`)
      .send(newBlog)
      .expect(204)

    const blogsAfter = await helper.blogsInDb()
    expect(blogsAfter[0].title).toBe('edited blog')
  })
})

describe('User creation validation', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    const newUser = new User({ username: 'usermine', passwordHash })

    await user.save()
    await newUser.save()
  })

  test('unique username', async () => {
    const passwordHash = await bcrypt.hash('tomato', 10)
    const user = { 
      username: 'usermine',
      password: passwordHash 
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(400)
  })

  test('unempty password and username fields', async () => {
    const user = {
      name: 'heikki'
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(400)
  })

  test('password length must be longer than 2', async () => {
    const user = {
      username: 'tester',
      password: '12'
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(400)
  })
})

afterAll(() => {
  mongoose.connection.close()
})