const express = require("express");
const router = express.Router();
const checkAuth = require("../../middleware/checkAuth");

const Tag = require("../../models/Tag");

// @route   GET api/tags
// @desc    Get all Tags
// @access  Public
router.get("/", (req, res) => {
  Tag.find()
    .select("_id name")
    .exec()
    .then(tags => res.status(200).json(tags))
    .catch(err => res.status(500).json({ error: err }));
});

// @route   POST api/tags
// @desc    Add new Tag
// @access  Private
router.post("/", checkAuth, (req, res) => {
  const newTag = new Tag({
    name: req.body.name
  });

  newTag
    .save()
    .then(tag => res.json({ msg: "Tag added successfully" }))
    .catch(err => res.status(500).json({ error: err }));
});

// @route   DELETE api/tags/:id
// @desc    Delete Tag
// @access  Private
router.delete("/:id", checkAuth, (req, res) => {
  Tag.findById(req.params.id)
    .then(tag =>
      tag
        .remove()
        .then(() => res.json({ msg: "Tag deleted successfully" }))
        .catch(err => res.status(500).json({ error: err }))
    )
    .catch(err => res.status(404).json({ error: err }));
});

module.exports = router;
