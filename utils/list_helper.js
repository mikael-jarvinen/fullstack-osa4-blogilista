const dummy = blogs => {
  return 1
}

const totalLikes = blogs => {
  const sum = (sum, blog) => {
    return sum + blog.likes
  }
  return blogs.reduce(sum ,0)
}

module.exports = {
  dummy,
  totalLikes
}