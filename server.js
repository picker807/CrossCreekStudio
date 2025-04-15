var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
// Get dependencies
var express = require('express');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var mongoose = require('mongoose');
//mongoose.set('debug', true);
var cors = require('cors');
require('dotenv').config();
var mongoUri = process.env.MONGODB_URI;
//console.log('SITE_URL:', process.env.SITE_URL);
// Import the routing files
var authRoutes = require('./server/routes/auth');
var adminRoutes = require('./server/routes/admin');
var eventRoutes = require('./server/routes/events');
var galleryRoutes = require('./server/routes/galleries');
var userRoutes = require('./server/routes/users');
var emailRoutes = require('./server/routes/email');
var app = express(); // create an instance of express
// Tell express to use the following parsers for POST data
app.use(bodyParser.json({ limit: '100mb' }));
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
        'https://crosscreekstudio.net'
    ],
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
app.use('/api/config', require('./server/routes/config'));
app.use('/api/galleries', galleryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/checkout', require('./server/routes/checkout'));
app.use('/api/orders', require('./server/routes/orders'));
// Tell express to use the specified directory as the
// root directory for your web site
app.use(express.static(path.join(__dirname, 'dist/cross-creek-creates/browser')));
// Tell express to map all other non-defined routes back to the index page
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist/cross-creek-creates/browser/index.html'));
});
app.use(function (err, req, res, next) {
    console.error('Global error handler:', err.stack);
    res.status(500).json({ message: 'Internal server error' });
});
app.get('*', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var renderModule, AppServerModule, document_1, html, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require('@angular/platform-server'); })];
            case 1:
                renderModule = (_a.sent()).renderModule;
                return [4 /*yield*/, Promise.resolve().then(function () { return require('./dist/cross-creek-creates/server/main'); })];
            case 2:
                AppServerModule = (_a.sent()).AppServerModule;
                document_1 = "\n      <!DOCTYPE html>\n      <html lang=\"en\">\n        <head>\n          <meta charset=\"UTF-8\">\n          <title>Cross Creek Studio</title>\n          <base href=\"/\">\n        </head>\n        <body>\n          <app-root></app-root>\n        </body>\n      </html>\n    ";
                return [4 /*yield*/, renderModule(AppServerModule, {
                        url: req.url,
                        document: document_1,
                    })];
            case 3:
                html = _a.sent();
                res.send(html);
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('SSR Error:', error_1);
                res.sendFile(path.join(__dirname, 'dist/cross-creek-creates/browser/index.html'));
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Establish a connection to the MongoDB database
//console.log(mongoUri);
mongoose.connect(mongoUri)
    .then(function () { return console.log('Connected to database!'); })
    .catch(function (err) { return console.error('Connection failed:', err); });
// Handle connection events
var db = mongoose.connection;
db.on('error', function (err) {
    console.error('Mongoose connection error:', err);
});
db.once('open', function () {
    console.log('Mongoose connected to the database');
});
db.on('disconnected', function () {
    console.log('Mongoose disconnected');
});
// Define the port address and tell express to use this port
var port = process.env.PORT || 8080;
console.log("Attempting to start server on port ".concat(port));
//app.set('port', port);
// Create HTTP server.
//const server = http.createServer(app);
// Tell the server to start listening on the provided port
var isDevelopment = process.env.NODE_ENV !== 'production';
if (isDevelopment) {
    // For development, listen on localhost
    app.listen(port, function () {
        console.log("Development server running on http://localhost:".concat(port));
    });
}
else {
    // For production, listen on all interfaces
    app.listen(port, '0.0.0.0', function () {
        console.log("Production server running on port ".concat(port));
    });
}
