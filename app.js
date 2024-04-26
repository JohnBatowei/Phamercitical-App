var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
// var favicon = require("serve-favicon");
var logger = require("morgan");
const mongoose = require("mongoose");
// let bcrypt = require("bcrypt");
let session = require("express-session");
let mongoDBsession = require("connect-mongodb-session")(session);
let flash = require("connect-flash");
var expressLayout = require("express-ejs-layouts");
const bodyParser = require("body-parser");
// const cors = require('cors');

//method-override
let methodOverride = require("method-override");

//models
var index = require("./routes/index");
var users = require("./routes/users");
const userAPI = require("./routes/apis/userAPI");
const userControl = require("./routes/controls/user");
const midControl = require("./routes/controls/mid");
const superControl = require("./routes/controls/super");
const logout = require("./routes/logout");
const dbRouter = require("./routes/apis/db");
const userviewprint = require("./routes/controls/usersviewprint/usersviewprint");

var app = express();

//mongodb
const url = "mongodb://localhost:27017/CERHI-DB";
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(data => {
    console.log(`

    88888888888888    888    888         888    888    888888888888    88888888888   88888888888
    88888888888888    888    888         888    888    888888888888    88888888888   88888888888
    888               888    888         888    888        888         888           888
    888               888    888         888    888        888         888           888
    888               888    888         888    888        888         888           888
    888    8888888    888    888         888    888        888         8888888888    888
    888    8888888    888    888         888    888        888         8888888888    888
    888        888    888    888         888    888        888         888           888
    888        888    888     888       888     888        888         888           888
    888        888    888      8888   8888      888        888         888           888
    88888888888888    888       888888888       888        888         88888888888   88888888888
    88888888888888    888        8888888        888        888         88888888888   88888888888
    
 -----------------------------------------------------------------------------------------------
                                      http://localhost:5000
 -----------------------------------------------------------------------------------------------

          `);
  })
  .catch(err => {
    console.log(err);
  });

//creating a store
const store = new mongoDBsession({
  uri: url,
  collection: "bmcSession"
});

// view engine setup
app.use(expressLayout);
app.set("layout", "./layouts/homeLay");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


app.use(
  session({
    secret: "key that will sign cookie",
    resave: false,
    saveUninitialized: false,
    store: store, //this store is equal to the new mongDBsession store
    cookie:{maxAge:180*60*1000}
  })
);

app.use(methodOverride("_method"));
//bootstrap
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap-icons/icons/")));
app.use(express.static(path.join(__dirname, "node_modules/jquery/dist")));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public/")));
app.use(flash());
// app.use(cors({origin: 'http://127.0.0.1:5000'}));

app.use("/", index);
app.use("/users", users);
app.use("/usercontrol", userControl);
app.use("/midcontrol", midControl);
app.use("/supercontrol", superControl);
app.use("/api/users", userAPI);
app.use("/logout", logout);
app.use("/db/api", dbRouter);
app.use("/users/:id", dbRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;