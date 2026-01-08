import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function BOMSetup() {
  const [itemId, setItemId] = useState('');
  const [componentId, setComponentId] = useState('');
  const [qty, setQty] = useState('');
  const [message, setMessage] = useState('');

  const [items, setItems] = useState([]);
  const [components, setComponents] = useState([]);
  const [bomList, setBomList] = useState([]);

  useEffect(() => {
    loadItems();
    loadComponents();
  }, []);

  useEffect(() => {
    if (itemId) {
      loadBomList(itemId);
    } else {
      setBomList([]);
    }
  }, [itemId]);

  async function loadItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('item_code', { ascending: true });

    if (error) {
      console.error('Error loading items:', error);
      setMessage('Error loading items: ' + error.message);
    } else {
      console.log('Loaded items:', data);
      setItems(data || []);
    }
  }

  async function loadComponents() {
    const { data, error } = await supabase
      .from('components')
      .select('id, component_code, description')
      .order('component_code', { ascending: true });

    if (error) {
      console.error('Error loading components:', error);
      setMessage('Error loading components: ' + error.message);
    } else {
      console.log('Loaded components:', data);
      setComponents(data || []);
    }
  }

  async function loadBomList(selectedItemId) {
    const { data, error } = await supabase
      .from('bom_components')
      .select(`
        id,
        qty,
        component_id,
        components (
          component_code,
          description
        )
      `)
      .eq('item_id', selectedItemId)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error loading BOM list:', error);
      setMessage('Error loading BOM list: ' + error.message);
      setBomList([]);
    } else {
      console.log('BOM List:', data);
      setBomList(data || []);
    }
  }

  async function addComponentToBom() {
    setMessage('');

    if (!itemId || !componentId || !qty) {
      setMessage('Please select an item, a component, and enter a quantity.');
      return;
    }

    const payload = {
      item_id: itemId,
      component_id: componentId,
      qty: parseFloat(qty)
    };

    console.log('Inserting BOM row:', payload);

    const { error } = await supabase
      .from('bom_components')
      .insert([payload]);

    if (error) {
      console.error('Error adding component:', error);
      setMessage('Error adding component: ' + error.message);
    } else {
      setMessage('Component added to BOM!');
      setComponentId('');
      setQty('');
      loadBomList(itemId);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>BOM Setup</h1>

      <label>Select Item:</label>
      <select
        value={itemId}
        onChange={e => setItemId(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', minWidth: '300px' }}
      >
        <option value="">Select Item</option>
        {items.map(i => (
          <option key={i.id} value={i.id}>
            {i.item_code} — {i.description}
          </option>
        ))}
      </select>

      {itemId && (
        <>
          <h3>Add Component to BOM</h3>

          <label>Component:</label>
          <select
            value={componentId}
            onChange={e => setComponentId(e.target.value)}
            style={{ display: 'block', marginBottom: '10px', minWidth: '300px' }}
          >
            <option value="">Select Component</option>
            {components.map(c => (
              <option key={c.id} value={c.id}>
                {c.component_code} — {c.description}
              </option>
            ))}
          </select>

          <label>Quantity Required:</label>
          <input
            type="number"
            value={qty}
            onChange={e => setQty(e.target.value)}
            style={{ display: 'block', marginBottom: '10px', width: '150px' }}
          />

          <button onClick={addComponentToBom} style={{ marginBottom: '10px' }}>
            Add to BOM
          </button>

          {message && <p>{message}</p>}

          <h3>Current BOM</h3>
          {bomList.length === 0 ? (
            <p>No components in BOM for this item yet.</p>
          ) : (
            <ul>
              {bomList.map(b => (
                <li key={b.id}>
                  {b.components && b.components.component_code
                    ? `${b.components.component_code} — ${b.components.description} | Qty: ${b.qty}`
                    : `Component ID: ${b.component_id} | Qty: ${b.qty}`}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default BOMSetup;