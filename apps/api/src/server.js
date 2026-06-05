const app = require('./app')
const env = require('./config/env')
const { testDatabaseConnection } = require('./db/connection')

const startServer = async () => {
  try {
    await testDatabaseConnection()

    app.listen(env.port, '0.0.0.0', () => {
      console.log(`PINTARIN API running on http://localhost:${env.port}`)
    })
  } catch (error) {
    console.error('Failed to start server')
    console.error(error)
    process.exit(1)
  }
}

startServer()
