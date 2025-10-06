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
let isLoop = localStorage.getItem("isLoop") || "true";
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
    let trackId;

    if (e) {
        // Nếu có event (user click), lấy từ element
        const hitCard = e.target.closest(".hit-card");
        const songItem = e.target.closest(".song-item");
        trackId = hitCard?.dataset.trackId ?? songItem?.dataset.trackId;
    } else {
        // Nếu không có event (load từ localStorage), lấy từ storage
        trackId = localStorage.getItem("currentSong");
    }

    if (!trackId) {
        console.warn("Không tìm thấy trackId");
        return;
    }

    try {
        const data = await httpRequest.get(`/tracks/${trackId}`);
        renderTrackPlayingById(data);
        currentSong = trackId;
        localStorage.setItem("currentSong", trackId);
        await audio.play();
    } catch (error) {
        console.error("Không thể phát bài hát:", error);
        throw error;
    }
}

// Khởi tạo khi load trang
export async function initPlayer() {
    const savedTrackId = localStorage.getItem("currentSong");

    if (savedTrackId) {
        try {
            const data = await httpRequest.get(`/tracks/${savedTrackId}`);
            renderTrackPlayingById(data);
            currentSong = savedTrackId;
            // Không auto play khi load trang
        } catch (error) {
            console.error("Không thể load bài hát đã lưu:", error);
            localStorage.removeItem("currentSong");
        }
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

audio.addEventListener("ended", (e) => {
    if (isLoop) {
        audio.play();
    }
});

// Hàm chuyển đổi bài hát
function swapSong(step) {

}

// Event play / pause song
playBtn.addEventListener("click", (e) => {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});

// Event loop song
loopBtn.addEventListener("click", (e) => {
    isLoop = !isLoop;
    loopBtn.classList.toggle("active", isLoop);
})

// Hàm điều chỉnh âm lượng
export function handleVolumeAudio() {
    const volumeRange = $(".volume-fill");
    const volumeBar = $(".volume-bar");
    const volumeBtn = $(".volume-btn");
    let volumeValue = localStorage.getItem("volumeValue");
    let isMuted = false;

    // Khởi tạo volume từ localStorage hoặc mặc định 100%
    if (!volumeValue) {
        volumeValue = 1; // 100%
        localStorage.setItem("volumeValue", volumeValue);
    } else {
        volumeValue = parseFloat(volumeValue);
    }

    // Set volume ban đầu
    audio.volume = volumeValue;
    volumeRange.style.width = `${Math.floor(volumeValue * 100)}%`;
    updateVolumeIcon(volumeValue);

    // Xử lý khi thay đổi volume bằng slider
    audio.addEventListener("volumechange", (e) => {
        volumeRange.style.width = `${Math.floor(audio.volume * 100)}%`;
        updateVolumeIcon(audio.volume);
    });

    // Click vào volume bar để thay đổi volume
    volumeBar.addEventListener("click", (e) => {
        const rect = volumeBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newVolume = Math.max(0, Math.min(1, clickX / rect.width));

        audio.volume = newVolume;
        volumeRange.style.width = `${Math.floor(newVolume * 100)}%`;
        localStorage.setItem("volumeValue", newVolume);
        isMuted = false;
        updateVolumeIcon(newVolume);
    });

    // Drag volume handle
    let isDragging = false;
    const volumeHandle = $(".volume-handle");

    volumeHandle.addEventListener("mousedown", (e) => {
        isDragging = true;
        e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const rect = volumeBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newVolume = Math.max(0, Math.min(1, clickX / rect.width));

        audio.volume = newVolume;
        volumeRange.style.width = `${Math.floor(newVolume * 100)}%`;
        updateVolumeIcon(newVolume);
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            localStorage.setItem("volumeValue", audio.volume);
        }
    });

    // Click vào nút volume để mute/unmute
    volumeBtn.addEventListener("click", () => {
        if (isMuted) {
            // Unmute
            audio.volume = volumeValue;
            volumeRange.style.width = `${Math.floor(volumeValue * 100)}%`;
            isMuted = false;
        } else {
            // Mute
            volumeValue = audio.volume; // Lưu volume hiện tại
            audio.volume = 0;
            volumeRange.style.width = "0%";
            isMuted = true;
        }
        updateVolumeIcon(audio.volume);
    });

    // Hàm cập nhật icon volume
    function updateVolumeIcon(volume) {
        const icon = volumeBtn.querySelector("i");

        if (volume === 0) {
            icon.className = "fas fa-volume-mute";
        } else if (volume < 0.5) {
            icon.className = "fas fa-volume-down";
        } else {
            icon.className = "fas fa-volume-up";
        }
    }
}

// Hàm điều chỉnh thời lượng bài hát
export function handleProgressAudio() {
    const progressFill = $(".progress-fill");
    const progressBar = $(".progress-bar");
    const timeElements = $$(".progress-container .time");
    const [currentTimeEl, durationTimeEl] = timeElements;

    let savedProgress = Number(localStorage.getItem("audioProgress"));
    let isDragging = false;

    // Format time
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    // Hàm lưu progress vào localStorage
    function saveProgress() {
        localStorage.setItem("audioProgress", audio.currentTime);
    }

    // Audio events - timeupdate
    audio.addEventListener("timeupdate", () => {
        if (isDragging) return; // Không cập nhật khi đang drag

        const percent = audio.currentTime / audio.duration;
        progressFill.style.width = `${percent * 100}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);

        // Lưu progress mỗi giây
        if (Math.floor(audio.currentTime) % 1 === 0) {
            saveProgress();
        }
    });


    // Audio events - loadedmetadata
    audio.addEventListener("loadedmetadata", () => {
        durationTimeEl.textContent = formatTime(audio.duration);

        if (savedProgress && savedProgress > 0) {
            audio.currentTime = savedProgress;
            progressFill.style.width = `${(savedProgress / audio.duration) * 100}%`;
        }
    });

    // Lưu progress khi pause
    audio.addEventListener("pause", saveProgress);

    // Xóa progress khi bài hát kết thúc
    audio.addEventListener("ended", () => {
        localStorage.removeItem("audioProgress");
    });

    // Lưu trước khi đóng trang
    window.addEventListener("beforeunload", saveProgress);

    // Click vào progress bar để seek
    progressBar.addEventListener("click", (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, clickX / rect.width));

        audio.currentTime = percent * audio.duration;
        progressFill.style.width = `${percent * 100}%`;
        saveProgress();
    });

    // Drag progress handle
    const progressHandle = $(".progress-handle");

    progressHandle.addEventListener("mousedown", (e) => {
        isDragging = true;
        e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, clickX / rect.width));

        audio.currentTime = percent * audio.duration;
        progressFill.style.width = `${percent * 100}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            saveProgress();
        }
    });
}