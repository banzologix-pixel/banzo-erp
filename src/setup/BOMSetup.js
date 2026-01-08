import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function BOMSetup() {
  const [parentItems, setParentItems] = useState([]);
  const [components, setComponents] = useState([]);
  const [bomLines, setBomLines] = useState([]);

  const [selectedParent, setSelectedParent] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [qty, setQty] = useState('');
  const [scrap, setScrap] = useState('');

  useEffect(() => {
    fetchParentItems();
    fetchComponents();
  }, []);

  useEffect(() => {
    if (selectedParent) fetchBOM(selectedParent);
    else setBomLines([]);
  }, [selectedParent]);

  async function fetchParentItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .in('item_type', ['FP', 'SA', 'WIP']); // manufactured items only

    if (error) {
      console.error('Error fetching parent items:', error);
      return;
    }

    setParentItems(data || []);
  }

  async function fetchComponents() {
    const { data, error } = await supabase
      .from('items')
      .select('*'); // all items can be components

    if (error) {
      console.error('Error fetching components:', error);
      return;
    }

    setComponents(data || []);
  }

  async function fetchBOM(parentId) {
    const { data, error } = await supabase
      .from('bom_lines')
      .select('*')
      .eq('parent_item_id', parentId);

    if (error) {
      console.error('Error fetching BOM:', error);
      return;
    }

    setBomLines(data || []);
  }

  async function saveBOMLine() {
    if (!selectedParent || !selectedComponent || !qty) {
      console.warn('Missing required BOM fields');
      return;
    }

    const { error } = await supabase.from('bom_lines').insert([
      {
        parent_item_id: selectedParent,
        component_item_id: selectedComponent,
        qty: Number(qty),
        scrap_percent: Number(scrap) || 0,
      },
    ]);

    if (error) {
      console.error('Error saving BOM line:', error);
      return;
    }

    setSelectedComponent('');
    setQty('');
    setScrap('');

    fetchBOM(selectedParent);
  }

  return (
    <div>
      <h2>BOM Setup</h2>

      <select
        value={selectedParent}
        onChange={(e) => setSelectedParent(e.target.value)}
      >
        <option value="">Select Parent Item</option>
        {parentItems.map((item) => (
          <option key={item.id} value={item.id}>
            {item.item_code} — {item.description}
          </option>
        ))}
      </select>

      {selectedParent && (
        <>
          <h3>Add Component</h3>

          <select
            value={selectedComponent}
            onChange={(e) => setSelectedComponent(e.target.value)}
          >
            <option value="">Select Component Item</option>
            {components.map((item) => (
              <option key={item.id} value={item.id}>
                {item.item_code} — {item.description}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantity"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />

          <input
            type="number"
            placeholder="Scrap %"
            value={scrap}
            onChange={(e) => setScrap(e.target.value)}
          />

          <button onClick={saveBOMLine}>Add Component</button>

          <h3>Existing BOM</h3>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Component</th>
                <th>Qty</th>
                <th>Scrap %</th>
              </tr>
            </thead>
            <tbody>
              {bomLines.map((line) => {
                const comp = components.find(
                  (c) => c.id === line.component_item_id
                );
                return (
                  <tr key={line.id}>
                    <td>{comp ? `${comp.item_code} — ${comp.description}` : 'Unknown'}</td>
                    <td>{line.qty}</td>
                    <td>{line.scrap_percent}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default BOMSetup;