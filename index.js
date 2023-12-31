const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ limit: "50mb", extended: true }));

const authRoutes = require("./routes/UsersRoutes.js");
const propertiesRoutes = require("./routes/PropertiesRoutes");
const reviewsRoutes = require("./routes/ReviewsRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/property", propertiesRoutes);
app.use("/api/review", reviewsRoutes);

mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected");
  })
  .catch((error) => {
    console.log(error.message);
  });

const server = app.listen(process.env.PORT, () => {
  console.log("Connected");

  //show all response from client on console
  app.use((req, res, next) => {
    console.log("Incoming Request:", req.method, req.url);
    console.log("Request Body:", req.body);
    next();
  });
  
  // ...existing code...
  

  
});

