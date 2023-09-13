const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { usr, TX, USR } = require("./model");
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
mongoose.connect(
  "mongodb+srv://tommy:1099@hacker-man.mqkqw8a.mongodb.net/ACID"
);
const db = mongoose.connection;

app.use(cors({ methods: ["GET", "POST", "DELETE", "OPTION", "PUT"] }));
app.use(express.json());
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("connected  to DB"));

app.listen(4444, () => console.log("listening on 4444"));

app.get("/createUser", async (req, res) => {
  const newUsr = await new USR({
    name: req.body.name,
    balance: 0,
  });
  await newUsr.save();
  res.send("User Created");
});

//=======================================================
app.post("/:id/deposit", cors(), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const usr = await USR.findById(req.params.id).session(session);
  try {
    usr.balance += req.body.amount;
    await usr.save();
    const tx = await new TX({
      userId: usr._id,
      total: usr.balance,
      TXAmount: req.body.amount,
      whatTX: "deposit",
      type: "Credit",
    });
    await tx.save();
    await session.commitTransaction();
    console.log("Deposit succeed");
    res.send("Deposit Succeed");
  } catch (error) {
    await session.abortTransaction();
    console.log("Deposit failed!");
    res.send("Deposit failed");
  }
});
app.post("/:id/withdraw", cors(), async (req, res) => {
  const session = await mongoose.startSession();
  await session.startTransaction();
  const usr = await USR.findById(req.params.id).session(session);
  try {
    if (req.body.amount > usr.balance) {
      console.log("Not enough money!");
      res.send("Not enough money!");
    } else {
      usr.balance -= req.body.amount;
      await usr.save();
      const tx = await new TX({
        userId: usr._id,
        total: usr.balance,
        TXAmount: req.body.amount,
        whatTX: "withdraw",
        type: "Credit",
      });
      await tx.save();
      await session.commitTransaction();
      console.log("withdraw succeed");
      res.send("withdraw Succeed");
    }
  } catch {
    await session.abortTransaction();
    console.log("withdraw failed!");
    res.send("withdraw failed");
  }
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
