const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.json()); 


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// defines the users array to store user data
const users = [];

// helper function to generate a unique user ID
function generateUserId() {
  return Math.random().toString(36).substr(2, 9); 
}

// creates a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;

  // checks if the username already exists
  if (users.some(user => user.username === username)) {
    return res.json({ error: 'Username already taken' });
  }

  // creates a new user
  const newUser = {
    username,
    _id: generateUserId(),
  };

  // adds the user to the array
  users.push(newUser);

  res.json(newUser);
});

// adds user exercises 
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  // finds the user by ID
  const user = users.find(user => user._id === _id);

  // checks if the user exists
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  // creates a new exercise
  const newExercise = {
    description,
    duration: parseInt(duration),
    date: date || new Date().toDateString(),
  };

  // adds the exercise to the user's log
  if (!user.log) {
    user.log = [];
  }
  user.log.push(newExercise);
  user.count = user.log.length;

  res.json(user);
});

// gets a user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;

  // finds the user by ID
  const user = users.find(user => user._id === _id);

  // checks if the user exists
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  res.json(user);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
