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
      return {
        title: fav.title,
        author: fav.author,
        likes: fav.likes
      }
    }
  }, {likes:0})
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}