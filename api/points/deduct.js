const express = require('express');
const app = express();
const router = express.Router();

// Example: using a User model (adjust to your DB setup)
const User = require('../models/user'); // Update path as needed

router.post('/', async (req, res) => {
  try {
    // 1. Authentication check (adjust to your auth system)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // 2. Validate input
    const { points } = req.body;
    const pointsToDeduct = parseInt(points, 10);
    if (isNaN(pointsToDeduct) || pointsToDeduct <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid points value' });
    }

    // 3. Fetch user from DB
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 4. Check if user has enough points
    if (user.points < pointsToDeduct) {
      return res.status(400).json({ success: false, message: "You don't have enough points." });
    }

    // 5. Deduct points and save
    user.points -= pointsToDeduct;
    await user.save();

    // 6. Respond with new balance
    return res.json({ success: true, points: user.points });
  } catch (err) {
    console.error('Error in /api/points/deduct:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/deductPoints', (req, res) => {
    // Your logic to handle point deduction goes here
    // Example:
    console.log('Received a request to deduct points');
    res.status(200).json({ message: 'Points deducted successfully!' });
  });
  

module.exports = router;