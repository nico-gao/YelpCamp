mapboxgl.accessToken = mapToken;
console.log(camp.geometry);
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: camp.geometry.coordinates, // starting position [lng, lat]
zoom: 10 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());


const marker = new mapboxgl.Marker()
.setLngLat(camp.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({ offset: 25 })
    .setHTML(
        `<h5>${camp.title}</h5><p>${camp.location}</p>`
    )
)
.addTo(map);