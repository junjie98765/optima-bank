const express = require("express")
const router = express.Router()
const path = require("path")

// @route   GET /redeem
// @desc    Render the redeem page
// @access  Public
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/redeem.html"))
})

module.exports = router
