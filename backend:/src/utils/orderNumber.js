const { v4: uuidv4 } = require('uuid');

// Human-scannable, unique, sortable-ish order number: ORD-YYYYMMDD-XXXXXXXX
function generateOrderNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = uuidv4().split('-')[0].toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
}

module.exports = { generateOrderNumber };
