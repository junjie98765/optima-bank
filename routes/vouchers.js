const express = require("express")
const router = express.Router()
const Voucher = require("../models/voucher")
const mongoose = require("mongoose")

// Debug middleware for this router
router.use((req, res, next) => {
  console.log(`Voucher API Request: ${req.method} ${req.originalUrl} at ${new Date().toISOString()}`)
  next()
})

// @route   GET /api/vouchers
// @desc    Get all vouchers
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    console.log("Fetching all vouchers...")

    // Check if the Voucher model is properly defined
    console.log("Voucher model:", {
      modelName: Voucher.modelName,
      collection: Voucher.collection.name,
      schema: Object.keys(Voucher.schema.paths),
    })

    // Check MongoDB connection status
    const dbState = mongoose.connection.readyState
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    }
    console.log(`MongoDB connection status: ${states[dbState]} (${dbState})`)

    if (dbState !== 1) {
      throw new Error(`MongoDB is not connected. Current state: ${states[dbState]}`)
    }

    const vouchers = await Voucher.find()
    console.log(`Found ${vouchers.length} vouchers`)
    res.json(vouchers)
  } catch (error) {
    console.error("Error fetching vouchers:", error)
    console.error("Stack trace:", error.stack)
    next(error) // Pass to global error handler
  }
})

// @route   GET /api/vouchers/:id
// @desc    Get voucher by ID
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    console.log(`Fetching voucher with ID: ${req.params.id}`)
    const voucher = await Voucher.findById(req.params.id)

    if (!voucher) {
      console.log(`Voucher with ID ${req.params.id} not found`)
      return res.status(404).json({ message: "Voucher not found" })
    }

    console.log(`Found voucher: ${voucher.name}`)
    res.json(voucher)
  } catch (error) {
    console.error(`Error fetching voucher ${req.params.id}:`, error)
    next(error)
  }
})

// @route   POST /api/vouchers
// @desc    Create a voucher
// @access  Private (Admin only)
router.post("/", async (req, res, next) => {
  try {
    const { name, description, points, category, validity, terms, iconClass } = req.body

    const voucher = new Voucher({
      name,
      description,
      points,
      category,
      validity,
      terms,
      iconClass,
    })

    const savedVoucher = await voucher.save()
    res.status(201).json(savedVoucher)
  } catch (error) {
    console.error("Error creating voucher:", error)
    next(error)
  }
})

// @route   PUT /api/vouchers/:id
// @desc    Update a voucher
// @access  Private (Admin only)
router.put("/:id", async (req, res, next) => {
  try {
    const { name, description, points, category, validity, terms, iconClass, isActive } = req.body

    const voucher = await Voucher.findById(req.params.id)

    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" })
    }

    voucher.name = name || voucher.name
    voucher.description = description || voucher.description
    voucher.points = points || voucher.points
    voucher.category = category || voucher.category
    voucher.validity = validity || voucher.validity
    voucher.terms = terms || voucher.terms
    voucher.iconClass = iconClass || voucher.iconClass
    voucher.isActive = isActive !== undefined ? isActive : voucher.isActive
    voucher.updatedAt = Date.now()

    const updatedVoucher = await voucher.save()
    res.json(updatedVoucher)
  } catch (error) {
    console.error("Error updating voucher:", error)
    next(error)
  }
})

// @route   DELETE /api/vouchers/:id
// @desc    Delete a voucher
// @access  Private (Admin only)
router.delete("/:id", async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id)

    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" })
    }

    await Voucher.deleteOne({ _id: req.params.id })
    res.json({ message: "Voucher removed" })
  } catch (error) {
    console.error("Error deleting voucher:", error)
    next(error)
  }
})

module.exports = router
