const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const PORT = 3000;
const saltRounds = 11;

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
  bcrypt
    .hash(req.body.password, saltRounds)
    .then((hash) => {
      if (hash) {
        const newUser = new User({
          email: req.body.username,
          password: hash,
        });

        newUser.save().then((createdUser) => {
          console.log(createdUser);
          res.render("secrets");
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

// --------LOGIN ROUTE

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  // console.log(req.body);

  User.find({ email: req.body.username })
    .then((foundUser) => {
      bcrypt.compare(
        req.body.password, // login password
        foundUser[0].password, // database saved password
        (err, result) => {
          // if error is found
          if (err) {
            console.error(err);
            res.redirect("/login");
            // if error is not found
          } else {
            // if result is true
            if (result) {
              res.render("secrets");
            }
            // is result is not true
            else {
              res.write("<h1>INVALID PASSWORD</h1> ");
              res.write("<a href='/login'>Go Back</a> ");
              res.send();
            }
          }
        }
      );

      // if (foundUser[0].password == req.body.password) {
      //   res.render("secrets");
      // } else {
      //   res.write("<h1>INVALID PASSWORD</h1> ");
      //   res.write("<a href='/login'>Go Back</a> ");
      //   res.send();
      // }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});
