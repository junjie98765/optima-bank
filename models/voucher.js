const mongoose = require("mongoose")

// Create a more flexible schema that won't throw errors if fields are missing
const voucherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      default: "other",
    },
    validity: {
      type: String,
      default: "No expiration",
    },
    description: {
      type: String,
      default: "",
    },
    terms: {
      type: String,
      default: "",
    },
    iconClass: {
      type: String,
      default: "fa-gift",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Add any other fields that might be in your database
    expiry: Date,
    imageUrl: String,
  },
  {
    // This option makes the schema more flexible
    strict: false,
    // This adds createdAt and updatedAt fields
    timestamps: true,
  },
)

// Add a pre-save hook to log what's being saved
voucherSchema.pre("save", function (next) {
  console.log("Saving voucher:", this.toObject())
  next()
})

// Add a method to the schema to help with debugging
voucherSchema.methods.toDebugString = function () {
  return `Voucher(${this._id}): ${this.name} - ${this.points} points`
}

// Make sure we're using the right collection name
const Voucher = mongoose.model("Voucher", voucherSchema, "vouchers")

// Log that the model has been created
console.log(`Voucher model initialized with collection: ${Voucher.collection.name}`)

module.exports = Voucher
