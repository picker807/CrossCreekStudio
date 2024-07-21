// Get dependencies
var express = require('express');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const session = require('express-session');
var logger = require('morgan');
var mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;

// Import the routing files
const authRoutes = require('./server/routes/auth');
const adminRoutes = require('./server/routes/admin');
const eventRoutes = require('./server/routes/events');
const galleryRoutes = require('./server/routes/galleries');
const userRoutes = require('./server/routes/users');
const emailRoutes = require('./server/routes/email');


var app = express(); // create an instance of express

// Tell express to use the following parsers for POST data
app.use(bodyParser.json({ limit: '100mb'}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '100mb'
}));
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(logger('dev')); // Tell express to use the Morgan logger


app.use(cors({
  origin: 'http://localhost:4200', // Replace with your frontend's URL
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());



// Register the routes with the Express application
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/events', eventRoutes);
app.use('/galleries', galleryRoutes);
app.use('/users', userRoutes);
app.get('/api/paypal-client-id', (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
});
app.use('/api/email', emailRoutes);

// Tell express to map all other non-defined routes back to the index page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/cross-creek-creates/browser/index.html'));
});

// Tell express to use the specified directory as the
// root directory for your web site
app.use(express.static(path.join(__dirname, 'dist/cross-creek-creates/browser')));

// Establish a connection to the MongoDB database
console.log(mongoUri);
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to database!'))
  .catch(err => console.error('Connection failed:', err));

// Handle connection events
const db = mongoose.connection;
db.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});
db.once('open', () => {
  console.log('Mongoose connected to the database');
});
db.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Define the port address and tell express to use this port
const port = process.env.PORT || '3000';
app.set('port', port);

// Create HTTP server.
const server = http.createServer(app);

// Tell the server to start listening on the provided port
server.listen(port, function() {
  console.log('API running on localhost: ' + port);
});