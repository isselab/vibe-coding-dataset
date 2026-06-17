import { useState } from "react";
import RecipeCard from "./components/RecipeCard";
import RecipeDetail from "./components/RecipeDetail";
import AddRecipeForm from "./components/AddRecipeForm";
import ShoppingList from "./components/ShoppingList";
import { sampleRecipes } from "./data/recipes";
import "./App.css";

export default function App() {
  const [recipes, setRecipes] = useState(sampleRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filter, setFilter] = useState("all");

  const [showAddForm, setShowAddForm] = useState(false);
  const addRecipe = (recipe) => setRecipes((prev) => [recipe, ...prev]);

  const deleteRecipe = (id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    if (selectedRecipe?.id === id) setSelectedRecipe(null);
  };

  const [activeTab, setActiveTab] = useState("recipes");

  const filtered = recipes.filter((r) => filter === "all" || r.type === filter);

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
              <button
                className="btn-primary add-btn"
                onClick={() => setShowAddForm(true)}
              >
                + Add Recipe
              </button>
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

        {activeTab === "shopping" && <ShoppingList />}
      </main>

      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {showAddForm && (
        <AddRecipeForm
          onAdd={addRecipe}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
