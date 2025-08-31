const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const sendOtp = require("../utils/sendOtp");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!validateEmail(email)) return res.status(400).json({ message: "Invalid email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ email });
    if (!user) user = await User.create({ email });

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOtp(email, otp);

    return res.json({ message: "OTP sent" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.signupWithOtp = async (req, res) => {
  try {
    const { name, dob, email, otp } = req.body;
    if (!name || !email || !otp) return res.status(400).json({ message: "All fields are required" });
    if (!validateEmail(email)) return res.status(400).json({ message: "Invalid email" });

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpires) return res.status(400).json({ message: "OTP not requested" });
    if (new Date() > user.otpExpires) return res.status(400).json({ message: "OTP expired" });
    if (otp !== user.otp) return res.status(400).json({ message: "Incorrect OTP" });

    user.name = name;
    user.dob = dob || "";
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, dob: user.dob }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Signup failed" });
  }
};

exports.loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!validateEmail(email) || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpires) return res.status(400).json({ message: "OTP not requested" });
    if (new Date() > user.otpExpires) return res.status(400).json({ message: "OTP expired" });
    if (otp !== user.otp) return res.status(400).json({ message: "Incorrect OTP" });

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, dob: user.dob }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "OTP login failed" });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Missing credential" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name, googleId });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = signToken(user._id);
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, dob: user.dob } });
  } catch (e) {
    console.error(e);
    return res.status(401).json({ message: "Google authentication failed" });
  }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id).select("-otp -otpExpires");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
};
