const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();


app.use(
  cors({
    origin: [
      "http://localhost:3000", // local dev
      "https://lead-crm-frontend-new.vercel.app", // frontend deployed on vercel
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
})();

app.get("/", (req, res) => {
  res.send("API working fine 🚀");
});

require("./V1/model");
app.use(require("./V1/router"));

app.listen(process.env.APP_PORT || 5000, () => {
  console.log(
    `🚀 Server running at http://localhost:${process.env.APP_PORT || 5000}`
  );
});
