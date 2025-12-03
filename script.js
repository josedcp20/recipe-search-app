let searchButton = document.getElementById("search-button");
let searchInput = document.getElementById("search-input");
let resultsDiv = document.getElementById("search-results");

// 2. WHEN BUTTON CLICKED
searchButton.addEventListener("click", function() {
    event.preventDefault();
    // 3. GET WHAT USER TYPED
    let ingredient = searchInput.value;
    console.log("Searching for:", ingredient);
    // 4. CHECK IF EMPTY
    if (ingredient === "") {
        resultsDiv.innerHTML = "<p>Please enter an ingredient!</p>";
        return; // Stop here if empty
    }
    // 5. SHOW LOADING MESSAGE
    resultsDiv.innerHTML = "<p>Loading recipes...</p>";

    // 6. BUILD API URL
    let apiUrl = "https://www.themealdb.com/api/json/v1/1/search.php?s=" +
    ingredient;
    console.log("API URL:", apiUrl);

    // 7. FETCH DATA (GET RECIPES FROM INTERNET!)
    fetch(apiUrl)
    .then(function(response) {
        return response.json(); // Convert to readable format
    })
    .then(function(data) {
        console.log("Got data:", data);
        // 8. CHECK IF FOUND RECIPES
        if (data.meals === null) {
            resultsDiv.innerHTML = "<p>No recipes found. Try another ingredient!</p>";
            return;
        }
        // 9. SHOW RECIPES
        let recipes = data.meals;
        let html = "";
        // Loop through first 5 recipes
        for (let i = 0; i < 5 && i < recipes.length; i++) {
            let recipe = recipes[i];
            html += `
            <div class="recipe-card">
            <h3>${recipe.strMeal}</h3>
            <img src="${recipe.strMealThumb}"
            alt="${recipe.strMeal}">
            <p><strong>Category:</strong>
            ${recipe.strCategory}</p>
            <p><strong>Origin:</strong> ${recipe.strArea}</p>
            </div>
            `;
        }
        resultsDiv.innerHTML = html;
    })
    .catch(function(error) {
    console.log("Error:", error);
    resultsDiv.innerHTML = "<p>Something went wrong. Try again!</p>";
    });
});