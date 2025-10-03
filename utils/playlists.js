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

function getTimeProgress(duration) {
    const hour = Math.floor(duration / 3600).toString().padStart(2, "0");
    const min = Math.floor((duration % 3600) / 60).toString().padStart(2, "0");

    return `${hour}hour ${min}minutes`;
}

function renderPlaylist(data) {
    const playlistHeader = $(".playlist-header");

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
                            <span>${data.total_tracks} songs, about ${getTimeProgress(data.total_duration)}</span>
                        </div>
                    </div>`;
}

function renderPlaylistTracks(data) {
    const songListContainer = $(".song-list-container");

}

export async function showDetailPlaylist() {

}
