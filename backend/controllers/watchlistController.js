const db = require('../config/db');

// Add movie to watchlist
exports.addToWatchlist = async (req, res) => {
  const { userId } = req.params;
  const { movieId } = req.body;

  try {
    await db.query(
      'INSERT INTO watchlist (user_id, movie_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, movieId]
    );
    res.status(201).json({ message: 'Added to watchlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
};

// Remove movie from watchlist
exports.removeFromWatchlist = async (req, res) => {
  const { userId } = req.params;
  const { movieId } = req.body;

  try {
    await db.query(
      'DELETE FROM watchlist WHERE user_id = $1 AND movie_id = $2',
      [userId, movieId]
    );
    res.status(200).json({ message: 'Removed from watchlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
};

// Get user watchlist
exports.getWatchlist = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM watchlist WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
};
