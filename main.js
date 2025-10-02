import httpRequest from "./utils/httpRequest.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const currentUser = localStorage.getItem("currentUser");
// let currentSong = ...

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
        } else {
            formLoginEmail.classList.remove("invalid");
        }

        if (!password) {
            formLoginPassword.classList.add("invalid");
        }

        const credentials = {
            email,
            password,
        }

        try {
            const { user, access_token } = await httpRequest.post("/auth/login", credentials);
            localStorage.setItem("accessToken", access_token);
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
        // Your Library
        const libraryItems = $$(".library-item");
        libraryItems.forEach(item => {
            item.addEventListener("click", (e) => {
                libraryItems.forEach(otherItem => {
                    otherItem.classList.remove("active");
                });

                item.classList.add("active");
            });
        });

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
                albumsContainer.classList.remove('hidden');
                artistsContainer.classList.add('hidden');
            } else if (tab === 'artists') {
                // Hiện Artists
                likedSongsItem.classList.add('hidden');
                playlistsContainer.classList.add('hidden');
                albumsContainer.classList.add('hidden');
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

    // Handle logout button click
    logoutBtn.addEventListener("click", function () {
        // Close dropdown first
        userDropdown.classList.remove("show");

        // TODO: Students will implement logout logic here
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");
        window.location.reload();
    });
});

// Import
import { showTrendingTracks } from "./utils/tracks.js";
import {
    showTrendingArtists, showArtistById, initArtistCardListeners, showArtistsFollowed
} from "./utils/artists.js";

import { showPlaylistsFollowed } from "./utils/playlists.js";
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
        // Playlists followed
        showPlaylistsFollowed();
        // Albums followed
        showAlbumsFollowed();
        // Artists followed
        showArtistsFollowed();

        // Unfollowed
        unfollowedLibrary();
    }

    // Hiển thị các bài hát thịnh hành hôm nay
    showTrendingTracks();

    // Hiển thị các nghệ sĩ phổ biến
    showTrendingArtists();

    // Chọn nghệ sĩ 
    initArtistCardListeners();

    // Hiển thị nghệ sĩ được chọn
    showArtistById();
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
        // Tìm library-item gần nhất
        const libraryItem = e.target.closest('.library-item');

        // Chỉ hiện context menu cho items có data-item-type
        if (libraryItem && libraryItem.dataset.itemType) {
            e.preventDefault();

            currentContextItem = libraryItem;

            // Đặt vị trí context menu
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
    unfollowItem.addEventListener('click', function () {
        if (currentContextItem) {
            const itemType = currentContextItem.dataset.itemType;

            // Xử lý theo từng loại
            if (itemType === 'artist') {
                unfollowArtist();
            } else if (itemType === 'playlist') {
                removePlaylist();
            } else if (itemType === 'album') {
                removeAlbum();
            }

            // Đóng context menu
            contextMenu.classList.remove('show');
            currentContextItem = null;
        }
    });
};

async function unfollowArtist() {
    const artistId = currentContextItem.dataset.artistId;
    return await httpRequest.del(`/artists/${artistId}/follow`);
}

async function removePlaylist() {
    const playlistId = currentContextItem.dataset.playlistId;
    return await httpRequest.del(`/playlists/${playlistId}/follow`);
}

async function removeAlbum() {
    const albumId = currentContextItem.dataset.albumId;
    return await httpRequest.del(`/albums/${albumId}/like`);
}


