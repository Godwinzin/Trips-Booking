let activeMap = null;
const UNSPLASH_ACCESS_KEY = 'XnapbKsXLLo7N828wdQE631T1qoobKxiqJocVIMSVFE';

const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Helper: Generate card HTML with Favorite Heart Button
function createCardHTML(item) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const isFav = favorites.includes(item.id);

  return `
    <div class="card">
      <div style="position: relative;">
        <img src="${item.image}" alt="${item.title}" onclick="viewDetails('${item.id}')" loading="lazy"
        onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';"
        >
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
// Global function to cancel a reservation
window.cancelBooking = function(event, id) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  // 1. Remove from localStorage
  let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  bookings = bookings.filter(b => String(b.id) !== String(id));
  localStorage.setItem('bookings', JSON.stringify(bookings));

  // 2. Target the clicked button and update UI
  const btn = event.currentTarget || event.target;
  if (btn) {
    btn.innerText = 'Cancelled';
    btn.disabled = true;
    btn.style.backgroundColor = '#9e9e9e';
    btn.style.color = '#ffffff';
    btn.style.borderColor = '#9e9e9e';
    btn.style.cursor = 'not-allowed';
  }

  // 3. Update the 'Confirmed' badge to 'Cancelled'
  const card = btn.closest('.booking-card');
  if (card) {
    const badge = card.querySelector('.status-badge');
    if (badge) {
      badge.innerText = 'Cancelled';
      badge.style.background = '#d32f2f';
    }
  }

  // 4. Feedback toast (if available)
  if (typeof showToast === 'function') {
    showToast('Reservation cancelled', 'info');
  }
};


// Global toggle for favorites using localStorage
function toggleFavorite(event, id) {
  event.stopPropagation(); // Prevents clicking the card link
  
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
  // Find item title for a clearer message (optional)
  const item = MOCK_DESTINATIONS.find(d => String(d.id) === String(id));
  const title = item ? item.title : 'Destination';

  if (favorites.includes(id)) {
    favorites = favorites.filter(favId => favId !== id);
    showToast(`Removed "${title}" from saved favorites`, 'info');
  } else {
    favorites.push(id);
    showToast(`Added "${title}" to saved favorites!`, 'success');
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));

  const btn = event.currentTarget;
  btn.classList.toggle('active');

  // Re-render if user is on saved.html
  if (window.location.pathname.includes('saved.html')) {
    renderSavedPage();
  }
}

// Navigate to details page with query parameters
function viewDetails(id) {
  window.location.href = `details.html?id=${id}`;
}
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3000);
}

// Page Router / Initialization
document.addEventListener('DOMContentLoaded', () => {
    // A. Mobile Hamburger Menu Listener
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  const path = window.location.pathname;
  if (path.endsWith('saved.html')) {
    renderSavedPage();
  }
  

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
  if (window.location.pathname.includes('details.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || "1";
    const destination = MOCK_DESTINATIONS.find(item => String(item.id) === String(id)) || MOCK_DESTINATIONS[0];

    const detailsContainer = document.getElementById('destination-details');
    const priceWidget = document.getElementById('widget-price');
    const reserveBtn = document.getElementById('reserve-btn');
    const dateInput = document.getElementById('checkin');

  if (dateInput) {
    // Calculate 5 days from today
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 5);

    // Format date as YYYY-MM-DD
    const minDateString = minDate.toISOString().split('T')[0];

    // Restrict date input
    dateInput.min = minDateString;
  }

    if (reserveBtn) {
      reserveBtn.onclick = (e) => {
        e.preventDefault();

        // 1. Get existing bookings or initialize empty array
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

        // 2. Prevent duplicate bookings for the same item
        const alreadyBooked = bookings.some(b => String(b.id) === String(destination.id));

        if (alreadyBooked) {
          showToast(`You have already reserved a spot for ${destination.title}!`, 'info');
          return;
        }

        // 3. Add booking with active date timestamp
        bookings.push({
          id: destination.id,
          bookedAt: new Date().toLocaleDateString()
        });

        localStorage.setItem('bookings', JSON.stringify(bookings));
        showToast(`Spot successfully reserved for ${destination.title}!`, 'success');
      };
    }
    

    if (detailsContainer) {
      // 1. Initial render with fallback static image
      detailsContainer.innerHTML = `
        <h1>${destination.title}</h1>
        <p style="color: var(--gray); margin-bottom: 1rem;">${destination.location} • ★ ${destination.rating}</p>
        <div class="gallery">
          <img id="gallery-img-1" src="${destination.image}" alt="${destination.title}">
          <img id="gallery-img-2" src="${destination.image}" alt="${destination.title}">
        </div>
        <h2>About this trip</h2>
        <p style="margin-top: 0.5rem; margin-bottom: 1.5rem;">${destination.description}</p>
        
        <div id="weather-info">
          <p>Loading current weather...</p>
        </div>

        <div class="map-section">
          <h2>Location & Map</h2>
          <div id="map"></div>
        </div>
      `;

      // 2. Fetch live photos asynchronously from Unsplash and update the gallery
      fetchDestinationImage(destination.location, destination.image).then(liveImageUrl => {
        const img1 = document.getElementById('gallery-img-1');
        if (img1) img1.src = liveImageUrl;
      });

      fetchDestinationImage(`${destination.location} travel`, destination.image).then(liveImageUrl => {
        const img2 = document.getElementById('gallery-img-2');
        if (img2) img2.src = liveImageUrl;
      });

      // 3. Fetch weather and render map
      fetchDestinationWeather(destination.lat, destination.lon);
      renderMap(destination.lat, destination.lon, destination.title, destination.location);
    }

    if (priceWidget) {
      priceWidget.innerText = `$${destination.price} / total`;
    }
  }

  // Render Booked Spots Page
// GLOBAL: Render Reserved Bookings
function renderBookingsPage() {
  const bookingsContainer = document.getElementById('bookings-results');
  if (!bookingsContainer) return;

  const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  const bookedIds = bookings.map(b => String(b.id));

  const bookedItems = MOCK_DESTINATIONS.filter(item => 
    bookedIds.includes(String(item.id))
  );

  if (bookedItems.length === 0) {
    bookingsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--gray);">
        <p style="font-size: 1.1rem; margin-bottom: 1rem;">You have no active reservations yet.</p>
        <a href="index.html" class="btn-primary" style="text-decoration: none; padding: 0.6rem 1.2rem; display: inline-block;">Explore Destinations</a>
      </div>
    `;
  } else {
    bookingsContainer.innerHTML = bookedItems.map(item => {
      const bookingInfo = bookings.find(b => String(b.id) === String(item.id));
      return `
        <div class="card booking-card">
          <div style="position: relative;">
            <img src="${item.image}" alt="${item.title}" onclick="viewDetails('${item.id}')">
            <span class="status-badge" style="position: absolute; top: 12px; right: 12px; background: #2e7d32; color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">
              Confirmed
            </span>
          </div>
          <div class="card-content">
            <h3>${item.title}</h3>
            <p style="color: var(--gray); font-size: 0.9rem; margin: 0;">📍 ${item.location}</p>
            <div style="margin: 0.5rem 0; font-size: 0.85rem; color: #555; background: #f8f9fa; padding: 8px 12px; border-radius: 6px;">
              <span><strong>Reserved:</strong> ${bookingInfo ? bookingInfo.bookedAt : 'Recently'}</span>
            </div>
            <p class="card-price" style="margin-bottom: 1rem;">$${item.price} <span style="font-size: 0.8rem; font-weight: normal; color: var(--gray);">/ total</span></p>
            <button class="btn-secondary" onclick="cancelBooking(event, '${item.id}')">Cancel Reservation</button>
          </div>
        </div>
      `;
    }).join('');
  }
}
if (window.location.pathname.includes('bookings.html')) {
    renderBookingsPage();
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
function renderMap(lat, lon, title, locationName) {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  // Destroy previous map instance if it exists
  if (activeMap) {
    activeMap.remove();
    activeMap = null;
  }

  // Initialize new map
  activeMap = L.map('map').setView([lat, lon], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(activeMap);

  L.marker([lat, lon]).addTo(activeMap)
    .bindPopup(`<b>${title}</b><br>${locationName}`)
    .openPopup();

  // Force map to redraw correctly after DOM render
  setTimeout(() => {
    if (activeMap) activeMap.invalidateSize();
  }, 100);
}


// Fetch a live image URL from Unsplash based on location search
async function fetchDestinationImage(query, fallbackUrl) {
  // If no key is set yet, return the static mock image
  if (UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
    return fallbackUrl;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    const data = await response.json();
    
    // Return regular image URL if found, otherwise return fallback
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
    return fallbackUrl;
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return fallbackUrl;
  }
}
});