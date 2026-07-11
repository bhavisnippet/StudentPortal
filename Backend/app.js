require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");

require("./config/passport");

const app = express();

// Middleware
app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5500",
    credentials: true,
  }),
);

// Session (needed for Google OAuth)
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);

// Connect database
connectDB();

// Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
