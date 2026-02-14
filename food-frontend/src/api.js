const BASE = '/api/foods';

export async function getFoodItems() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch food items');
  return res.json();
}

export async function addFoodItem(item) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to add food item');
  return res.json();
}

export async function deleteFoodItem(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete food item');
}

export async function updateFoodItem(id, item) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to update food item');
  return res.json();
}
