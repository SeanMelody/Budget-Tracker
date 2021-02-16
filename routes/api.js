// Consts for the router and the mongoose database
const router = require("express").Router();
const Transaction = require("../models/transaction.js");

// Post request to send the data to the database
router.post("/api/transaction", ({ body }, res) => {
  Transaction.create(body)
    .then(dbTransaction => {
      res.json(dbTransaction);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

// Post request to send all the data that was saved in IndexedDB
router.post("/api/transaction/bulk", ({ body }, res) => {
  Transaction.insertMany(body)
    .then(dbTransaction => {
      res.json(dbTransaction);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

// Get request to get all the data from the mongoose database and display to the page
router.get("/api/transaction", (req, res) => {
  Transaction.find({}).sort({ date: -1 })
    .then(dbTransaction => {
      res.json(dbTransaction);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

// Gotta export the router!
module.exports = router;