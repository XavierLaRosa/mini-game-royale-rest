// reference environment variables using dotenv package
require('dotenv').config()

// install server dependencies
const express = require('express')
const app = express()
const mongoose = require('mongoose')

// connect to mongodb database
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to database'))

// tell express to accept JSON as the data format
app.use(express.json())

const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

const gamesRouter = require('./routes/games')
app.use('/games', gamesRouter)

const sessionsRouter = require('./routes/sessions')
app.use('/sessions', sessionsRouter)

// test out server is working
app.listen(3000, () => console.log('server started'))