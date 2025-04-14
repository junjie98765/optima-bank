// // Import required modules
// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const bcrypt = require("bcrypt");
// const crypto = require("crypto");
// const nodemailer = require("nodemailer");
// const path = require("path");
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// require('dotenv').config();



// // Initialize Express
// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// // app.use(cookieParser());

// //app.use(cors({ origin: "http://localhost:3000" }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));



// // app.use(
// //   expressSession({
// //     secret: "your-secret-key", // Choose a secret key
// //     resave: false,
// //     saveUninitialized: false,
// //     cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // cookie expires in 1 day
// //   })
// // );


// // Connect to MongoDB
// mongoose
//   .connect("mongodb://localhost:27017/registration")
//   .then(() => console.log("Connected to MongoDB successfully!"))
//   .catch((err) => console.log("Error connecting to MongoDB:", err));

// // Define User Schema
// const userSchema = new mongoose.Schema({
//   username: String,
//   email: String,
//   phone: String,
//   password: String,
//   resetToken: String,
//   resetTokenExpiry: Date,
// });

// const User = mongoose.model("User", userSchema);

// // User Registration Route
// app.post("/register", async (req, res) => {
//   const { username, email, phone, password } = req.body;

//   const existingUser = await User.findOne({
//     $or: [{ email }],
//   });

//   if (existingUser) {
//     return res.status(400).send("Username, Email, or Phone already exists");
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const newUser = new User({
//     username,
//     email,
//     phone,
//     password: hashedPassword,
//   });

//   try {
//     await newUser.save();
//     res.status(200).send("User registered successfully");
//   } catch (err) {
//     res.status(500).send("Error registering user");
//   }
// });



// app.post("/signin", async (req, res) => {
//   const { username, password } = req.body;
//   console.log("Received username:", username);  // Log the username
  
//   const user = await User.findOne({ username });
//   if (!user) return res.status(404).send("User not found");

//   const isPasswordCorrect = await bcrypt.compare(password, user.password);
//   if (isPasswordCorrect) {
//     res.sendFile(path.join(__dirname, "public", "voucher_display.html"));
//     //res.send("Successfully signed in!");
//   } else {
//     res.status(400).send("Incorrect password");
//   }
// });


// // Forgot Password Route (UPDATED)
// app.post("/forget-password", async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });

//   if (!user) return res.status(404).send("User not found");

//   // Generate reset token
//   const token = crypto.randomBytes(32).toString("hex");
//   user.resetToken = token;
//   user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry
//   await user.save();

//   const resetLink = `http://localhost:5000/reset-password/${token}`; // 🔹 Updated link

//   // Setup Nodemailer
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "thushaanya.r@gmail.com", //  Change this to your email
//       pass: "vmnb cwpn eurd bebp", //  Use an App Password
//     },
//   });

//   const mailOptions = {
//     from: "thushaanya.r@gmail.com",
//     to: email,
//     subject: "Reset Your Password",
//     html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.log("Email error:", error);
//       return res.status(500).send("Error sending email");
//     }
//     console.log("Email sent: " + info.response); 
//     res.send("Reset link sent to your email");
//   });
// });

// // Serve Reset Password Page (Add this before the POST reset route)
// app.use("/static", express.static(path.join(__dirname, "public")));




// app.get("/reset-password/:token", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "reset-password.html"));
// });



// app.post('/reset-password/:token', async (req, res) => {
//   const { token } = req.params;
//   const { newPassword } = req.body;

//   console.log("Checking Token:", token);

//   const user = await User.findOne({ resetToken: token });

//   if (!user) {
//       console.log(" No user found with this token!");
//       return res.status(400).send("Invalid or expired token.");
//   }

//   console.log(" User Found:", user.email);
//   console.log(" Token Expiry:", user.resetTokenExpiry);
//   console.log(" Current Time:", Date.now());

//   if (new Date(user.resetTokenExpiry).getTime() < Date.now()) {
//       console.log("Token has expired!");
//       return res.status(400).send("Token has expired. Please request a new password reset.");
//   }

//   // Hash new password
//   user.password = await bcrypt.hash(newPassword, 10);
//   user.resetToken = undefined;
//   user.resetTokenExpiry = undefined;
//   await user.save();

//   console.log("Password successfully reset for:", user.email);
//   res.send("Password successfully reset. You can now log in.");
// });


// app.get("/check-token/:token", async (req, res) => {
//   const { token } = req.params;

//   const user = await User.findOne({ resetToken: token });

//   console.log(" Checking token:", token);
//   console.log(" Found user:", user);

//   if (!user) {
//       return res.status(400).json({ message: "Token is invalid or does not exist." });
//   }

//   console.log(" Token Expiry:", user.resetTokenExpiry);
//   console.log(" Current Time:", Date.now());

//   if (user.resetTokenExpiry < Date.now()) {
//       return res.status(400).json({ message: "Token has expired. Please request a new password reset." });
//   }

//   res.json({ message: "Token is valid" });
// });


// // Assuming you're using Express and Passport for authentication
// app.post('/auth/google/callback', async (req, res) => {
//   const token = req.body.token;


// //google
//   passport.authenticate('google', (err, user, info) => {
//       if (err || !user) {
//           return res.status(400).json({ success: false, message: 'Authentication failed' });
//       }

//       // If authentication is successful, send a success response to the frontend
//       res.json({ success: true, message: 'User logged in successfully' });

  
//   })(req, res);
// });

// // Passport Google Strategy setup
// passport.use(
//   new GoogleStrategy(
//       {
//           clientID: '262201707875-fsd8diveqkc8taqvikf7sd5n6u05hu16.apps.googleusercontent.com',
//           clientSecret: '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',
//           callbackURL: 'http://localhost:5000/auth/google/callback',
//       },
//       async (accessToken, refreshToken, profile, done) => {
//           const existingUser = await User.findOne({ email: profile.emails[0].value });

//           if (!existingUser) {
//               const newUser = new User({
//                   username: profile.displayName,
//                   email: profile.emails[0].value,
//                   phone: '',
//                   password: '',
//               });
//               await newUser.save();
//           }

//           return done(null, profile);
//       }
//   )
// );

// //  Start the Server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



//start here
// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const path = require("path");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")))

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err.stack)
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  })
})

// Connect to MongoDB with more detailed error handling
mongoose
  .connect("mongodb://localhost:27017/registration", {
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
db.once("open", () => {
  console.log("MongoDB connection open event fired")
  // List all collections in the database
  db.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error("Error listing collections:", err)
    } else {
      console.log(
        "Available collections:",
        collections.map((c) => c.name),
      )
    }
  })
})


// Import routes after app is initialized
const voucherRoutes = require("./routes/vouchers")

// Use routes
app.use("/api/vouchers", voucherRoutes)

// Add a test route to verify the server is running
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" })
})

// Start Server with better error handling
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api/vouchers`)
})

// Define User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  phone: String,
  password: String,
  resetToken: String,
  resetTokenExpiry: Date,
});

const User = mongoose.model("User", userSchema);

// Register Route
app.post("/register", async (req, res) => {
  const { username, email, phone, password } = req.body;
  const existingUser = await User.findOne({ $or: [{ email }] });

  if (existingUser) {
    return res.status(400).send("Username, Email, or Phone already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    phone,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    res.status(200).send("User registered successfully");
  } catch (err) {
    res.status(500).send("Error registering user");
  }
});

// Login Route
app.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  console.log("Received username:", username);  // Log the username

  const user = await User.findOne({ username });
  if (!user) return res.status(404).send("User not found");

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (isPasswordCorrect) {
    // Redirect with username in query
    res.redirect(`/dashboard?username=${encodeURIComponent(username)}`);
  } else {
    res.status(400).send("Incorrect password");
  }
});

// Serve dashboard after login
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'voucher_display.html'));
});

// Forgot Password
app.post("/forget-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).send("User not found");

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry
  await user.save();

  const resetLink = `http://localhost:5000/reset-password/${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "thushaanya.r@gmail.com",
      pass: "vmnb cwpn eurd bebp",
    },
  });

  const mailOptions = {
    from: "thushaanya.r@gmail.com",
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Email error:", error);
      return res.status(500).send("Error sending email");
    }
    console.log("Email sent: " + info.response); 
    res.send("Reset link sent to your email");
  });
});

// Reset password page
app.get("/reset-password/:token", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "reset-password.html"));
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({ resetToken: token });

  if (!user) {
    return res.status(400).send("Invalid or expired token.");
  }

  if (new Date(user.resetTokenExpiry).getTime() < Date.now()) {
    return res.status(400).send("Token has expired. Please request a new password reset.");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.send("Password successfully reset. You can now log in.");
});

// Check token validity
app.get("/check-token/:token", async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({ resetToken: token });

  if (!user) {
    return res.status(400).json({ message: "Token is invalid or does not exist." });
  }

  if (user.resetTokenExpiry < Date.now()) {
    return res.status(400).json({ message: "Token has expired. Please request a new password reset." });
  }

  res.json({ message: "Token is valid" });
});

// Google Auth Callback
app.post('/auth/google/callback', async (req, res) => {
  const token = req.body.token;

  passport.authenticate('google', (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ success: false, message: 'Authentication failed' });
    }

    res.json({ success: true, message: 'User logged in successfully' });
  })(req, res);
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: '262201707875-fsd8diveqkc8taqvikf7sd5n6u05hu16.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:5000/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ email: profile.emails[0].value });

      if (!existingUser) {
        const newUser = new User({
          username: profile.displayName,
          email: profile.emails[0].value,
          phone: '',
          password: '',
        });
        await newUser.save();
      }

      return done(null, profile);
    }
  )
);



// Serve redeem page
app.get("/redeem.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "redeem.html"));
});


// Admin route to get all vouchers
app.get('/admin/vouchers', async (req, res) => {
  try {
    const vouchers = await Voucher.find();
    res.json(vouchers);
  } catch (err) {
    res.status(500).send("Error fetching vouchers");
  }
});

// Admin route to update a voucher by ID
app.put('/admin/vouchers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, points, category, validity, terms, iconClass, isActive } = req.body

  try {
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      id,
      { name, points, category, expiry, description, imageUrl, terms },
      { new: true }
    );

    if (!updatedVoucher) {
      return res.status(404).send("Voucher not found");
    }

    res.json(updatedVoucher);
  } catch (err) {
    res.status(500).send("Error updating voucher");
  }
});

// Admin route to delete a voucher by ID
app.delete('/admin/vouchers/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedVoucher = await Voucher.findByIdAndDelete(id);
    if (!deletedVoucher) {
      return res.status(404).send("Voucher not found");
    }

    res.json({ message: "Voucher deleted successfully" });
  } catch (err) {
    res.status(500).send("Error deleting voucher");
  }
});

// app.get("/cart", (req, res) => {
//   app.use("/static", express.static(path.join(__dirname, "public")));
// });

// Normal user route to get all vouchers
app.get('/api/vouchers', async (req, res) => {
  try {
    const vouchers = await Voucher.find();
    res.json(vouchers);
  } catch (err) {
    res.status(500).send("Error fetching vouchers");
  }
});


// Start Server
//app.listen(PORT, () => {
//  console.log(`Server running on port ${PORT}`);
//});
