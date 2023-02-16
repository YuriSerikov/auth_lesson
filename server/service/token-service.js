const jwt = require("jsonwebtoken");
const tokenModel = require("../models/token-model");

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "10m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });
    return { accessToken, refreshToken };
  }
  async saveToken(userId, refreshToken) {
    const tokenData = await tokenModel.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const tocken = await tokenModel.create({
      user: userId,
      refreshToken: refreshToken,
    });
    return tocken;
  }

  async removeToken(refreshToken) {
    const tokenData = await tokenModel.deleteOne({
      refreshToken: refreshToken,
    });
    return tokenData;
  }

  async validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (error) {
      return null;
    }
  }

  async validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      console.log("валидация токуна доступа userData: ", userData);
      return userData;
    } catch (error) {
      return null;
    }
  }
  async findToken(refreshToken) {
    const tokenData = await tokenModel.findOne({ refreshToken: refreshToken });
    return tokenData;
  }
}

module.exports = new TokenService();
