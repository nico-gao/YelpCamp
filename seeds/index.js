const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log("Database connected");
});

const sample = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 25; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() *20 ) + 10;
        const camp = new Campground({
            author: '613a74aeb08d2ed4dc8f2cb9',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dtfylnmvq/image/upload/v1631826921/YelpCamp/zgw7b3mpwoptejeo0t14.jpg',
                  filename: 'YelpCamp/zgw7b3mpwoptejeo0t14',
                },
                {
                  url: 'https://res.cloudinary.com/dtfylnmvq/image/upload/v1631826921/YelpCamp/cnonncah0osusx9arzxq.jpg',
                  filename: 'YelpCamp/cnonncah0osusx9arzxq',
                }
              ],
            description: 'lorem',
            price
        });
        await camp.save();
    }
}

seedDB().then(() => {
    db.close();
});