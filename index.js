const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors=require("cors")
require("dotenv").config();
const io = require('socket.io')(server);
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');



const port = process.env.PORT || 7070;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
