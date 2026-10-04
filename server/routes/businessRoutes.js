const express = require('express');
const router = express.Router();
const {
  getDashboard,
  createListing,
  getMyServices,
  updateListing,
  deleteListing,
} = require('../controllers/businessController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

router.use(protect);
router.use(authorize('business_owner'));

router.get('/dashboard', getDashboard);
router.get('/services', getMyServices);
router.post('/services', upload.single('image'), createListing);
router.put('/services/:id', upload.single('image'), updateListing);
router.delete('/services/:id', deleteListing);

module.exports = router;
