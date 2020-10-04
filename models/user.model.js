const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    favoriteExercises: [{ 
        type: Schema.Types.ObjectId,
        ref: 'Exercise' 
    }],
    isVerified: { type: Boolean, default: false },
    hasWeeklyExerciseGoal: { type: Boolean, default: false},
    weeklyExerciseGoal: { type: Number, default: 0 },
    isWeeklyExerciseGoalAchieved: { type: Boolean, default: false },
    finishedExerciseRound: { type: Number, default: 0 },
    totalWorkoutTime: { type: Number, default: 0 },
    upperTotalWorkoutTime: { type: Number, default: 0 },
    coreTotalWorkoutTime: { type: Number, default: 0 },
    lowerTotalWorkoutTime: { type: Number, default: 0 },
    weeklyExerciseGoalSubmitDate: { type: String }
})

const User = mongoose.model('User', userSchema)

module.exports = User
