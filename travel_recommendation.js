document.addEventListener('DOMContentLoaded', function() {
    const recommendationsContainer = document.querySelector('.recommendations-container');
    const imageBox = document.getElementById('imageBox');
    let travelData = {
        countries: [],
        temples: [],
        beaches: []
    };

    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Loading recommendations...';
    loadingIndicator.classList.add('loading-indicator');
    recommendationsContainer.appendChild(loadingIndicator);

    // Fetch the data from the JSON file
    fetch('travel_recommendation_api.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.countries && data.temples && data.beaches) {
                travelData = data;

                // Display two images in the image box
                const images = [
                    data.countries[0].cities[0].imageUrl,
                    data.countries[0].cities[1].imageUrl
                ];

                imageBox.innerHTML = images.map(src => `<img src="${src}" alt="Travel Image">`).join('');
            } else {
                throw new Error('Invalid data format');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            recommendationsContainer.innerHTML = `<p class="error-message"></p>`;
        })
        .finally(() => {
            // Remove loading indicator
            loadingIndicator.remove();
        });

    function createItemElement(item) {
        return `
            <div class="item">
                <h2>${item.name}</h2>
                <img src="${item.imageUrl}" alt="${item.name}" class="item-image">
                <p>${item.description}</p>
            </div>
        `;
    }

    function findRecommendationsByKeyword(keyword) {
        const searchKeyword = keyword.toLowerCase();
        let foundItems = [];

        // Search in categories based on keyword
        if (searchKeyword === 'beach') {
            foundItems = travelData.beaches;
        } else if (searchKeyword === 'temple') {
            foundItems = travelData.temples;
        } else if (searchKeyword === 'country') {
            // Include cities from all countries
            travelData.countries.forEach(country => {
                foundItems.push(...country.cities);
            });
        } else {
            // If not a recognized keyword, search in all categories
            foundItems = [
                ...travelData.countries.flatMap(country => country.cities),
                ...travelData.temples,
                ...travelData.beaches
            ].filter(item => item.name.toLowerCase().includes(searchKeyword));
        }

        return foundItems;
    }

    function renderRecommendations(keyword) {
        const dataToRender = findRecommendationsByKeyword(keyword);

        if (dataToRender.length > 0) {
            recommendationsContainer.innerHTML = dataToRender.map(createItemElement).join('');
            recommendationsContainer.classList.add('show'); // Show the recommendations container
        } else {
            recommendationsContainer.innerHTML = `<p class="error-message">No results found for "${keyword}".</p>`;
            recommendationsContainer.classList.add('show'); // Ensure container is shown even if no results
        }
    }

    window.searchFunction = function() {
        const searchInput = document.getElementById('searchBar').value.trim();
        if (searchInput) {
            renderRecommendations(searchInput);
        } else {
            recommendationsContainer.classList.remove('show'); // Hide recommendations container if search input is empty
        }
    }

    window.resetFunction = function() {
        document.getElementById('searchBar').value = '';
        recommendationsContainer.classList.remove('show'); // Hide recommendations container
    }
});
