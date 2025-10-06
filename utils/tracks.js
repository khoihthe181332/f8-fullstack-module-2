import httpRequest from "./httpRequest.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Render trending tracks
function renderTrendingTrack(data) {
    const trendingTrackList = $(".hits-grid");
    trendingTrackList.innerHTML = data.map((track) => {
        return `<div class="hit-card" data-track-id="${track.id}" data-item-type="track">
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
export async function showTrendingTracks() {
    try {
        const data = await httpRequest.get("/tracks/trending?limit=15");
        renderTrendingTrack(data.tracks);
    } catch (error) {
        console.error("Lỗi...");
    }
}

/* 
 * PLAYER_MUSIC 
*/
const NEXT = 1;
const PREV = -1;
// Audio
const audio = $("#audio-music");
// Controls button 
const nextBtn = $(".next-btn");
const prevBtn = $(".prev-btn")
const shuffleBtn = $(".shuffle-btn");
const loopBtn = $(".repeat-btn");
const playBtn = $(".play-btn");

let currentSong = localStorage.getItem("currentSong");

export function initTrackCardListener() {
    document.addEventListener("click", (e) => {
        // Chọn Track Card
        const playHitBtn = e.target.closest(".hit-play-btn");
        if (playHitBtn) {
            e.preventDefault();
            showTrackPlaying(e);
        }

        // Chọn nhạc trong playlist
        const songItem = e.target.closest(".song-item");
        if (songItem) {
            e.preventDefault();
            if (songItem.classList.contains("playing")) {
                // Nếu đang play thì pause
                songItem.classList.remove("playing");
            } else {
                const allSongs = document.querySelectorAll(".song-item");
                allSongs.forEach(song => {
                    song.classList.remove("playing");
                });

                // Sau đó mới add playing cho bài hiện tại
                songItem.classList.add("playing");
                showTrackPlaying(e);
            }
        }
    });
};

function renderTrackPlayingById(data) {
    const playerLeft = $(".player-left");
    playerLeft.innerHTML = `<img src="${data.image_url}" alt="Current track" class="player-image" />
                <div class="player-info">
                    <div class="player-title">
                        ${data.title}
                    </div>
                    <div class="player-artist">${data.artist_name}</div>
                </div>
                <button class="add-btn">
                    <i class="fa-solid fa-plus"></i>
                </button>`;

    audio.src = data.audio_url;
}

async function showTrackPlaying(e) {
    const hitCard = e.target.closest(".hit-card");
    const songItem = e.target.closest(".song-item");
    const trackId = hitCard?.dataset.trackId ?? songItem?.dataset.trackId;
    try {
        const data = await httpRequest.get(`/tracks/${trackId}`);
        renderTrackPlayingById(data);
        currentSong = trackId;
        localStorage.setItem("currentSong", trackId);
        audio.play(); // Chọn bài phát sẽ phát luôn

    } catch (error) {
        console.error("Không thể phát bài hát ");
        throw error;
    }
}

audio.addEventListener("playing", (e) => {
    playBtn.classList.add("playing");
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
});

audio.addEventListener("pause", (e) => {
    playBtn.classList.remove("playing");
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
});

// Event play / pause song
playBtn.addEventListener("click", (e) => {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});

// Hàm chuyển đổi bài hát
function swapSong(step) {
    
}