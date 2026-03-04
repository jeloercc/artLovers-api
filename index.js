// Global State Variables, to track current page and mode (artworks vs search)
let currentPage = 1;
let currentMode = "artworks"; 
// Store the last search query to maintain it across pagination
let lastSearchQuery = "";

//  FETCH (Data Point 1)
const fetchArtworks = () => {
    // template literal with pagination 
    const apiUrl = `https://api.artic.edu/api/v1/artworks?fields=id,title,artist_display,image_id&page=${currentPage}`;
    fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            const pageInfo = document.getElementById("page-info");
            if (pageInfo) {
                pageInfo.textContent = `Page ${data.pagination.current_page} of ${data.pagination.total_pages}`;
            }
            renderArtworks(data.data);
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
};

// Function to render artworks on the page
const renderArtworks = (artworks) => {
    const container = document.getElementById("art-container");
    
    // CLEAR the container before drawing the new page!
    container.replaceChildren();

    // create a card block 
    artworks.forEach((art) => {
        const artBlock = document.createElement("article"); 
        artBlock.className = "art-card";
        const image = document.createElement("img");
        // Using the correct IIIF format
        if (art.image_id) {
            image.src = `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`;
            image.alt = `${art.title} artwork`;
            image.style.maxWidth = "100%"; 
            image.style.borderRadius = "4px";
        } else {
            image.style.display = "none";
        }
        // create the title element
        const title = document.createElement("h2");
        title.textContent = art.title;
        
        // create the artist info element
        const artistInfo = document.createElement("p");
        artistInfo.textContent = `Artist: ${art.artist_display}`;

        // append elements to the block
        artBlock.appendChild(image);
        artBlock.appendChild(title);
        artBlock.appendChild(artistInfo);

        // append the card to the container
        container.appendChild(artBlock);
    });
};

// FETCH SEARCH (Data Point 2)
const fetchSearch = () => {
    const searchInput = document.getElementById("search-input").value.trim();
   if (searchInput) lastSearchQuery = searchInput; // ← guardar
    const query = lastSearchQuery; // ← usar el guardado
    const apiUrl = `https://api.artic.edu/api/v1/artworks/search?q=${query}&fields=id,title,artist_display,image_id&page=${currentPage}&limit=12`;
    fetch(apiUrl)
        .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then((data) => {
            const pageInfo = document.getElementById("page-info");
            if (pageInfo) {
                // Calculate total pages based on total results and limit per page (12)
                const totalPages = Math.ceil(data.pagination.total / 12);
                pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            }
            renderSearchResults(data.data);
        })
        .catch((error) => console.error("Error fetching search results:", error));
};

const renderSearchResults = (searchResults) => {
    const container = document.getElementById("art-container");
    container.replaceChildren();

    searchResults.forEach((search) => {
        const searchBlock = document.createElement("article");
        searchBlock.className = "art-card";
        
        // Create the image element and construct the URL
        const image = document.createElement("img");
        if (search.image_id) {
            // Reusing the exact same IIIF logic that works!
            image.src = `https://www.artic.edu/iiif/2/${search.image_id}/full/843,/0/default.jpg`;
            image.alt = `${search.title} artwork`;
            image.style.maxWidth = "100%"; 
            image.style.borderRadius = "4px";
        } else {
            image.style.display = "none";
        }

        const title = document.createElement("h2");
        title.textContent = search.title;
        
        const artistInfo = document.createElement("p");
        artistInfo.textContent = `Artist: ${search.artist_display}`;

        searchBlock.appendChild(title);
        searchBlock.appendChild(image);
        searchBlock.appendChild(artistInfo);
        container.appendChild(searchBlock);
    });
};
//actios listeners for buttons and pagination
// --- NAVIGATION LISTENERS (Top Menu) ---
document.getElementById("btn-artworks").addEventListener("click", () => {
    currentMode = "artworks";
    currentPage = 1;
    document.getElementById("search-section").classList.remove("visible"); // ← único listener
    fetchArtworks();
});

// Show search section when Search button is clicked
document.getElementById("btn-search").addEventListener("click", () => {
    currentMode = "search";
    currentPage = 1;
    document.getElementById("search-section").classList.add("visible");
});

// --- SEARCH LISTENER (Search Button) ---
document.getElementById("search-btn").addEventListener("click", () => {
    currentPage = 1;
    fetchSearch();
});
// --- ENTER KEY LISTENER ---
document.getElementById("search-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        currentPage = 1;
        fetchSearch();
    }
});

// --- PAGINATION LISTENERS (Bottom Controls) ---
document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        // Check which mode is active to call the correct fetch
        if (currentMode === "artworks") {
            fetchArtworks();
        } else {
            fetchSearch();
        }
    }
});
// Next button listener
document.getElementById("next-btn").addEventListener("click", () => {
    currentPage++;
    // Check which mode is active to call the correct fetch
    if (currentMode === "artworks") {
        fetchArtworks();
    } else {
        fetchSearch();
    }
});

// Execute initial fetch on page load
fetchArtworks();