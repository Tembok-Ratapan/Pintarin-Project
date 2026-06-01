const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const env = require('./config/env')
const { createRateLimiter } = require('./middlewares/rateLimiter')
const healthRoutes = require('./modules/health/health.routes')
const authRoutes = require('./modules/auth/auth.routes')
const profileRoutes = require('./modules/profiles/profile.routes')
const analyticsRoutes = require('./modules/analytics/analytics.routes')
const regionsRoutes = require('./modules/regions/regions.routes')
const predictionsRoutes = require('./modules/predictions/predictions.routes')
const csrRoutes = require('./modules/csr/csr.routes')
const schoolRoutes = require('./modules/schools/school.routes')
const schoolRequestRoutes = require('./modules/schoolRequests/schoolRequest.routes')
const csrAidRoutes = require('./modules/csrAid/csrAid.routes')
const notFoundHandler = require('./middlewares/notFoundHandler')
const errorHandler = require('./middlewares/errorHandler')
const aiRoutes = require('./modules/ai/ai.routes')

const app = express()

if (env.security.trustProxy) {
  app.set('trust proxy', 1)
}

app.use(helmet())

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin)) {
        return callback(null, true)
      }

      const error = new Error('Not allowed by CORS')
      error.statusCode = 403

      return callback(error)
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

if (env.security.rateLimitEnabled) {
  app.use(
    createRateLimiter({
      windowMs: env.security.rateLimitWindowMs,
      max: env.security.rateLimitMax,
      message: 'Terlalu banyak request. Coba lagi beberapa saat lagi.',
    })
  )
}

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'))
}

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to PINTARIN API',
  })
})

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/regions', regionsRoutes)
app.use('/api/predictions', predictionsRoutes)
app.use('/api/csr', csrRoutes)
app.use('/api/schools', schoolRoutes)
app.use('/api/school-requests', schoolRequestRoutes)
app.use('/api/csr-aid', csrAidRoutes)
app.use('/api/ai', aiRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
