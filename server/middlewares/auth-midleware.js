const ApiError = require("../exeptions/api-errors");
const TokenService = require("../service/token-service");

module.exports = async function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    console.log("заголовок авторизации: ", authorizationHeader);

    if (!authorizationHeader) {
      console.log("нет заголовка req.headers.authorization");
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      console.log("нет токена accessToken");
      return next(ApiError.UnauthorizedError());
    }

    const userData = await TokenService.validateAccessToken(accessToken);
    //console.log("userData = ", userData);
    if (!userData) {
      console.log("нет валидации токена доступа");
      return next(ApiError.UnauthorizedError());
    }
    req.user = userData;
    next();
  } catch (e) {
    console.log("auth-midleware: ошибка не определена - ", e);
    return next(ApiError.UnauthorizedError());
  }
};
