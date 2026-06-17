// &begin[AddRecipe]
import { useState } from 'react';

const emptyForm = {
  title: '',
  type: 'meal',
  cuisine: '',
  difficulty: 'Easy',
  cookTime: '',
  servings: '',
  rating: 3,
  image: '',
  ingredients: '',
  instructions: '',
};

export default function AddRecipeForm({ onAdd, onClose }) {
  const [form, setForm] = useState(emptyForm);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const recipe = {
      id: Date.now().toString(),
      ...form,
      cookTime: Number(form.cookTime),
      servings: Number(form.servings),
      rating: Number(form.rating),
      image: form.image || `https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop`,
      ingredients: form.ingredients.split('\n').map((s) => s.trim()).filter(Boolean),
      instructions: form.instructions.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    onAdd(recipe);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Recipe</h2>
          <button className="detail-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="recipe-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input required value={form.title} onChange={set('title')} placeholder="Recipe name" />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select value={form.type} onChange={set('type')}>
                <option value="meal">Meal</option>
                <option value="drink">Drink / Cocktail</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cuisine</label>
              <input value={form.cuisine} onChange={set('cuisine')} placeholder="e.g. Italian" />
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select value={form.difficulty} onChange={set('difficulty')}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cook Time (min) *</label>
              <input required type="number" min="1" value={form.cookTime} onChange={set('cookTime')} placeholder="30" />
            </div>
            <div className="form-group">
              <label>Servings *</label>
              <input required type="number" min="1" value={form.servings} onChange={set('servings')} placeholder="4" />
            </div>
            <div className="form-group">
              <label>Rating (1-5)</label>
              <input type="number" min="1" max="5" step="0.5" value={form.rating} onChange={set('rating')} />
            </div>
          </div>
          <div className="form-group">
            <label>Image URL (optional)</label>
            <input value={form.image} onChange={set('image')} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Ingredients * (one per line)</label>
            <textarea required rows={5} value={form.ingredients} onChange={set('ingredients')} placeholder={"2 cups flour\n1 tsp salt\n..."} />
          </div>
          <div className="form-group">
            <label>Instructions * (one step per line)</label>
            <textarea required rows={5} value={form.instructions} onChange={set('instructions')} placeholder={"Mix dry ingredients\nAdd wet ingredients\n..."} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Add Recipe</button>
          </div>
        </form>
      </div>
    </div>
  );
}
// &end[AddRecipe]
