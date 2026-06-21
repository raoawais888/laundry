require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

/* ==========================================
   SOCKET.IO
========================================== */

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

global.io = io;

io.on('connection', (socket) => {

    console.log(`Socket Connected: ${socket.id}`);

    // Rider updates live location
    socket.on('rider-location-update', (data) => {

        io.emit('order-location-update', {
            riderId: data.riderId,
            latitude: data.latitude,
            longitude: data.longitude
        });

    });

    // Order status updates
    socket.on('order-status-update', (data) => {

        io.emit('order-status-changed', {
            orderId: data.orderId,
            status: data.status
        });

    });

    socket.on('disconnect', () => {
        console.log(`Socket Disconnected: ${socket.id}`);
    });

});

/* ==========================================
   SECURITY
========================================== */

app.use(helmet());

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(compression());

/* ==========================================
   RATE LIMITING
========================================== */

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500
}));

/* ==========================================
   BODY PARSER
========================================== */

app.use(express.json({
    limit: '50mb'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '50mb'
}));

app.use(cookieParser());

/* ==========================================
   LOGGING
========================================== */

app.use(morgan('dev'));

/* ==========================================
   HEALTH CHECK
========================================== */

app.get('/', (req, res) => {

    return res.status(200).json({
        success: true,
        app: 'Laundry Pickup & Delivery API',
        version: '1.0.0',
        status: 'Running'
    });

});

app.get('/health', (req, res) => {

    return res.status(200).json({
        success: true,
        uptime: process.uptime(),
        timestamp: new Date()
    });

});

/* ==========================================
   API ROUTES
========================================== */

// // Authentication
 app.use('/api/auth', require('./src/routes/auth.routes'));

// // Customer
// app.use('/api/users', require('./src/routes/user.routes'));
// app.use('/api/addresses', require('./src/routes/address.routes'));

// // Orders
// app.use('/api/orders', require('./src/routes/order.routes'));

// // Payments
// app.use('/api/payments', require('./src/routes/payment.routes'));

// // Reviews
// app.use('/api/reviews', require('./src/routes/review.routes'));

// // Notifications
// app.use('/api/notifications', require('./src/routes/notification.routes'));

// // Rider
// app.use('/api/riders', require('./src/routes/rider.routes'));

// // Admin
// app.use('/api/admin', require('./src/routes/admin.routes'));

// // Support
// app.use('/api/support', require('./src/routes/support.routes'));

// // Uploads
// app.use('/api/uploads', require('./src/routes/upload.routes'));

/* ==========================================
   404
========================================== */

// app.use('*', (req, res) => {

//     return res.status(404).json({
//         success: false,
//         message: 'Route Not Found'
//     });

// });

/* ==========================================
   ERROR HANDLER
========================================== */

app.use((err, req, res, next) => {

    console.error(err);

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });

});

/* ==========================================
   SERVER
========================================== */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

    console.log(`
====================================
🚀 Laundry Backend Running
🌎 Environment: ${process.env.NODE_ENV}
📡 Port: ${PORT}
====================================
`);

});

/* ==========================================
   PROCESS EVENTS
========================================== */

process.on('uncaughtException', (err) => {

    console.error('UNCAUGHT EXCEPTION');
    console.error(err);

});

process.on('unhandledRejection', (err) => {

    console.error('UNHANDLED REJECTION');
    console.error(err);

});