// Get dependencies
var express = require('express');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;
console.log("Get Mongo URI: ", process.env.MONGO_URI);

// Import the routing files
const adminRoutes = require('./server/routes/admin');
const eventRoutes = require('./server/routes/events');
const galleryRoutes = require('./server/routes/galleries');
const userRoutes = require('./server/routes/users');

var app = express(); // create an instance of express

// Tell express to use the following parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use(logger('dev')); // Tell express to use the Morgan logger

// Add support for CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  next();
});



// Register the routes with the Express application
app.use('/admin', adminRoutes);
app.use('/events', eventRoutes);
app.use('/galleries', galleryRoutes);
app.use('/users', userRoutes);

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