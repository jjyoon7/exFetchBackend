module.exports = `
    type Exercise {
        _id: ID!
        bodySection: String!
        duration: String!
        title: String!
        videoUrl: String!
        favorite: Boolean
        totalRep: Int
    }

    type ExerciseNotFound {
        message: String
    }

    type TopThreeExercises {
        topThreeExercises: [Exercise!]
    }

    type ExerciseData {
        exercises: [Exercise!]!
        totalExercises: Int!
        currentPage: Int
    }

    type ExerciseRepAndWeeklyGoal {
        totalRep: Int!
        weeklyExerciseGoal: Int!
        isWeeklyExerciseGoalAchieved: Boolean!
        finishedExerciseRound: Int!
        totalWorkoutTime: Int!
        upperTotalWorkoutTime: Int!
        coreTotalWorkoutTime: Int!
        lowerTotalWorkoutTime: Int!
    }
    
    input ExerciseInputData {
        bodySection: String!
        duration: String!
    }
`