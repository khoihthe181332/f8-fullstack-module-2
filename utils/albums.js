import httpRequest from "./httpRequest.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function renderAlbumsFollowed(data) {
    const albumsFollowed = $(".albums-followed-container");

    albumsFollowed.innerHTML = data.map(data => {
        return `<div class="library-item album-followed-item">
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