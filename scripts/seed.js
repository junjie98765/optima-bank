const mongoose = require("mongoose")
const Voucher = require("../models/voucher")

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/registration")
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.log("Error connecting to MongoDB:", err))

// Sample voucher data
const sampleVouchers = [
  {
    name: "Starbucks Gift Card",
    description: "Enjoy a cup of premium coffee at any Starbucks outlet nationwide.",
    points: 500,
    category: "food",
    validity: "Dec 31, 2023",
    terms: "Valid at all participating Starbucks outlets. Cannot be combined with other promotions.",
    iconClass: "fa-coffee",
  },
  {
    name: "Amazon $25 Gift Card",
    description: "Shop your favorite items on Amazon with this digital gift card.",
    points: 750,
    category: "shopping",
    validity: "Dec 31, 2023",
    terms: "Valid for all products on Amazon. Cannot be exchanged for cash.",
    iconClass: "fa-shopping-cart",
  },
  {
    name: "Movie Ticket Voucher",
    description: "Get a free movie ticket at any participating cinema.",
    points: 400,
    category: "entertainment",
    validity: "Nov 30, 2023",
    terms: "Valid for standard 2D movies only. Not valid on weekends and public holidays.",
    iconClass: "fa-film",
  },
  {
    name: "Uber Ride Discount",
    description: "Get 50% off on your next Uber ride (up to $15).",
    points: 300,
    category: "travel",
    validity: "Oct 31, 2023",
    terms: "Valid for one ride only. Maximum discount of $15.",
    iconClass: "fa-car",
  },
]

// Function to seed the database
async function seedDatabase() {
  try {
    // Clear existing vouchers
    await Voucher.deleteMany({})
    console.log("Cleared existing vouchers")

    // Insert sample vouchers
    const insertedVouchers = await Voucher.insertMany(sampleVouchers)
    console.log(`Added ${insertedVouchers.length} sample vouchers to the database`)

    // List all vouchers
    const allVouchers = await Voucher.find()
    console.log("Current vouchers in database:")
    allVouchers.forEach((voucher) => {
      console.log(`- ${voucher.name} (${voucher.points} points)`)
    })

    mongoose.connection.close()
    console.log("Database connection closed")
  } catch (error) {
    console.error("Error seeding database:", error)
    mongoose.connection.close()
  }
}

// Run the seed function
seedDatabase()
