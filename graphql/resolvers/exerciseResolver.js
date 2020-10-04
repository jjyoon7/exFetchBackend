const validator = require('validator')

const mongoose = require('mongoose')
const { google } = require('googleapis')

const User = require('../../models/user.model')
const Exercise = require('../../models/exercise.model')

module.exports = {
    Query: {
        exercises: async function(parent, { page, perPage, userId, sortByKeyword }, context) {
            if(!context.isAuth) {
                const error = new Error('User not authenticated.')
                error.code = 401
                throw error
            }
            try {            
                if(!page) {
                    page = 1
                }

                // console.log('sortByKeyword', sortByKeyword)

                const creator = await User.findById(userId)

                let exercises
                let totalExercises

                //keywords options
                //'oldest', 'min. short - long', 'min. long - short', 'only upper', 'only core', 'only lower'
                if(sortByKeyword === 'oldest') {

                    // console.log('key word is oldest')
                    exercises = await Exercise.find()
                                              .where('creator')
                                              .in(creator)
                                              .sort({ createAt: 1 })
                                              .skip((page - 1) * perPage)
                                              .limit(perPage)
                    totalExercises = await Exercise.find().where('creator').in(creator).countDocuments() 
                } else if(sortByKeyword === 'favorite') {
                    // console.log('key word is favorite')

                    exercises = await Exercise.find()
                                              .where('creator')
                                              .in(creator)
                                              .where('favorite')
                                              .in(true)
                                              .sort({ createAt: 1 })
                                              .skip((page - 1) * perPage)
                                              .limit(perPage)

                    totalExercises = await Exercise.find().where('creator').in(creator).where('favorite').in(true).countDocuments()   
                } else if(sortByKeyword === 'min. short - long') {

                    // console.log('key word is min. short - long')
                    exercises = await Exercise.find()
                                              .where('creator')
                                              .in(creator)
                                              .sort({'duration': 1 })
                                              .skip((page - 1) * perPage)
                                              .limit(perPage)
                    totalExercises = await Exercise.find().where('creator').in(creator).countDocuments()

                } else if(sortByKeyword === 'min. long - short') {

                    // console.log('key word is min. long - short')
                    exercises = await Exercise.find()
                                              .where('creator')
                                              .in(creator)
                                              .sort({'duration': -1 })
                                              .skip((page - 1) * perPage)
                                              .limit(perPage)
                    totalExercises = await Exercise.find().where('creator').in(creator).countDocuments()

                } else if(sortByKeyword === 'only upper') {

                    // console.log('key word is only upper')
                    exercises = await Exercise.find()
                                              .where('creator')
                                              .in(creator)
                                              .where('bodySection')
                                              .in('Upper')
                                              .skip((page - 1) * perPage)
                                              .limit(perPage)
                    totalExercises = await Exercise.find().where('bodySection').in('Upper').countDocuments()  

                } else if(sortByKeyword === 'only core') {

                    // console.log('key word is only core')
                    exercises = await Exercise.find()
                                              .where('creator')
                                              .in(creator)
                                              .where('bodySection')
                                              .in('Core')
                                              .skip((page - 1) * perPage)
                                              .limit(perPage)

                    totalExercises = await Exercise.find().where('bodySection').in('Core').countDocuments()  

                } else if(sortByKeyword === 'only lower') {

                    // console.log('key word is only lower')
                    exercises = await Exercise.find()
                                              .where('creator')
                                              .in(creator)
                                              .where('bodySection')
                                              .in('Lower')
                                              .skip((page - 1) * perPage)
                                              .limit(perPage)
                    
                    totalExercises = await Exercise.find().where('bodySection').in('Lower').countDocuments()                          
                } else {
                    //when there is no keyword, or keyword is newest.
                    exercises = await Exercise.find()
                                              .where('creator')
                                              .in(creator)
                                              .sort({ createdAt: -1 })
                                              .skip((page - 1) * perPage)
                                              .limit(perPage)

                    totalExercises = await Exercise.find().where('creator').in(creator).countDocuments() 
                }

                // console.log('exercises in exercises resolver method', exercises)

                return {
                    __typename: 'ExerciseData',
                    exercises: exercises,
                    totalExercises: totalExercises,
                    currentPage: page
                }
            } catch(err) {
                console.log(err)
                return {
                    __typename: 'FetchingFailed'
                }
            }
        },
        exercise: async function(parent, { id }, context) {
            try {
                // console.log('context.isAuth', context.isAuth)
                
                if (!context.isAuth) {
                    const error = new Error('Not authenticated!')
                    error.code = 401
                    throw error
                  }
                //   console.log('id in exercise method', id)
                  const exercise = await Exercise.findById(id)
                //   console.log('exercise', exercise)
                  if (!exercise) {
                    return {
                        __typename: 'ExerciseNotFound'
                    }
                  }
                  return {
                    __typename: 'Exercise',  
                    ...exercise._doc,
                    _id: exercise._id.toString()
                  }
            } catch(err) {
                return {
                    __typename: 'FetchingFailed',
                    message: err
                }
            }
        },
        topThreeExercises: async function(parent, { userId }, context) {
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

                const exercises = await Exercise.find().where('creator').in(user)
                // console.log('exercises in top three', exercises)

                if(!exercises) {
                    return {
                        __typename: 'EmptyArray'
                    }
                }

                const mappedTopThreeExercises = exercises.filter(exercise => {
                                                    if(exercise.totalRep > 0) return exercise
                                                }).sort(function (a, b) {
                                                    if(a.totalRep !== 0 && b.totalRep !== 0) {
                                                        return b.totalRep - a.totalRep
                                                    }
                                                }).slice(0, 3)

                // console.log('mappedTopThree',mappedTopThree)

                return {
                    __typename: 'TopThreeExercises',
                    topThreeExercises: mappedTopThreeExercises
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
        createExerciseRequest: async function(parent, { exerciseInput }, context) {
            try {
                if(!context.isAuth) {
                    const error = new Error('User not authenticated.')
                    error.code = 401
                    throw error
                }
            
                if (validator.isEmpty(exerciseInput.bodySection)) {
                    return {
                        __typename: 'BodySectionMissing'
                    }
                }
        
                if (validator.isEmpty(exerciseInput.duration)) {
                    return {
                        __typename: 'DurationMissing'
                    }
                }

                const user = await User.findById(context.userId)
                // fetch a video based on key word
                // check if fetched video already exists in the database
                // if it already exists, send a new request to search for a new video
                // if fetched video is new, save to the Exercise database.

                //fetch video
                const fetchedExerciseData = await google.youtube('v3').search.list({
                    key: process.env.YOUTUBE_TOKEN,
                    part: 'snippet',
                    q: `${exerciseInput.bodySection} ${exerciseInput.duration}min workout`,
                    type: 'video',
                    maxResults: 20
                }).then(async response => {
                    // console.log('response.data.items', response.data.items)
                    const youtubeData = response.data.items

                    const filteredExerciseData = youtubeData.map((item) => {
        
                        const yotubeTitle = item.snippet.title
                        const youtubeUrl = item.id.videoId

                        const exercise = new Exercise({
                            _id: mongoose.Types.ObjectId(),
                            bodySection: exerciseInput.bodySection,
                            duration: exerciseInput.duration,
                            title: yotubeTitle,
                            videoUrl: `https://www.youtube.com/embed/${youtubeUrl}`,
                            favorite: false,
                            creator: user
                        })

                        return exercise
                        
                    })

                    const randomNum = Math.floor(Math.random() * Math.floor(20))

                    //randomly get 1 item from filteredExerciseData array
                    const fetchedData = filteredExerciseData[randomNum]

                    const savedExerciseData = await fetchedData.save()

                    //maybe just return success message
                    //and save new exercise data to the exercises array?

                    return savedExerciseData
                })   

                // console.log('fetchedExerciseData', fetchedExerciseData)

                //returning that fetched video
                return {
                    __typename: 'Exercise',
                    ...fetchedExerciseData._doc,
                    _id: fetchedExerciseData._id.toString(),
                    createdAt: fetchedExerciseData.createdAt.toISOString()
                }

            } catch(e) {
                console.log(e)
                return {
                    __typename: 'FetchingFailed'
                }
            }
        },
        deleteExercise: async function(parent, { id }, context) {
            try {
                if(!context.isAuth) {
                    const error = new Error('User not authenticated.')
                    error.code = 401
                    throw error
                }

                // console.log('id from delete exercise',id)

                //check if the exercise exsits
                const exercise = await Exercise.findById(id)

                // console.log('exercise found',exercise)
    
                if(!exercise) {
                    const error = new Error('Cannot find the exercise')
                    error.code = 404
                    throw error
                }
    
                //if the exercise exists, delete it.
                await Exercise.findByIdAndRemove(id)
    
                //also delete from the user's favorite if the exercise was favorited.
                if(exercise.favorite) {
                    const user = await User.findById(context.userId)
                    user.favoriteExercises.pull(id)
                    await user.save()
                }

                return {
                    ...exercise._doc
                }
    
                //for the testing
                // return true
            } catch(err) {
                console.log(err)
            }
        },
        toggleFavoriteExercise: async function(parent, { id }, context) {
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

                // console.log('favorite in toggleFavoriteExercise', favorite)
    
                exercise.favorite = !exercise.favorite
                await exercise.save()
    
                return {
                    __typename: 'Exercise',
                    ...exercise._doc,
                    _id: exercise._id.toString()
                }
    
            } catch(err) {
                return {
                    __typename: 'AddFailed',
                    message: err
                }
            }
        }
    }
}
