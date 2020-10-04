const User = require('../../models/user.model')
const Exercise = require('../../models/exercise.model')

module.exports = {
    Mutation: {
        updateExerciseTotalRepAndWeeklyExerciseGoal: async function(parent, { id, userId }, context) {
            //this method is combined, to avoid chaining 2 different mutations.
            try {
                if(!context.isAuth) {
                    const error = new Error('User not authenticated.')
                    error.code = 401
                    throw error
                }
                const exercise = await Exercise.findById(id)

                if(!exercise) {
                    return {
                        __typename: 'ExerciseNotFound'
                    }
                }

                const user = await User.findById(userId)

                if(!user) {
                    return {
                        __typename: 'FetchingFailed'
                    }
                }

                exercise.totalRep += 1
                user.finishedExerciseRound += 1

                if(exercise.bodySection === 'Upper') {
                    user.upperTotalWorkoutTime += exercise.duration
                
                } else if(exercise.bodySection === 'Core') {
                    // console.log('user.coreTotalWorkoutTime + exercise.duration', user.coreTotalWorkoutTime + exercise.duration)
                    user.coreTotalWorkoutTime += exercise.duration
                
                } else if(exercise.bodySection === 'Lower') {
                    user.lowerTotalWorkoutTime += exercise.duration
                }

                user.totalWorkoutTime = user.upperTotalWorkoutTime + user.coreTotalWorkoutTime + user.lowerTotalWorkoutTime

                //here checking if the weeklyExerciseGoal is true
                if (user.weeklyExerciseGoal <= user.finishedExerciseRound) {
                    user.isWeeklyExerciseGoalAchieved = true
                } else {
                    user.isWeeklyExerciseGoalAchieved = false
                }

                await exercise.save()
                await user.save()

                return {
                    __typename: 'ExerciseRepAndWeeklyGoal',
                    totalRep: exercise.totalRep,
                    finishedExerciseRound: user.finishedExerciseRound,
                    weeklyExerciseGoal: user.weeklyExerciseGoal,
                    isWeeklyExerciseGoalAchieved: user.isWeeklyExerciseGoalAchieved,
                    totalWorkoutTime: user.totalWorkoutTime,
                    upperTotalWorkoutTime: user.upperTotalWorkoutTime,
                    coreTotalWorkoutTime: user.coreTotalWorkoutTime,
                    lowerTotalWorkoutTime: user.lowerTotalWorkoutTime
                }
    
            } catch(err) {
                return {
                    __typename: 'UpdateFailed',
                    message: err
                }
            }
        }
    }
}