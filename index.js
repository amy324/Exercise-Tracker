const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.json()); // Add this line to parse JSON in the request body

// Define the users array to store user data
const users = [];

// Helper function to generate a unique user ID
function generateUserId() {
  return Math.random().toString(36).substr(2, 9); // Simple implementation for demonstration purposes
}

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;

  // Check if the username already exists
  const isUsernameTaken = users.some(user => user.username === username);
  if (isUsernameTaken) {
    return res.json({ error: 'Username already taken' });
  }

  // Create a new user
  const newUser = {
    username,
    _id: generateUserId(),
  };

  // Add the user to the array
  users.push(newUser);

  res.json(newUser); // Updated response
});

// Get a list of all users
app.get('/api/users', (req, res) => {
  res.json(users.map(user => ({ username: user.username, _id: user._id })));
});

// Add exercises for a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  // Find the user by ID
  const user = users.find(user => user._id === _id);

  // Check if the user exists
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  // Create a new exercise
  const newExercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };

  // Add the exercise to the user's log
  if (!user.log) {
    user.log = [];
  }
  user.log.push(newExercise);
  user.count = user.log.length;

  // Respond with the added exercise
  res.json({
    _id: user._id,
    username: user.username,
    date: newExercise.date,
    duration: newExercise.duration,
    description: newExercise.description,
  });
});

// Get a user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;

  // Find the user by ID
  const user = users.find(user => user._id === _id);

  // Check if the user exists
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  // Respond with the user's exercise log
  res.json({
    _id: user._id,
    username: user.username,
    count: user.count || 0,
    log: user.log || [],
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
