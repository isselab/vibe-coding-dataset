// &begin[ShoppingList]
import { useState } from 'react';

export default function ShoppingList() {
  const [items, setItems] = useState([
    { id: '1', text: 'Spaghetti (400g)', completed: false },
    { id: '2', text: 'Pancetta (200g)', completed: true },
  ]);
  const [input, setInput] = useState('');

  // &begin[AddShoppingItem]
  const addItem = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setItems((prev) => [...prev, { id: Date.now().toString(), text: trimmed, completed: false }]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addItem();
  };
  // &end[AddShoppingItem]

  // &begin[CompleteShoppingItem]
  const toggleItem = (id) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const removeCompleted = () => {
    setItems((prev) => prev.filter((item) => !item.completed));
  };
  // &end[CompleteShoppingItem]

  const pending = items.filter((i) => !i.completed);
  const completed = items.filter((i) => i.completed);

  return (
    <div className="shopping-list">
      <div className="shopping-header">
        <h2>Shopping List</h2>
        <span className="badge">{pending.length} left</span>
      </div>

      {/* &begin[AddShoppingItem] */}
      <div className="shopping-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add item..."
          className="shopping-input"
        />
        <button className="btn-primary" onClick={addItem}>Add</button>
      </div>
      {/* &end[AddShoppingItem] */}

      <ul className="shopping-items">
        {pending.map((item) => (
          // &begin[CompleteShoppingItem]
          <li key={item.id} className="shopping-item">
            <input type="checkbox" checked={false} onChange={() => toggleItem(item.id)} />
            <span>{item.text}</span>
          </li>
          // &end[CompleteShoppingItem]
        ))}
        {completed.length > 0 && (
          <>
            <li className="shopping-divider">
              <span>Purchased ({completed.length})</span>
              {/* &begin[CompleteShoppingItem] */}
              <button className="btn-text" onClick={removeCompleted}>Clear</button>
              {/* &end[CompleteShoppingItem] */}
            </li>
            {completed.map((item) => (
              // &begin[CompleteShoppingItem]
              <li key={item.id} className="shopping-item completed">
                <input type="checkbox" checked={true} onChange={() => toggleItem(item.id)} />
                <span>{item.text}</span>
              </li>
              // &end[CompleteShoppingItem]
            ))}
          </>
        )}
      </ul>
    </div>
  );
}
// &end[ShoppingList]
