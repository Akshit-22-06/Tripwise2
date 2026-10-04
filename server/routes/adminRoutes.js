const express = require('express');
const router = express.Router();
const {
  getUsers,
  toggleUserSuspension,
  getPendingVerifications,
  processVerification,
  deleteReviewOverride,
  getSystemReports,
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.post('/users/toggle-status', toggleUserSuspension);
router.get('/verifications', getPendingVerifications);
router.post('/verifications/process', processVerification);
router.delete('/reviews/:id', deleteReviewOverride);
router.get('/reports', getSystemReports);

module.exports = router;
