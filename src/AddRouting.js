import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function AddRouting() {
  const [items, setItems] = useState([]);
  const [operations, setOperations] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [sequenceNo, setSequenceNo] = useState('');
  const [operationId, setOperationId] = useState('');
  const [standardTime, setStandardTime] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState('');
  const [routingList, setRoutingList] = useState([]);

  // Load items and operations
  useEffect(() => {
    async function loadData() {
      const { data: itemData } = await supabase
        .from('items')
        .select('*')
        .order('item_code', { ascending: true });

      const { data: opData } = await supabase
        .from('operations')
        .select('*')
        .order('name', { ascending: true });

      setItems(itemData || []);
      setOperations(opData || []);
    }

    loadData();
  }, []);

  // Load routing steps for selected item
  useEffect(() => {
    if (!selectedItem) return;

    async function loadRouting() {
      const { data } = await supabase
        .from('item_routing')
        .select(`
          id,
          sequence_no,
          standard_time_minutes,
          is_active,
          operations ( name )
        `)
        .eq('item_id', selectedItem)
        .order('sequence_no', { ascending: true });

      setRoutingList(data || []);
    }

    loadRouting();
  }, [selectedItem]);

  async function saveRoutingStep() {
    const { error } = await supabase
      .from('item_routing')
      .insert([{
        item_id: selectedItem,
        operation_id: operationId,
        sequence_no: sequenceNo,
        standard_time_minutes: standardTime,
        is_active: isActive
      }]);

    if (error) {
      setMessage('Error saving routing: ' + error.message);
    } else {
      setMessage('Routing step saved successfully!');
      setSequenceNo('');
      setOperationId('');
      setStandardTime('');
      setIsActive(true);

      // Reload routing list
    
        from('item_routing')
        .select(`
          id,
          sequence_no,
          standard_time_minutes,
          is_active,
          operations ( name )
        `)
        .eq('item_id', selectedItem)
        .order('sequence_no', { ascending: true });

      setRoutingList(data || []);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Add Routing</h1>

      <label>Select Item:</label>
      <select
        value={selectedItem}
        onChange={e => setSelectedItem(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      >
        <option value="">Select Item</option>
        {items.map(item => (
          <option key={item.id} value={item.id}>
            {item.item_code}
          </option>
        ))}
      </select>

      {selectedItem && (
        <>
          <h3>Add Routing Step</h3>

          <label>Sequence Number:</label>
          <input
            type="number"
            value={sequenceNo}
            onChange={e => setSequenceNo(e.target.value)}
            style={{ display: 'block', marginBottom: '10px' }}
          />

          <label>Operation:</label>
          <select
            value={operationId}
            onChange={e => setOperationId(e.target.value)}
            style={{ display: 'block', marginBottom: '10px' }}
          >
            <option value="">Select Operation</option>
            {operations.map(op => (
              <option key={op.id} value={op.id}>
                {op.name}
              </option>
            ))}
          </select>

          <label>Standard Time (minutes per unit):</label>
          <input
            type="number"
            value={standardTime}
            onChange={e => setStandardTime(e.target.value)}
            style={{ display: 'block', marginBottom: '10px' }}
          />

          <label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
            Active Step
          </label>

          <br /><br />

          <button onClick={saveRoutingStep}>Save Routing Step</button>

          {message && <p>{message}</p>}

          <h3>Routing Steps for This Item</h3>
          <ul>
            {routingList.map(step => (
              <li key={step.id}>
                Seq {step.sequence_no} — {step.operations?.name} — {step.standard_time_minutes} min
                {step.is_active ? '' : ' (inactive)'}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default AddRouting;