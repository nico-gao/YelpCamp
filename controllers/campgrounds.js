const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({ accessToken: mapboxToken });

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
    const geoData = await geocoder.forwardGeocode({
        query: req.body.camp.location,
        limit: 1
    }).send();
    const camp = new Campground(req.body.camp);
    camp.geometry = geoData.body.features[0].geometry;
    camp.images = req.files.map(f => ({
        url: f.path, 
        filename: f.filename,
    }));
    camp.author = req.user._id;
    await camp.save();
    console.log(camp);
    req.flash('success', 'Campground created!');
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const imgToDelete = req.body.deleteImages;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.camp });
    const images = req.files.map(f => ({
        url: f.path, 
        filename: f.filename,
    }));
    camp.images.push(...images);
    await camp.save();
    if (imgToDelete) {
        for (let filename of imgToDelete){
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({$pull: {images: {filename: {$in: imgToDelete}}}});
    }
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}