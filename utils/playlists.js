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
                                <div class="item-subtitle">Danh sách phát • ${data.total_tracks} bài hát</div>
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
                            Danh sách phát • ${data.total_tracks} bài hát
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

    return `${hour > 0 ? hour + " giờ" : ""} ${min > 0 ? min + " phút" : ""} `;
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
                        <div class="playlist-type">${data.is_public === 1 ? "Danh sách phát công khai" : "Danh sách phát riêng tư"}</div>
                        <h1 class="playlist-title">${data.name}</h1>
                        <div class="playlist-meta">
                            <img src="${data.image_url}"
                                alt="${data.name}">
                            <span>${data.name}</span>
                            <span class="meta-separator">•</span>
                            <span>${data.total_tracks} bài hát, khoảng ${getTotalTimeOfPlaylist(data.total_duration)}</span>
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

        songListContainer.innerHTML = tracks.map((track, index) => {
            return `<div class="song-item" data-track-id="${track.track_id}" data-item-type="track">
                            <div class="song-number">${index + 1}</div>
                            <div class="play-icon">
                                <i class="fa-solid fa-play icon-play"></i>
                                <i class="fa-solid fa-pause icon-pause"></i>
                            </div>
                            <div class="song-info">
                                <img src="${track.track_image_url}"
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
                                <button class="more-button"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>`
        }).join("");
    } catch (error) {
        console.error("Không thể tải được danh sách bài hát");
        throw error;
    }
}

import { toggleView } from "../main.js";

async function showPlaylistById(playlistId) {
    if (!playlistId) {
        console.error("Playlist ID is required");
        return;
    }

    try {
        const data = await httpRequest.get(`/playlists/${playlistId}`);
        renderPlaylistById(data);

        const tracksOfPlaylist = await httpRequest.get(`/playlists/${playlistId}/tracks`);
        renderPlaylistTracks(tracksOfPlaylist);

        // Cập nhập URL
        const newUrl = `?view=playlist&id=${playlistId}`;
        window.history.pushState({ view: 'playlist', playlistId }, '', newUrl);

        localStorage.setItem("playlistId", playlistId);

        // toggle view
        toggleView("playlist-page");
    } catch (error) {
        console.error("Không tải được playlist");
    }
}

export function initPlaylistCardListeners() {
    document.addEventListener("click", async (e) => {
        // Playlist card
        // ....

        // Playlist - library item
        const playlistItem = e.target.closest('.library-item[data-item-type="myPlaylist"]') || e.target.closest(('.library-item[data-item-type="playlist"]'));
        if (playlistItem) {
            const playlistId = playlistItem?.dataset.playlistId;
            if (playlistId) {
                await showPlaylistById(playlistId);
            }
        }
    });
}

// Xử lý URL parameters khi trang load
export function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    const playlistId = urlParams.get('id');

    if (view === 'playlist' && playlistId) {
        showPlaylistById(playlistId);
    } else {
        toggleView("content-wrapper");
    }
}

// Event listener cho nút back/forward của browser
window.addEventListener('popstate', function (e) {
    if (e.state) {
        if (e.state.view === 'playlist' && e.state.playlistId) {
            showPlaylistById(e.state.playlistId);
        } else {
            toggleView("content-wrapper");
        }
    } else {
        handleUrlParams();
    }
});

/** 
 * Tạo playlist
 */
export async function createPlaylist(playlistData) {
    try {
        const response = await httpRequest.post('/playlists', playlistData);
        return response;
    } catch (error) {
        console.error('Error creating playlist:', error);
        throw error;
    }
}

// Xử lý chọn ảnh
const playlistOverlay = $(".playlist-overlay");
const playlistImg = $(".playlist-img img");
const fileInput = $("#file-input");

// Click vào overlay để chọn ảnh
playlistOverlay.addEventListener("click", function () {
    fileInput.click();
});

// Xử lý khi chọn file
// ....

const playlistCreateForm = $("#playlist-form");
playlistCreateForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Lấy giá trị từ form
    const playlistName = $("#playlist-title-input").value.trim();
    const playlistDesc = $("#playlist-desc-input").value.trim();
    const errorMessage = $(".error-message");

    // Validate tên playlist
    if (!playlistName) {
        errorMessage.style.display = "flex";
        $("#playlist-title-input").classList.add("error");
        return;
    } else {
        errorMessage.style.display = "none";
        $("#playlist-title-input").classList.remove("error");
    }

    // Chuẩn bị dữ liệu
    const playlistData = {
        name: playlistName,
        description: playlistDesc || "Playlist description",
        is_public: true,
        image_url: "https://tse4.mm.bing.net/th/id/OIP.Lpgm30caiYmI_rJA5KZuGAHaEo?pid=Api&P=0&h=220"
    };

    try {
        // Gọi API tạo playlist
        const result = await createPlaylist(playlistData);

        // Thành công - đóng modal và reset form
        console.log('Playlist created successfully:', result);
        playlistCreateForm.reset();
        $(".modal-playlist-overlay").classList.remove("show");

        await showMyPlaylist();
    } catch (error) {
        // Xử lý lỗi
        console.error('Failed to create playlist:', error);
        alert('Failed to create playlist. Please try again.');
    }
});

// Reset form khi đóng modal
$("#modalClose").addEventListener("click", function () {
    playlistCreateForm.reset();
    document.querySelector(".error-message").style.display = "none";
    $("#playlist-title-input").classList.remove("error");
});

// Hàm update Playlist 
export function initUpdatePlaylist() {
    const playlistModal = $("#edit-playlist-modal");
    const form = playlistModal.querySelector("#edit-playlist-form");
    const imgInput = playlistModal.querySelector(".playlist-img img");
    const nameInput = playlistModal.querySelector("#edit-playlist-title-input");

    let cacheData = null;

    const updatePlaylistBtn = document.querySelector(".update-playlist-btn");
    if (updatePlaylistBtn) {
        // Mở modal update playlist
        updatePlaylistBtn.addEventListener("click", async (e) => {
            playlistModal.classList.add("show");
            const playlistId = localStorage.getItem("playlistId");
            try {
                cacheData = await httpRequest.get(`/playlists/${playlistId}`);
                imgInput.src = cacheData.image_url;
                nameInput.value = cacheData.name;
            } catch (error) {
                alert("Không thể lấy thông tin của playlist");
                throw error;
            }
        });
    };

    let newPlaylistName = null;
    let newPlaylistImage = null;

    // Cập nhật tên playlist mới
    nameInput.addEventListener("change", (e) => {
        newPlaylistName = nameInput.value.trim();
    });

    form.addEventListener("submit", async e => {
        e.preventDefault();
        const playlistId = localStorage.getItem("playlistId");
        if (playlistId) {
            try {
                const data = await httpRequest.put(`/playlists/${playlistId}`, {
                    name: newPlaylistName,
                    image_url: newPlaylistImage || cacheData.image_url
                });

                await Promise.all([showMyPlaylist(), showPlaylistById()])

                playlistModal.classList.remove("show");
                return data;
            } catch (error) {
                alert(`Không thể cập nhật thông tin của playlist ${nameInput}`);
                throw error;
            }
        }
    });
}