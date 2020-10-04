module.exports = `
    type User {
        _id: ID!
        email: String!
        password: String
        name: String!
        favoriteExercises: [Exercise!]!
        isVerified: Boolean!
        hasWeeklyExerciseGoal: Boolean
        weeklyExerciseGoal: Int
        weeklyExerciseGoalSubmitDate: String
        isWeeklyExerciseGoalAchieved: Boolean
        finishedExerciseRound: Int
        totalWorkoutTime: Int
        upperTotalWorkoutTime: Int
        coreTotalWorkoutTime: Int
        lowerTotalWorkoutTime: Int
    }
    
    input UserInputData {
        email: String!
        name: String!
        password: String!
    }
`