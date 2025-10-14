import httpRequest from "./utils/httpRequest.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const currentUser = localStorage.getItem("currentUser");

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
    // Get DOM elements
    const signupBtn = document.querySelector(".signup-btn");
    const loginBtn = document.querySelector(".login-btn");
    const authModal = document.getElementById("authModal");
    const modalClose = document.getElementById("modalClose");
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const showLoginBtn = document.getElementById("showLogin");
    const showSignupBtn = document.getElementById("showSignup");

    const formSignUpEmail = $("#form-signup-email");
    const formSignUpPassword = $("#form-signup-password");

    const formLoginEmail = $("#form-login-email");
    const formLoginPassword = $("#form-login-password");

    // Function to show signup form
    function showSignupForm() {
        signupForm.style.display = "block";
        loginForm.style.display = "none";
    }

    // Function to show login form
    function showLoginForm() {
        signupForm.style.display = "none";
        loginForm.style.display = "block";
    }

    // Function to open modal
    function openModal() {
        authModal.classList.add("show");
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    // Open modal with Sign Up form when clicking Sign Up button
    signupBtn.addEventListener("click", function () {
        showSignupForm();
        openModal();
    });

    // Open modal with Login form when clicking Login button
    loginBtn.addEventListener("click", function () {
        showLoginForm();
        openModal();
    });

    // Close modal function
    function closeModal() {
        authModal.classList.remove("show");
        document.body.style.overflow = "auto"; // Restore scrolling
    }

    // Close modal when clicking close button
    modalClose.addEventListener("click", closeModal);

    // Close modal when clicking overlay (outside modal container)
    authModal.addEventListener("click", function (e) {
        if (e.target === authModal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && authModal.classList.contains("show")) {
            closeModal();
        }
    });

    // Switch to Login form
    showLoginBtn.addEventListener("click", function () {
        showLoginForm();
    });

    // Switch to Signup form
    showSignupBtn.addEventListener("click", function () {
        showSignupForm();
    });


    // Đóng / Mở Create Playlist Modal
    const playlistModal = document.querySelector("#create-playlist-modal");
    const closePlaylistModalBtn = playlistModal.querySelector("#modalClose");
    const playlistModalContainer = playlistModal.querySelector(".modal-container");

    $(".create-btn").addEventListener("click", function () {
        showPlaylistModal();
    });

    function showPlaylistModal() {
        playlistModal.classList.add("show");
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    closePlaylistModalBtn.addEventListener("click", closePlaylistModal);
    playlistModal.addEventListener("click", closePlaylistModal);

    function closePlaylistModal() {
        playlistModal.classList.remove("show");
        document.body.style.overflow = "auto"; // Restore scrolling
    }

    playlistModalContainer.addEventListener("click", (e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện nổi bọt lên overlay
    });


    // Đóng Update Playlist Modal
    const updatePlaylistModal = $("#edit-playlist-modal");
    const closeUpdatePlaylistModalBtn = updatePlaylistModal.querySelector("#editModalClose");
    const updatePlaylistModalContainer = updatePlaylistModal.querySelector(".modal-container");

    closeUpdatePlaylistModalBtn.addEventListener("click", closeUpdatePlaylistModal);
    updatePlaylistModal.addEventListener("click", closeUpdatePlaylistModal);

    function closeUpdatePlaylistModal() {
        updatePlaylistModal.classList.remove("show");
        document.body.style.overflow = "auto"; // Restore scrolling
    }

    updatePlaylistModalContainer.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    // Đóng popup playlist
    const popupPlaylist = $(".popup-playlist-overlay");
    const popupPlaylistContainer = $(".popup-playlist-container");
    const closePopup = $(".close-popup");

    function closePopupPlaylist() {
        popupPlaylist.classList.remove("show");
        document.body.style.overflow = "auto"; // Restore scrolling
    }

    popupPlaylist.addEventListener("click", closePopupPlaylist);
    closePopup.addEventListener("click", closePopupPlaylist);

    popupPlaylistContainer.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    // Xử lý người dùng xem được mật khẩu 
    (function togglePassword() {
        const togglePasswordBtns = $$(".toggle-password");

        togglePasswordBtns.forEach(btn => {
            btn.addEventListener("click", function () {
                // Tìm input password trong cùng form-group với button này
                const formGroup = this.closest(".form-group");
                if (!formGroup) return;

                const passwordInput = formGroup.querySelector('input[type="password"], input[type="text"]');
                if (!passwordInput) return;

                // Toggle type và icon
                if (passwordInput.type === "password") {
                    passwordInput.type = "text";
                    this.classList.replace("fa-eye", "fa-eye-slash");
                } else {
                    passwordInput.type = "password";
                    this.classList.replace("fa-eye-slash", "fa-eye");
                }
            });
        });
    })();

    // Register form
    signupForm.querySelector(".auth-form-content").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = $("#signupEmail").value.trim();
        const password = $("#signupPassword").value.trim();

        // Xử lý lỗi người dùng nhập
        if (!email) {
            formSignUpEmail.classList.add("invalid");
        } else {
            formSignUpEmail.classList.remove("invalid");
        }

        const credentials = {
            email,
            password,
        }

        try {
            const { user, access_token } = await httpRequest.post("/auth/register", credentials);
            localStorage.setItem("accessToken", access_token);
            localStorage.setItem("currentUser", user.email);
            authModal.classList.remove("show");
            window.location.reload();
        } catch (error) {
            if (error?.response?.error?.code === "EMAIL_EXISTS") {
                formSignUpEmail.querySelector("span").textContent = error.response.error.message;
                formSignUpEmail.classList.add("invalid");

                setTimeout(() => {
                    formSignUpEmail.classList.remove("invalid");
                }, 2000);
            }

            const passwordError = error.response.error.details.find(detail => detail.field === "password");
            if (error?.response?.error?.code === "VALIDATION_ERROR") {
                formSignUpPassword.querySelector("span").textContent = passwordError.message;
                formSignUpPassword.classList.add("invalid");

                setTimeout(() => {
                    formSignUpPassword.classList.remove("invalid");
                }, 2000);
            }
        }
    });

    // Login form
    loginForm.querySelector(".auth-form-content").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = $("#loginEmail").value.trim();
        const password = $("#loginPassword").value.trim();

        // Xử lý lỗi người dùng nhập
        if (!email) {
            formLoginEmail.classList.add("invalid");
            return;
        } else {
            formLoginEmail.classList.remove("invalid");
        }

        if (!password) {
            formLoginPassword.classList.add("invalid");
            return;
        }

        const credentials = {
            email,
            password,
        }

        try {
            const { user, access_token, refresh_token } = await httpRequest.post("/auth/login", credentials);
            localStorage.setItem("accessToken", access_token);
            localStorage.setItem("refreshToken", refresh_token);
            localStorage.setItem("currentUser", user.email);
            authModal.classList.remove("show");
            window.location.reload();
        } catch (error) {
            if (error?.response?.error?.code === "INVALID_CREDENTIALS") {
                formLoginPassword.querySelector("span").textContent = error.response.error.message;
            }
        }
    });

    if (currentUser) {
        // Event mở ô tìm kiếm trong your library
        const searchLibraryInput = $(".search-library-input");
        if (searchLibraryInput) {
            document.addEventListener("click", (e) => {
                const isSearchArea = e.target.closest(".search-library-btn, .search-library-input");

                if (isSearchArea) {
                    searchLibraryInput.classList.add("show");
                    setTimeout(() => searchLibraryInput.focus(), 200);
                } else {
                    searchLibraryInput.classList.remove("show");
                }
            });
        }

        // Lấy URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const currentTab = urlParams.get('tab') || 'playlists'; // Mặc định là 'playlists'

        // Lấy các elements
        const navTabs = $$('.nav-tab');
        const likedSongsItem = $('.liked-songs-item');
        const playlistsContainer = $('.playlists-followed-container');
        const albumsContainer = $('.albums-followed-container');
        const artistsContainer = $('.artists-followed-container');
        const myPlaylistContainer = $(".my-playlists-container");

        // Hàm cập nhật giao diện dựa trên tab hiện tại
        function updateView(tab) {
            // Xóa class active khỏi tất cả các tab
            navTabs.forEach(t => t.classList.remove('active'));

            // Thêm class active vào tab hiện tại
            const activeTab = $(`.nav-tab[data-tab="${tab}"]`);
            if (activeTab) {
                activeTab.classList.add('active');
            }

            // Hiển thị/ẩn nội dung tương ứng
            if (tab === 'playlists') {
                // Hiện Playlists và Albums
                likedSongsItem.classList.remove('hidden');
                playlistsContainer.classList.remove('hidden');
                myPlaylistContainer.classList.remove('hidden');
                albumsContainer.classList.add('hidden');
                artistsContainer.classList.add('hidden');
            } else if (tab === 'artists') {
                // Hiện Artists
                likedSongsItem.classList.add('hidden');
                playlistsContainer.classList.add('hidden');
                albumsContainer.classList.add('hidden');
                myPlaylistContainer.classList.add('hidden');
                artistsContainer.classList.remove('hidden');
            } else if (tab === 'albums') {
                likedSongsItem.classList.add('hidden');
                playlistsContainer.classList.add('hidden');
                albumsContainer.classList.remove('hidden');
                myPlaylistContainer.classList.add('hidden');
                artistsContainer.classList.add('hidden');
            }
        }

        // Cập nhật view khi trang load
        updateView(currentTab);

        // Xử lý sự kiện popstate (khi người dùng nhấn nút back/forward)
        window.addEventListener('popstate', function () {
            const urlParams = new URLSearchParams(window.location.search);
            const tab = urlParams.get('tab') || 'playlists';
            updateView(tab);
        });

        // Xử lý click vào tab (optional - để có smooth transition không reload trang)
        navTabs.forEach(tab => {
            tab.addEventListener('click', function (e) {
                e.preventDefault();
                const tabValue = this.getAttribute('data-tab');

                // Cập nhật URL mà không reload trang
                const newUrl = `?tab=${tabValue}`;
                window.history.pushState({ tab: tabValue }, '', newUrl);

                // Cập nhật view
                updateView(tabValue);
            });
        });
    }
});

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
    const userAvatar = document.getElementById("userAvatar");
    const userDropdown = document.getElementById("userDropdown");
    const logoutBtn = document.getElementById("logoutBtn");

    const homeBtn = $(".home-btn");

    // Toggle dropdown when clicking avatar
    userAvatar.addEventListener("click", function (e) {
        e.stopPropagation();
        userDropdown.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
        if (
            !userAvatar.contains(e.target) &&
            !userDropdown.contains(e.target)
        ) {
            userDropdown.classList.remove("show");
        }
    });

    // Close dropdown when pressing Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && userDropdown.classList.contains("show")) {
            userDropdown.classList.remove("show");
        }
    });

    // Về trang chủ
    homeBtn.addEventListener("click", () => {
        showHome();
    })

    document.querySelector(".logo").addEventListener("click", () => {
        showHome();
    })

    // Handle logout button click
    logoutBtn.addEventListener("click", async function () {
        // Close dropdown first
        userDropdown.classList.remove("show");

        // TODO: Students will implement logout logic here
        try {
            const refreshToken = localStorage.getItem("refreshToken");

            if (refreshToken) {
                await httpRequest.post("/auth/logout", {
                    refresh_token: refreshToken
                });
            }

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("currentUser");
            window.location.reload();
            // return res;
        } catch (error) {
            // Lỗi có thể token hết hạn
            console.error("Logout error:", error);

            // Vẫn xóa dữ liệu local và reload
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("currentUser");
            window.location.reload();
        }
    });


});

// Import
import { showTrendingTracks, initTrackCardListener, handleVolumeAudio, handleProgressAudio, initPlayer, initAddTrackToPlaylist, loadCurrentPlaylist, initDeleteTrackFromPlaylist } from "./utils/tracks.js";
import {
    showTrendingArtists, initArtistCardListeners, showArtistsFollowed, handleUrlParams, followArtist
} from "./utils/artists.js";

import { showPlaylistsFollowed, showMyPlaylist, initPlaylistCardListeners, initUpdatePlaylist } from "./utils/playlists.js";
import { showAlbumsFollowed, initAlbumsCardListener, followAlbum } from "./utils/albums.js";


// Other functionality
document.addEventListener("DOMContentLoaded", async () => {
    const authButtons = $(".auth-buttons");
    const userAvatar = $("#userAvatar");

    // Your library
    const yourLibrary = $(".sidebar-nav");

    try {
        const { user } = await httpRequest.get("/users/me");
        updateCurrentUser(user);
        userAvatar.classList.add("show");
        yourLibrary.classList.add("show"); // Chỉ hiển thị khi đã đăng nhập 
    } catch (error) {
        authButtons.classList.add("show");
    }

    if (currentUser) {
        // Follow artist
        followArtist();

        // Follow album
        followAlbum();

        // My Playlist
        await showMyPlaylist();

        // Playlists followed
        await showPlaylistsFollowed();
        // Albums followed
        await showAlbumsFollowed();
        // Artists followed
        await showArtistsFollowed();

        // Unfollowed
        unfollowedLibrary();

        initDeletePlaylistButton();

        // Update playlist
        initUpdatePlaylist();

        // Add track to playlist
        initAddTrackToPlaylist();

        // Delete track from playlist
        initDeleteTrackFromPlaylist();

        // Load current playlist
        loadCurrentPlaylist();
    }

    // Hiển thị các bài hát thịnh hành hôm nay
    await showTrendingTracks();

    // Hiển thị các nghệ sĩ phổ biến
    await showTrendingArtists();

    // Chọn nghệ sĩ 
    initArtistCardListeners();

    // Kiểm tra URL parameters để hiển thị đúng view
    handleUrlParams();

    // Chọn album 
    initAlbumsCardListener();

    // Chọn playlist
    initPlaylistCardListeners();

    // Khởi tạo bài hát
    initPlayer();

    // Chọn bài hát
    initTrackCardListener();

    // Điều chỉnh âm lượng
    handleVolumeAudio();

    // Điều chỉnh thời lượng bài hát
    handleProgressAudio();
});

function updateCurrentUser(user) {
    const userAvatar = $("#user-avatar");
    if (user.avatar_url) {
        userAvatar.src = user.avatar_url;
    }
}

function unfollowedLibrary() {
    const contextMenu = $('#contextMenu');
    const unfollowItem = $('#unfollowItem');
    let currentContextItem = null;

    if (!contextMenu || !unfollowItem) return;

    // Context Menu - Right Click
    document.addEventListener('contextmenu', function (e) {
        const libraryItem = e.target.closest('.library-item');
        if (libraryItem && libraryItem.dataset.itemType) {
            e.preventDefault();
            currentContextItem = libraryItem;

            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.top = e.pageY + 'px';
            contextMenu.classList.add('show');
        }
    });

    // Đóng context menu khi click ra ngoài
    document.addEventListener('click', function (e) {
        if (!contextMenu.contains(e.target)) {
            contextMenu.classList.remove('show');
            currentContextItem = null;
        }
    });

    // Xử lý click vào Unfollow
    unfollowItem.addEventListener('click', async function () {
        if (!currentContextItem) return;

        const itemType = currentContextItem.dataset.itemType;
        const itemToRemove = currentContextItem;

        // Đóng context menu ngay lập tức
        contextMenu.classList.remove('show');

        // Confirm trước khi xóa
        const confirmed = confirm('Bạn có chắc chắn muốn xóa?');
        if (!confirmed) {
            currentContextItem = null;
            return;
        }

        try {
            let result;

            // Sử dụng các hàm API tương ứng
            switch (itemType) {
                case 'artist':
                    result = await unfollowArtist(itemToRemove);
                    break;
                case 'myPlaylist':
                    result = await deletePlaylist(itemToRemove);
                    break;
                case 'playlist':
                    result = await removePlaylist(itemToRemove);
                    break;
                case 'album':
                    result = await removeAlbum(itemToRemove);
                    break;
                default:
                    throw new Error('Invalid item type');
            }

            // Nếu API thành công, xóa phần tử khỏi DOM với animation
            if (result) {
                itemToRemove.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                itemToRemove.style.opacity = '0';
                itemToRemove.style.transform = 'translateX(-20px)';

                // Xóa phần tử sau khi animation hoàn thành
                setTimeout(() => {
                    itemToRemove.remove();
                }, 300);
            }
        } catch (error) {
            console.error('Error unfollowing item:', error);
            alert(`Không thể xóa. Vui lòng thử lại!`);
        } finally {
            currentContextItem = null;
        }
    });
}

async function unfollowArtist(item) {
    const artistId = item.dataset.artistId;
    try {
        await httpRequest.del(`/artists/${artistId}/follow`);

        // Cập nhật lại button Follow nếu đang ở trang artist đó
        const heroBackground = $(".hero-background");
        const currentArtistId = heroBackground?.dataset.artistId;

        if (currentArtistId === artistId) {
            const followBtn = $(".follow-button");
            if (followBtn) {
                followBtn.textContent = "Follow";
                followBtn.classList.remove("following");
                followBtn.disabled = false;
            }
        }

        // Refresh danh sách nghệ sĩ đã theo dõi
        await showArtistsFollowed();

    } catch (error) {
        console.error('Error unfollowing artist:', error);
        throw error;
    }
}

async function removePlaylist(item) {
    const playlistId = item.dataset.playlistId;
    try {
        return await httpRequest.del(`/playlists/${playlistId}/follow`);
    } catch (error) {
        console.error('Error removing playlist:', error);
        throw error;
    }
}

async function deletePlaylist(item) {
    const playlistId = item.dataset?.playlistId || localStorage.getItem("playlistId");

    if (!playlistId) {
        throw new Error("Không tìm thấy playlist ID");
    }

    try {
        return await httpRequest.del(`/playlists/${playlistId}`);
    } catch (error) {
        console.error('Error removing playlist:', error);
        throw error;
    }
}

async function removeAlbum(item) {
    const albumId = item.dataset.albumId;
    try {
        return await httpRequest.del(`/albums/${albumId}/like`);
    } catch (error) {
        console.error('Error removing album:', error);
        throw error;
    }
}

// Hàm chuyển tiếp giữa các tab
export function toggleView(page) {
    const contentWrapper = $(".content-wrapper");
    const artistPage = $(".artist-page");
    const playlistPage = $(".playlist-page");
    const albumPage = $(".album-page");

    if (page === "artist-page") {
        contentWrapper?.classList.add("hidden");
        artistPage?.classList.remove("hidden");
        playlistPage?.classList.add("hidden");
        albumPage?.classList.add("hidden");
    } else if (page === "content-wrapper") {
        contentWrapper?.classList.remove("hidden");
        albumPage?.classList.add("hidden");
        artistPage?.classList.add("hidden");
        playlistPage?.classList.add("hidden");
    } else if (page === "playlist-page") {
        contentWrapper?.classList.add("hidden");
        albumPage?.classList.add("hidden");
        artistPage?.classList.add("hidden");
        playlistPage?.classList.remove("hidden");
    } else if (page === "album-page") {
        contentWrapper?.classList.add("hidden");
        artistPage?.classList.add("hidden");
        playlistPage?.classList.add("hidden");
        albumPage?.classList.remove("hidden");
    }
}

// Hiển thị trang Home
function showHome() {
    // Cập nhật URL về trang chủ
    window.history.pushState({ view: 'home' }, '', window.location.pathname);

    // Toggle view về home
    toggleView("content-wrapper");
}

// Hàm xóa Playlist trong Playlist Detail
function initDeletePlaylistButton() {
    const morePlaylistBtn = $(".more-playlist-btn");
    const menuPlaylist = $(".more-playlist");

    if (!morePlaylistBtn || !menuPlaylist) return;

    // Toggle menu khi click vào nút more
    morePlaylistBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        menuPlaylist.classList.toggle("show");
    });

    // Xử lý click vào nút Delete trong menu
    const deletePlaylistBtn = menuPlaylist.querySelector(".delete-playlist-btn");

    if (deletePlaylistBtn) {
        deletePlaylistBtn.addEventListener("click", async (e) => {
            e.stopPropagation();

            // Đóng menu
            menuPlaylist.classList.remove("show");

            // Confirm trước khi xóa
            const confirmed = confirm("Bạn có chắc chắn muốn xóa playlist này?");
            if (!confirmed) return;

            try {
                // Gọi API xóa playlist (sử dụng hàm deletePlaylist chung)
                await deletePlaylist({});

                // Tìm playlist item trong library để xóa khỏi DOM
                const playlistId = localStorage.getItem("playlistId");
                const playlistItem = $(`.library-item[data-playlist-id="${playlistId}"]`);

                if (playlistItem) {
                    // Animation xóa 
                    playlistItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    playlistItem.style.opacity = '0';
                    playlistItem.style.transform = 'translateX(-20px)';

                    // Xóa phần tử sau khi animation hoàn thành
                    setTimeout(() => {
                        playlistItem.remove();
                        localStorage.removeItem("playlistId");
                        // Chuyển hướng về trang Home sau khi xóa
                        showHome();
                    }, 300);
                } else {
                    // Nếu không tìm thấy element, huyển hướng về trang Home luôn
                    showHome();
                }
            } catch (error) {
                console.error('Error deleting playlist:', error);
                alert("Không thể xóa playlist. Vui lòng thử lại!");
            }
        });
    }

    // Đóng menu khi click ra ngoài
    document.addEventListener("click", (e) => {
        if (!menuPlaylist.contains(e.target) && !morePlaylistBtn.contains(e.target)) {
            menuPlaylist.classList.remove("show");
        }
    });
}
