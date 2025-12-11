// ----------------------------------------
// BACKEND IN SINGLE FILE: server.js
// ----------------------------------------



const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Home Page Route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});



// ----------------------------------------
// 1) Connect to MongoDB
// ----------------------------------------
mongoose
  .connect("mongodb+srv://admin:admin@cluster0.el0s2yf.mongodb.net/student_database?appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Connection Error:", err));

// ----------------------------------------
// 2) User Model (for signup/login)
// ----------------------------------------
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
  })
);

// ----------------------------------------
// 3) Student Model
// ----------------------------------------
const Student = mongoose.model(
  "Student",
  new mongoose.Schema({
    name: String,
    rollNo: String,
    department: String,
    mobile : Number,
  })
);

// ----------------------------------------
// 4) Middleware - Check Login (JWT)
// ----------------------------------------
function auth(req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).json({ msg: "Access Denied" });

  try {
    const verified = jwt.verify(token, "secret123");
    req.user = verified;
    next();
  } catch {
    res.status(400).json({ msg: "Invalid Token" });
  }
}

// ----------------------------------------
// 5) AUTH ROUTES
// ----------------------------------------

// Signup route
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  let exist = await User.findOne({ email });
  if (exist) return res.json({ msg: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed });
  await user.save();

  res.json({ msg: "Signup successful" });
});

// Login route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ msg: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ msg: "Incorrect password" });

  const token = jwt.sign({ id: user._id }, "secret123");

  res.json({ msg: "Login successful", token });
});

// ----------------------------------------
// 6) STUDENT ROUTES
// ----------------------------------------

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

// ----------------------------------------
// 7) START SERVER
// ----------------------------------------
app.listen(5000, () => console.log("Server running on port 5000"));
