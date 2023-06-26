const { User } = require("../model/user.model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const jwtKey = process.env.jwtKey;

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.find({ email });
    if (user.length > 0) return res.json({ err: "user already present" });

    // Generate JWT token for email verification
    const token = jwt.sign({ email }, jwtKey, { expiresIn: '1h' });

    // email message
    const mailOptions = {
      from: 'vashevne@gmail.com',
      to: email,
      subject: 'Email Verification',
      text: `Please click the following link to verify your email: ${req.protocol}://${req.get('host')}/verify/${token}`,
    };

    //Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 587,
      auth: {
        user: 'your-mailtrap-username',
        pass: 'your-mailtrap-password',
      },
    });

    // Send the verification email
    await transporter.sendMail(mailOptions);

    // Hashpassword
    bcrypt.hash(password, 5, async (err, hash) => {
      if (err) {
        res.status(400).json({ err: err.message });
      } else {
        const user = new User({ name, email, password: hash });
        await user.save();
        console.log(user);
        res.status(200).json({ msg: "user registered" });
      }
    });
  } catch (error) {
    res.status(400).json({ err: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.find({ email });
    console.log(user);
    if (user.length !== 0) {
      await bcrypt.compare(password, user[0].password, (err, success) => {
        if (success) {
          token = jwt.sign({ userID: user[0]._id }, jwtKey, {
            expiresIn: "24h",
          });
          // token sent
          res.json({ message: "login success", Token: `${token}` });
        } else {
          res.status(403).send({ message: "Invalid Credentials" });
        }
      });
    } else {
      res.send("Wrong credentials");
    }
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decodedToken = jwt.verify(token, jwtKey);
    const { email } = decodedToken;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
