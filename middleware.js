const Campground = require('./models/campground');
const { campSchema, reviewSchema } = require('./validationSchemas.js');
const ExpressError = require('./utilities/ExpressError');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCamp = (req, res, next) => {
    const { error } = campSchema.validate(req.body);
    if(error){
        const msg = error.details.map(e => e.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

module.exports.isCampAuthor = async(req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp.author.equals(req.user._id)){
        req.flash('error', 'No permission!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(e => e.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}