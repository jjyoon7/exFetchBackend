const { mergeResolvers } = require('@graphql-tools/merge')

const authResolver = require('./authResolver')
const exerciseResolver = require('./exerciseResolver')
const combinedResolver = require('./combinedResolver')
const userResolver = require('./userResolver')

const resolvers = [
    authResolver,
    exerciseResolver,
    combinedResolver,
    userResolver
]

module.exports = mergeResolvers(resolvers)