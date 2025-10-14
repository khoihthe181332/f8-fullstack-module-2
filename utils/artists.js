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
        const data = await httpRequest.get("/artists/trending?limit=15");
        renderTrendingArtists(data.artists);
    } catch (error) {
        console.error("Không tải được danh sách nghệ sĩ:", error);
    }
}

// Render Artist by ID
function renderArtistById(data) {
    const artistHero = $(".artist-hero");
    const artistControls = $(".artist-controls");

    if (!artistHero) {
        console.error("Artist hero element not found");
        return;
    }

    artistControls.innerHTML = `<button class="play-button">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="follow-button follow-artist-button ${data.is_following ? "following" : ""}">${data.is_following ? "Following" : "Follow"}</button>
                    <button class="more-button">
                        <i class="fas fa-ellipsis"></i>
                    </button>`;

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
        return `<div class="track-item" data-track-id="${track.id}">
                    <div class="track-number">${index + 1}</div>
                    <div class="track-playing"><i class="fa-solid fa-chart-simple"></i></div>
                    <div class="track-image">
                        <img src="${track.image_url}" alt="${track.title}" />
                        <i class="fas fa-play track-item-play-btn"></i>
                        <i class="fas fa-pause track-item-play-btn"></i>
                    </div>
                    <div class="track-info">
                        <div class="track-name">${track.title}</div>
                    </div>
                    <div class="track-plays">${(track.play_count || 27498341).toLocaleString()}</div>
                    <span class="playing-indicator ${track.playlist_id ? "add" : ""}"><i class="fa-solid ${track.playlist_id ? "fa-circle-check" : "fa-circle-plus"}"></i></span>
                    <div class="track-duration">${getTimeProgress(track.duration)}</div>
                    <button class="track-menu-btn">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>`
    }).join("");
}

import { toggleView } from "../main.js";

// GET Artist by ID
async function showArtistById(artistId) {
    if (!artistId) {
        console.error("Artist ID is required");
        return;
    }

    try {
        const data = await httpRequest.get(`/artists/${artistId}`);
        renderArtistById(data);

        const artistPopularTrack = await httpRequest.get(`/artists/${artistId}/tracks/popular`);
        renderArtistPopularTracks(artistPopularTrack);

        localStorage.setItem("artistId", artistId);

        // Cập nhật URL
        const newUrl = `?view=artist&id=${artistId}`;
        window.history.pushState({ view: 'artist', artistId }, '', newUrl);

        // Toggle view
        toggleView("artist-page");
    } catch (error) {
        console.error("Không tải được thông tin nghệ sĩ:", error);
    }
}

// Event listeners cho artist cards
export function initArtistCardListeners() {
    document.addEventListener('click', async (e) => {
        const artistCard = e.target.closest('.artist-card');
        if (artistCard) {
            e.preventDefault();
            const artistId = artistCard.dataset.artistId;
            if (artistId) {
                await showArtistById(artistId);
            }
        }

        // Click vào library artist item
        const libraryArtistItem = e.target.closest('.library-item[data-item-type="artist"]');
        if (libraryArtistItem) {
            const artistId = libraryArtistItem.dataset.artistId;
            if (artistId) {
                await showArtistById(artistId);
            }
        }
    });
}

// Xử lý URL parameters khi trang load
export function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    const artistId = urlParams.get('id');

    if (view === 'artist' && artistId) {
        showArtistById(artistId);
    } else {
        toggleView("content-wrapper");
    }
}

// Event listener cho nút back/forward của browser
window.addEventListener('popstate', function (e) {
    if (e.state) {
        if (e.state.view === 'artist' && e.state.artistId) {
            showArtistById(e.state.artistId);
        } else {
            toggleView("content-wrapper");
        }
    } else {
        handleUrlParams();
    }
});

// Hàm follow artist
export function followArtist() {
    // Dùng event delegation thay vì query button trực tiếp
    document.addEventListener("click", async (e) => {
        const followBtn = e.target.closest(".follow-artist-button");
        if (!followBtn) return;

        e.preventDefault();

        // Kiểm tra đã follow chưa
        if (followBtn.disabled || followBtn.classList.contains("following")) return;

        // Disable button để tránh spam click
        followBtn.disabled = true;

        try {
            // Lấy artistId từ hero background
            const heroBackground = $(".hero-background");
            const artistId = heroBackground?.dataset.artistId;

            if (!artistId) {
                console.error("Không tìm thấy artist ID");
                followBtn.disabled = false;
                return;
            }

            await httpRequest.post(`/artists/${artistId}/follow`);

            // Cập nhật UI của button
            followBtn.textContent = "Following";
            followBtn.classList.add("following");

            // Refresh danh sách nghệ sĩ đã theo dõi
            await showArtistsFollowed();

        } catch (error) {
            console.error("Không thể theo dõi nghệ sĩ này");
            followBtn.disabled = false;
        }
    });
}

function renderArtistsFollowed(data) {
    const artistsFollowedContainer = $(".artists-followed-container");
    artistsFollowedContainer.innerHTML = data.map(data => {
        return `<div class="library-item" data-item-type="artist" data-item-name="${data.name}" data-artist-id="${data.id}">
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



