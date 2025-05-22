var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer({ dest: "./public/images" });
var mongo = require("mongodb");
var db = require("monk")("localhost/nodeblog");

const formatError = require("../utils/errorFormatter");
const { check, validationResult } = require("express-validator");

router.get("/add", function (req, res, next) {
  var categories = db.get("categories");
  categories.find({}, {}, function (err, categories) {
    res.render("addpost", {
      title: "Add Post",
      categories: categories,
    });
  });
});

router.post(
  "/add",
  upload.single("mainimage"),
  [
    check("title").notEmpty().withMessage("Title field is required"),
    check("body").notEmpty().withMessage("Body field is required"),
  ],
  function (req, res, next) {
    const errors = validationResult(req).formatWith(formatError);
    if (!errors.isEmpty()) {
      res.render("addpost", {
        errors: errors.array(),
      });
    } else {
      console.log(req.body.category);
      var title = req.body.title;
      var category = req.body.category;
      var body = req.body.body;
      var author = req.body.author;
      var date = new Date();

      if (req.file) {
        var mainimage = req.file.filename;
      } else {
        var mainimage = "noimage.jpg";
      }
      var posts = db.get("posts");
      posts.insert(
        {
          title: title,
          body: body,
          category: category,
          date: date,
          author: author,
          mainimage: mainimage,
        },
        function (err, post) {
          if (err) {
            res.send(err);
          } else {
            req.flash("success", "Post Added");
            res.location("/");
            res.redirect("/");
          }
        }
      );
    }
  }
);

module.exports = router;
