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
const mongoDBURI = 'mongodb+srv://root:root@cluster0.dqvji0r.mongodb.net/?retryWrites=true&w=majority';

// Connect to MongoDB Atlas
mongoose.connect(mongoDBURI, options)
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
    date: Date,
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
            date,
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

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});
