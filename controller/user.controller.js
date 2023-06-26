const express = require('express');

require('dotenv').config()
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const {UserModel}= require("../model/user.model")

const verificationToken = uuidv4();

exports.register = async (req, res) => {

    try {
        const { username, email, password } = req.body;

        

        console.log(verificationToken)

        // checking
        const UserExits = await UserModel.findOne({ email })

        if (UserExits) {
            return res.status(400).json({ msg: "User already Present" })
        }
        bcrypt.hash(password, 8, async (err, hash) => {

            if (err) {
                res.send({ "msg": "Something Wrong", "err": err.message })
            } else {

                const user = new UserModel({ username, email, password: hash })
                await user.save()

                // Send verification email


                const transporter = nodemailer.createTransport({
                  host: 'smtp.ethereal.email',
                  port: 587,
                  auth: {
                      user: 'torrance.jenkins@ethereal.email',
                      pass: 'cWuNNtfaGsxDwe6mYn'
                  }
              });

                const mailOptions = {
                    from: 'vashevne@gmail.com', // Replace with your email
                    to: email,
                    subject: 'Verify your email',
                    html: `Click <a href="http://localhost:8080/verify/${verificationToken}">click here</a> to verify your email.`,
                };

                await transporter.sendMail(mailOptions);
                res.send({ "msg": " New User Registered Success" })
            }
        })
    } catch (err) {
        res.status(500).send({ msg: err.message })
        console.log(err)
    }
};

// Email verification endpoint
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Update the user's email verification status in the database

        await UserModel.updateOne({
            verificationToken: token
        },
            { $set: { verified: true }, $unset: { verificationToken: 1 } })

        res.status(200).json({ message: 'Email verification successful. You can now login.' });
    } catch (err) {
        console.error('Error during email verification:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.login =  async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await UserModel.findOne({ email })
        console.log(user)

        if (!user) {
            return res.status(401).json({ message: "Invalid username Or password" })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid username Or password" })
        }

        const AccessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.jwtKey, { expiresIn: 120 })
        res.cookie("jwt", AccessToken, { httpOnly: true })
        let loguser = user.username
        res.json({ msg: "Login Sucessful", AccessToken, loguser, verificationToken })

    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}


