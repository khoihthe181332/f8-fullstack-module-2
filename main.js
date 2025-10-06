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
                albumsContainer.classList.remove('hidden');
                artistsContainer.classList.add('hidden');
            } else if (tab === 'artists') {
                // Hiện Artists
                likedSongsItem.classList.add('hidden');
                playlistsContainer.classList.add('hidden');
                albumsContainer.classList.add('hidden');
                myPlaylistContainer.classList.add('hidden');
                artistsContainer.classList.remove('hidden');
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
import { showTrendingTracks, initTrackCardListener } from "./utils/tracks.js";
import {
    showTrendingArtists, showArtistById, initArtistCardListeners, showArtistsFollowed, handleUrlParams, followArtist
} from "./utils/artists.js";

import { showPlaylistsFollowed, showMyPlaylist, showPlaylistById, initPlaylistCardListeners } from "./utils/playlists.js";
import { showAlbumsFollowed } from "./utils/albums.js";


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
    }

    // Hiển thị các bài hát thịnh hành hôm nay
    await showTrendingTracks();

    // Hiển thị các nghệ sĩ phổ biến
    await showTrendingArtists();

    // Chọn nghệ sĩ 
    initArtistCardListeners();

    // Hiển thị nghệ sĩ được chọn
    showArtistById();
    handleUrlParams();

    // Chọn playlist
    initPlaylistCardListeners();

    // Chọn bài hát
    initTrackCardListener();
});

function updateCurrentUser(user) {
    const userAvatar = $("#user-avatar");
    if (user.avatar_url) {
        userAvatar.src = user.avatar_url;
    }
}

let currentContextItem = null;

function unfollowedLibrary() {
    const contextMenu = $('#contextMenu');
    const unfollowItem = $('#unfollowItem');

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
        }
    });

    // Xử lý click vào Unfollow
    unfollowItem.addEventListener('click', async function () {
        if (!currentContextItem) return;

        const itemType = currentContextItem.dataset.itemType;
        const itemToRemove = currentContextItem; // Lưu reference trước khi xóa

        // Đóng context menu ngay lập tức
        contextMenu.classList.remove('show');

        try {
            let result;
            if (itemType === 'artist') {
                result = await unfollowArtist(itemToRemove);
            } else if (itemType === 'myPlaylist') {
                result = await deletePlaylist(itemToRemove);
            } else if (itemType === 'playlist') {
                result = await removePlaylist(itemToRemove);
            } else if (itemType === 'album') {
                result = await removeAlbum(itemToRemove);
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
            // Có thể hiển thị thông báo lỗi cho user
            alert(`Không thể xóa ${itemType} Vui lòng thử lại!`);
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
    const playlistId = item.dataset.playlistId;
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

    if (page === "artist-page") {
        contentWrapper?.classList.add("hidden");
        artistPage?.classList.remove("hidden");
        playlistPage?.classList.add("hidden");
    } else if (page === "content-wrapper") {
        contentWrapper?.classList.remove("hidden");
        artistPage?.classList.add("hidden");
        playlistPage?.classList.add("hidden");
    } else if (page === "playlist-page") {
        contentWrapper?.classList.add("hidden");
        artistPage?.classList.add("hidden");
        playlistPage?.classList.remove("hidden");
    }
}

// Hiển thị trang Home
function showHome() {
    // Cập nhật URL về trang chủ
    window.history.pushState({ view: 'home' }, '', window.location.pathname);

    // Toggle view về home
    toggleView("content-wrapper");
}
