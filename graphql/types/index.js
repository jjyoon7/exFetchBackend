const { mergeTypeDefs } = require('@graphql-tools/merge')

const authType = require('./authType')
const errorType = require('./errorType')
const exerciseType = require('./exerciseType')
const userType = require('./userType')

const types = [
    authType,
    errorType,
    exerciseType,
    userType
]
  
module.exports = mergeTypeDefs(types)