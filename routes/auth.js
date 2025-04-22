const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const { OAuth2Client } = require("google-auth-library")
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const path = require("path") // Added missing path import

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 500, // Initial points for new users
    },
    googleId: {
      type: String,
      sparse: true, // Allows null values and ensures uniqueness for non-null values
    },
    resetToken: String,
    resetTokenExpiry: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Pre-save hook to hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified("password") || !this.password) return next()

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10)
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model("User", userSchema)

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, phone, password, points } = req.body

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    })

    if (existingUser) {
      return res.status(400).send("Username or Email already exists")
    }

    // Create new user with points (default to 500 if not provided)
    const newUser = new User({
      username,
      email,
      phone,
      password,
      points: points || 500, // Use provided points or default to 500
    })

    await newUser.save()
    res.status(201).send("Registration successful")
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).send("Error registering user")
  }
})

// Login user
router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body
    console.log("Received username:", username) // Log the username

    // Find user by username
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).send("Invalid username or password")
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).send("Invalid username or password")
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "1d" },
    )

    // Set cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })

    // Redirect to homepage or send success response
    res.redirect("/voucher_display.html")
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).send("Error logging in")
  }
})

// Google authentication callback
router.post("/auth/google/callback", async (req, res) => {
  try {
    const { token, points } = req.body
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { email, name, sub: googleId } = payload

    // Check if user exists
    let user = await User.findOne({ email })

    if (!user) {
      // Create new user if not exists
      user = new User({
        username: name,
        email,
        googleId,
        password: Math.random().toString(36).slice(-8), // Random password
        phone: "", // Empty phone for Google auth users
        points: points || 500, // Use provided points or default to 500
      })
      await user.save()
    }

    // Create JWT token
    const jwtToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "1d" },
    )

    // Set cookie with token
    res.cookie("token", jwtToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })

    res.json({ success: true })
  } catch (error) {
    console.error("Google auth error:", error)
    res.status(500).json({ success: false, message: "Authentication failed" })
  }
})

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token")
  res.redirect("/signin.html")
})

// Password reset request
router.post("/forget-password", async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).send("User not found")
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex")
    user.resetToken = token
    user.resetTokenExpiry = Date.now() + 3600000 // 1 hour expiry
    await user.save()

    // In a real application, you would send an email with a reset link
    const resetLink = `http://localhost:5000/reset-password/${token}`

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "thushaanya.r@gmail.com",
        pass: "vmnb cwpn eurd bebp",
      },
    })

    const mailOptions = {
      from: "thushaanya.r@gmail.com",
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Email error:", error)
        return res.status(500).send("Error sending email")
      }
      console.log("Email sent: " + info.response)
      res.send("Reset link sent to your email")
    })
  } catch (error) {
    console.error("Password reset error:", error)
    res.status(500).send("Error processing password reset")
  }
})

// Reset password page
router.get("/reset-password/:token", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "reset-password.html"))
})

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params
  const { newPassword } = req.body

  const user = await User.findOne({ resetToken: token })

  if (!user) {
    return res.status(400).send("Invalid or expired token.")
  }

  if (new Date(user.resetTokenExpiry).getTime() < Date.now()) {
    return res.status(400).send("Token has expired. Please request a new password reset.")
  }

  user.password = newPassword // Will be hashed by pre-save hook
  user.resetToken = undefined
  user.resetTokenExpiry = undefined
  await user.save()

  res.send("Password successfully reset. You can now log in.")
})

// Check token validity
router.get("/check-token/:token", async (req, res) => {
  const { token } = req.params

  const user = await User.findOne({ resetToken: token })

  if (!user) {
    return res.status(400).json({ message: "Token is invalid or does not exist." })
  }

  if (user.resetTokenExpiry < Date.now()) {
    return res.status(400).json({ message: "Token has expired. Please request a new password reset." })
  }

  res.json({ message: "Token is valid" })
})

module.exports = router
