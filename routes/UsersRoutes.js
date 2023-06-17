const express = require("express");
const router = express.Router();

const {
  addUser,
  recoverEmail,
  resetPassword,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require("../controllers/UsersController");
const fetchUser = require("../middleware/fetchUser");

router.post("/add-user", addUser);
router.post("/recover-email/:email", recoverEmail);
router.put("/reset-password/:email/:token", resetPassword);
router.post("/login-user", loginUser);
router.get("/get-user-profile", fetchUser, getUserProfile);
router.put("/update-user-profile", fetchUser, updateUserProfile);
module.exports = router;
