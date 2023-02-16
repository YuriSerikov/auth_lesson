require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const config = require("config");
const router = require("./router/index");
const errorMiddleware = require("../server/middlewares/error-midleware.js");

const PORT = config.port || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
/* app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
); */
app.use(cors());
app.use("/api", router);
app.use(errorMiddleware);

const start = async () => {
  try {
    await mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () =>
      console.log(`Сервер стартовал через порт = ${PORT}`)
    );
  } catch (e) {
    console.log(e);
  }
};

start();
