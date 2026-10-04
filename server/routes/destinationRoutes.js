const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getDestinationById,
  getNearbyEntities,
  createDestination,
} = require('../controllers/destinationController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.get('/', getDestinations);
router.get('/nearby', getNearbyEntities);
router.get('/:id', getDestinationById);

router.post('/', protect, authorize('admin'), createDestination);

module.exports = router;
