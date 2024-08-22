// Get dependencies
var express = require('express');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const session = require('express-session');
var logger = require('morgan');
var mongoose = require('mongoose');
//mongoose.set('debug', true);
const cors = require('cors');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;

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

app.use(logger('dev'));


app.use(cors({
  origin: process.env.SITE_URL,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());



// Register the routes with the Express application
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/api/users', userRoutes);
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

app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Establish a connection to the MongoDB database
//console.log(mongoUri);
mongoose.connect(mongoUri)
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
const port = process.env.PORT || 4000;
//app.set('port', port);

// Create HTTP server.
//const server = http.createServer(app);

// Tell the server to start listening on the provided port
app.listen(port, '0.0.0.0', () => {
  console.log('API running on port: ' + port);
});