const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const checkAuth = require("../../middleware/checkAuth");

const User = require("../../models/User");

// @route   POST api/users/signup
// @desc    Register new user
// @access  Public
router.post("/signup", (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ msg: "Please enter all fields!" });

  User.findOne({ email })
    .exec()
    .then(user => {
      if (user)
        return res
          .status(409)
          .json({ msg: "User with that email already exists!" });

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return res.status(500).json({ error: err });
        }
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            return res.status(500).json({ error: err });
          }

          const newUser = new User({
            firstName,
            lastName,
            email,
            password: hash
          });

          newUser
            .save()
            .then(user => {
              res.status(201).json({ msg: "User created" });
            })
            .catch(err => res.status(500).json({ error: err }));
        });
      });
    })
    .catch(err => res.status(500).json({ error: err }));
});

// @route   POST api/users/login
// @desc    Auth user
// @access  Public
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields!" });
  }
  User.findOne({ email }).then(user => {
    if (!user)
      return res
        .status(400)
        .json({ msg: "User with that email doesn't exists!" });

    bcrypt.compare(password, user.password).then(isMatch => {
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      jwt.sign(
        { id: user.id },
        config.get("jwtSecret"),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email
            }
          });
        }
      );
    });
  });
});

// @route   DELETE api/users/:id
// @desc    Delete User
// @access  Private
router.delete("/:id", checkAuth, (req, res) => {
  const id = req.params.id;
  if (req.user.id !== id)
    return res.status(401).json({ msg: "No permission!" });
  User.findById(id)
    .exec()
    .then(user =>
      user
        .remove()
        .then(() => res.json({ msg: "User deleted successfully" }))
        .catch(err => res.status(500).json({ error: err }))
    )
    .catch(err => res.status(404).json({ msg: "User not found" }));
});

module.exports = router;
