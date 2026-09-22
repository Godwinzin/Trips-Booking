// Mock dataset (Acts as our temporary database/API response)
const MOCK_DESTINATIONS = [
  {
    id: '1',
    title: 'Kyoto Cultural Tour',
    category: 'City',
    location: 'Japan',
    price: 450,
    rating: 4.9,
    lat: 35.0116,
    lon: 135.7681,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    description: 'Explore ancient temples, traditional tea houses, and vibrant bamboo groves in Kyoto.'
  },
  {
    id: '2',
    title: 'Santorini Sunset Retreat',
    category: 'Beach',
    location: 'Greece',
    price: 850,
    rating: 4.8,
    lat: 36.3932,
    lon: 25.4615,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80',
    description: 'Experience whitewashed architecture overlooking breathtaking Aegean views.'
  },
  {
    id: '3',
    title: 'Swiss Alps Hiking Adventure',
    category: 'Mountain',
    location: 'Switzerland',
    price: 1200,
    rating: 4.9,
    lat: 46.5197,
    lon: 8.4237,
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80',
    description: 'Traverse scenic mountain passes, alpine lakes, and stay in classic chalet lodges.'
  },
  {
    id: '4',
    title: 'Bali Tropical Getaway',
    category: 'Beach',
    location: 'Indonesia',
    price: 350,
    rating: 4.7,
    lat: -8.4095,
    lon: 115.1889,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    description: 'Relax in private villas surrounded by lush rainforests and serene ocean beaches.'
  }
];

// Helper: Generate card HTML
// Helper: Generate card HTML with Favorite Heart Button
function createCardHTML(item) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const isFav = favorites.includes(item.id);

  return `
    <div class="card">
      <div style="position: relative;">
        <img src="${item.image}" alt="${item.title}" onclick="viewDetails('${item.id}')">
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(event, '${item.id}')" title="Save to Favorites">
          ♥
        </button>
      </div>
      <div class="card-content" onclick="viewDetails('${item.id}')">
        <h3 class="card-title">${item.title}</h3>
        <p style="color: var(--gray);">${item.location}</p>
        <p class="card-price">$${item.price} <span style="font-size: 0.8rem; font-weight: normal; color: var(--gray);">/ total</span></p>
      </div>
    </div>
  `;
}

// Global toggle for favorites using localStorage
function toggleFavorite(event, id) {
  event.stopPropagation(); // Prevents clicking the card link
  
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  if (favorites.includes(id)) {
    favorites = favorites.filter(favId => favId !== id);
  } else {
    favorites.push(id);
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));

  const btn = event.currentTarget;
  btn.classList.toggle('active');

  // Re-render if user is on saved.html
  if (window.location.pathname.endsWith('saved.html')) {
    renderSavedPage();
  }
}

// Navigate to details page with query parameters
function viewDetails(id) {
  window.location.href = `details.html?id=${id}`;
}

// Page Router / Initialization
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  // 1. Home Page Logic
  if (path.endsWith('index.html') || path.endsWith('/')) {
    const popularContainer = document.getElementById('popular-destinations');
    if (popularContainer) {
      popularContainer.innerHTML = MOCK_DESTINATIONS.map(createCardHTML).join('');
    }

    const homeForm = document.getElementById('home-search-form');
    if (homeForm) {
      homeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('destination-input').value;
        window.location.href = `search.html?query=${encodeURIComponent(query)}`;
      });
    }
  }

  // 2. Search Page Logic
  if (path.endsWith('search.html')) {
    const resultsContainer = document.getElementById('search-results');
    const priceSlider = document.getElementById('price-range');
    const categoryCheckboxes = document.querySelectorAll('.category-filter');
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('query') || '';

    if (searchQuery) {
      document.getElementById('search-title').innerText = `Search results for "${searchQuery}"`;
    }

    // Function to apply search query, price filter, AND category filters together
    function filterDestinations() {
      const maxPrice = parseFloat(priceSlider.value);
      
      // Get array of selected categories (e.g., ['Beach', 'Mountain'])
      const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      const filtered = MOCK_DESTINATIONS.filter(item => {
        // 1. Text search match
        const matchesSearch = !searchQuery || 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Price match
        const matchesPrice = item.price <= maxPrice;

        // 3. Category match (if none checked, match all)
        const matchesCategory = selectedCategories.length === 0 || 
          selectedCategories.includes(item.category);

        return matchesSearch && matchesPrice && matchesCategory;
      });

      // Render updated list
      resultsContainer.innerHTML = filtered.length > 0 
        ? filtered.map(createCardHTML).join('') 
        : '<p>No destinations found matching your criteria.</p>';
    }

    // Attach event listeners to slider and checkboxes
    if (priceSlider) {
      priceSlider.addEventListener('input', filterDestinations);
    }
    
    categoryCheckboxes.forEach(cb => {
      cb.addEventListener('change', filterDestinations);
    });

    // Run once on initial page load
    filterDestinations();
  }

  // 3. Details Page Logic
  // Details Page Router Block
  if (path.endsWith('details.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const destination = MOCK_DESTINATIONS.find(item => item.id === id) || MOCK_DESTINATIONS[0];

    const detailsContainer = document.getElementById('destination-details');
    const priceWidget = document.getElementById('widget-price');

    if (detailsContainer) {
      detailsContainer.innerHTML = `
        <h1>${destination.title}</h1>
        <p style="color: var(--gray); margin-bottom: 1rem;">${destination.location} • ★ ${destination.rating}</p>
        <div class="gallery">
          <img src="${destination.image}" alt="${destination.title}">
          <img src="${destination.image}" alt="${destination.title}">
        </div>
        <h2>About this trip</h2>
        <p style="margin-top: 0.5rem; margin-bottom: 1.5rem;">${destination.description}</p>
        
        <!-- Live Weather Container -->
        <div id="weather-info">
          <p>Loading current weather...</p>
        </div>
      `;

      // Fetch live weather using destination coordinates
      fetchDestinationWeather(destination.lat, destination.lon);
    }

    if (priceWidget) {
      priceWidget.innerText = `$${destination.price} / total`;
    }
  }

  // Saved Page Router Block
  if (path.endsWith('saved.html')) {
    renderSavedPage();
  }

  function renderSavedPage() {
    const savedContainer = document.getElementById('saved-results');
    if (!savedContainer) return;

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const savedItems = MOCK_DESTINATIONS.filter(item => favorites.includes(item.id));

    if (savedItems.length === 0) {
      savedContainer.innerHTML = '<p>You haven\'t saved any destinations yet. Click the heart icon on any card to save it here!</p>';
    } else {
      savedContainer.innerHTML = savedItems.map(createCardHTML).join('');
    }
  }
  async function fetchDestinationWeather(lat, lon) {
  const weatherContainer = document.getElementById('weather-info');
  if (!weatherContainer) return;

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const data = await response.json();
    const current = data.current_weather;

    weatherContainer.innerHTML = `
      <div class="weather-card">
        <h3>Current Weather</h3>
        <p class="weather-temp">${current.temperature}°C</p>
        <p>Wind Speed: ${current.windspeed} km/h</p>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load weather:', error);
    weatherContainer.innerHTML = '<p>Weather data unavailable.</p>';
  }
}
});