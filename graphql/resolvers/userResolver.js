const User = require('../../models/user.model')

module.exports = {
    Query: {
        user: async function(parent, { userId }, context) {
            try {
                // console.log('userId in user query',userId)
                if(!context.isAuth) {
                    const error = new Error('User not authenticated.')
                    error.code = 401
                    throw error
                }

                const user = await User.findById(userId)
                // console.log('user in userquery', user)
                if(!user) {
                    return {
                        __typename: 'UserNotFound'
                    }
                }
    
                return {
                    __typename: 'User',
                    ...user._doc,
                    _id: user._id.toString()
                }
                
            } catch(err) {
                return {
                    __typename: 'FetchingFailed',
                    message: err
                }
            }
        },
    },
    Mutation: {
        setWeeklyExerciseGoal: async function(parent, { userId, weeklyExerciseGoal }, context) {
            try {
                if(!context.isAuth) {
                    const error = new Error('User not authenticated.')
                    error.code = 401
                    throw error
                }

                const user = await User.findById(userId)

                if(!user) {
                    return {
                        __typename: 'FetchingFailed'
                    }
                }
                // console.log('weeklyExerciseGoal input from frontend',weeklyExerciseGoal)
                // console.log('user goal in set exercise goal', user.weeklyExerciseGoal)
                
                user.weeklyExerciseGoal = weeklyExerciseGoal
                user.weeklyExerciseGoalSubmitDate = new Date().toISOString()
                user.hasWeeklyExerciseGoal = true

                // console.log('user weeklygoal submit date', user.weeklyExerciseGoalSubmitDate)

                // console.log('user in set exercise goal', user)

                await user.save()

                return {
                    __typename: 'User',
                    ...user.doc,
                    _id: user._id.toString(),
                    weeklyExerciseGoal: user.weeklyExerciseGoal,
                    hasWeeklyExerciseGoal: user.hasWeeklyExerciseGoal,
                    weeklyExerciseGoalSubmitDate: user.weeklyExerciseGoalSubmitDate
                }

            } catch(err) {
                return {
                    __typename: 'AddFailed',
                    message: err
                }
            }
        },
        resetWeeklyData: async function(parent, { userId }, context) {
            //here reset user's weekly related date when the new week begins.
            //because user need to set a new goal every week.
            try {
                if(!context.isAuth) {
                    const error = new Error('User not authenticated.')
                    error.code = 401
                    throw error
                }

                const user = await User.findById(userId)

                if(!user) {
                    return {
                        __typename: 'UserNotFound'
                    }
                }

                user.finishedExerciseRound = 0
                user.weeklyExerciseGoal = 0
                user.isWeeklyExerciseGoalAchieved = false 
                user.weeklyExerciseGoalSubmitDate = null
                user.hasWeeklyExerciseGoal = false

                await user.save()

                return {
                    __typename: 'User',
                    ...user.doc,
                    _id: user._id.toString(),
                    finishedExerciseRound: user.finishedExerciseRound,
                    weeklyExerciseGoal: user.weeklyExerciseGoal,
                    isWeeklyExerciseGoalAchieved: user.isWeeklyExerciseGoalAchieved,
                    weeklyExerciseGoalSubmitDate: user.weeklyExerciseGoalSubmitDate,
                    hasWeeklyExerciseGoal: user.hasWeeklyExerciseGoal
                }
            } catch(err) {
                return {
                    __typename: 'ResetFailed',
                    message: err
                }
            }
        }
    }
}
