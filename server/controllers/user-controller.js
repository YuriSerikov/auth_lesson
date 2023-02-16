const { json } = require("express");
const userService = require("../service/user-service");
const { validationResult } = require("express-validator");
const cookies = require("cookie-parser");
const ApiError = require("../exeptions/api-errors");

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          ApiError.BadRequest("Ошибка при валидации", errors.array())
        );
      }

      const { email, password } = req.body;
      const userData = await userService.registration(email, password);
      res.cookie("refresh token", userData.refreshToken, {
        maxAge: 30 * 24 * 3600000,
        httpOnly: true,
      });
      res.status(200).json({ email });
      return res.json(userData);
    } catch (e) {
      console.log("Ошибка регистрации: ", e);
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      res.cookie("refresh token", userData.refreshToken, {
        maxAge: 30 * 24 * 3600000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      res.status(500).json({ error: "Ошибка авторизации" });
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookies(refreshToken);
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }
  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      console.log("Ошибка активации: ", error);
      next(e);
    }
  }
  async refresh(req, res, next) {
    console.log("запущен user-controller refresh");
    try {
      const refreshToken = req.cookies["refresh token"];
      console.log("refreshToken от cookies", refreshToken);

      const userData = await userService.refresh(refreshToken);
      res.cookie("refresh token", userData.refreshToken, {
        maxAge: 30 * 24 * 3600000,
        httpOnly: true,
      });
      //return res.json("access token:", userData.accessToken);
      let returnData = {
        "access token": userData.accessToken,
      };
      return res.json(returnData);
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
}

module.exports = new UserController();
