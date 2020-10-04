const makeExecutableSchema = require('@graphql-tools/schema').makeExecutableSchema
const resolvers = require('../resolvers/index')
const typeDefs = require('../types/index')

const typeDefsUnion = `
    union LoginResult = AuthData | EmailNotFound | PasswordIncorrect | NotVerified

    union CreateUserResult = User | EmailInvalid | EmailExists | PasswordNotQualified 

    union ResetResult = AuthData | EmailNotFound

    union VerificationResult = User | EmailVerificationFailed

    union UpdatePasswordResult = User | EmailInvalid | PasswordNotQualified

    union CreateExerciseResult = Exercise | BodySectionMissing | DurationMissing | FetchingFailed

    union ExerciseListResult = ExerciseData | FetchingFailed | EmptyArray

    union ToggleFavResult = Exercise | ExerciseNotFound | AddFailed

    union TotalRepAndWeeklyGoalResult = ExerciseRepAndWeeklyGoal | ExerciseNotFound | FetchingFailed 

    union TopThreeExercisesResult = TopThreeExercises | FetchingFailed | EmptyArray | UserNotFound

    union ExerciseResult = Exercise | ExerciseNotFound | FetchingFailed

    union WeeklyExerciseGoalResult = User | AddFailed | FetchingFailed

    union ResetWeeklyDataResult = User | UserNotFound | ResetFailed

    union UserResult = User | UserNotFound | FetchingFailed

    type Query {
        login(email: String!, password: String!): LoginResult!
        verifyEmail(verificationToken: String!): VerificationResult!
        exercises(userId: String!, page: Int, perPage: Int, sortByKeyword: String): ExerciseListResult!
        topThreeExercises(userId: String!): TopThreeExercisesResult!
        exercise(id: ID!): ExerciseResult!
        user(userId: String!): UserResult!
    }

    type Mutation {
        createUser(userInput: UserInputData): CreateUserResult!
        createExerciseRequest(exerciseInput: ExerciseInputData): CreateExerciseResult!
        deleteExercise(id: ID!): Exercise!
        resetUserRequest(email: String!): ResetResult!
        updateUserPassword(newPassword: String!, resetPasswordToken: String!): UpdatePasswordResult!
        toggleFavoriteExercise(id: ID!): ToggleFavResult!
        updateExerciseTotalRepAndWeeklyExerciseGoal(id: ID!, userId: String!): TotalRepAndWeeklyGoalResult!
        setWeeklyExerciseGoal(userId: String!, weeklyExerciseGoal: Int!): WeeklyExerciseGoalResult!
        resetWeeklyData(userId: String!): ResetWeeklyDataResult!
    }

    schema { 
        query: Query
        mutation: Mutation
    }
`

const executableSchema = makeExecutableSchema({
    typeDefs: [ typeDefs, typeDefsUnion ],
    resolvers
})

// console.log(executableSchema.typeDefs)

module.exports = executableSchema