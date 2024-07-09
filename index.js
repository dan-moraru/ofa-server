const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const errorHandler = require('./middleware/error');
const aiRoute = require('./routes/ai');
const healthRoute = require('./routes/health');

const PORT = process.env.PORT || 5000;
//const SECRET = process.env.SECRET;

const app = express();

// Enable compression and body parsing
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Set static folder
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 Mins
  max: 30,
});
app.use(limiter);
app.set('trust proxy', 1);

// Enable cors
app.use(cors());

// Routes
app.use('/ofa', aiRoute);
app.use('/health', healthRoute);

// Error handler middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));