// ========================= level 4 bcrypt

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");

const saltRounds = 11;

const PORT = 3000;

// middlewares

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(passport.initialize());
app.use(passport.session());

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

app.use(
  session({
    secret: "hello world",
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // milliseconds
  })
);

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

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      console.log("strategy running.");
      try {
        const user = await User.findOne({ email });
        if (!user) {
          console.log("User Not Found");
          return done(null, false, { message: "User Not Found" });
        }
        // compare and return true or false if password is same or not
        const isValid = await bcrypt.compare(password, user.password);
        // if password is not same
        if (!isValid) {
          console.log("Incorrect Password");
          return done(null, false, { message: "Incorrect password" });
        }

        console.log("User Authenticated");
        // if user is authenticated (only if password matched)
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

//   ROUTES

// ------- HOME ROUTE
app.get("/", (req, res) => {
  res.render("home");
});

// --------SIGNUP ROUTE

app.get("/signup", (req, res) => {
  res.render("register");
});

app.post("/signup", async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: username });
    if (existingUser) {
      return res.redirect("/auth/login");
    }

    const hash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({ email: username, password: hash });
    await newUser.save();

    req.login(newUser, (err) => {
      if (err) {
        return console.error("Error Loggin in :", err);
      }
      res.redirect("/secrets");
    });
  } catch (err) {
    console.error(err);
  }
});

// --------LOGIN ROUTE

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  // console.log(req.body);

  User.find({ email: req.body.username })
    .then((foundUser) => {
      if (foundUser.length === 1) {
        bcrypt
          .compare(req.body.password, foundUser[0].password)
          .then((result) => {
            if (result) {
              console.log("password matched");
              res.render("secrets");
            } else {
              console.log("Incorrect password");
              res.redirect("/login");
            }
          });
      } else {
        console.log(`user with ${req.body.username} doesn't exists.`);
        res.redirect("/signup");
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});

// ========================= level 3 md5

// const express = require("express");
// const app = express();

// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const md5 = require("md5");
// const PORT = 3000;

// console.log(md5("password"));

// // middlewares

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));
// app.set("view engine", "ejs");

// mongoose
//   .connect("mongodb://localhost:27017/webigeeks-secretsDB")
//   .then(() => {
//     console.log(`Connected to webigeeks-secretsDB`);
//     app.listen(PORT, () => {
//       console.log("server started on port", PORT);
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// // schema
// const userSchema = new mongoose.Schema(
//   {
//     email: { type: String, unique: true, minLength: 8, required: true },
//     password: { type: String, minLength: 8, required: true },
//   },
//   { timestamps: true }
// );

// // model

// const User = new mongoose.model("user", userSchema);

// //   ROUTES

// // ------- HOME ROUTE
// app.get("/", (req, res) => {
//   res.render("home");
// });

// // --------SIGNUP ROUTE

// app.get("/signup", (req, res) => {
//   res.render("register");
// });

// app.post("/signup", (req, res) => {
//   const newUser = new User({
//     email: req.body.username,
//     password: md5(req.body.password),
//   });

//   newUser
//     .save()
//     .then((createdUser) => {
//       console.log(createdUser);
//       res.render("secrets");
//     })

//     .catch((err) => {
//       console.error(err);
//     });
// });

// // --------LOGIN ROUTE

// app.get("/login", (req, res) => {
//   res.render("login");
// });

// app.post("/login", (req, res) => {
//   // console.log(req.body);

//   User.find({ email: req.body.username })
//     .then((foundUser) => {
//       if (foundUser[0].password == md5(req.body.password)) {
//         res.render("secrets");
//       } else {
//         res.write("<h1>INVALID PASSWORD</h1> ");
//         res.write("<a href='/login'>Go Back</a> ");
//         res.send();
//       }
//     })
//     .catch((err) => {
//       console.log(err);
//       res.redirect("/login");
//     });
// });

// ========================= level 1

// const express = require("express");
// const app = express();

// const bodyParser = require("body-parser");
// const bcrypt = require("bcrypt");
// const mongoose = require("mongoose");

// const PORT = 3000;
// const saltRounds = 11;

// // middlewares

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));
// app.set("view engine", "ejs");

// mongoose
//   .connect("mongodb://localhost:27017/webigeeks-secretsDB")
//   .then(() => {
//     console.log(`Connected to webigeeks-secretsDB`);
//     app.listen(PORT, () => {
//       console.log("server started on port", PORT);
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// // schema
// const userSchema = new mongoose.Schema(
//   {
//     email: { type: String, unique: true, minLength: 8, required: true },
//     password: { type: String, minLength: 8, required: true },
//   },
//   { timestamps: true }
// );

// // model

// const User = new mongoose.model("user", userSchema);

// //   ROUTES

// // ------- HOME ROUTE
// app.get("/", (req, res) => {
//   res.render("home");
// });

// // --------SIGNUP ROUTE

// app.get("/signup", (req, res) => {
//   res.render("register");
// });

// app.post("/signup", (req, res) => {
//   console.log(req.body);
//   bcrypt
//     .hash(req.body.password, saltRounds)
//     .then((hash) => {
//       if (hash) {
//         const newUser = new User({
//           email: req.body.username,
//           password: hash,
//         });

//         newUser.save().then((createdUser) => {
//           console.log(createdUser);
//           res.render("secrets");
//         });
//       }
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// });

// // --------LOGIN ROUTE

// app.get("/login", (req, res) => {
//   res.render("login");
// });

// app.post("/login", (req, res) => {
//   // console.log(req.body);

//   User.find({ email: req.body.username })
//     .then((foundUser) => {
//       bcrypt.compare(
//         req.body.password, // login password
//         foundUser[0].password, // database saved password
//         (err, result) => {
//           // if error is found
//           if (err) {
//             console.error(err);
//             res.redirect("/login");
//             // if error is not found
//           } else {
//             // if result is true
//             if (result) {
//               res.render("secrets");
//             }
//             // is result is not true
//             else {
//               res.write("<h1>INVALID PASSWORD</h1> ");
//               res.write("<a href='/login'>Go Back</a> ");
//               res.send();
//             }
//           }
//         }
//       );

//       // if (foundUser[0].password == req.body.password) {
//       //   res.render("secrets");
//       // } else {
//       //   res.write("<h1>INVALID PASSWORD</h1> ");
//       //   res.write("<a href='/login'>Go Back</a> ");
//       //   res.send();
//       // }
//     })
//     .catch((err) => {
//       console.log(err);
//       res.redirect("/login");
//     });
// });
