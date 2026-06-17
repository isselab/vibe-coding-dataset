// &begin[RecipeBook]
import { useState } from "react";
import RecipeCard from "./components/RecipeCard";
import RecipeDetail from "./components/RecipeDetail";
import AddRecipeForm from "./components/AddRecipeForm";
import ShoppingList from "./components/ShoppingList";
import { sampleRecipes } from "./data/recipes";
import "./App.css";

export default function App() {
  // &begin[RecipeList]
  const [recipes, setRecipes] = useState(sampleRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filter, setFilter] = useState("all");
  // &end[RecipeList]

  // &begin[AddRecipe]
  const [showAddForm, setShowAddForm] = useState(false);
  const addRecipe = (recipe) => setRecipes((prev) => [recipe, ...prev]);
  // &end[AddRecipe]

  // &begin[DeleteRecipe]
  const deleteRecipe = (id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    if (selectedRecipe?.id === id) setSelectedRecipe(null);
  };
  // &end[DeleteRecipe]

  const [activeTab, setActiveTab] = useState("recipes");

  // &begin[RecipeList]
  const filtered = recipes.filter((r) => filter === "all" || r.type === filter);
  // &end[RecipeList]

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <span className="logo">🍳</span>
          <h1>Recipe Book</h1>
        </div>
        <nav className="tab-nav">
          <button
            className={activeTab === "recipes" ? "tab active" : "tab"}
            onClick={() => setActiveTab("recipes")}
          >
            Recipes
          </button>
          <button
            className={activeTab === "shopping" ? "tab active" : "tab"}
            onClick={() => setActiveTab("shopping")}
          >
            Shopping List
          </button>
        </nav>
      </header>

      <main className="app-main">
        {/* &begin[RecipeList] */}
        {activeTab === "recipes" && (
          <div className="recipes-tab">
            <div className="recipes-toolbar">
              <div className="filter-buttons">
                {["all", "meal", "drink"].map((f) => (
                  <button
                    key={f}
                    className={`filter-btn ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === "all" ? "All" : f === "meal" ? "Meals" : "Drinks"}
                  </button>
                ))}
              </div>
              {/* &begin[AddRecipe] */}
              <button
                className="btn-primary add-btn"
                onClick={() => setShowAddForm(true)}
              >
                + Add Recipe
              </button>
              {/* &end[AddRecipe] */}
            </div>
            {filtered.length === 0 ? (
              <div className="empty-state">
                No recipes found. Try adjusting your search or add a new recipe!
              </div>
            ) : (
              <div className="recipe-grid">
                {filtered.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={setSelectedRecipe}
                    onDelete={deleteRecipe}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {/* &end[RecipeList] */}

        {/* &begin[ShoppingList] */}
        {activeTab === "shopping" && <ShoppingList />}
        {/* &end[ShoppingList] */}
      </main>

      {/* &begin[RecipeDetail] */}
      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
      {/* &end[RecipeDetail] */}

      {/* &begin[AddRecipe] */}
      {showAddForm && (
        <AddRecipeForm
          onAdd={addRecipe}
          onClose={() => setShowAddForm(false)}
        />
      )}
      {/* &end[AddRecipe] */}
    </div>
  );
}
// &end[RecipeBook]
