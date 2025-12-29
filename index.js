const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const bcrypt = require("bcryptjs");
const authRoutes =require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const protect = require("./middleware/authMiddleware");


const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

//connect DB
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("DB Connected"))
    .catch((err) => console.log(err));


//Protected Route
app.get("/protected", protect, (req, res)=>{
    res.json({message: "Access granted", userId: req.user});
});    

//test route
app.get("/health", (req, res) => {
    res.send("server is running");
});





//start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

})