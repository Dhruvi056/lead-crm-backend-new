const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({

  email: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.length > 0 && arr[0] && arr[0].trim() !== "";
      },
      message: "At least one email is required",
    },
},
     firstName: {
        type: String,
        required: true
    },
    websiteURL: {
        type: String,
        required: false,
        default: null
    },
    linkdinURL: {
        type: String,
        required: false,
        default: null
    },
    industry: {
        type: String,
        required: true
    },
    whatsUpNumber: {
        type: Number,
        unique: true,
        required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    },
    workEmail: {
        type: String,
        required: false,
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    priority: {
        type: String,
        enum: ["HIGH", "MEDIUM", "LOW"],
        default: "HIGH"
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default: Date.now
    },
     isDeleted: {
    type: Boolean,
    default: false
  }
});
module.exports = mongoose.model("Lead", leadSchema);
