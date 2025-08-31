const router = require("express").Router();
const ctrl = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/send-otp", ctrl.sendOtp);
router.post("/signup", ctrl.signupWithOtp);
router.post("/login-otp", ctrl.loginWithOtp);
router.post("/google", ctrl.googleAuth);
router.get("/me", auth, ctrl.me);

module.exports = router;
