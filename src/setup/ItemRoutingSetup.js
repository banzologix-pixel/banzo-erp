import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ItemRoutingSetup() {
  const [items, setItems] = useState([]);
  const [operations, setOperations] = useState([]);
  const [routing, setRouting] = useState([]);

  const [selectedItem, setSelectedItem] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('');
  const [sequence, setSequence] = useState('');
  const [stdTime, setStdTime] = useState('');
  const [setupTime, setSetupTime] = useState('');
  const [operators, setOperators] = useState('');

  useEffect(() => {
    fetchItems();
    fetchOperations();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      fetchRouting(selectedItem);
    } else {
      setRouting([]);
    }
  }, [selectedItem]);

  async function fetchItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .in('item_type', ['SA', 'WIP', 'FP']); // manufactured items only

    if (error) {
      console.error('Error fetching items:', error);
      return;
    }

    console.log('Fetched items:', data);
    setItems(data || []);
  }

  async function fetchOperations() {
    const { data, error } = await supabase.from('operations').select('*');

    if (error) {
      console.error('Error fetching operations:', error);
      return;
    }

    setOperations(data || []);
  }

  async function fetchRouting(itemId) {
    console.log('Fetching routing for item:', itemId);

    const { data, error } = await supabase
      .from('item_routing')
      .select('*')
      .eq('item_id', itemId)
      .order('sequence', { ascending: true });

    if (error) {
      console.error('Error fetching routing:', error);
      return;
    }

    setRouting(data || []);
  }

  async function saveRouting() {
    if (!selectedItem || !selectedOperation || !sequence || !stdTime) {
      console.warn('Missing required routing fields');
      return;
    }

    const { error } = await supabase.from('item_routing').insert([
      {
        item_id: selectedItem,
        operation_id: selectedOperation,
        sequence: Number(sequence),
        std_time_minutes: Number(stdTime),
        setup_time_minutes: Number(setupTime) || 0,
        operators: Number(operators) || 1,
      },
    ]);

    if (error) {
      console.error('Error saving routing:', error);
      return;
    }

    setSelectedOperation('');
    setSequence('');
    setStdTime('');
    setSetupTime('');
    setOperators('');

    fetchRouting(selectedItem);
  }

  return (
    <div>
      <h2>Item Routing Setup</h2>

      <select
        value={selectedItem}
        onChange={(e) => {
          console.log('Selected item:', e.target.value);
          setSelectedItem(e.target.value);
        }}
      >
        <option value="">Select Item</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.item_code} — {item.description}
          </option>
        ))}
      </select>

      {selectedItem && (
        <>
          <h3>Add Routing Step</h3>

          <select
            value={selectedOperation}
            onChange={(e) => setSelectedOperation(e.target.value)}
          >
            <option value="">Select Operation</option>
            {operations.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Sequence"
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
          />

          <input
            type="number"
            placeholder="Standard Time (minutes)"
            value={stdTime}
            onChange={(e) => setStdTime(e.target.value)}
          />

          <input
            type="number"
            placeholder="Setup Time (minutes)"
            value={setupTime}
            onChange={(e) => setSetupTime(e.target.value)}
          />

          <input
            type="number"
            placeholder="Operators"
            value={operators}
            onChange={(e) => setOperators(e.target.value)}
          />

          <button onClick={saveRouting}>Add Routing Step</button>

          <h3>Existing Routing</h3>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Sequence</th>
                <th>Operation</th>
                <th>Std Time (min)</th>
                <th>Setup Time</th>
                <th>Operators</th>
              </tr>
            </thead>
            <tbody>
              {routing.map((r) => {
                const op = operations.find((o) => o.id === r.operation_id);
                return (
                  <tr key={r.id}>
                    <td>{r.sequence}</td>
                    <td>{op ? op.name : 'Unknown'}</td>
                    <td>{r.std_time_minutes}</td>
                    <td>{r.setup_time_minutes}</td>
                    <td>{r.operators}</td>
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

export default ItemRoutingSetup;