var now = new Date();
var currenttime = now.toLocaleString();
document.getElementById("currenttime").innerHTML = currenttime;

// Nur wenn angemeldet
if (localStorage.getItem('jwt')) {
    fetch('/api/favorites', {
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('jwt')
        }
    })
    .then(res => res.json())
    .then(favorites => {
        favorites.forEach(fav => {
            console.log("Favorit:", fav);
            // hier UI bauen (z. B. in <ul>)
        });
    });
}