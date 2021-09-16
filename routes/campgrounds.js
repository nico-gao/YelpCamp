const express = require('express');
const router = express.Router();
const wrapAsync = require('../utilities/wrapAsync');
const ExpressError = require('../utilities/ExpressError');
const Campground = require('../models/campground');
const { isLoggedIn, isCampAuthor, validateCamp } = require('../middleware');

router.get('/', wrapAsync(async (req, res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index', { camps });
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate({ 
        path: 'reviews',
        populate: {
            path: 'author'
        }
}).populate('author');
    if(!camp){
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { camp });
}));

router.get('/:id/edit', isLoggedIn, isCampAuthor, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { camp });
}));

router.post('/', isLoggedIn, validateCamp, wrapAsync(async (req, res, next) => {
    const camp = new Campground(req.body.camp);
    camp.author = req.user._id;
    await camp.save();
    req.flash('success', 'Campground created!');
    res.redirect(`/campgrounds/${camp._id}`)
}));

router.put('/:id', isLoggedIn, isCampAuthor, validateCamp, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.camp });
    res.redirect(`/campgrounds/${camp._id}`);
}));

router.delete('/:id', isLoggedIn, isCampAuthor, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}));

module.exports = router;