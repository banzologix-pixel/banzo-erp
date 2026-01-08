import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function UomSetup() {
  const [uomCode, setUomCode] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState('');

  const [uoms, setUoms] = useState([]);

  useEffect(() => {
    loadUoms();
  }, []);

  async function loadUoms() {
    const { data, error } = await supabase
      .from('uom')
      .select('*')
      .order('uom_code', { ascending: true });

    if (!error) setUoms(data);
  }

  async function saveUom() {
    if (!uomCode.trim() || !description.trim()) {
      setMessage('Please fill in all required fields.');
      return;
    }

    const payload = {
      uom_code: uomCode.trim(),
      description: description.trim(),
      is_active: isActive
    };

    const { error } = await supabase.from('uom').insert([payload]);

    if (error) {
      setMessage('Error saving UOM: ' + error.message);
    } else {
      setMessage('UOM saved successfully!');
      setUomCode('');
      setDescription('');
      setIsActive(true);
      loadUoms();
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>UOM Setup</h1>

      <label>UOM Code:</label>
      <input
        type="text"
        value={uomCode}
        onChange={e => setUomCode(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Description:</label>
      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>
        <input
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
        />
        Active
      </label>

      <br />
      <button onClick={saveUom}>Save UOM</button>

      {message && <p>{message}</p>}

      <h3>Existing UOMs</h3>
      <ul>
        {uoms.map(u => (
          <li key={u.id}>
            {u.uom_code} — {u.description}
            {u.is_active ? '' : ' (Inactive)'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UomSetup;