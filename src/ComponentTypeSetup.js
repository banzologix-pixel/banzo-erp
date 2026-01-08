import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function ComponentTypeSetup() {
  const [typeName, setTypeName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [componentTypes, setComponentTypes] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadComponentTypes();
  }, []);

  async function loadComponentTypes() {
    const { data, error } = await supabase
      .from('component_types')
      .select('id, type_code, description, is_active')
      .order('type_code', { ascending: true });

    if (error) {
      console.error('Error loading component types:', error);
      setMessage('Error loading component types: ' + error.message);
    } else {
      console.log('Loaded component types:', data);
      setComponentTypes(data || []);
    }
  }

  async function saveComponentType() {
    setMessage('');

    if (!typeName) {
      setMessage('Please enter a type name.');
      return;
    }

    const payload = {
      type_code: typeName.toUpperCase().replace(/\s+/g, '_'),
      description: typeName,
      is_active: isActive
    };

    console.log('Saving component type:', payload);

    const { error } = await supabase
      .from('component_types')
      .insert([payload]);

    if (error) {
      console.error('Error saving component type:', error);
      setMessage('Error saving component type: ' + error.message);
    } else {
      setMessage('Component type saved successfully!');
      setTypeName('');
      setIsActive(true);
      loadComponentTypes();
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Component Type Setup</h1>

      <label>Type Name:</label>
      <input
        type="text"
        value={typeName}
        onChange={e => setTypeName(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '300px' }}
      />

      <label>
        <input
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
        />
        Active
      </label>

      <br /><br />

      <button onClick={saveComponentType} style={{ marginBottom: '10px' }}>
        Save Component Type
      </button>

      {message && <p>{message}</p>}

      <h3>Existing Component Types</h3>
      {componentTypes.length === 0 ? (
        <p>No component types found.</p>
      ) : (
        <ul>
          {componentTypes.map(t => (
            <li key={t.id}>
              {t.type_code} — {t.description} {t.is_active ? '' : '(Inactive)'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ComponentTypeSetup;