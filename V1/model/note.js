const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        leadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lead",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        createdDate: {
            type: Date,
            default: Date.now,
        },
        updatedDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
