const express = require('express')
const nodemailer = require('nodemailer')
const path = require('path')
const dotenv = require('dotenv')
const { google } = require('googleapis')
const cors = require('cors')

dotenv.config()

const port = process.env.PORT || 5000
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const redirectUrl = process.env.REDIRECT_URL
const refreshToken = process.env.REFRESH_TOKEN

const app = express()
app.use(cors())

const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl)

oAuth2Client.setCredentials({ refresh_token: refreshToken })

// processing the request body
// app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
  res.send('API is running...')
})

app.post('/send', async (req, res) => {
  const output = `
        <p>Ermias you got a new Message</p>
        <h3>Contact Detail</h3>
        <h4>${req.body.username}</h4>
        <h4>${req.body.email}</h4>
        <p>${req.body.message}</p>
    `

  const accessToken = await oAuth2Client.getAccessToken()

  let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'hadeklte21@gmail.com',
      clientId,
      clientSecret,
      refreshToken,
      accessToken,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })

  let mailOptions = {
    from: '"HadeKlte" <hadeklte21@gmail.com>',
    to: 'sotyu28@gmail.com',
    subject: 'Nodemailer Testing',
    text: 'lets check out NODMAILER',
    html: output,
  }

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      throw new Error('nodemailer fail')
      return
    }

    // console.log("mail service", mailOptions)

    // console.log("Message sent: %s", info);

    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.status(201).json(info)
  })
})

// const __direname = path.resolve()

// if(process.env.NODE_ENV === "production"){
//   app.use(express.static(path.join(__direname, "/frontend/build")))

//   app.get("*", (req, res) => res.sendFile(path.resolve(__direname, "frontend", "build", "index.js")))
// } else {

// }

// // Custom Error Handler for Routes does not exist
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
})

//  customer error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  })
})

app.listen(port, () => {
  console.log(`server is running on ${port}`)
})
