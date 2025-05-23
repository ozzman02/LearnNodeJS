var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer({ dest: "./public/images" });
var mongo = require("mongodb");
var db = require("monk")("localhost/nodeblog");

const formatError = require("../utils/errorFormatter");
const { check, validationResult } = require("express-validator");

const validateComment = () => [
  check("name")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Name field is required"),
  check("body")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Body field is required"),
  check("email")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Email field is required")
    .isEmail()
    .withMessage("Invalid email format")
];

router.get("/show/:id", function (req, res, next) {
  var posts = db.get("posts");
  posts.findOne({ _id: req.params.id }, function (err, post) {
    res.render("show", {
      post: post,
    });
  });
});

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
    check("title").trim().notEmpty().withMessage("Title field is required"),
    check("body").trim().notEmpty().withMessage("Body field is required"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req).formatWith(formatError);
    if (!errors.isEmpty()) {
      return res.render("addpost", { errors: errors.array() });
    }

    try {
      const { title, category, body, author } = req.body;
      const date = new Date();
      const mainimage = req.file ? req.file.filename : "noimage.jpg";

      const posts = db.get("posts");
      await posts.insert({ title, body, category, date, author, mainimage });

      req.flash("success", "Post Added");
      res.redirect("/");
    } catch (err) {
      console.error("Error adding post:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.post("/addcomment", upload.single("mainimage"), validateComment(), async (req, res, next) => {
  const errors = validationResult(req).formatWith(formatError);

  if (!errors.isEmpty()) {
    const posts = db.get("posts");
    const post = await posts.findOne({ _id: req.body.postid });

    return res.render("show", {
      errors: errors.array(),
      post,
    });
  }

  try {
    const postid = req.body.postid;
    const comment = {
      name: req.body.name,
      email: req.body.email,
      body: req.body.body,
      commentdate: new Date(),
    };

    const posts = db.get("posts");
    await posts.update({ _id: postid }, { $push: { comments: comment } });

    req.flash("success", "Comment Added");
    res.redirect(`/posts/show/${postid}`);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).send("Internal Server Error");
  }
});

/*router.post(
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
);*/

/*router.post(
  "/addcomment",
  upload.single("mainimage"),
  validateComment(),
  function (req, res, next) {
    const errors = validationResult(req).formatWith(formatError);
    if (!errors.isEmpty()) {
      var posts = db.get("posts");
      posts.findOne({ _id: req.body.postid }, function (err, post) {
        if (err) {
          console.error("Error fetching post:", err);
          return res.status(500).send("Internal Server Error");
        }
        res.render("show", {
          errors: errors.array(),
          post: post,
        });
      });
    } else {
      var name = req.body.name;
      var email = req.body.email;
      var body = req.body.body;
      var commentdate = new Date();
      var postid = req.body.postid;

      var comment = {
        name: name,
        email: email,
        body: body,
        commentdate: commentdate,
      };

      var posts = db.get("posts");
      posts.update(
        {
          _id: postid,
        },
        {
          $push: {
            comments: comment,
          },
        },
        function (err, doc) {
          if (err) {
            throw err;
          } else {
            req.flash("success", "Comment Added");
            res.location("/posts/show/" + postid);
            res.redirect("/posts/show/" + postid);
          }
        }
      );
    }
  }
);*/

module.exports = router;
