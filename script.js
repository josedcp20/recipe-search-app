let searchInput = document.getElementById("search-input");
let resultsDiv = document.getElementById("search-results");
let searchForm = document.querySelector(".search-form");
let favDiv = document.getElementById("favorites-container");

let recipes = [];
let favorites_guest = [];
let favorites_sarah = [];
let favorites_john = [];

function getCurrentUser() {
    return localStorage.getItem('username') || 'guest';
}

// escape HTML and preserve line breaks
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function formatInstructions(text) {
    const safe = escapeHtml(text || 'No instructions available.');
    return safe.replace(/\r\n|\n|\r/g, '<br>');
}
function getIngredientsHtml(recipe) {
    const items = [];
    for (let i = 1; i <= 20; i++) {
        const ing = recipe[`strIngredient${i}`];
        const meas = recipe[`strMeasure${i}`];
        if (ing && ing.trim() !== '') {
            const text = (meas ? `${escapeHtml(meas.trim())} ` : '') + escapeHtml(ing.trim());
            items.push(`<li>${text}</li>`);
        }
    }
    return items.length ? items.join('') : '<li>No ingredients listed.</li>';
}

// split instructions into numbered steps
function getInstructionSteps(text) {
    if (!text) return ['No instructions available.'];
    return String(text)
        .split(/\r\n|\n|\r/)
        .map(s => s.trim())
        .filter(s => s.length);
}

// determine if a recipe is meat-based
function isMeatBased(recipe) {
    if (!recipe) return false;
    const meatWords = ['beef','chicken','pork','lamb','turkey','veal','bacon','ham','sausage','goat','mutton','chorizo','salami','steak'];
    const cat = (recipe.strCategory || '').toLowerCase();
    if (meatWords.some(w => cat.includes(w))) return true;
    for (let i = 1; i <= 20; i++) {
        const ing = (recipe[`strIngredient${i}`] || '').toLowerCase();
        if (meatWords.some(w => ing.includes(w))) return true;
    }
    return false;
}

const toggle = document.getElementById("about-toggle");
const text = document.getElementById("about-text");
toggle.addEventListener("click", () => {
text.classList.toggle("hidden");
});

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const greeting = document.getElementById('user-greeting');
const logininput = document.getElementById('login-input');

loadUser();

loadFavorites();
renderFavorites();

function loadUser() {
    const username = localStorage.getItem('username');
    if (username) {
        logininput.classList.add('hidden');
        greeting.textContent = `Hola, ${username}`;
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    }
}

loginBtn.addEventListener('click', () => {
    greeting.textContent = '';
    saveFavorites();
    const name = logininput.value.trim();
    if (!name || !name.trim()) return;
    if (name != "sarah" && name != "john") {
        greeting.textContent = "Not a valid username, try again.";
        logininput.value = '';
        return;
    }
    localStorage.setItem('username', name.trim());
    loadUser();
    loadFavorites();
    renderFavorites();
    logininput.classList.add('hidden');
});

logoutBtn.addEventListener('click', () => {
    saveFavorites();
    localStorage.removeItem('username');
    greeting.textContent = '';
    logininput.value = '';
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    logininput.classList.remove('hidden');
    loadFavorites();
    renderFavorites();
});

function loadFavorites() {
    const user = getCurrentUser();
    try {
        const data = localStorage.getItem(`favorites_${user}`);
        favorites = data ? JSON.parse(data) : [];
    } catch (e) {
        favorites = [];
    }
}
function saveFavorites() {
    const user = getCurrentUser();
    localStorage.setItem(`favorites_${user}`, JSON.stringify(favorites));
}
function isFavorite(id) {
    return favorites.some(f => f.idMeal === id);
}
function toggleFavorite(recipe) {
    if (isFavorite(recipe.idMeal)) {
        favorites = favorites.filter(f => f.idMeal !== recipe.idMeal);
    } else {
        favorites.push(recipe);
    }
    saveFavorites();
    renderFavorites();
}
function renderFavorites() {
    const container = document.getElementById('favorites-container');
    if (!container) return;
    if (favorites.length === 0) {
        container.innerHTML = '<p id="no-favorites">No favorites yet.</p>';
        return;
    }
    container.innerHTML = favorites.map((r, i) => `
        <div class="favorite-card recipe-card" data-id="${r.idMeal}">
            <h3>${r.strMeal}</h3>
            <img src="${r.strMealThumb}"
            alt="${r.strMeal}">
            <p><strong>Category:</strong>
            ${r.strCategory}</p>
            <p><strong>Origin:</strong> ${r.strArea}</p>
            <button 
                class="like-btn" 
                type="button" 
                data-id="${r.idMeal}">
                ${isFavorite(r.idMeal) ? 'UNLIKE' : 'LIKE'}
            </button>
        </div>
    `).join('');
}

searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    let ingredient = searchInput.value.trim();
    searchInput.value = '';
    console.log("Searching for:", ingredient);
    if (ingredient === "") {
        resultsDiv.innerHTML = "<p>Please enter an ingredient!</p>";
        return;
    }
    resultsDiv.innerHTML = "<p>Loading recipes...</p>";
    let apiUrl = "https://www.themealdb.com/api/json/v1/1/search.php?s=" + ingredient;
    console.log("API URL:", apiUrl);

    fetch(apiUrl)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log("Got data:", data);
        if (data.meals === null) {
            recipes = [];
            resultsDiv.innerHTML = "<p>No recipes found. Try another ingredient!</p>";
            return;
        }
        // apply meat-based filter (always active)
        const meals = data.meals || [];
        const filtered = meals.filter(isMeatBased);
        console.log(`Filtered meals: ${filtered.length} of ${meals.length}`);
        if (filtered.length === 0) {
            recipes = [];
            resultsDiv.innerHTML = "<p>No meat-based recipes found. Try another ingredient!</p>";
            return;
        }

        recipes = filtered;
        let html = "";
        for (let i = 0; i < 8 && i < recipes.length; i++) {
            let recipe = recipes[i];
            html += `
            <div class="recipe-card" data-index="${i}">
                <h3>${recipe.strMeal}</h3>
                <img src="${recipe.strMealThumb}"
                alt="${recipe.strMeal}">
                <p><strong>Category:</strong>
                ${recipe.strCategory}</p>
                <p><strong>Origin:</strong> ${recipe.strArea}</p>
                <button 
                    class="like-btn" 
                    type="button" 
                    data-id="${recipe.idMeal}">
                    ${isFavorite(recipe.idMeal) ? 'UNLIKE' : 'LIKE'}
                </button>
            </div>
            `;
        }
        resultsDiv.innerHTML = html;
    })
    .catch(function(error) {
        console.log("Error:", error);
        recipes = [];
        resultsDiv.innerHTML = "<p>Something went wrong. Try again!</p>";
    });
});

document.addEventListener('click', function (e) {
    const btn = e.target.closest('.like-btn');
    if (!btn) return;

    // prevent card click handlers from also opening the modal
    e.stopPropagation();

    const id = btn.dataset.id;

    const recipe =
        recipes.find(r => r.idMeal === id) ||
        favorites.find(r => r.idMeal === id);

    if (!recipe) return;

    toggleFavorite(recipe);

    btn.textContent = isFavorite(id) ? 'UNLIKE' : 'LIKE';
});

function showModal(recipe) {
    if (!recipe) return;
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ing = recipe[`strIngredient${i}`];
        const meas = recipe[`strMeasure${i}`];
        if (ing && ing.trim() !== "") {
            ingredients.push({ ing: ing.trim(), meas: (meas || '').trim() });
        }
    }
    const favText = isFavorite(recipe.idMeal) ? 'UNLIKE' : 'LIKE';
    const favClass = isFavorite(recipe.idMeal) ? 'fav-btn saved' : 'fav-btn';

    const instructionSteps = getInstructionSteps(recipe.strInstructions);
    const instructionsHtml = instructionSteps.length
        ? `<ol class="modal-instructions">${instructionSteps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>`
        : `<p class="modal-instructions">${escapeHtml(recipe.strInstructions || 'No instructions available.')}</p>`;

    const ingredientsHtml = ingredients.length
        ? ingredients.map(it => `<li><span class="ingredient-measure">${escapeHtml(it.meas)}</span><span class="ingredient-name">${escapeHtml(it.ing)}</span></li>`).join('')
        : '<li>No ingredients listed.</li>';

    const html = `
        <h2>${escapeHtml(recipe.strMeal)}</h2>
        <img src="${recipe.strMealThumb}" alt="${escapeHtml(recipe.strMeal)}" style="max-width:100%;border-radius:8px;margin-top:12px;">
        <button class="${favClass}" data-id="${recipe.idMeal}">${favText}</button>
        <h3>Ingredients</h3>
        <ul class="modal-ingredients">${ingredientsHtml}</ul>
        <h3>Instructions</h3>
        ${instructionsHtml}
    `;
    const modal = document.getElementById('recipe-modal');
    document.getElementById('modal-body').innerHTML = html;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function showModalByIndex(index) {
    const idx = Number(index);
    const recipe = recipes[idx];
    showModal(recipe);
}

function closeModal() {
    const modal = document.getElementById('recipe-modal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}


// modal close button
const modalClose = document.querySelector('.modal-close');
if (modalClose) modalClose.addEventListener('click', closeModal);

// modal outer click and fav button handling
const modalEl = document.getElementById('recipe-modal');
if (modalEl) {
    modalEl.addEventListener('click', function(e) {
        if (e.target.id === 'recipe-modal') return closeModal();
        if (e.target.matches('.fav-btn')) {
            const id = e.target.dataset.id;
            const inFav = isFavorite(id);
            if (inFav) {
                favorites = favorites.filter(f => f.idMeal !== id);
            } else {
                let recipe = recipes.find(r => r.idMeal === id) || favorites.find(r => r.idMeal === id);
                if (!recipe) {
                    return;
                }
                favorites.push(recipe);
            }
            saveFavorites();
            renderFavorites();
            e.target.textContent = isFavorite(id) ? 'UNLIKE' : 'LIKE';
            e.target.classList.toggle('saved', isFavorite(id));
        }
    });
}

// close with Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// open modal only when clicking the image inside a result card
resultsDiv.addEventListener('click', function(e) {
    const img = e.target.closest('.recipe-card img');
    if (!img) return; // only open from image clicks
    const card = img.closest('.recipe-card');
    if (!card) return;
    const idx = card.dataset.index;
    if (idx !== undefined) showModalByIndex(idx);
});

// open modal from favorites list only when clicking the image
document.getElementById('favorites-container').addEventListener('click', function(e) {
    const img = e.target.closest('.favorite-card img');
    if (!img) return;
    const card = img.closest('.favorite-card');
    if (!card) return;
    const id = card.dataset.id;
    const recipe = favorites.find(r => r.idMeal === id);
    if (recipe) showModal(recipe);
});

// initial load
loadFavorites();
renderFavorites();