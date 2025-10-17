import httpRequest from "./httpRequest.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const toastNotification = $(".toast-notif");
const toastText = $(".toast-text");

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

// Hiển thị playlist follow ở sidebar
export async function showPlaylistsFollowed() {
    try {
        const data = await httpRequest.get("/me/playlists/followed?limit=20&offset=0");
        renderPlaylistsFollowed(data.playlists);
    } catch (error) {
        console.error("Không tải được Playlists đã theo dõi");
    }
}

function renderPlaylistPopular(data) {
    const playlistGrid = $(".playlist-grid");
    playlistGrid.innerHTML = data.map(data => {
        return ` <div class="playlist-card" data-item-type="playlist" data-playlist-id="${data.id}">
                            <div class="playlist-card-cover">
                                <img src="${data.image_url}" alt="${data.name}" />
                                <button class="playlist-play-btn">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                            <div class="playlist-card-info">
                                <h3 class="playlist-card-title">${data.name}</h3>
                                <p class="playlist-card-artist">${data.user_username}</p>
                            </div>
                        </div>`
    }).join("");
}

// Hiển thị playlist trong trang home
export async function showPopularPlaylist() {
    try {
        const data = await httpRequest.get("/playlists?limit=9&offset=0");
        renderPlaylistPopular(data.playlists);

    } catch (error) {
        console.error("Không tải được danh sách playlist");
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
                                <i class="fas fa-volume-up icon-pause"></i>
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
        toastNotification.classList.add("error", "show")
        toastText.textContent = "Hiển thị danh sách phát không thành công";
        setTimeout(() => {
            toastNotification.classList.remove("show")
        }, 2000)
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
export async function createPlaylist() {
    try {
        const response = await httpRequest.post('/playlists', {
            name: "Danh sách phát của tôi",
            description: "Playlist description",
            is_public: true,
            image_url: "https://cdn.vox-cdn.com/thumbor/TtDUOcStwxcfVhfSms3Lj-5HlUY=/0x106:2040x1254/1600x900/cdn.vox-cdn.com/uploads/chorus_image/image/73520026/STK088_SPOTIFY_CVIRGINIA_C.0.jpg",

        });
        return response;
    } catch (error) {
        throw error;
    }
}

// Event listener cho nút tạo playlist
const createPlaylistBtn = $(".create-btn");
createPlaylistBtn.addEventListener("click", async () => {
    try {
        const data = await createPlaylist();
        await Promise.all([showMyPlaylist(), showPlaylistsFollowed(), showPlaylistById(data.playlist.id)]);
        return data;
    } catch (error) {
        toastNotification.classList.add("error", "show")
        toastText.textContent = "Tạo danh sách phát không thành công"
        setTimeout(() => {
            toastNotification.classList.remove("show")
        }, 2000)
        throw error;
    }
});

// Hàm update Playlist 
export function initUpdatePlaylist() {
    const playlistModal = $("#edit-playlist-modal");
    const form = playlistModal.querySelector("#edit-playlist-form");
    const imgInput = playlistModal.querySelector(".playlist-img img");
    const nameInput = playlistModal.querySelector("#edit-playlist-title-input");
    const editFileInput = playlistModal.querySelector("#edit-file-input");
    const overlay = playlistModal.querySelector(".playlist-overlay");

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
                toastNotification.classList.add("error", "show")
                toastText.textContent = "Không thể lấy thông tin danh sách phát";
                setTimeout(() => {
                    toastNotification.classList.remove("show")
                }, 2000)
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

                await Promise.all([showMyPlaylist(), showPlaylistById(playlistId)])

                playlistModal.classList.remove("show");

                // Thông báo
                toastNotification.classList.add("success", "show")
                toastText.textContent = "Cập nhật danh sách phát thành công"
                setTimeout(() => {
                    toastNotification.classList.remove("show");
                }, 2000)
                return data;
            } catch (error) {
                // Toast thông báo
                toastNotification.classList.add("error", "show")
                toastText.textContent = "Cập nhật danh sách phát không thành công"
                setTimeout(() => {
                    toastNotification.classList.remove("show");
                }, 2000)
                throw error;
            }
        }
    });

    // Load ảnh được chọn từ local
    overlay.addEventListener("click", () => {
        editFileInput.click();
    })

    editFileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        try {
            // Tạo FormData
            const formData = new FormData();
            formData.append("images", file);  // Key phải là "images"

            // Upload
            const response = await httpRequest.post("/upload/images", formData);

            // Lấy URL
            if (response.files && response.files.length > 0) {
                const baseUrl = 'https://spotify.f8team.dev';
                const uploadedUrl = baseUrl + response.files[0].url;

                // Cập nhật ảnh
                imgInput.src = uploadedUrl;
                newPlaylistImage = uploadedUrl;

                console.log("Upload thành công:", uploadedUrl);
            }
        } catch (error) {
            // Hiển thị thông báo khi không thành công
            toastNotification.classList.add("error", "show")
            toastText.textContent = "Tải ảnh không thành công";
            setTimeout(() => {
                toastNotification.classList.remove("show")
            }, 2000);
        }
    })
}