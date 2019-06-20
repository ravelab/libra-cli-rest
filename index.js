const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');
const queue = require('express-queue');
const api = require('./api');

const app = express();
app.use(queue({ activeLimit: 1, queuedLimit: -1 }));
app.set('trust proxy', true);
app.use(helmet());
app.use(cors());
app.use(
  morgan('tiny', {
    skip: req => req.url === '/health'
  })
);
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', api);

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0');
console.log('Listen on port ' + port);
