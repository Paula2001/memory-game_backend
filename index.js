const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const app = express();
app.use(express.json());
const mongoURI = 'mongodb://mongoadmin:secret@mongo:27017/test?authSource=admin';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const tokenBlacklist = new Set(); // Simple in-memory store for blacklisted tokens

// Registration endpoint
app.post('/register', async (req, res) => {

    try {
      // Extract username and password from request body
      const { username, password } = req.body;
      // Check if the user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).send('Username already exists');
      }
  
      console.log(password);
      const user = new User({ username, password });
      await user.save();
  
      // Generate a token for the new user
      const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' }); // Replace 'your_jwt_secret' with a real secret key
      
      // Send the token to the client
      res.json({ token });
    } catch (error) {
      res.status(500).send(error);
    }
  });

// Login endpoint
// Login endpoint
app.post('/login', async (req, res) => {
    try {
      // Extract username and password from request body
      const { username, password } = req.body;
  
      // Find the user by username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).send('User not found');
      }

      console.log(password, user);
      if (password !== user.password) {
        return res.status(401).send('Invalid credentials');
      }
  
      // User authenticated, generate a token
      const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' }); // Replace 'your_jwt_secret' with a real secret key
  
      // Send the token to the client
      res.json({ token });
    } catch (error) {
      res.status(500).send(JSON.stringify(error));
    }
  });
  

// Protected data endpoint
app.get('/data', authenticateToken, (req, res) => {
    res.send({'data': "some fake data"});
});

// Logout endpoint
app.post('/logout', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Assuming the token is sent in the Authorization header
  
    // Add the token to the blacklist
    tokenBlacklist.add(token);
  
    res.send('Logged out successfully');
  });
  
  // Middleware to check if a token is blacklisted
function checkBlacklist(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
    if (tokenBlacklist.has(token)) {
        return res.status(401).send('Token is no longer valid');
    }
    next();
}
  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function authenticateToken(req, res, next) {
    // Retrieve the token from the Authorization header
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
    if (token == null) {
      return res.sendStatus(401); // if there's no token
    }
  
    jwt.verify(token, 'your_jwt_secret', (err, user) => {
      if (err) {
        return res.sendStatus(403); // if the token is not valid
      }
  
      req.user = user;
      next(); // proceed to the next middleware/route handler
    });
  }