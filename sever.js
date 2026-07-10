const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// User model
const User = mongoose.model("User", {
  username: String,
  password: String,
  createdAt: Number
});

// Signup endpoint
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Missing fields" });

  const user = new User({
    username,
    password,
    createdAt: Date.now()
  });

  await user.save();

  // Notify you (Discord webhook)
  await axios.post(process.env.WEBHOOK_URL, {
    content: `New signup: ${username}`
  });

  res.json({ success: true });
});

app.listen(3000, () => console.log("Server running on port 3000"));
