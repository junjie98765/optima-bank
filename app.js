// Import required modules
const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const cors = require("cors")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const path = require("path")
const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
require("dotenv").config()
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")

// Import routes
const voucherRoutes = require("./routes/vouchers")
const authRoutes = require("./routes/auth")
const pointsRoutes = require("./routes/points")

// Initialize Express
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: "http://localhost:5000",
    credentials: true,
  }),
)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({ message: "Authentication required" })
    }
    return res.redirect("/signin.html")
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({ message: "Invalid token" })
    }
    res.clearCookie("token")
    return res.redirect("/signin.html")
  }
}

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err.stack)
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message,
  })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/registration", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    console.error("Connection details:", {
      host: "localhost",
      port: "27017",
      database: "registration",
    })
  })

// Debug MongoDB connection
const db = mongoose.connection
db.on("error", (err) => {
  console.error("MongoDB connection error event:", err)
})

db.once("open", async () => {
  console.log("MongoDB connection open event fired")
  
  db.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error("Error listing collections:", err)
    } else {
      console.log("Available collections:", collections.map((c) => c.name))
    }
  })

  // --------- 🛒 AUTO-ADD CART FIELD FOR OLD USERS ---------
  const User = mongoose.model("User")

  async function ensureCartFieldForExistingUsers() {
    try {
      const usersWithoutCart = await User.find({ cart: { $exists: false } })
      console.log(`Found ${usersWithoutCart.length} users without cart.`)

      for (const user of usersWithoutCart) {
        user.cart = []
        await user.save()
        console.log(`Updated user ${user._id} with empty cart.`)
      }

      console.log("Finished updating old users.")
    } catch (error) {
      console.error("Error ensuring cart field:", error)
    }
  }

  await ensureCartFieldForExistingUsers()
  // --------- 🛒 END CART PATCH ---------
})

// Use routes
app.use("/api/vouchers", voucherRoutes)
app.use("/", authRoutes)
app.use("/api/points", pointsRoutes)

// --- 🛒 Cart API routes ---

// Load User model
const User = mongoose.model("User");

// Get cart for a user
// Get cart for a user
app.get("/api/cart/:userId", async (req, res) => {
  try {
      const user = await User.findById(req.params.userId);
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }
      res.json({ cart: user.cart || [] });
  } catch (err) {
      console.error("Error fetching cart:", err);
      res.status(500).json({ error: "Internal server error" });
  }
});


// Save cart for a user
app.post("/api/cart/:userId", async (req, res) => {
  try {
      const { cart } = req.body;
      const user = await User.findByIdAndUpdate(req.params.userId, { cart: cart }, { new: true });

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "Cart updated successfully", cart: user.cart });
  } catch (err) {
      console.error("Error saving cart:", err);
      res.status(500).json({ error: "Internal server error" });
  }
});


// Associate guest cart to user
app.post("/api/cart/associate", async (req, res) => {
  try {
    const { guestUserId, userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Cart associated successfully", cart: user.cart });
  } catch (err) {
    console.error("Error associating cart:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Protected routes
app.get("/voucher_display.html", authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, "public/voucher_display.html"))
})

app.get("/redeem", authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, "public/redeem.html"))
})

app.get("/cart", authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, "public/cart.html"))
})

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" })
})

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "262201707875-fsd8diveqkc8taqvikf7sd5n6u05hu16.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const User = mongoose.model("User")
        const existingUser = await User.findOne({ email: profile.emails[0].value })

        if (!existingUser) {
          const newUser = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            phone: "",
            password: "",
          })
          await newUser.save()
        }

        return done(null, profile)
      } catch (error) {
        return done(error, null)
      }
    },
  ),
)

// Serve redeem page
app.get("/redeem.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "redeem.html"))
})

// Admin routes
app.get("/admin/vouchers", async (req, res) => {
  try {
    const Voucher = mongoose.model("Voucher")
    const vouchers = await Voucher.find()
    res.json(vouchers)
  } catch (err) {
    res.status(500).send("Error fetching vouchers")
  }
})

app.put("/admin/vouchers/:id", async (req, res) => {
  const { id } = req.params
  const { name, description, points, category, validity, terms, iconClass, isActive } = req.body

  try {
    const Voucher = mongoose.model("Voucher")
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      id,
      { name, description, points, category, validity, terms, iconClass, isActive },
      { new: true },
    )

    if (!updatedVoucher) {
      return res.status(404).send("Voucher not found")
    }

    res.json(updatedVoucher)
  } catch (err) {
    res.status(500).send("Error updating voucher")
  }
})

app.delete("/admin/vouchers/:id", async (req, res) => {
  const { id } = req.params

  try {
    const Voucher = mongoose.model("Voucher")
    const deletedVoucher = await Voucher.findByIdAndDelete(id)
    if (!deletedVoucher) {
      return res.status(404).send("Voucher not found")
    }

    res.json({ message: "Voucher deleted successfully" })
  } catch (err) {
    res.status(500).send("Error deleting voucher")
  }
})

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api/vouchers`)
  console.log(`Sign in page available at http://localhost:${PORT}/signin.html`)
})
