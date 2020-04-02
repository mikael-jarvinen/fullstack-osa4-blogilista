const lodash = require('lodash')

const dummy = blogs => {
  return 1
}

const totalLikes = blogs => {
  const sum = (sum, blog) => {
    return sum + blog.likes
  }
  return blogs.reduce(sum ,0)
}

const favoriteBlog = blogs => {
  return blogs.reduce((fav, blog) => {
    if (blog.likes > fav.likes){
      return {
        title: blog.title,
        author: blog.author,
        likes: blog.likes
      }
    } else {
      return fav
    }
  }, {likes:0})
}

const mostBlogs = blogs => {
  let authors = blogs.map(blog => blog.author)
  authors = lodash.uniq(authors)
  let scoreboard = []
  authors.forEach(() => scoreboard = scoreboard.concat(0))

  blogs.forEach(blog => {
    scoreboard[authors.indexOf(blog.author)]++
  })

  console.log('debugging', authors, scoreboard)

  let maxIndex = 0
  for (let i=0; i< scoreboard.length; i++){
    if(scoreboard[i] > scoreboard[maxIndex]){
      maxIndex = i
    }
  }

  return {
    author: authors[maxIndex],
    blogs: scoreboard[maxIndex]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}