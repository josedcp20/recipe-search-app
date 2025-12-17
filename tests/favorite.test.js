beforeEach(() => {
    jest.resetModules();

    document.body.innerHTML = `
    <div class="login-box">
      <span id="user-greeting"></span>
      <input type="text" id="login-input" />
      <button id="login-btn">Login</button>
      <button id="logout-btn" class="hidden">Logout</button>
    </div>

    <h2 id="about-toggle"></h2>
    <div id="about-text" class="hidden"></div>

    <section class="search-section">
      <form class="search-form">
        <input type="text" id="search-input" />
        <button id="search-button" type="submit">Search</button>
      </form>
    </section>

    <div id="search-results"></div>

    <section class="favorites-section">
      <h2>Favorites</h2>
      <div id="favorites-container">
        <p id="no-favorites">No favorites yet.</p>
      </div>
    </section>

    <div id="recipe-modal" class="modal" aria-hidden="true">
      <div class="modal-content" role="dialog" aria-modal="true">
        <button class="modal-close" aria-label="Close">×</button>
        <div id="modal-body"></div>
      </div>
    </div>
    `;

    let store = {};
    global.localStorage = {
        getItem: (key) => (key in store ? store[key] : null),
        setItem: (key, value) => {store[key] = value.toString();},
        removeItem: (key) => {delete store[key];},
        clear: () => {store = {};}
    };
});

test ('when there are no favorites, shows "No favorites yet."', () => {
    require('../script.js');
    const container = document.getElementById('favorites-container');
    expect(container).not.toBeNull();
    expect(container.textContent).toContain('No favorites yet.');
});

test ('renders favorites from localStorage', () => {
    const sample = [{
        idMeal: "111",
        strMeal: "Test Meal",
        strMealThumb: "thumb.jpg",
        strCategory: "Test Category",
        strArea: "Test Area"
    }];

    localStorage.setItem('favorites_guest', JSON.stringify(sample));

    require('../script.js');

    const container = document.getElementById('favorites-container');
    const favCard = container.querySelector('.favorite-card');
    expect(favCard).not.toBeNull();
    expect(favCard.textContent).toContain('Test Meal');
});

test('clicking UNLIKE on a favorite removes it and updates localStorage', () => {
  const sample = [{
    idMeal: "111",
    strMeal: "Test Meal",
    strMealThumb: "thumb.jpg",
    strCategory: "TestCat",
    strArea: "TestArea"
  }];
  localStorage.setItem('favorites_guest', JSON.stringify(sample));

  require('../script.js');

  const container = document.getElementById('favorites-container');
  const likeBtn = container.querySelector('.like-btn');
  expect(likeBtn).not.toBeNull();

  // Simulate user clicking the UNLIKE button
  likeBtn.click();

  // After clicking, renderFavorites should show "No favorites yet."
  expect(container.textContent).toMatch(/No favorites yet/i);

  // localStorage should be updated to an empty array (stringified)
  expect(localStorage.getItem('favorites_guest')).toBe(JSON.stringify([]));
});