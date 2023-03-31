// Console logging
console.log("Using /detect routes");

// Import express
let express = require('express');
let router = express.Router();

// Import Multer
var multer = require('multer');
var upload = multer();

const fetch = require('node-fetch');

// Import Helpers
const middleware_options = require('../middleware/middleware_options');
const middleware_canvas = require('../middleware/middleware_canvas');
const middleware_detection = require('../middleware/middleware_detection');
const middleware_draw = require('../middleware/middleware_draw');

// Define route
router.post('/detect',
    upload.single('img'),
    middleware_options,
    middleware_canvas,
    middleware_detection,
    middleware_draw,
    async function (req, res, next) {
        try {
            // Reply with image if required
            if (req.query.return_img && req.drawn_canvas) {
                res.contentType('jpeg');
                res.end(req.drawn_canvas.toBuffer(), 'binary');
            }

            // Else reply with detections object 
            else if (req.matches) {
                res.send(req.matches);
            }

            // Else respond with an internal error
            else {
                throw 'Error computing response, no return value'
            }
        }
        catch (err) {
            next(err);
        }
    });

// Define route
router.get('/detectByURL',
    async function (req, res, next) {
        try {
            let img_url = req.query.img_url;
            if (!img_url) {
                throw 'No image URL provided';
            }

            // Download image from URL
            // Download image from URL
            fetch(img_url)
                .then(res => {
                    if (res.ok) {
                        console.log('Downloaded image from URL');
                        return res.buffer();
                    } else {
                        console.log('Failed to download image from URL');
                        throw new Error('Failed to download image from URL');
                    }
                })
                .then(buffer => {
                    req.file = { buffer: buffer, mimetype: 'image/jpeg', originalname: 'image.jpg' };
                    next();
                })
                .catch(err => {
                    res.json({"matches": false});
                    next(err);
                });


        } catch (err) {
            res.json({"matches": false});
            next(err);
        }
    },
    middleware_options,
    middleware_canvas,
    middleware_detection,
    middleware_draw,
    async function (req, res, next) {
        try {
            // Reply with image if required
            if (req.query.return_img && req.drawn_canvas) {
                res.contentType('jpeg');
                res.end(req.drawn_canvas.toBuffer(), 'binary');
            }

            // Else reply with detections object 
            else if (req.matches) {
                if (req.matches.length > 0)
                    res.json({"matches": true});
                else
                    res.json({"matches": false});
            }

            // Else respond with an internal error
            else {
                throw 'Error computing response, no return value'
            }
        }
        catch (err) {
            res.json({"matches": false});
            next(err);
        }
    });

// Export router
module.exports = router