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