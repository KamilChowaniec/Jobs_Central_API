const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/checkAuth");

const User = require("../../models/User");

// @route   POST api/users
// @desc    Register new user
// @access  Public
router.post("/", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields!" });
  }
  User.findOne({ email }).then(user => {
    if (user)
      return res
        .status(400)
        .json({ msg: "User with that email already exists!" });
    const newUser = new User({
      name,
      email,
      password
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then(user => {
          jwt.sign(
            { id: user.id },
            config.get("jwtSecret"),
            { expiresIn: 600 },
            (err, token) => {
              if (err) throw err;
              res.json({
                token,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email
                }
              });
            }
          );
        });
      });
    });
  });
});

// @route   DELETE api/users/:id
// @desc    Delete User
// @access  Private
router.delete("/:id", auth, (req, res) => {
  const id = req.params.id;
  if (req.user.id !== id)
    return res.status(401).json({ msg: "No permission!" });
  User.findById(id)
    .exec()
    .then(user =>
      user
        .remove()
        .then(() => res.json({ success: true }))
        .catch(err => res.status(500).json({ error: err }))
    )
    .catch(err => res.status(404).json({ success: false }));
});

module.exports = router;
