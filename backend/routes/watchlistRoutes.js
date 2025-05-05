const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { authenticateToken} = require('../middleware/authMiddleware');

router.get('/:userId/watchlist', watchlistController.getWatchlist);
router.post('/:userId/watchlist', watchlistController.addToWatchlist);
router.delete('/:userId/watchlist', watchlistController.removeFromWatchlist);

module.exports = router;
