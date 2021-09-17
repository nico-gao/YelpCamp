const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const wrapAsync = require('../utilities/wrapAsync');
const { isLoggedIn, isCampAuthor, validateCamp } = require('../middleware');

router.route('/')
    .get(wrapAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCamp, wrapAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(wrapAsync(campgrounds.showCampground))
    .put(isLoggedIn, isCampAuthor, upload.array('image'), validateCamp, wrapAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isCampAuthor, wrapAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isCampAuthor, wrapAsync(campgrounds.renderEditForm)); 

module.exports = router;