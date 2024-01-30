const searchBtn = document.querySelector(".searchBtn");
const closeBtn = document.querySelector("#searchClose");
const searchBar = document.querySelector(".searchBar");
const searchInput = document.getElementById("searchInput");
const toggleSearchBar = () => {
    let isOpen = searchBar.classList.contains("open") ? true : false;
    isOpen ? searchBar.classList.remove("open") : searchBar.classList.add("open");
    searchBtn.setAttribute("aria-expanded", `${!isOpen}`);
    searchInput.focus();
};

if(searchBtn) searchBtn.addEventListener("click", toggleSearchBar);
if(closeBtn) closeBtn.addEventListener("click", toggleSearchBar);
