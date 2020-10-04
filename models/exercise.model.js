const mongoose = require('mongoose')
const Schema = mongoose.Schema

const exercisesSchema = mongoose.Schema({
    bodySection: { type: String, require: true },
    duration: { type: Number },
    title: {type: String},
    videoUrl: { type: String },
    favorite: { type: Boolean, default: false },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalRep: { type: Number, default: 0 }
}, { timestamps: true })

const Exercise = mongoose.model('Exercise', exercisesSchema)

module.exports = Exercise
