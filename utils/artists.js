import httpRequest from "./httpRequest.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Render Trending Artist
function renderTrendingArtists(data) {
    const artistTrendingList = $(".artists-grid");
    artistTrendingList.innerHTML = data.map((artist) => {
        return `<div class="artist-card" data-artist-id="${artist.id}">
                    <div class="artist-card-cover">
                        <img src="${artist.image_url}" alt="${artist.name}" />
                        <button class="artist-play-btn">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                    <div class="artist-card-info">
                        <h3 class="artist-card-name">${artist.name}</h3>
                        <p class="artist-card-type">Artist</p>
                    </div>
                </div>`;
    }).join("");
}

export async function showTrendingArtists() {
    try {
        const data = await httpRequest.get("/artists/trending?limit=5");
        renderTrendingArtists(data.artists);
    } catch (error) {
        console.error("Không tải được danh sách nghệ sĩ:", error);
    }
}

// Render Artist by ID
function renderArtistById(data) {
    const artistHero = $(".artist-hero");
    if (!artistHero) {
        console.error("Artist hero element not found");
        return;
    }

    artistHero.innerHTML = `
        <div class="hero-background" data-artist-id="${data.id}">
            <img src="${data.background_image_url}" alt="${data.name} artist background" class="hero-image" />
            <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
            <div class="verified-badge ${data.is_verified ? "show" : ""}">
                <i class="fas fa-check-circle"></i>
                <span>Verified Artist</span>
            </div>
            <h1 class="artist-name">${data.name}</h1>
            <p class="monthly-listeners">
                ${data.monthly_listeners.toLocaleString()} monthly listeners
            </p>
        </div>`;
}

function getTimeProgress(duration) {
    const min = Math.floor(duration / 60);
    const sec = String(duration % 60).padStart(2, "0");

    return `${min}:${sec}`
}

// Render Artist's Popular Track
function renderArtistPopularTracks(data) {
    const trackList = $(".track-list");
    // Handle both array directly or nested in object
    const tracks = Array.isArray(data) ? data : (data.tracks || [data]);

    trackList.innerHTML = tracks.map((track, index) => {
        return `<div class="track-item">
                    <div class="track-number">${index + 1}</div>
                    <div class="track-image">
                        <img src="${track.image_url}" alt="${track.title}" />
                        <i class="fas fa-play track-item-play-btn"></i>
                    </div>
                    <div class="track-info">
                        <div class="track-name">
                            ${track.title}
                        </div>
                    </div>
                    <div class="track-plays">${(track.play_count || 27498341).toLocaleString()}</div>
                    <div class="track-duration">${getTimeProgress(track.duration)}</div>
                    <button class="track-menu-btn">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>`
    }).join("");
}

// GET Artist by ID
export async function showArtistById(artistId) {
    const firstArtistTrending = await httpRequest.get("/artists/trending?limit=2");
    artistId = localStorage.getItem("artistID") || firstArtistTrending.artists[0].id;

    if (!artistId) {
        console.error("Artist ID is required");
        return;
    }

    try {
        const data = await httpRequest.get(`/artists/${artistId}`);
        renderArtistById(data);
        const artistPopularTrack = await httpRequest.get(`/artists/${artistId}/tracks/popular`);
        renderArtistPopularTracks(artistPopularTrack);
    } catch (error) {
        console.error("Không tải được thông tin nghệ sĩ:", error);
    }
}

// Optional: Add event listeners for artist cards
export function initArtistCardListeners() {
    document.addEventListener('click', (e) => {
        const artistCard = e.target.closest('.artist-card');
        if (artistCard) {
            const artistId = artistCard.dataset.artistId;
            if (artistId) {
                localStorage.setItem("artistID", artistId);
                showArtistById(artistId);
            }
        }
    });
}

function renderArtistsFollowed(data) {
    const artistsFollowedContainer = $(".artists-followed-container");
    artistsFollowedContainer.innerHTML = data.map(data => {
        return `<div class="library-item">
                            <img src="${data.image_url}" alt="${data.name}"
                                class="item-image" />
                            <div class="item-info">
                                <div class="item-title">${data.name}</div>
                                <div class="item-subtitle">Artist</div>
                            </div>
                        </div>`
    }).join("");
}

export async function showArtistsFollowed() {
    try {
        const data = await httpRequest.get("/me/following?limit=20&offset=0");
        renderArtistsFollowed(data.artists);
    } catch (error) {
        console.error("Không tải được danh sách nghệ sĩ đã theo dõi");
    }

}