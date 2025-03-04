const openWeatherApiKey = "2f8795480d5cbefc7d7e72992181bfc0";
const cities = ["New York", "Paris", "Tokyo", "Londres", "Moscou", "Sydney", "Berlin", "Rio de Janeiro", "Cape Town", "Pékin"];



// Fonction générique pour récupérer des données météo
async function fetchWeatherData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
        const data = await response.json();

        // Vérification si l'API retourne une erreur
        if (data.cod && parseInt(data.cod) !== 200) {
            throw new Error(`Erreur API : ${data.message}`);
        }

        return data;
    } catch (error) {
        console.error("Erreur API :", error);
        alert("Problème lors de la récupération des données : " + error.message);
        return null; // Arrête l'exécution en cas d'erreur
    }
}
// Récupération et affichage de la météo d'une ville
async function fetchWeather() {
    const city = document.getElementById("search-city").value.trim();
    if (!city) return alert("Veuillez entrer une ville.");
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${openWeatherApiKey}`;
    const data = await fetchWeatherData(url);
    if (!data || !data.main || !data.wind) return;

    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;

    // Affichage des résultats
    document.getElementById("weather-result").innerHTML = `
        <h3>Météo à ${city}</h3>
        <p>🌡️ Température : ${temp}°C</p>
        <p>💧 Humidité : ${humidity}%</p>
        <p>💨 Vent : ${wind} km/h</p>
    `;
    
    fetchAltitudeWeather(data.coord.lat, data.coord.lon);
}



document.addEventListener("DOMContentLoaded", fetchCityTemperatures);

// Récupération des coordonnées de la ville
async function getCityCoordinates(city) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Problème lors de la récupération des coordonnées.");

        const data = await response.json();
        if (data.length === 0) throw new Error("Ville non trouvée.");

        // Extraction des coordonnées (premier résultat)
        const { lat, lon } = data[0];
        return { lat, lon };
    } catch (error) {
        console.error("Erreur:", error);
        alert("Impossible de récupérer les coordonnées de la ville.");
        return null;
    }
}

// Récupération des données météo en altitude
async function fetchAltitudeWeather(lat, lon, altitude = 1500) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&elevation=${altitude}&current=temperature_2m,relative_humidity_2m,windspeed_10m`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Problème lors de la récupération des données météo.");

        const data = await response.json();
        if (!data.current) throw new Error("Données météo non disponibles.");

        

        // Extraction des données météo
        const tempAltitude = data.current.temperature_2m;
        const humidityAltitude = data.current.relative_humidity_2m;
        const windAltitude = data.current.windspeed_10m;

        // Affichage des données météorologiques en altitude
        document.getElementById("altitude-data").innerHTML = `
            <h3>Données en Altitude</h3>
            <p>🏔️ Altitude : ${altitude}m</p>
            <p>🌡️ Température : ${tempAltitude}°C</p>
            <p>💧 Humidité : ${humidityAltitude}%</p>
            <p>💨 Vent : ${windAltitude} km/h</p>
        `;
    
    }

// Fonction principale qui récupère la ville et lance la météo
async function getWeatherForCity() {
    const city = document.getElementById("search-city2").value.trim();
    if (!city) return alert("Veuillez entrer une ville.");

    const coordinates = await getCityCoordinates(city);
    if (coordinates) {
        fetchAltitudeWeather(coordinates.lat, coordinates.lon);
    }
}




// Récupération des températures des grandes villes (défilement)
async function fetchCityTemperatures() {
    const cityList = document.getElementById("city-list");
    cityList.innerHTML = "";
    
    for (const city of cities) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${openWeatherApiKey}`;
        const data = await fetchWeatherData(url);
        if (!data || !data.main) continue;
        
        const cityItem = document.createElement("span");
        cityItem.textContent = `${city} - ${data.main.temp}°C`;
        cityList.appendChild(cityItem);
    }
}

// Ajout des caméras en direct via l'API YouTube
function loadLiveCams() {
    const camContainer = document.getElementById("live-cams");
    if (!camContainer) return;

    const videoIds = ["5qap5aO4i9A", "9Auq9mYxFEE", "2mP6P6pK5IU"]; // IDs des vidéos YouTube
    const locations = ["Tokyo", "Paris", "Los Angeles"]; // Noms des endroits correspondants

    // Génère dynamiquement les div pour chaque vidéo et le nom de l'endroit
    videoIds.forEach((id, index) => {
        const camItemDiv = document.createElement("div");
        camItemDiv.className = "cam-item"; // Ajoute la classe pour aligner avec le CSS
        camItemDiv.style = "display: inline-block; margin: 10px;";

        const playerDiv = document.createElement("div");
        playerDiv.id = `player-${index}`;
        playerDiv.style = "margin: 0 auto;"; // Centre chaque vidéo

        // Crée un élément pour le nom de l'endroit
        const locationDiv = document.createElement("p");
        locationDiv.textContent = `Emplacement : ${locations[index]}`;

        camItemDiv.appendChild(playerDiv);
        camItemDiv.appendChild(locationDiv);

        camContainer.appendChild(camItemDiv);
    });
}

// Fonction appelée quand l'API YouTube est chargée
function onYouTubeIframeAPIReady() {
    const videoIds = ["_k-5U7IeK8g", "4In_qA6dLcg", "3LXQWU67Ufk"];

    videoIds.forEach((id, index) => {
        new YT.Player(`player-${index}`, {
            height: '300',
            width: '400',
            videoId: id,
            playerVars: { 'autoplay': 1, 'controls': 1, 'mute' : 1 }
        });
    });
}

// Charge la section des caméras dès que la page est prête
document.addEventListener("DOMContentLoaded", function() {
    loadLiveCams();
});

// Ajoute le script de l'API YouTube
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

// Ajout d'un EventListener pour lancer la recherche au clic sur un bouton
document.getElementById("search-btn").addEventListener("click", getWeatherForCity);