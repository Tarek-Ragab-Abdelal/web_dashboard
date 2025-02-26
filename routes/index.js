const express = require("express");
const router = express.Router();
const path = require("path");
const authenticateToken = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const IoTPacket = require("../models/data");

// Serve the main index page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Redirect login to home
router.get("/login", (req, res) => {
  res.redirect(303, "/");
});

// Redirect index.html to home
router.get("/index.html", (req, res) => {
  res.redirect(303, "../");
});

// Serve the dashboard after authentication
router.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/dashboard.html"));
});

// Also redirect /dashboard.html to /dashboard to ensure authentication
router.get("/dashboard.html", (req, res) => {
  res.redirect(303, "/dashboard");
});

router.get("/css/dashboard.css", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/css/dashboard.css"));
});
router.get("/css/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/css/style.css"));
});
router.get("/js/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/js/script.js"));
});

router.get("/data", authenticateToken, async (req, res) => {
  try {
    const latestPacket = await IoTPacket.findOne()
      .sort({ createdAt: -1 })
      .exec();
    if (!latestPacket) {
      return res.status(404).send({ error: "No data found" });
    }
    res.json(latestPacket);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch data" });
  }
});
// router.get("/data", authenticateToken, (req, res) => {
//   // Example data update
//   const exampleData = {
//     vending: {
//       products: {
//         A: { count: 30, price: 1.75, flow: 15 },
//         B: { count: 45, price: 2.25, flow: 20 },
//         C: { count: 150, price: 0.99, flow: 30 },
//       },
//       freeVends: 10,
//     },
//     changer: {
//       nickels: 120,
//       dimes: 150,
//       quarters: 90,
//       totalCashValue: 50.0,
//     },
//     coinBox: {
//       total: 75,
//     },
//     billStack: {
//       total: 120,
//     },
//     errors: {
//       tankLow: true,
//       uvFail: false,
//       flowFail: true,
//       mdbFail: false,
//       other: false,
//     },
//     transactions: {
//       escrow: 25,
//       cashTotal: 250,
//       cashSinceLastReset: 150,
//     },
//   };

//   res.send(exampleData);
// });

// Handle 404 - Place this last
router.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../public/404.html"));
});

module.exports = router;
