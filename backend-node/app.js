const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const swapRequestRouter = require('./routes/swap-request');
const messagesRouter = require('./routes/messages');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI);

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/swap-request', swapRequestRouter);
app.use('/api/messages', messagesRouter);

module.exports = app;
