// Required Consts!
const express = require("express");
// Logger helps development by giving network information in the console.
const logger = require("morgan");
// Mongoose project!
const mongoose = require("mongoose");
// Compression to help compress to and from the server to make loading faster!  Yeay!
const compression = require("compression");

// Set the PORT for Heroku deployment or to 3005 cause I'm crazy!
const PORT = process.env.PORT || 3005;

// set app as Express
const app = express();

// Middleware
app.use(logger("dev"));
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Require static files so CSS and JS work!
app.use(express.static("public"));

// Connect to mongoose and optimize for Heroku Deployment
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/budget", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

// An option to quit compression if the header comes back as x - no - comp
const options = {
  filter: (req, res) => {
    if (req.headers["x-no-comp"]) {
      return false;
    }
    return compression.filter(req, res);
  }
}

// Middleware for compression
app.use(compression(options))

// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});