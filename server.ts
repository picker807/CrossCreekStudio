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

//console.log('SITE_URL:', process.env.SITE_URL);

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


// Configure CORS to allow requests from the Render domain
app.use(cors({
  origin: [
    'https://crosscreekcreates.onrender.com',
    'http://localhost:4200',
    'http://localhost:8080',
    'https://crosscreekstudio.net'],
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
app.use('/api/cart', require('./server/routes/cart'));
app.use('/api/products', require('./server/routes/products'));
app.use('/api/galleries', galleryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/checkout', require('./server/routes/checkout'));
app.use('/api/orders', require('./server/routes/orders'));

// Tell express to use the specified directory as the
// root directory for your web site
app.use(express.static(path.join(__dirname, 'dist/cross-creek-creates/browser')));

// Tell express to map all other non-defined routes back to the index page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/cross-creek-creates/browser/index.html'));
});

app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});


app.get('*', async (req, res) => {
  try {
    const { renderModule } = await import('@angular/platform-server');
    const { AppServerModule } = await import('./dist/cross-creek-creates/server/main');
    const document = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Cross Creek Studio</title>
          <base href="/">
        </head>
        <body>
          <app-root></app-root>
        </body>
      </html>
    `;
    const html = await renderModule(AppServerModule, {
      url: req.url,
      document: document,
    });
    res.send(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.sendFile(path.join(__dirname, 'dist/cross-creek-creates/browser/index.html'));
  }
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
const port = process.env.PORT || 8080;
console.log(`Attempting to start server on port ${port}`);
//app.set('port', port);

// Create HTTP server.
//const server = http.createServer(app);

// Tell the server to start listening on the provided port
const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment) {
  // For development, listen on localhost
  app.listen(port, () => {
    console.log(`Development server running on http://localhost:${port}`);
  });
} else {
  // For production, listen on all interfaces
  app.listen(port, '0.0.0.0', () => {
    console.log(`Production server running on port ${port}`);
  });
}

