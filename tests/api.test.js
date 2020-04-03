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

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})