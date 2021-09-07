const express = require('express');
const router = express.Router();
const wrapAsync = require('../utilities/wrapAsync');
const ExpressError = require('../utilities/ExpressError');
const Campground = require('../models/campground');
const { campSchema } = require('../validationSchemas.js');


const validateCamp = (req, res, next) => {
    const { error } = campSchema.validate(req.body);
    if(error){
        const msg = error.details.map(e => e.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

router.get('/', wrapAsync(async (req, res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index', { camps });
}));

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});

router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { camp });
}));

router.get('/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/edit', { camp });
}));

router.post('/', validateCamp, wrapAsync(async (req, res, next) => {
    // if(!req.body.camp) throw new ExpressError('Invalid Campground Data', 400);
    const camp = new Campground(req.body.camp);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`)
}));

router.put('/:id', validateCamp, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.camp });
    res.redirect(`/campgrounds/${camp._id}`);
}));

router.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

module.exports = router;