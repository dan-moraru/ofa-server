const express = require('express');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const errorHandler = require('./middleware/error');
const aiRoute = require('./routes/ai');
const healthRoute = require('./routes/health');

const PORT = process.env.PORT || 5000;

const app = express();

// Enable compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 Mins
  max: 30,
});
app.use(limiter);
app.set('trust proxy', 1);

// Enable cors
app.use(cors());

// Set static folder
app.use(express.static('public'));

// Routes
app.use('/ofa', aiRoute);
app.use('/health', healthRoute);

// Error handler middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));