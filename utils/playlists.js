import httpRequest from "./httpRequest.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function renderPlaylistsFollowed(data) {
    const playlistsLiked = $(".playlists-followed-container");
    playlistsLiked.innerHTML = data.map((data) => {
        return `<div class="library-item" data-item-type="playlist" data-playlist-id="${data.id}">
                            <img src="${data.image_url}" alt="${data.name}" class="item-image" />
                            <div class="item-info">
                                <div class="item-title">${data.name}</div>
                                <div class="item-subtitle">Playlist • ${data.total_tracks} songs</div>
                            </div>
                        </div>`
    }).join("");
}

export async function showPlaylistsFollowed() {
    try {
        const data = await httpRequest.get("/me/playlists/followed?limit=20&offset=0");
        renderPlaylistsFollowed(data.playlists);
    } catch (error) {
        console.error("Không tải được Playlists đã theo dõi");
    }
}

function renderMyPlaylist(data) {
    const myPlaylist = $(".my-playlists-container");

    // ✅ Sắp xếp: "Liked Songs" lên đầu, các playlist khác giữ nguyên thứ tự
    const sortedData = [...data].sort((a, b) => {
        if (a.name === "Liked Songs") return -1;  // Liked Songs lên đầu
        if (b.name === "Liked Songs") return 1;   // Liked Songs lên đầu
        return 0;  // Giữ nguyên thứ tự của các playlist khác
    });

    myPlaylist.innerHTML = sortedData.map(data => {
        return `<div class="library-item" data-item-type="myPlaylist" data-playlist-id="${data.id}">
                    ${data.name === "Liked Songs"
                ? `<div class="item-icon liked-songs">
                            <i class="fas fa-heart"></i>
                           </div>`
                : `<img src="${data.image_url}" alt="${data.name}" class="item-image" />`
            }
                    <div class="item-info">
                        <div class="item-title">${data.name}</div>
                        <div class="item-subtitle">
                            ${data.name === "Liked Songs" ? '<i class="fas fa-thumbtack"></i>' : ""}
                            Playlist • ${data.total_tracks} songs
                        </div>
                    </div>
                </div>`
    }).join("");
}

export async function showMyPlaylist() {
    try {
        const data = await httpRequest.get("/me/playlists");
        renderMyPlaylist(data.playlists);
        return
    } catch (error) {
        console.error("Không thể tải playlist");
        throw error;
    }
}

function getTotalTimeOfPlaylist(duration) {
    const hour = Math.floor(duration / 3600).toString().padStart(2, "0");
    const min = Math.floor((duration % 3600) / 60).toString().padStart(2, "0");

    return `${hour}hour ${min}minutes`;
}

function getTimeProgress(duration) {
    const min = Math.floor(duration / 60);
    const sec = String(duration % 60).padStart(2, "0");

    return `${min}:${sec}`
}

// Render Playlist by ID
function renderPlaylistById(data) {
    const playlistHeader = $(".playlist-header");

    if (!playlistHeader) {
        console.error("Playlist hero element not found");
        return;
    }

    playlistHeader.innerHTML = `<div class="playlist-img">
                        <img src="${data.image_url}"
                            alt="${data.name}">
                    </div>
                    <div class="playlist-info">
                        <div class="playlist-type">${data.is_public === 1 ? "Public playlist" : "Private playlist"}</div>
                        <h1 class="playlist-title">${data.name}</h1>
                        <div class="playlist-meta">
                            <img src="${data.image_url}"
                                alt="${data.name}">
                            <span>${data.name}</span>
                            <span class="meta-separator">•</span>
                            <span>${data.total_tracks} songs, about ${getTotalTimeOfPlaylist(data.total_duration)}</span>
                        </div>
                    </div>`;
}

function formatDate(dateString) {
    const date = new Date(dateString);

    // Format theo locale Tiếng Việt
    return date.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function renderPlaylistTracks(data) {
    const songListContainer = $(".song-list-container");
    try {
        const tracks = Array.isArray(data) ? data : (data.tracks || [data]);

        songListContainer.innerHTML = tracks.map((track) => {
            return `<div class="song-item">
                            <div class="song-number">${track.position}</div>
                            <div class="play-icon">▶</div>
                            <div class="song-info">
                                <img src="https://spotify.f8team.dev${track.track_image_url}"
                                    alt="${track.track_title}" class="song-thumbnail">
                                <div class="song-details">
                                    <div class="song-title">${track.track_title}</div>
                                    <div class="song-artist">${track.artist_name}</div>
                                </div>
                            </div>
                            <div class="song-album">${track.album_title}</div>
                            <div class="song-date">${formatDate(track.added_at)}</div>
                            <div class="song-duration">
                                <span class="playing-indicator ${track.playlist_id ? "add" : ""}"><i class="fa-solid ${track.playlist_id ? "fa-circle-check" : "fa-circle-plus"}"></i></span>
                                <span class="duration-time">${getTimeProgress(track.track_duration)}</span>
                                <span class="more-button"><i class="fas fa-ellipsis-h"></i></span>
                            </div>
                        </div>`
        }).join("");
    } catch (error) {
        console.error("Không thể tải được danh sách bài hát");
        throw error;
    }
}

import { toggleView } from "../main.js";

export async function showPlaylistById(playlistId) {
    if (!playlistId) {
        console.error("Playlist ID is required");
        return;
    }

    try {
        const data = await httpRequest.get(`/playlists/${playlistId}`);
        renderPlaylistById(data);

        const tracksOfPlaylist = await httpRequest.get(`/playlists/${playlistId}/tracks`);
        renderPlaylistTracks(tracksOfPlaylist);

        // toggle view
        toggleView("playlist-page");
    } catch (error) {
        console.error("Không tải được playlist");
    }
}

export function initPlaylistCardListeners() {
    document.addEventListener("click", (e) => {
        // Playlist card
        // ....

        // Playlist - library item
        const libraryMyPlaylistItem = e.target.closest('.library-item[data-item-type="myPlaylist"]');
        const libraryFollowedPlaylistItem = e.target.closest(('.library-item[data-item-type="playlist"]'));
        if (libraryFollowedPlaylistItem || libraryMyPlaylistItem) {
            const playlistId = libraryMyPlaylistItem.dataset.playlistId ?? libraryFollowedPlaylistItem.dataset.playlistId;
            if (playlistId) {
                showPlaylistById(playlistId);
            }
        }
    });
}
