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


const users = [];


function generateUserId() {
  return Math.random().toString(36).substr(2, 9); 
}


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

  res.json(newUser);
});




app.get('/api/users', (req, res) => {
  res.json(users.map(user => ({ username: user.username, _id: user._id })));
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(user => user._id === _id);

  if (!user) {
    return res.json({ error: 'User not found' });
  }

  const newExercise = {
    description,
    duration: parseInt(duration),
    date: date || new Date().toDateString(),
  };

  if (!user.log) {
    user.log = [];
  }
  user.log.push(newExercise);
  user.count = user.log.length;

  res.json({
    _id: user._id,
    username: user.username,
    date: newExercise.date,
    duration: newExercise.duration,
    description: newExercise.description,
  });
});


app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;

  const user = users.find(user => user._id === _id);

  if (!user) {
    return res.json({ error: 'User not found' });
  }

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
