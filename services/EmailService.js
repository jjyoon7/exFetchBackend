const nodemailer = require('nodemailer')
const nodemailerSendgrid = require('nodemailer-sendgrid')
const jwt = require('jsonwebtoken')

require('dotenv').config()
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const VERIFICATION_SECRET_KEY = process.env.VERIFICATION_SECRET_KEY

const transporter = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: SENDGRID_API_KEY
    })
)

exports.sendConfirmationEmail = async (user) => {
    const token = jwt.sign(
        {
            userId: user._id.toString(),
            email: user.email
        }, 
        VERIFICATION_SECRET_KEY, 
        { expiresIn: '1h' }
    ) 
    const url = `http://localhost:3000/confirmation/${token}`

    transporter.sendMail({
        from: 'info@hometrainingwithkenny.life',
        to: `${user.email}`,
        subject: `Confirm your account, ${user.name} - Hometraining with Kenny`,
        html: `<div style="display: grid; place-items: center;">
                     <h3 style="color: #0000ea;">Confirm your account <a href=${url}>by clicking here</a></h3>
               </div>`
    }).then(() => {
        console.log('Email sent.')
    }).catch(err => {
        console.log(err.response.body)
    })
}

exports.sendResetEmail = async (user) => {
    const resetPasswordToken = jwt.sign(
        {
            userId: user._id.toString(),
            email: user.email
        }, 
        VERIFICATION_SECRET_KEY, 
        { expiresIn: '1h' }
    )

    const url = `http://localhost:3000/reset/${resetPasswordToken}`

    transporter.sendMail({
        from: 'info@hometrainingwithkenny.life',
        to: `${user.email}`,
        subject: `Reset your password, ${user.name} - Hometraining with Kenny`,
        html: `
                <div style="display: grid; place-items: center;">
                    <h3 style="color: #0000ea;">Reset your password <a href=${url}>by clicking here</a></h3>
                </div>
              `
    }).then(() => {
        console.log('Reset email sent.')
    }).catch(err => {
        console.log(err.response.body)
    })
}

exports.sendPasswordResetConfirmationEmail = async (user) => {
    transporter.sendMail({
        from: 'info@hometrainingwithkenny.life',
        to: `${user.email}`,
        subject: `Password has been successfully updated, ${user.name} - Hometraining with Kenny`,
        html: `
                <div style="display: grid; place-items: center;">
                    <h3 style="color: #0000ea;">Your password has been updated.</h3>
                </div>
              `
    }).then(() => {
        console.log('Password reset confirmation email sent.')
    }).catch(err => {
        console.log(err.response.body)
    })

}