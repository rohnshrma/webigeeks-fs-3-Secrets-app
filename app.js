const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const exp = require("constants");
const { type } = require("os");

const PORT = 3000;

// middlewares

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose
  .connect("mongodb://localhost:27017/webigeeks-secretsDB")
  .then(() => {
    console.log(`Connected to webigeeks-secretsDB`);
    app.listen(PORT, () => {
      console.log("server started on port", PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });

// schema
const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, minLength: 8, required: true },
    password: { type: String, minLength: 8, required: true },
  },
  { timestamps: true }
);

// model

const User = new mongoose.model("user", userSchema);

//   ROUTES

// ------- HOME ROUTE
app.get("/", (req, res) => {
  res.render("home");
});

// --------SIGNUP ROUTE

app.get("/signup", (req, res) => {
  res.render("register");
});

app.post("/signup", (req, res) => {
  console.log(req.body);

  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });

  newUser
    .save()
    .then((addedUser) => {
      console.log("Newly added user ->", addedUser);
      res.render("secrets");
    })
    .catch((err) => {
      console.log(err);
    });
});

// --------LOGIN ROUTE

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  console.log(req.body);

  User.find({ email: req.body.username })
    .then((foundUser) => {
      if (foundUser[0].password == req.body.password) {
        res.render("secrets");
      } else {
        res.write("<h1>INVALID PASSWORD</h1> ");
        res.write("<a href='/login'>Go Back</a> ");
        res.send();
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});
