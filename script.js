let searchInput = document.getElementById("search-input");
let resultsDiv = document.getElementById("search-results");
let searchForm = document.querySelector(".search-form");
let favDiv = document.getElementById("favorites-container");

let recipes = [];
let favorites = []; 

const toggle = document.getElementById("about-toggle");
const text = document.getElementById("about-text");
toggle.addEventListener("click", () => {
text.classList.toggle("hidden");
});

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const greeting = document.getElementById('user-greeting');
const logininput = document.getElementById('login-input');

function loadUser() {
    const username = localStorage.getItem('username');
    if (username) {
        greeting.textContent = `Hola, ${username}`;
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    }
}

loginBtn.addEventListener('click', () => {
    const name = logininput.value.trim();
    if (!name || !name.trim()) return;

    localStorage.setItem('username', name.trim());
    loadUser();
    logininput.classList.add('hidden');
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('username');
    greeting.textContent = '';
    logininput.value = '';
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    logininput.classList.remove('hidden');
});

function loadFavorites() {
    try {
        const data = localStorage.getItem('favorites');
        favorites = data ? JSON.parse(data) : [];
    } catch (e) {
        favorites = [];
    }
}
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
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
        <div class="recipe-card" data-id="${r.idMeal}">
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
        recipes = data.meals;
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
    if (!e.target.matches('.like-btn')) return;

    const id = e.target.dataset.id;

    const recipe =
        recipes.find(r => r.idMeal === id) ||
        favorites.find(r => r.idMeal === id);

    if (!recipe) return;

    toggleFavorite(recipe);

    e.target.textContent = isFavorite(id) ? 'UNLIKE' : 'LIKE';
});

function showModal(recipe) {
    if (!recipe) return;
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ing = recipe[`strIngredient${i}`];
        const meas = recipe[`strMeasure${i}`];
        if (ing && ing.trim() !== "") {
            ingredients.push(`${meas ? meas.trim()+' ' : ''}${ing.trim()}`);
        }
    }
    const favText = isFavorite(recipe.idMeal) ? 'Remove from favorites' : 'Add to favorites';
    const favClass = isFavorite(recipe.idMeal) ? 'fav-btn saved' : 'fav-btn';
    const html = `
        <h2>${recipe.strMeal}</h2>
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" style="max-width:100%;border-radius:8px;margin-top:12px;">
        <button class="${favClass}" data-id="${recipe.idMeal}">${favText}</button>
        <h3>Ingredients</h3>
        <ul class="modal-ingredients">${ingredients.map(it => `<li>${it}</li>`).join('')}</ul>
        <h3>Instructions</h3>
        <p>${recipe.strInstructions || 'No instructions available.'}</p>
    `;
    const modal = document.getElementById('recipe-modal');
    document.getElementById('modal-body').innerHTML = html;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function showModalByIndex(index) {
    const recipe = recipes[index];
    showModal(recipe);
}

function closeModal() {
    const modal = document.getElementById('recipe-modal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}


document.querySelector('.modal-close').addEventListener('click', closeModal);
document.getElementById('recipe-modal').addEventListener('click', function(e) {
    if (e.target.id === 'recipe-modal') closeModal();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});


document.getElementById('recipe-modal').addEventListener('click', function(e) {
    if (e.target.id === 'recipe-modal') closeModal();
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
        e.target.textContent = isFavorite(id) ? 'Remove from favorites' : 'Add to favorites';
        e.target.classList.toggle('saved', isFavorite(id));
    }
});

document.getElementById('favorites-container').addEventListener('click', function(e) {
    const card = e.target.closest('.favorite-card');
    if (!card) return;
    const id = card.dataset.id;
    const recipe = favorites.find(r => r.idMeal === id);
    if (recipe) showModal(recipe);
});

loadFavorites();
renderFavorites();

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});
