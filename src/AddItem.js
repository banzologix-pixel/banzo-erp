import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function AddItem() {
  const [itemCode, setItemCode] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState('');
  const [uom, setUom] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [message, setMessage] = useState('');

  async function saveItem() {
    const { data, error } = await supabase
      .from('items')
      .insert([{
        item_code: itemCode,
        description,
        item_type: itemType,
        uom,
        is_active: isActive,
        status,
        Notes: notes,
        cost
      }]);

    if (error) {
      setMessage('Error saving item: ' + error.message);
    } else {
      setMessage('Item saved successfully!');
      setItemCode('');
      setDescription('');
      setItemType('');
      setUom('');
      setIsActive(true);
      setStatus('');
      setNotes('');
      setCost('');
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Add Item</h1>

      <label>Item Code:</label>
      <input
        type="text"
        value={itemCode}
        onChange={e => setItemCode(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Description:</label>
      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Item Type:</label>
      <input
        type="text"
        value={itemType}
        onChange={e => setItemType(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Unit of Measure (UOM):</label>
      <input
        type="text"
        value={uom}
        onChange={e => setUom(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Status:</label>
      <input
        type="text"
        value={status}
        onChange={e => setStatus(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Notes:</label>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '300px', height: '80px' }}
      />

      <label>Cost:</label>
      <input
        type="number"
        value={cost}
        onChange={e => setCost(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>
        <input
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
        />
        Active Item
      </label>

      <br /><br />

      <button onClick={saveItem}>Save Item</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default AddItem;