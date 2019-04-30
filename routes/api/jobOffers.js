const express = require("express");
const router = express.Router();
const checkAuth = require("../../middleware/checkAuth");

const JobOffer = require("../../models/JobOffer");

// @route   GET api/jobOffers
// @desc    Get all JobOffers
// @access  Public
router.get("/", (req, res) => {
  JobOffer.find()
    .sort({ date: 1 })
    .exec()
    .then(jobOffers => res.status(200).json(jobOffers))
    .catch(err => res.status(500).json({ error: err }));
});

// @route   GET api/jobOffers/:id
// @desc    Get JobOffer
// @access  Public
router.get("/:id", (req, res) => {
  JobOffer.findById(req.params.id)
    .exec()
    .then(jobOffer => {
      if (jobOffer) res.status(200).json(jobOffer);
      else
        res.status(404).json({ msg: "No valid entry found for provided ID" });
    })
    .catch(err => res.status(500).json({ error: err }));
});

// @route   POST api/jobOffers
// @desc    Add new JobOffers
// @access  Private
router.post("/", checkAuth, (req, res) => {
  const newJobOffer = new JobOffer({
    name: req.body.name,
    description: req.body.description
  });

  newJobOffer
    .save()
    .then(jobOffer => res.json(jobOffer))
    .catch(err => res.status(500).json({ error: err }));
});

// @route   PATCH api/jobOffers/:id
// @desc    Update JobOffers
// @access  Private
router.patch("/:id", checkAuth, (req, res) => {
  JobOffer.findById(req.params.id)
    .exec()
    .then(jobOffer => {
      if (jobOffer) {
        if (req.user.id !== jobOffer.authorId)
          return res.status(401).json({ msg: "No permission!" });
        const updateOps = {};
        for (const ops of req.body) {
          updateOps[ops.propName] = ops.value;
        }
        JobOffer.update({ _id: req.params.id }, { $set: updateOps })
          .exec()
          .then(result => res.status(200).json(result))
          .catch(err => res.status(500).json({ error: err }));
      } else
        res.status(404).json({ msg: "No valid entry found for provided ID" });
    })
    .catch(err => res.status(500).json({ error: err }));
});

// @route   DELETE api/jobOffers/:id
// @desc    Delete JobOffer
// @access  Private
router.delete("/:id", checkAuth, (req, res) => {
  JobOffer.findById(req.params.id)
    .then(jobOffer => {
      if (req.user.id !== jobOffer.authorId)
        return res.status(401).json({ msg: "No permission!" });
      jobOffer
        .remove()
        .exec()
        .then(() => res.json({ success: true }))
        .catch(err => res.status(500).json({ error: err }));
    })
    .catch(err => res.status(404).json({ success: false }));
});

module.exports = router;
