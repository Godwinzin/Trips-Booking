let activeMap = null;
const UNSPLASH_ACCESS_KEY = 'XnapbKsXLLo7N828wdQE631T1qoobKxiqJocVIMSVFE';

// Set current year in footer
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Global Helper: Generate exact Card HTML used on Home Page
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

// Global Function: Cancel Reservation
window.cancelBooking = function(event, id) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  // 1. Remove from localStorage
  let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  bookings = bookings.filter(b => String(b.id) !== String(id));
  localStorage.setItem('bookings', JSON.stringify(bookings));

  // 2. Refresh Bookings page
  renderBookingsPage();

  // 3. Feedback Toast
  if (typeof showToast === 'function') {
    showToast('Reservation cancelled', 'info');
  }
};

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
        <a href="index.html" class="btn-primary" style="text-decoration: none; padding: 0.6rem 1.2rem; display: inline-block; border-radius: var(--radius);">Explore Destinations</a>
      </div>
    `;
  } else {
    bookingsContainer.innerHTML = bookedItems.map(item => {
      const bookingInfo = bookings.find(b => String(b.id) === String(item.id));
      const guests = bookingInfo && bookingInfo.guests ? bookingInfo.guests : 1;
      const displayPrice = bookingInfo && bookingInfo.totalPrice ? bookingInfo.totalPrice : item.price;

      return `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="card">
            <div style="position: relative;">
              <img src="${item.image}" alt="${item.title}" onclick="viewDetails('${item.id}')" loading="lazy"
                onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';"
              >
              <!-- Confirmed Status Badge -->
              <span class="status-badge">Confirmed</span>
            </div>
            <div class="card-content" onclick="viewDetails('${item.id}')">
              <h3 class="card-title">${item.title}</h3>
              <p style="color: var(--gray);">${item.location}</p>
              <div style="margin: 0.4rem 0; font-size: 0.85rem; color: #555; background: #f8f9fa; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                <strong>Reserved:</strong> ${bookingInfo ? bookingInfo.bookedAt : 'Recently'} • <strong>${guests} ${guests > 1 ? 'Guests' : 'Guest'}</strong>
              </div>
              <p class="card-price">$${displayPrice} <span style="font-size: 0.8rem; font-weight: normal; color: var(--gray);">/ total</span></p>
            </div>
          </div>
          <button class="btn-primary" onclick="cancelBooking(event, '${item.id}')" style="background-color: var(--secondary); border-radius: var(--radius); padding: 0.5rem; width: 100%; cursor: pointer;">
            Cancel Reservation
          </button>
        </div>
      `;
    }).join('');
  }
}

// Global Function: Render Saved Page
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

// Global Toggle Favorites
function toggleFavorite(event, id) {
  event.stopPropagation();
  
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
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
  if (btn) btn.classList.toggle('active');

  if (window.location.pathname.includes('saved.html')) {
    renderSavedPage();
  }
}

// Global Navigation Handler
function viewDetails(id) {
  window.location.href = `details.html?id=${id}`;
}

// Global Toast Handler
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

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Hamburger Menu
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

  // Bookings Page Execution
  if (path.includes('bookings.html')) {
    renderBookingsPage();
  }

  // Saved Page Execution
  if (path.includes('saved.html')) {
    renderSavedPage();
  }

  // Home Page Execution
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

  // Search Page Execution
  if (path.includes('search.html')) {
    const resultsContainer = document.getElementById('search-results');
    const priceSlider = document.getElementById('price-range');
    const categoryCheckboxes = document.querySelectorAll('.category-filter');
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('query') || '';

    const searchTitle = document.getElementById('search-title');
    if (searchQuery && searchTitle) {
      searchTitle.innerText = `Search results for "${searchQuery}"`;
    }

    function filterDestinations() {
      if (!resultsContainer) return;
      const maxPrice = priceSlider ? parseFloat(priceSlider.value) : Infinity;
      
      const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      const filtered = MOCK_DESTINATIONS.filter(item => {
        const matchesSearch = !searchQuery || 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPrice = item.price <= maxPrice;
        const matchesCategory = selectedCategories.length === 0 || 
          selectedCategories.includes(item.category);

        return matchesSearch && matchesPrice && matchesCategory;
      });

      resultsContainer.innerHTML = filtered.length > 0 
        ? filtered.map(createCardHTML).join('') 
        : '<p>No destinations found matching your criteria.</p>';
    }

    if (priceSlider) priceSlider.addEventListener('input', filterDestinations);
    categoryCheckboxes.forEach(cb => cb.addEventListener('change', filterDestinations));

    filterDestinations();
  }

  // Details Page Execution
  if (path.includes('details.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || "1";
    const destination = MOCK_DESTINATIONS.find(item => String(item.id) === String(id)) || MOCK_DESTINATIONS[0];

    const detailsContainer = document.getElementById('destination-details');
    const priceWidget = document.getElementById('widget-price');
    const reserveBtn = document.getElementById('reserve-btn');
    const dateInput = document.getElementById('checkin');
    const guestsInput = document.getElementById('guests');

    // Function to calculate dynamic total price
    function updateTotalPrice() {
      const guestCount = guestsInput ? Math.max(1, parseInt(guestsInput.value) || 1) : 1;
      const totalPrice = destination.price * guestCount;

      if (priceWidget) {
        priceWidget.innerHTML = `$${totalPrice} <span style="font-size: 0.85rem; font-weight: normal; color: var(--gray);">(${guestCount} ${guestCount > 1 ? 'guests' : 'guest'})</span>`;
      }
      return totalPrice;
    }

    // Initial price setup
    updateTotalPrice();

    // Recalculate price when guest count changes
    if (guestsInput) {
      guestsInput.addEventListener('input', updateTotalPrice);
      guestsInput.addEventListener('change', updateTotalPrice);
    }

    if (dateInput) {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 5);
      dateInput.min = minDate.toISOString().split('T')[0];
    }

    if (reserveBtn) {
      reserveBtn.onclick = (e) => {
        e.preventDefault();
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

        const alreadyBooked = bookings.some(b => String(b.id) === String(destination.id));
        if (alreadyBooked) {
          showToast(`You have already reserved a spot for ${destination.title}!`, 'info');
          return;
        }

        const guestCount = guestsInput ? Math.max(1, parseInt(guestsInput.value) || 1) : 1;
        const calculatedPrice = destination.price * guestCount;

        bookings.push({
          id: destination.id,
          bookedAt: new Date().toLocaleDateString(),
          guests: guestCount,
          totalPrice: calculatedPrice
        });

        localStorage.setItem('bookings', JSON.stringify(bookings));
        showToast(`Spot successfully reserved for ${destination.title}!`, 'success');
      };
    }

    if (detailsContainer) {
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

      fetchDestinationImage(destination.location, destination.image).then(liveImageUrl => {
        const img1 = document.getElementById('gallery-img-1');
        if (img1) img1.src = liveImageUrl;
      });

      fetchDestinationImage(`${destination.location} travel`, destination.image).then(liveImageUrl => {
        const img2 = document.getElementById('gallery-img-2');
        if (img2) img2.src = liveImageUrl;
      });

      fetchDestinationWeather(destination.lat, destination.lon);
      renderMap(destination.lat, destination.lon, destination.title, destination.location);
    }
  }
});

// Weather API Fetch
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

// Leaflet Map Rendering
function renderMap(lat, lon, title, locationName) {
  const mapContainer = document.getElementById('map');
  if (!mapContainer || typeof L === 'undefined') return;

  if (activeMap) {
    activeMap.remove();
    activeMap = null;
  }

  activeMap = L.map('map').setView([lat, lon], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(activeMap);

  L.marker([lat, lon]).addTo(activeMap)
    .bindPopup(`<b>${title}</b><br>${locationName}`)
    .openPopup();

  setTimeout(() => {
    if (activeMap) activeMap.invalidateSize();
  }, 100);
}

// Unsplash Image Fetch
async function fetchDestinationImage(query, fallbackUrl) {
  if (UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
    return fallbackUrl;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
    return fallbackUrl;
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return fallbackUrl;
  }
}