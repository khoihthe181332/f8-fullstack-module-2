// utils/sortLibrary.js
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

let currentSortType = "recent";

// Hàm sort chung cho tất cả library items
export function sortLibraryItems(items, sortType, priorityItem = null) {
    const sorted = [...items];

    if (sortType === "alphabetical") {
        sorted.sort((a, b) => {
            // Item ưu tiên luôn ở đầu (ví dụ: Liked Songs)
            if (priorityItem) {
                if (a.name === priorityItem || a.title === priorityItem) return -1;
                if (b.name === priorityItem || b.title === priorityItem) return 1;
            }

            // So sánh theo tên/title
            const nameA = a.name || a.title || "";
            const nameB = b.name || b.title || "";
            return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
        });
    } else {
        // Gần đây - giữ thứ tự mặc định
        sorted.sort((a, b) => {
            if (priorityItem) {
                if (a.name === priorityItem || a.title === priorityItem) return -1;
                if (b.name === priorityItem || b.title === priorityItem) return 1;
            }
            return 0;
        });
    }

    return sorted;
}

// Hàm khởi tạo Sort UI
export function initSortLibrary(onSortChange) {
    const sortBtn = $(".sort-btn");
    const sortPopup = $(".sort-popup");
    const sortOptions = $$(".sort-option");
    const sortText = $(".sort-text");

    if (!sortBtn || !sortPopup) return;

    // Toggle popup
    sortBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sortPopup.classList.toggle("show");
    });

    // Đóng popup khi click ra ngoài
    document.addEventListener("click", (e) => {
        if (!sortPopup.contains(e.target) && !sortBtn.contains(e.target)) {
            sortPopup.classList.remove("show");
        }
    });

    // Xử lý click vào option
    sortOptions.forEach(option => {
        option.addEventListener("click", () => {
            const sortType = option.dataset.sort;

            // Cập nhật UI
            sortOptions.forEach(opt => opt.classList.remove("active"));
            option.classList.add("active");

            // Cập nhật text
            sortText.textContent = sortType === "recent" ? "Gần đây" : "Thứ tự chữ cái";

            // Đóng popup
            sortPopup.classList.remove("show");

            // Lưu state và callback
            currentSortType = sortType;
            if (onSortChange) {
                onSortChange(sortType);
            }
        });
    });
}

export function getCurrentSortType() {
    return currentSortType;
}