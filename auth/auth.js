const multer = require("multer");
const path = require("path");

const userAuth = (req, res, next) => {
  if (req.session.userAuth) {
    next();
  } else {
    res.redirect("/");
  }
};

const midUserAuth = (req, res, next) => {
  if (req.session.midUserAuth) {
    next();
  } else {
    res.redirect("/");
  }
};

const superUserAuth = (req, res, next) => {
  if (req.session.superUserAuth) {
    next();
  } else {
    res.redirect("/");
  }
};

//file uploads
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      "_" + Date.now() + path.extname(file.originalname)
    );
  }
});

const upload = multer({ storage: fileStorageEngine }).single("file");

module.exports = {
  userAuth,
  midUserAuth,
  superUserAuth,
  upload
};
