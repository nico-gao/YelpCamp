const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utilities/wrapAsync');
const ExpressError = require('./utilities/ExpressError');
const { campSchema } = require('./validationSchemas.js');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log("Database connected");
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', wrapAsync(async (req, res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index', { camps });
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.get('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/show', { camp });
}));

app.get('/campgrounds/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/edit', { camp });
}));

app.post('/campgrounds', validateCamp, wrapAsync(async (req, res, next) => {
    // if(!req.body.camp) throw new ExpressError('Invalid Campground Data', 400);
    const camp = new Campground(req.body.camp);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`)
}));

app.put('/campgrounds/:id', validateCamp, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.camp });
    res.redirect(`/campgrounds/${camp._id}`);
}));

app.delete('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode);
    res.render('error', { err });
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});