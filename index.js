// import http from "http";
// import fs from "fs"
// import {feature} from "./feature.js";

// const server = http.createServer((req,res)=>{
//    const path = req.url;
//     if(path == "/home"){
//         fs.readFile("./index.html","utf-8",(err,data)=>{
//             res.end(data);
//         });
//     }
//     else if(path == "/feature"){
//         res.end(`<h1>Percentage Number ${feature()}</h1>`);
//     }
//     else if(path =="/about"){
//         res.end("<h1>about Page</h1>");
//     }
//     else {
//         res.end("<h1>Page not found</h1>");
//     }
// });

// server.listen(5000,"127.0.0.1",()=>{
//     console.log("served");
// });
import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
//connect mongodb to node
mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
  })
  .then(() => console.log("db connected"))
  .catch((e) => console.log(e));

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  password:String
});

const user = mongoose.model("Users", messageSchema);

const app = express();

//to get rid writing file extension by placing files in view with ejs extension
app.set("view engine", "ejs");

//to server static, get rid writing absolute path
app.use(express.static(path.join(path.resolve(), "public")));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

const users = [];

// app.get("/add",(req,res)=>{
//   Message.create({name:"luv",email:"sample@gmail.com"}).then(()=>{
//     res.send("added");
//   });
// });

// app.get("/", (req, res) => {
//   //passing data in file using ejs
//   // res.render("index",{name:"luv sharma"});
//   res.render("login")
// });

const isAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decrypted = jwt.verify(token, "kngki4ijfi4gjffj");
    console.log(decrypted);
    req.user = await user.findById(decrypted._id);
    
    next();
  } else {
    res.render("register");
  }
};
app.get("/", isAuth, (req, res) => {
  
  res.render("logout", { name: req.user.name });
});

app.post("/register", async (req, res) => {
  const { name, email,password } = req.body;

  const userExistorNot = await user.findOne({ email });
  
  if (userExistorNot) {
    return res.redirect("login");
  }
  const hashedPassword = await bcrypt.hash(password,10);
  const User = await user.create({
    name,
    email,
    password:hashedPassword
  });
  
  const token = jwt.sign(
    {
      _id: User._id,
    },
    "kngki4ijfi4gjffj"
  );
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});
app.get("/register",(req,res)=>{
  res.render("register");
});
app.get("/login",(req,res)=>{
    res.render("login");
});
app.post("/login",async (req, res) => {
  const  {email,password} = req.body;

  let User = await user.findOne({email});

  if(!User)return res.redirect("register");

  const passMatchOrNot = await bcrypt.compare(password,User.password);
  if(!passMatchOrNot)return res.render("login",{email,message:"Incorrect Password"});
  const token = jwt.sign(
    {
      _id: User._id,
    },
    "kngki4ijfi4gjffj"
  );
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});
app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

// app.post("/form", async (req, res) => {
//   // console.log(users);
//   const { name, email } = req.body;
//   await Message.create({
//     name,
//     email,
//   });
//   res.redirect("/success");
// });
// app.get("/success", (req, res) => {
//   res.render("success");
// });
// app.get("/users", (req, res) => {
//   res.json({
//     users,
//   });
// });

app.listen(5000, () => {
  console.log("served");
});
