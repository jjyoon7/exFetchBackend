const express = require('express')
const mongoose = require('mongoose')
const app = express()
require('dotenv').config()
const PORT = process.env.PORT || 8080

const { graphqlHTTP } = require('express-graphql')
const executableSchema = require('./graphql/schema/schema')

const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')

const auth = require('./middleware/auth')

app.use(cors({
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(auth)

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/graphql', graphqlHTTP({
    schema: executableSchema,
    graphiql: true,
    customFormatErrorFn: (error) => ({
        message: error.message,
        locations: error.locations,
        stack: error.stack ? error.stack.split('\n') : [],
        path: error.path
    })
}))

app.use((error, req, res, next) => {
    console.log(error)
    const status = error.code || 500
    const message = error.message
    const data = error.data
    res.status(status).json({ message })
})

const uri = process.env.ATLAS_KEY

mongoose.connect(uri, { useNewUrlParser: true,
                        useUnifiedTopology: true,
                        useFindAndModify: false 
                    })
        .then(result => {
            console.log(`server is running on port ${PORT}`)
            console.log('MongoDB database connection established succesfully')
            app.listen(PORT)
        })
        .catch(err => console.log(err))

