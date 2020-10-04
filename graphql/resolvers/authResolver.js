const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')

const User = require('../../models/user.model')

const { sendConfirmationEmail, sendResetEmail, sendPasswordResetConfirmationEmail } = require('../../services/EmailService')

require('dotenv').config()

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const VERIFICATION_SECRET_KEY = process.env.VERIFICATION_SECRET_KEY 

module.exports = {
    Query: {
        login: async function (parent, { email, password }, context) {
            try {
                const user = await User.findOne({ email: email })
    
                // console.log('user verified in login', user.isVerified)
    
                const errors = []
    
                // console.log('email user', email)

                if(!user) {
                    const error = new Error('User not found.')
                    error.code = 404
                    errors.push('404')
                    
                    return {
                        __typename: 'EmailNotFound',
                        message: 'Email does not exist in database.'
                    }
    
                    // throw error
                }
    
                const isEqual = await bcrypt.compare(password, user.password)
    
                if(!isEqual) {
                    const error = new Error('Password is incorrect.')
                    error.code = 401
                    errors.push('401')
                    // throw error
                    return {
                        __typename: 'PasswordIncorrect',
                        message: 'Password is incorrect.'
                    }
                }
    
                if(!user.isVerified) {
                    const error = new Error('Please verify your email address')
                    error.code = 403
                    errors.push('403')
                    // throw error
                    return {
                        __typename: 'NotVerified',
                        message: 'Please verify your email address.'
                    }
                }
    
                const token = jwt.sign(
                    {
                        userId: user._id.toString(),
                        email: user.email
                    },
                    JWT_SECRET_KEY,
                    { expiresIn: '1h' }
                )
    
                //why refreshToken is needed here?
                const refreshToken = jwt.sign(
                    {
                        userId: user._id.toString(),
                        email: user.email
                    },
                    JWT_SECRET_KEY,
                    { expiresIn: '1h' }
                )
    
                return {
                    token,
                    refreshToken,
                    userId: user._id.toString(),
                    __typename: 'AuthData'
                }
    
            } catch(err) {
                console.log(err)
            }
        },
        verifyEmail: async function (parent, { verificationToken }, context) {
            
            let decodedToken
            let user

            try {
    
                decodedToken = jwt.verify(verificationToken, VERIFICATION_SECRET_KEY)

                user = await User.findOne({email: decodedToken.email})

                if(!user) {
                    // const error = new Error('User not found')
                    // error.code = 401
                    // throw error
                    return {
                        __typename: 'EmailVerificationFailed',
                        message: 'Email verification failed.'
                    }
                }
    
                user.isVerified = true
    
                await user.save()
    
                return {
                    ...user._doc,
                    _id: user._id.toString(),
                    __typename: 'User'
                }
    
            } catch(err) {
                user.isVerified = false
                return next()
            }
        },
    },
    Mutation: {
        createUser: async function (parent, { userInput }, context) {
            try {
                const errors = []
    
                if(!validator.isEmail(userInput.email)) {
                    errors.push({ message: 'Invalid email.' })
                    return {
                        __typename: 'EmailInvalid',
                        message: 'This email is invalid.'
                    }
                }
                if(
                    validator.isEmpty(userInput.password) ||
                    !validator.isLength(userInput.password, { min: 6 })
                ) {
                    errors.push({ message: 'Password is too short.' })
                    return {
                        __typename: 'PasswordNotQualified',
                        message: 'Password is not qualified.'
                    }
                }
    
                const existinguser = await User.findOne({ email: userInput.email })
    
                if(existinguser) {
                    // const error = new Error('User with this email already exists.')
                    // throw error
                    return {
                        __typename: 'EmailExists',
                        message: 'This email already exists.'
                    }
                }
    
                const hashedPW = await bcrypt.hash(userInput.password, 12)
    
                const user = new User({
                    email: userInput.email,
                    password: hashedPW,
                    name: userInput.name
                })
    
                await user.save()
    
                await sendConfirmationEmail(user)
    
                return {
                    __typename: 'User',
                    ...user._doc,
                    _id: user._id.toString()
                }
            } catch(err) {
                console.log(err)
            }
        },
        resetUserRequest: async function(parent, { email }, context) {
            try {
                const user = await User.findOne({email: email})
    
                if(!user) {
                    // const error = new Error('User with this email does not exists.')
                    // error.code = 401
                    // throw error
                    return {
                        __typename: 'EmailNotFound',
                        message: 'User with this email does not exists.'
                    }
                }
    
                await sendResetEmail(user)
    
                return {
                    ...user._doc,
                    userId: user._id.toString(),
                    __typename: 'AuthData'
                }
    
            } catch(err) {
                console.log(err)
            }
        },
        updateUserPassword: async function(parent, { newPassword, resetPasswordToken }, context) {
            try {
                const decodedToken = jwt.verify(resetPasswordToken, VERIFICATION_SECRET_KEY)
    
                const user = await User.findOne({email: decodedToken.email})
    
                if(!user) {
                    // const error = new Error('User with this email does not exists.')
                    // error.code = 401
                    // throw error
                    return {
                        __typename: 'EmailInvalid',
                        message: 'User with this email does not exists.'
                    }
                }
    
                const errors = []
    
                if(
                    validator.isEmpty(newPassword) ||
                    !validator.isLength(newPassword, {min: 6})
                ) {
                    errors.push({ message: 'New password is too short.' })
                    return {
                        __typename: 'PasswordNotQualified',
                        message: 'Password is not qualified.'
                    }
                }
    
                const hashedPW = await bcrypt.hash(newPassword, 12)
    
                user.password = hashedPW
    
                await user.save()
                await sendPasswordResetConfirmationEmail(user)
    
                return {
                    ...user._doc,
                    _id: user._id.toString(),
                    __typename: 'User'
                }
    
            } catch(err) {
                console.log(err)
            }
        }
    }
}
