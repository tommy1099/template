const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const DOGDB = require("./model");
const redis = require("redis");
const app = express();

const redisClient = redis.createClient({
  host: "localhost",
  port: 6379,
});

redisClient.connect();
redisClient.on("connect", function () {
  console.log("Connected to Redis");
});
redisClient.on("error", function (err) {
  console.log("Error: " + err);
});
mongoose.connect("mongodb+srv://tommy:1099@hacker-man.mqkqw8a.mongodb.net/DOG");
const db = mongoose.connection;

app.use(cors({ methods: ["GET", "POST", "DELETE", "OPTION", "PUT"] }));
app.use(express.json());
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("connected  to DB"));

app.listen(4444, () => console.log("listening on 4444"));

//=======================================================
app.get("/", cors(), async (req, res) => {
  await check().then((data) => {
    res.json({ srcs: data });
  });
});

const check = async function () {
  // redisClient.set("srcs", "https://");

  await redisClient.get("srcs").then(async (data) => {
    try {
      if (data !== null) {
        return JSON.parse(data);
      } else {
        let arr = [];
        const allDogs = await DOGDB.find();
        allDogs.forEach((item) => arr.push(item.src));
        await redisClient.setEx("srcs", 3600, JSON.stringify(arr));
      }
    } catch (error) {
      console.log(error);
    }
  });
  const recentlyAdded = await redisClient.get("srcs");
  return JSON.parse(recentlyAdded);
};
