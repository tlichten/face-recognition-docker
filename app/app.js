// Get the environmental variables 
port = process.env.PORT || 1890;
weights_path = process.env.WEIGHTS_PATH || './app/weights';
descriptor_path = process.env.DESCRIPTOR_PATH || './app/descriptors.json';
use_tf = process.env.USE_TF || 'true';

// Handle kill commands gracefully
process.on('SIGTERM', function () {
    server.close();
    process.exit(0);
});
process.on('SIGINT', function () {
    server.close();
    process.exit(0);
});

// Load Tensorflow.js 
try {
    const tf = require('@tensorflow/tfjs-node');
    console.log('Loaded tfjs-node version', tf.version_core);
}
catch (err) {
    console.warn('Unable to load tfjs-node\n', err);
}

// Import the express modules
let express = require('express');
let app = express();

// Import the helper modules
const load_models = require('./helpers/load_models');
const load_descriptors = require('./helpers/load_descriptors');
const parse_model_options = require('./helpers/parse_model_options');
const parse_detection_options = require('./helpers/parse_detection_options');

// Load in Application Variables 
load_models(weights_path).then((result) => {
    app.locals.models_loaded = result;
}).catch(err => {
    throw(err);
})
load_descriptors(descriptor_path).then(matchers => {
    app.locals.face_matchers = matchers;
}).catch(err => {
    console.warn("No descriptors loaded on start\n", err);
});
app.locals.model_options = parse_model_options(process.env.MODEL_OPTIONS || { model: 'ssd', minConfidence: 0.6 });
app.locals.detection_options = parse_detection_options(process.env.DETECTION_OPTIONS || {});

// Configure the routes
app.use(require('./routes/index'));

// Start the application
let server = app.listen(port, function () {
    console.log(`Listening on port ${port}...`);
});