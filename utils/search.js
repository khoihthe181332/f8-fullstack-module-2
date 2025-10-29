// utils/searchLibrary.js
const $ = document.querySelector.bind(document);

let debounceTimer = null;
let currentSearchQuery = "";

/**
 * Debounce function - Trì hoãn thực thi hàm
 * @param {Function} func - Hàm cần debounce
 * @param {number} delay - Thời gian delay (ms)
 */
function debounce(func, delay = 300) {
    return function (...args) {
        // Clear timeout cũ
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Tạo timeout mới
        debounceTimer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Lọc items dựa trên search query
 * @param {Array} items - Mảng items cần filter
 * @param {string} query - Từ khóa tìm kiếm
 * @returns {Array} - Mảng items đã filter
 */
export function filterItems(items, query) {
    if (!query || query.trim() === "") {
        return items;
    }

    const searchTerm = query.toLowerCase().trim();

    return items.filter(item => {
        // Lấy tên item (playlist.name, album.title, artist.name)
        const itemName = (item.name || item.title || "").toLowerCase();

        // Lấy subtitle nếu có (artist name, album artist, etc.)
        const itemArtist = (item.artist_name || item.user_username || "").toLowerCase();

        // Tìm trong cả name và artist
        return itemName.includes(searchTerm) || itemArtist.includes(searchTerm);
    });
}

/**
 * Highlight text khớp với query
 * @param {string} text - Text gốc
 * @param {string} query - Query tìm kiếm
 * @returns {string} - HTML với highlight
 */
export function highlightText(text, query) {
    if (!query || !text) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Khởi tạo search functionality
 * @param {Function} onSearch - Callback khi search
 */
export function initSearchLibrary(onSearch) {
    const searchInput = $(".search-library-input");
    const searchBtn = $(".search-library-btn");
    const clearBtn = $(".clear-search-btn");

    if (!searchInput) return;

    // Debounced search function
    const debouncedSearch = debounce((query) => {
        currentSearchQuery = query;
        if (onSearch) {
            onSearch(query);
        }
    }, 300);

    // Event listener cho input
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value;

        // Hiện/ẩn nút clear
        if (clearBtn) {
            clearBtn.style.display = query ? "block" : "none";
        }

        // Gọi search với debounce
        debouncedSearch(query);
    });

    // Event listener cho nút clear
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            searchInput.value = "";
            clearBtn.style.display = "none";
            searchInput.focus();
            currentSearchQuery = "";

            // Trigger search với query rỗng
            if (onSearch) {
                onSearch("");
            }
        });
    }

    // Xử lý click vào search button
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            searchInput.classList.add("show");
            setTimeout(() => searchInput.focus(), 200);
        });
    }

    // Đóng search khi click ra ngoài
    document.addEventListener("click", (e) => {
        const isSearchArea = e.target.closest(".search-library-btn, .search-library-input, .clear-search-btn");

        if (!isSearchArea && searchInput.classList.contains("show")) {
            // Chỉ đóng nếu input rỗng
            if (!searchInput.value) {
                searchInput.classList.remove("show");
            }
        }
    });

    // Xử lý ESC key để clear search
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            searchInput.value = "";
            if (clearBtn) clearBtn.style.display = "none";
            currentSearchQuery = "";

            if (onSearch) {
                onSearch("");
            }
        }
    });
}

/**
 * Lấy query hiện tại
 * @returns {string}
 */
export function getCurrentSearchQuery() {
    return currentSearchQuery;
}

/**
 * Reset search state
 */
export function resetSearch() {
    currentSearchQuery = "";
    const searchInput = $(".search-library-input");
    const clearBtn = $(".clear-search-btn");

    if (searchInput) {
        searchInput.value = "";
    }

    if (clearBtn) {
        clearBtn.style.display = "none";
    }
}