const express = require("express");
const mongoose = require("mongoose");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

// -----------------------------
// Discord Bot Setup
// -----------------------------
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

bot.login(process.env.DISCORD_BOT_TOKEN);

bot.once("ready", () => {
  console.log("Discord bot online");
});

// -----------------------------
// MongoDB Connection
// -----------------------------
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

// -----------------------------
// User Model
// -----------------------------
const User = mongoose.model("User", {
  username: String,
  password: String,
  createdAt: Number
});

// -----------------------------
// Signup Endpoint
// -----------------------------
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

  // Send Discord bot notification
  const channel = bot.channels.cache.get(process.env.DISCORD_CHANNEL_ID);

  if (channel) {
    channel.send({
      embeds: [
        {
          title: "New Signup",
          description: `A new user just signed up!\n\n**Username:** ${username}`,
          color: 0x00ff99,
          timestamp: new Date().toISOString()
        }
      ]
    });
  }

  res.json({ success: true });
});

// -----------------------------
// Start Server
// -----------------------------
app.listen(3000, () => console.log("Server running on port 3000"));
