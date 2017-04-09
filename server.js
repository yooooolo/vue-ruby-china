const config = require('dotenv').config()
const serverRender = require('vue-server-renderer')
const LRU = require('lru-cache')
const resolve = file => path.resolve(__dirname, file)
const isProd = process.env.NODE_ENV === 'production'

const Koa = require('koa')
const app = new Koa()

let renderer
if (isProd) {
  const bundle = require('./dist/vue-ssr-bundle.json')
  const template = fs.readFileSync(resolve('./dist/index.html'), 'utf-8')
  renderer = createRenderer(bundle, template)
} else {
  require('./build/setup-dev-server')(app, (bundle, template) => {
    renderer = createRenderer(bundle, template)
  })
}

function createRenderer (bundle, template) {
  return serverRender.createBundleRenderer(bundle, {
    template,
    cache: LRU({
      max: 1000,
      maxAge: 1000 * 60 * 15
    })
  })
}

// logger
app.use(async (ctx, next) => {
  const start = new Date
  await next()
  const ms = new Date - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// response
app.use(ctx => {
  if (!renderer) {
    ctx.end('waiting for compilation... refresh in a moment.')
  }

  const errorHandler = err => {
    if (err && err.code === 400) {
      ctx.status(404).end('404 | Page Not Found')
    } else {
      ctx.status(500).end('500 | Internal Server Error')
      console.error(`error during render: ${req.url}`)
      console.error(err)
    }
  }

  renderer
    .renderToStream({ url: ctx.url })
    .on('error', errorHandler)
    .pipe(ctx)
})

app.listen(process.env.PORT, () => {
  console.log(`server started at localhost: ${process.env.PORT}`)
})
