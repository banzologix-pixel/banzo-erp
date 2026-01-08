import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ItemSetup() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    item_code: '',
    description: '',
    item_type: 'FP',
    uom: 'EA',
    status: 'Draft',
    Notes: '',
    cost: 0
  });

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const { data } = await supabase
      .from('items')
      .select('id, item_code, description, item_type, uom, status, "Notes", cost')
      .order('item_code');

    setItems(data || []);
  }

  async function saveItem() {
    const { error } = await supabase.from('items').insert(form);

    if (error) {
      console.error(error);
      alert('Error saving item');
      return;
    }

    alert('Item saved');
    loadItems();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Item Setup</h2>

      <div>
        <label>Item Code:</label>
        <input
          value={form.item_code}
          onChange={(e) => setForm({ ...form, item_code: e.target.value })}
        />
      </div>

      <div>
        <label>Description:</label>
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div>
        <label>Type:</label>
        <select
          value={form.item_type}
          onChange={(e) => setForm({ ...form, item_type: e.target.value })}
        >
          <option value="FP">Finished Product</option>
          <option value="RM">Raw Material</option>
          <option value="SA">Sub-Assembly</option>
        </select>
      </div>

      <div>
        <label>UOM:</label>
        <input
          value={form.uom}
          onChange={(e) => setForm({ ...form, uom: e.target.value })}
        />
      </div>

      <div>
        <label>Status:</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="Draft">Draft</option>
          <option value="Active">Active</option>
        </select>
      </div>

      <div>
        <label>Notes:</label>
        <textarea
          value={form.Notes}
          onChange={(e) => setForm({ ...form, Notes: e.target.value })}
        />
      </div>

      <div>
        <label>Cost:</label>
        <input
          type="number"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
        />
      </div>

      <button onClick={saveItem} style={{ marginTop: 10 }}>
        Save Item
      </button>

      <h3 style={{ marginTop: 30 }}>Existing Items</h3>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Code</th>
            <th>Description</th>
            <th>Type</th>
            <th>UOM</th>
            <th>Status</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.item_code}</td>
              <td>{i.description}</td>
              <td>{i.item_type}</td>
              <td>{i.uom}</td>
              <td>{i.status}</td>
              <td>{i.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ItemSetup;