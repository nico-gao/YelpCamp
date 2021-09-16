const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index', { camps });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.showCampground = async (req, res) => {
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
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { camp });
}

module.exports.createCampground = async (req, res, next) => {
    const camp = new Campground(req.body.camp);
    camp.author = req.user._id;
    await camp.save();
    req.flash('success', 'Campground created!');
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.camp });
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}