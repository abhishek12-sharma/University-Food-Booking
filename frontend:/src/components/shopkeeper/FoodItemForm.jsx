import { useState } from 'react';

const EMPTY = {
  name: '',
  description: '',
  category: '',
  price: '',
  quantity_available: '',
  is_available: true,
  image_url: ''
};

export default function FoodItemForm({ initialValue, onSubmit, submitting, submitLabel = 'Save' }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialValue });
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.price === '' || Number(form.price) < 0) errs.price = 'Enter a valid price';
    if (form.quantity_available === '' || !Number.isInteger(Number(form.quantity_available)) || Number(form.quantity_available) < 0) {
      errs.quantity_available = 'Enter a valid non-negative quantity';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity_available: Number(form.quantity_available),
      is_available: form.is_available,
      image_url: form.image_url.trim() || null
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
      <div>
        <label className="label" htmlFor="name">Name</label>
        <input id="name" className="input" value={form.name} onChange={(e) => update('name', e.target.value)} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea
          id="description"
          className="input"
          rows={3}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="category">Category</label>
          <input id="category" className="input" value={form.category} onChange={(e) => update('category', e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="price">Price (₹)</label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            className="input"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
          />
          {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="quantity">Quantity available</label>
          <input
            id="quantity"
            type="number"
            min="0"
            className="input"
            value={form.quantity_available}
            onChange={(e) => update('quantity_available', e.target.value)}
          />
          {errors.quantity_available && <p className="mt-1 text-xs text-red-600">{errors.quantity_available}</p>}
        </div>
        <div className="flex items-end gap-2 pb-2">
          <input
            id="is_available"
            type="checkbox"
            checked={form.is_available}
            onChange={(e) => update('is_available', e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="is_available" className="text-sm text-gray-700">Available for ordering</label>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="image_url">Image URL (optional)</label>
        <input id="image_url" className="input" value={form.image_url} onChange={(e) => update('image_url', e.target.value)} />
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
