import httpRequest from "./httpRequest.js";

// Render trending tracks
function renderTrendingTrack(data) {
    const trendingTrackList = document.querySelector(".hits-grid");
    trendingTrackList.innerHTML = data.map((track) => {
        return `<div class="hit-card">
            <div class="hit-card-cover">
                <img src="${track.image_url}" alt="Flowers" />
                <button class="hit-play-btn">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <div class="hit-card-info">
                <h3 class="hit-card-title">${track.title}</h3>
                <p class="hit-card-artist">${track.artist_name}</p>
            </div>
        </div>`;
    }).join("");
}

// Show trending tracks
export async function showTrendingTrack() {
    try {
        const data = await httpRequest.get("/tracks/trending?limit=6");
        renderTrendingTrack(data.tracks);
    } catch (error) {
        console.error("Lỗi...");
    }
}