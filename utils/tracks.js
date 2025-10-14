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

// Render Playlist in Popup to add Track
function renderPlaylistToAdd(data) {
    const wrapper = $(".popup-playlist-container .item-wrapper");
    wrapper.innerHTML = data.map(data => {
        return `<div class="popup-item" data-item-type="myPlaylist" data-playlist-id="${data.id}">
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

async function showPlaylistToAdd() {
    try {
        const data = await httpRequest.get("/me/playlists");
        renderPlaylistToAdd(data.playlists);
        return
    } catch (error) {
        console.error("Không thể tải playlist");
        throw error;
    }
}

// Add Track to Playlist
export function initAddTrackToPlaylist() {
    const popupPlaylist = $(".popup-playlist-overlay");

    function closePopup() {
        popupPlaylist.classList.remove("show");
        document.body.style.overflow = "auto"; // Restore scrolling
    }

    document.addEventListener("click", async (e) => {
        // Mở popup
        const addBtn = e.target.closest(".add-btn")
        if (addBtn) {
            e.preventDefault();
            popupPlaylist.classList.add("show");
        }

        // Render playlist
        await showPlaylistToAdd();

        // Chọn playlist để thêm track
        const popupItems = $$(".popup-item");
        popupItems.forEach(item => {
            item.addEventListener("click", async (e) => {
                e.preventDefault();
                const playlistId = item.dataset.playlistId;
                const trackId = localStorage.getItem("currentSong");

                if (playlistId && trackId) {
                    try {
                        const res = await httpRequest.post(`/playlists/${playlistId}/tracks`, {
                            track_id: trackId,
                            position: 0
                        })
                        // Đóng popup
                        closePopup();
                        return res;
                    } catch (error) {
                        alert("Không thể thêm bài hát vào playlist");
                        closePopup();
                        throw error;
                    }
                }
            });
        });
    });
}

// Delete Track from PLaylist
export function initDeleteTrackFromPlaylist() {
    document.addEventListener("click", async (e) => {
        // Kiểm tra xem element được click có phải là more-btn hoặc con của nó
        const moreBtn = e.target.closest(".more-button");

        if (moreBtn) {
            const songItem = moreBtn.closest(".song-item");
            if (songItem) {
                e.preventDefault();
                const trackId = songItem.dataset.trackId;
                const playlistId = localStorage.getItem("playlistId");

                if (trackId && playlistId) {
                    // Confirm trước khi xóa
                    const confirmed = confirm("Bạn có chắc chắn muốn xóa bài hát này?");
                    if (!confirmed) return;

                    try {
                        // Xóa track khỏi playlist
                        await httpRequest.del(`/playlists/${playlistId}/tracks/${trackId}`);
                        // Xóa track khỏi UI
                        songItem.remove();
                    } catch (error) {
                        alert("Không thể xóa bài hát khỏi playlist");
                        throw error;
                    }


                }
            }
        }
    });
}
/* 
 * PLAYER_MUSIC 
*/
const NEXT = 1;
const PREV = -1;
let isLoop = localStorage.getItem("isLoop") === "true";
let isShuffle = localStorage.getItem("isShuffle") === "true";
// Audio
const audio = $("#audio-music");
// Controls button 
const nextBtn = $(".next-btn");
const prevBtn = $(".prev-btn");
const shuffleBtn = $(".shuffle-btn");
const loopBtn = $(".repeat-btn");
const playBtn = $(".play-btn");

let currentSong = localStorage.getItem("currentSong");
let currentIndex = Number(localStorage.getItem("currentIndex")) || 0;
let currentPlaylist = [];

export function initTrackCardListener() {
    document.addEventListener("click", async (e) => {
        // Bỏ qua nếu click vào nút more
        if (e.target.closest(".more-button")) {
            return;
        }

        // Chọn Track Card
        const playHitBtn = e.target.closest(".hit-play-btn");
        if (playHitBtn) {
            e.preventDefault();
            await showTrackPlaying(e);
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
                await showTrackPlaying(e);
            }
        }

        // Chọn nhạc trong Danh sách Artist
        const trackItem = e.target.closest(".track-item");
        if (trackItem) {
            e.preventDefault();

            if (trackItem.classList.contains("playing")) {
                trackItem.classList.remove("playing");
            } else {
                const allTracks = $$(".track-item");
                allTracks.forEach(track => {
                    track.classList.remove("playing");
                });

                trackItem.classList.add("playing");
                await showTrackPlaying(e)
            }
        }
    });
};

async function showTrackPlaying(e) {
    let trackId;
    let elementType = null;

    if (e) {
        const hitCard = e.target.closest(".hit-card");
        const songItem = e.target.closest(".song-item");
        const trackItem = e.target.closest(".track-item");

        if (hitCard) {
            trackId = hitCard.dataset.trackId;
            elementType = 'hit-card';
        } else if (songItem) {
            trackId = songItem.dataset.trackId;
            elementType = 'song-item';
        } else if (trackItem) {
            trackId = trackItem.dataset.trackId;
            elementType = 'track-item';
        }
    } else {
        trackId = localStorage.getItem("currentSong");
    }

    if (!trackId) {
        console.warn("Không tìm thấy trackId");
        return;
    }

    try {
        if (elementType === 'hit-card' || !elementType) {
            const track = await httpRequest.get(`/tracks/${trackId}`);
            if (track) {
                currentSong = trackId;
                localStorage.setItem("currentSong", currentSong);
                renderTrackPlayingById(track);
                updatePlayingState(trackId); // Thêm dòng này
                audio.play();
                return;
            }
        }

        if (elementType === 'song-item' || elementType === 'track-item') {
            const data = getCurrentSong(trackId);
            if (data) {
                $(".player-image").src = data?.image_url || data?.track_image_url;
                $(".player-title").textContent = data?.title || data?.track_title;
                $(".player-artist").textContent = data?.artist_name || data?.track_artist_name;
                if (data?.playlist_id) {
                    $(".add-btn").classList.add("add");
                    $(".add-btn").innerHTML = `<i class="fas fa-circle-check"></i>`;
                }
                audio.src = data?.audio_url || data?.track_audio_url;
                localStorage.setItem("currentSong", trackId);
                updatePlayingState(trackId); // Thêm dòng này
                audio.play();
                return;
            }
        }
    } catch (error) {
        console.error("Không thể phát bài hát:", error);
        throw error;
    }
}

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
                    <span class="tooltip">Thêm vào danh sách yêu thích</span>
                </button>`;

    audio.src = data.audio_url;
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

function getCurrentSong(trackId) {
    currentIndex = currentPlaylist.findIndex(track => {
        const trackIdentifier = track.track_id || track.id;
        return trackIdentifier === trackId;
    });

    localStorage.setItem("currentIndex", currentIndex);
    return currentPlaylist[currentIndex];
}

// Hàm chuyển đổi bài hát
function swapSong(step) {
    currentIndex = (currentIndex + step + currentPlaylist.length) % currentPlaylist.length;
    const nextTrack = currentPlaylist[currentIndex];

    if (nextTrack) {
        const trackId = nextTrack.track_id || nextTrack.id;
        currentSong = trackId;

        // Render UI
        $(".player-image").src = nextTrack.image_url || nextTrack.track_image_url;
        $(".player-title").textContent = nextTrack.title || nextTrack.track_title;
        $(".player-artist").textContent = nextTrack.artist_name || nextTrack.track_artist_name;

        // Cập nhật audio
        audio.src = nextTrack.audio_url || nextTrack.track_audio_url;
        audio.play();

        // Cập nhật class playing
        updatePlayingState(trackId);

        // Lưu vào localStorage
        localStorage.setItem("currentSong", currentSong);
        localStorage.setItem("currentIndex", currentIndex);
    }
}

// Hàm cập nhật trạng thái playing
function updatePlayingState(trackId) {
    // Xóa tất cả class playing hiện có
    const allSongs = $$(".song-item");
    const allTracks = $$(".track-item");

    allSongs.forEach(song => song.classList.remove("playing"));
    allTracks.forEach(track => track.classList.remove("playing"));

    // Thêm class playing cho bài hát đang phát
    const currentSongItem = $(`.song-item[data-track-id="${trackId}"]`);
    const currentTrackItem = $(`.track-item[data-track-id="${trackId}"]`);

    if (currentSongItem) {
        currentSongItem.classList.add("playing");
    }

    if (currentTrackItem) {
        currentTrackItem.classList.add("playing");
    }
}

export function loadCurrentPlaylist() {
    document.addEventListener("click", async (e) => {
        const playlist = e.target.closest('.library-item[data-item-type="playlist"]') || e.target.closest('.library-item[data-item-type="myPlaylist"]')
            || e.target.closest('.library-item[data-item-type="artist"]');

        const playlistId = playlist?.dataset.playlistId
        const artistId = playlist?.dataset.artistId;

        if (playlistId) {
            try {
                const data = await httpRequest.get(`/playlists/${playlistId}/tracks`);
                currentPlaylist = data.tracks;
                return currentPlaylist;
            } catch (error) {
                console.error("Không thể tải playlist hiện tại:", error);
                throw error;
            }
        }

        if (artistId) {
            try {
                const data = await httpRequest.get(`/artists/${artistId}/tracks/popular`);
                currentPlaylist = data.tracks;
                return currentPlaylist;
            } catch (error) {
                console.error("Không thể tải playlist của nghệ sĩ:", error);
                throw error;

            }
        }
    });
}

const oneSong = () => {
    if (currentPlaylist.length <= 1) {
        audio.currentTime = 0;
        audio.play();
        return true;
    }
    return false;
};

// Event chuyển bài hát
nextBtn.addEventListener("click", (e) => {
    if (oneSong()) return;

    if (isShuffle) {
        console.log("NEXT");
    } else {
        swapSong(NEXT);
    }
});

prevBtn.addEventListener("click", (e) => {
    if (oneSong()) return;

    if (audio.currentTime < 2) {
        if (isShuffle) {
            console.log("PREV");
        } else {
            swapSong(PREV);
        }
    } else {
        audio.currentTime = 0;
        audio.play();
    }
});

// Event phát / dừng bài hát
playBtn.addEventListener("click", (e) => {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});

// Event phát lại bài hát
loopBtn.addEventListener("click", (e) => {
    isLoop = !isLoop;
    loopBtn.classList.toggle("active", isLoop);

    localStorage.setItem("isLoop", isLoop);
});

// Event trộn bài hát
shuffleBtn.addEventListener("click", e => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);

    localStorage.setItem("isShuffle", isShuffle);
})

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
    } else {
        if (currentPlaylist.length > 0) {
            swapSong(NEXT);
        }
    }

});

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
    const timeStart = $(".time-start");
    const timeEnd = $(".time-end");

    let isSeeking = false; // Kiểm tra xem có đang tua không ?

    // Hàm định dạng thời gian 
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    // Hàm cập nhật thời lượng
    const updateProgressSong = (currentTime, duration) => {
        if (!duration) return;

        const progressPercent = Math.floor((currentTime / duration) * 100);
        progressFill.style.width = `${progressPercent}%`;
    }

    // Hàm xử lý tua bài hát
    const seekToPosition = (e) => {
        if (!audio.duration) return;

        const progressBarRect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - progressBarRect.left;
        const progressBarWidth = progressBarRect.width;

        // Tính phần trăm vị trí click
        const seekPercent = Math.max(0, Math.min(100, (clickX / progressBarWidth) * 100));

        // Tính thời gian cần tua đến
        const seekTime = (seekPercent / 100) * audio.duration;

        // Cập nhật thời gian của audio
        audio.currentTime = seekTime;

        // Cập nhật giao diện ngay lập tức
        updateProgressSong(seekTime, audio.duration);
        if (timeStart) {
            timeStart.textContent = formatTime(seekTime);
        }
    };

    // Nghe sự kiện click vào thanh progress
    if (progressBar) {
        progressBar.addEventListener("click", seekToPosition);
    }

    // Xử lý kéo thả (drag) thanh progress
    if (progressBar) {
        progressBar.addEventListener("mousedown", (e) => {
            isSeeking = true;
            seekToPosition(e);

            const onMouseMove = (e) => {
                if (isSeeking) {
                    seekToPosition(e);
                }
            };

            const onMouseUp = () => {
                isSeeking = false;
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });
    }

    // Nghe sự kiện bài hát "đang phát"
    audio.addEventListener("timeupdate", e => {
        const { currentTime, duration } = audio;
        if (!duration || isSeeking) return;

        // Cập nhật thanh tiến trình
        updateProgressSong(currentTime, duration);

        // Cập nhật hiển thị thời gian
        if (timeStart) {
            timeStart.textContent = formatTime(currentTime);
        }
        if (timeEnd) {
            timeEnd.textContent = formatTime(duration);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loopBtn.classList.toggle("active", isLoop);
    shuffleBtn.classList.toggle("active", isShuffle);
});
