import { useState } from 'react';

export default function InventoryTable({ items, onUpdateQuantity, onToggleAvailability, soldByItemId = {} }) {
  const [editingId, setEditingId] = useState(null);
  const [draftQty, setDraftQty] = useState('');

  function startEdit(item) {
    setEditingId(item.id);
    setDraftQty(String(item.quantity_available));
  }

  function commitEdit(item) {
    const qty = Number(draftQty);
    if (Number.isInteger(qty) && qty >= 0) {
      onUpdateQuantity(item, qty);
    }
    setEditingId(null);
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Available qty</th>
            <th className="px-4 py-3">Sold today</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item.id} className={item.quantity_available === 0 ? 'bg-red-50/40' : ''}>
              <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
              <td className="px-4 py-3 text-gray-500">{item.category || '—'}</td>
              <td className="px-4 py-3 text-gray-700">₹{Number(item.price).toFixed(2)}</td>
              <td className="px-4 py-3">
                {editingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      className="input w-20"
                      value={draftQty}
                      onChange={(e) => setDraftQty(e.target.value)}
                      autoFocus
                    />
                    <button className="btn btn-primary px-3 py-1.5 text-xs" onClick={() => commitEdit(item)}>
                      Save
                    </button>
                    <button
                      className="btn btn-secondary px-3 py-1.5 text-xs"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className={`font-semibold ${item.quantity_available === 0 ? 'text-red-600' : 'text-gray-800'} hover:underline`}
                    onClick={() => startEdit(item)}
                  >
                    {item.quantity_available}
                  </button>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500">{soldByItemId[item.id] ?? '—'}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggleAvailability(item, !item.is_available)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {item.is_available ? 'Available' : 'Unavailable'}
                </button>
              </td>
              <td className="px-4 py-3 text-right">
                <a href={`/shopkeeper/menu/edit/${item.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
                  Edit
                </a>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                No menu items yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
