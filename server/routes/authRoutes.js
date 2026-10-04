const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  getWishlist,
  toggleWishlist,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist', protect, toggleWishlist);

module.exports = router;
