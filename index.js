const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB connection string
const mongoDBURI = process.env.MONGODB_URI;


// Connect to MongoDB Atlas
mongoose.connect(mongoDBURI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });

// Define a mongoose schema and model for users
const userSchema = new mongoose.Schema({
  username: String,
});
const User = mongoose.model('User', userSchema);

// Define a mongoose schema and model for exercises
const exerciseSchema = new mongoose.Schema({
  userId: String,
  description: String,
  duration: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Handle user creation
app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  try {
    const user = new User({ username });
    await user.save();
    res.json({ username: user.username, _id: user._id });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Handle exercise creation
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const exercise = new Exercise({
      userId: user._id,
      description,
      duration,
      date: date ? new Date(date) : undefined,
    });

    await exercise.save();
    res.json({
      _id: exercise.userId,
      username: user.username,
      date: exercise.date.toDateString(),
      duration: exercise.duration,
      description: exercise.description,
    });

  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: 'Error creating exercise' });
  }
});

// Handle GET request to /api/users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Handle GET request to /api/users/:_id/logs
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(_id);
    let exercisesQuery = { userId: _id };

    // Handle optional date parameters
    if (from && to) {
      exercisesQuery.date = { $gte: new Date(from), $lte: new Date(to) };
    } else if (from) {
      exercisesQuery.date = { $gte: new Date(from) };
    } else if (to) {
      exercisesQuery.date = { $lte: new Date(to) };
    }

    // Limit the number of logs
    let exercises = await Exercise.find(exercisesQuery).limit(limit || 0);

    // Format date as string in the log array
    exercises = exercises.map(exercise => ({
      ...exercise.toObject(),
      date: exercise.date.toDateString(),
    }));

    res.json({
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log: exercises,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching user logs' });
  }
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
