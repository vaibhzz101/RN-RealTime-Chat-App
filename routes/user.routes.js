const express = require("express")
const controller = require("../controller/user.controller");
const { model } = require("mongoose");
const userRouter = express.Router()

userRouter.post("/register", controller.register);
userRouter.post("/login", controller.login);
userRouter.get("/verify/:token", controller.verifyEmail )

module.exports = {
    userRouter,
  };
  