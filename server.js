const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Home Page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));

// User Model
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
  })
);

// Student Model
const Student = mongoose.model(
  "Student",
  new mongoose.Schema({
    name: String,
    rollNo: String,
    department: String,
    mobile: Number,
  })
);

// Auth Middleware
function auth(req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).json({ msg: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.status(400).json({ msg: "Invalid Token" });
  }
}

// Signup
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  let exist = await User.findOne({ email });
  if (exist) return res.json({ msg: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed });

  await user.save();
  res.json({ msg: "Signup successful" });
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ msg: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ msg: "Incorrect password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ msg: "Login successful", token });
});

// Add Student
app.post("/api/students/add", auth, async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.json({ msg: "Student Added" });
});

// Get Students
app.get("/api/students", auth, async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// Delete Student
app.delete("/api/students/delete/:id", auth, async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ msg: "Student Deleted" });
});

// Start Server (Render uses PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running:", PORT));
