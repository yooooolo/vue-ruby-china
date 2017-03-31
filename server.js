const config = require('dotenv').config()
const Koa = require('koa')
const app = new Koa()

app.listen(process.env.PORT, () => {
  console.log(`server started at localhost: ${process.env.PORT}`)
})
