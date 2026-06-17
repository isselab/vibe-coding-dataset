import { useState } from 'react';

function StarRating({ rating }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <span key={star} className={`star ${filled ? 'filled' : half ? 'half' : 'empty'}`}>
            {filled ? '★' : half ? '⯨' : '☆'}
          </span>
        );
      })}
      <span className="rating-value">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function RecipeCard({ recipe, onClick, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(recipe.id);
    } else {
      setConfirmDelete(true);
    }
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDelete(false);
  };

  return (
    <div className="recipe-card" onClick={() => onClick(recipe)}>
      <div className="card-image-wrapper">
        <img src={recipe.image} alt={recipe.title} className="card-image" />
        <span className={`type-badge ${recipe.type}`}>{recipe.type === 'drink' ? 'Drink' : 'Meal'}</span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{recipe.title}</h3>
        <p className="card-cuisine">{recipe.cuisine}</p>
        <StarRating rating={recipe.rating} />
        <div className="card-meta">
          <span className={`difficulty ${recipe.difficulty.toLowerCase()}`}>{recipe.difficulty}</span>
          <span className="meta-item">⏱ {recipe.cookTime} min</span>
          <span className="meta-item">🍽 {recipe.servings} servings</span>
        </div>
        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          {confirmDelete ? (
            <div className="confirm-delete">
              <span>Delete?</span>
              <button className="btn-confirm" onClick={handleDelete}>Yes</button>
              <button className="btn-cancel" onClick={handleCancelDelete}>No</button>
            </div>
          ) : (
            <button className="btn-delete" onClick={handleDelete}>Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}
