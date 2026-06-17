// &begin[RecipeDetail]
export default function RecipeDetail({ recipe, onClose }) {
  if (!recipe) return null;

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>✕</button>
        <img src={recipe.image} alt={recipe.title} className="detail-image" />
        <div className="detail-content">
          <div className="detail-header">
            <div>
              <h2 className="detail-title">{recipe.title}</h2>
              <p className="detail-cuisine">{recipe.cuisine} · <span className={`type-badge ${recipe.type}`}>{recipe.type === 'drink' ? 'Drink' : 'Meal'}</span></p>
            </div>
            <div className="detail-meta">
              <span className={`difficulty ${recipe.difficulty.toLowerCase()}`}>{recipe.difficulty}</span>
              <span>⏱ {recipe.cookTime} min</span>
              <span>🍽 {recipe.servings} servings</span>
              <span>{'★'.repeat(Math.round(recipe.rating))} {recipe.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="detail-sections">
            <div className="detail-section">
              <h3>Ingredients</h3>
              <ul className="ingredients-list">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>
            <div className="detail-section">
              <h3>Instructions</h3>
              <ol className="instructions-list">
                {recipe.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// &end[RecipeDetail]
