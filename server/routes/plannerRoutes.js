const express = require('express');
const router = express.Router();
const {
  generateTrip,
  calculateBudgetBreakdown,
  saveItinerary,
  getUserItineraries,
  deleteItinerary,
} = require('../controllers/plannerController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/generate', generateTrip);
router.post('/calculate-budget', calculateBudgetBreakdown);
router.post('/save', saveItinerary);
router.get('/my-plans', getUserItineraries);
router.delete('/:id', deleteItinerary);

module.exports = router;
