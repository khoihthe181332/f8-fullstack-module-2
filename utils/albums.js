import httpRequest from "./httpRequest.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function renderAlbumsFollowed(data) {
    const albumsFollowed = $(".albums-followed-container");

    albumsFollowed.innerHTML = data.map((data) => {
        return `<div class="library-item album-followed-item" data-item-type="album" data-album-id="${data.id}">
                            <img src="${data.cover_image_url}" alt="${data.title}" class="item-image" />
                            <div class="item-info">
                                <div class="item-title">${data.title}</div>
                                <div class="item-subtitle">Album's</div>
                            </div>
                        </div>`;
    }).join("");
}

export async function showAlbumsFollowed() {
    try {
        const data = await httpRequest.get("/me/albums/liked?limit=20&offset=0");
        renderAlbumsFollowed(data.albums);
    } catch (error) {
        console.error("Không tải được albums đã thích");
    }
}

function getTotalTimeOfAlbum(duration) {
    const hour = Math.floor(duration / 3600).toString().padStart(2, "0");
    const min = Math.floor((duration % 3600) / 60).toString().padStart(2, "0");

    return `${hour > 0 ? hour + " hour" : ""} ${min > 0 ? min + " minutes" : ""} `;
}

function getTimeProgress(duration) {
    const min = Math.floor(duration / 60);
    const sec = String(duration % 60).padStart(2, "0");

    return `${min}:${sec}`
}

import { toggleView } from "../main.js";

function renderAlbumById(data) {
    try {
        const albumHero = $(".album-hero");
        const albumControls = $(".album-controls");
        albumHero.innerHTML = `<div class="album-cover-wrapper">
                        <img src="${data.cover_image_url ?? data.artist_image_url}" alt="Album Cover" class="album-cover" />
                    </div>
                    <div class="album-info-wrapper">
                        <div class="album-type-badge">Album</div>
                        <h1 class="album-title">${data.title}</h1>
                        <div class="album-meta">
                            <a href="#" class="album-artist-link">${data.artist_name}</a>
                            <span class="meta-separator">•</span>
                            <span class="album-track-count">${data.total_tracks} songs</span>
                            <span class="meta-separator">•</span>
                            <span class="album-duration">${getTotalTimeOfAlbum(data.total_duration)}</span>
                        </div>
                    </div>`;

        albumControls.innerHTML = `<button class="play-button">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="follow-button ${data.is_following ? "following" : ""}">${data.is_following ? "Following" : "Follow"}</button>
                    <button class="more-button">
                        <i class="fas fa-ellipsis"></i>
                    </button>`;
    } catch (error) {
        throw error;
    }
}

function renderAlbumTracks(data) {
    const albumTracksContainer = $(".album-tracks-list");
    try {
        const tracks = Array.isArray(data) ? data : (data.tracks || [data]);

        albumTracksContainer.innerHTML = tracks.map((track, index) => {
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
        }).join("")
    } catch (error) {
        console.error("Không thể tải được danh sách bài hát cho album");
        throw error;
    }
}

async function showAlbumById(albumId) {
    if (!albumId) {
        console.error("Album ID is required");
        return;
    }

    try {
        const data = await httpRequest.get(`/albums/${albumId}`);
        renderAlbumById(data);

        const tracksOfAlbum = await httpRequest.get(`/albums/${albumId}/tracks`);
        renderAlbumTracks(tracksOfAlbum);

        localStorage.setItem("albumId", albumId);

        // Cập nhật URL
        const newUrl = `?view=album&id=${albumId}`;
        window.history.pushState({ view: 'album', albumId }, '', newUrl);

        // Toggle view
        toggleView("album-page");
    } catch (error) {
        console.error("Không thể tải được thông tin album");
    }
}

export function initAlbumsCardListener() {
    document.addEventListener("click", async (e) => {
        // Album card
        // ... 

        // Album followed item
        const albumItem = e.target.closest('.library-item[data-item-type="album"]');
        if (albumItem) {
            const albumId = albumItem.dataset.albumId;
            if (albumId) {
                await showAlbumById(albumId);
            }
        }
    });
}
