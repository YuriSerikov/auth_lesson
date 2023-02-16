const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const mailService = require("./mail-service");
const tokenService = require("./token-service");
const UserDtos = require("../dtos/dtos");
const sendVerificationMail = require("./sendVerificationMail");
const ApiError = require("../exeptions/api-errors");

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(
        `Пользователь с почтовым адресом ${email} уже существует.`
      );
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();

    console.log("email: ", email);
    const user = await UserModel.create({
      email,
      password: hashPassword,
      activationLink,
    });

    // отправка верификационного сообщения
    console.log("user: ", user);
    await sendVerificationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`
    );

    const userDtos = new UserDtos(user); // id, email, isActivated
    const tokens = tokenService.generateTokens({ ...userDtos });
    await tokenService.saveToken(userDtos.id, tokens.refreshToken);
    return { ...tokens, user: userDtos };
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Некорректная ссылка активации");
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest("Пользователь не найден");
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest("Не верный пароль");
    }
    const userDtos = new UserDtos(user); // id, email, isActivated
    const tokens = tokenService.generateTokens({ ...userDtos });
    console.log("tokens", tokens);
    await tokenService.saveToken(userDtos.id, tokens.refreshToken);
    return { ...tokens, user: userDtos };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    console.log("запущен user-service refresh token");
    console.log("refresh token:", refreshToken);
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = await tokenService.validateRefreshToken(refreshToken);
    console.log("проверка refresh token", userData);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    console.log("токен из БД:", tokenFromDb);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id);
    console.log("пользователь из БД : ", user);
    const userDtos = new UserDtos(user); // id, email, isActivated
    const tokens = tokenService.generateTokens({ ...userDtos });
    console.log("новые токены: ", tokens);
    console.log("id пользователя: ", userDtos.id);
    await tokenService.saveToken(userDtos.id, tokens.refreshToken);
    return { ...tokens, user: userDtos };
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new UserService();
