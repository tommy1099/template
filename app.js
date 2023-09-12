const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const DOGDB = require("./model");

const app = express();
mongoose.connect("mongodb+srv://tommy:1099@hacker-man.mqkqw8a.mongodb.net/DOG");
const db = mongoose.connection;
app.use(cors({ methods: ["GET", "POST", "DELETE", "OPTION", "PUT"] }));
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("connected  to DB"));
app.listen(4444, () => console.log("listening on 4444"));
//=======================================================
app.get("/all", cors(), async (req, res) => {
  let allDBArr = [];
  const allDB = await DOGDB.find();
  allDB.forEach((item) => allDBArr.push(item.src));
  //   console.log(src);
  res.send(allDBArr);
});
