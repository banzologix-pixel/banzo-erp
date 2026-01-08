import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function ComponentSetup() {
  const [componentCode, setComponentCode] = useState('');
  const [description, setDescription] = useState('');
  const [uomId, setUomId] = useState('');
  const [componentTypeId, setComponentTypeId] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [uoms, setUoms] = useState([]);
  const [componentTypes, setComponentTypes] = useState([]);
  const [components, setComponents] = useState([]);

  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUoms();
    loadComponentTypes();
    loadComponents();
  }, []);

  async function loadUoms() {
    const { data, error } = await supabase
      .from('uom')
      .select('id, uom_code, description')
      .order('uom_code', { ascending: true });

    if (error) {
      console.error('Error loading UOMs:', error);
      setMessage('Error loading UOMs: ' + error.message);
    } else {
      console.log('Loaded UOMs:', data);
      setUoms(data || []);
    }
  }

  async function loadComponentTypes() {
    const { data, error } = await supabase
      .from('component_types')
      .select('id, type_code, description')
      .order('type_code', { ascending: true });

    if (error) {
      console.error('Error loading component types:', error);
      setMessage('Error loading component types: ' + error.message);
    } else {
      console.log('Loaded component types:', data);
      setComponentTypes(data || []);
    }
  }

  async function loadComponents() {
    const { data, error } = await supabase
      .from('components')
      .select(`
        id,
        component_code,
        description,
        is_active,
        uom_id,
        component_type_id,
        uom (uom_code),
        component_types (type_code)
      `)
      .order('component_code', { ascending: true });

    if (error) {
      console.error('Error loading components:', error);
      setMessage('Error loading components: ' + error.message);
    } else {
      console.log('Loaded components:', data);
      setComponents(data || []);
    }
  }

  async function saveComponent() {
    setMessage('');

    if (!componentCode || !description || !uomId || !componentTypeId) {
      setMessage('Please fill in all required fields.');
      return;
    }

    const payload = {
      component_code: componentCode,
      description,
      uom_id: uomId,
      component_type_id: componentTypeId,
      is_active: isActive
    };

    console.log('Saving component:', payload);

    const { error } = await supabase
      .from('components')
      .insert([payload]);

    if (error) {
      console.error('Error saving component:', error);
      setMessage('Error saving component: ' + error.message);
    } else {
      setMessage('Component saved successfully!');
      setComponentCode('');
      setDescription('');
      setUomId('');
      setComponentTypeId('');
      setIsActive(true);
      loadComponents();
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Component Setup</h1>

      <label>Component Code:</label>
      <input
        type="text"
        value={componentCode}
        onChange={e => setComponentCode(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '300px' }}
      />

      <label>Description:</label>
      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '300px' }}
      />

      <label>UOM:</label>
      <select
        value={uomId}
        onChange={e => setUomId(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '300px' }}
      >
        <option value="">Select UOM</option>
        {uoms.map(u => (
          <option key={u.id} value={u.id}>
            {u.uom_code} — {u.description}
          </option>
        ))}
      </select>

      <label>Component Type:</label>
      <select
        value={componentTypeId}
        onChange={e => setComponentTypeId(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '300px' }}
      >
        <option value="">Select Type</option>
        {componentTypes.map(t => (
          <option key={t.id} value={t.id}>
            {t.type_code} — {t.description}
          </option>
        ))}
      </select>

      <label>
        <input
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
        />
        Active
      </label>

      <br /><br />

      <button onClick={saveComponent} style={{ marginBottom: '10px' }}>
        Save Component
      </button>

      {message && <p>{message}</p>}

      <h3>Existing Components</h3>
      {components.length === 0 ? (
        <p>No components found.</p>
      ) : (
        <ul>
          {components.map(c => (
            <li key={c.id}>
              {c.component_code} — {c.description}  
              {' '}| UOM: {c.uom?.uom_code}  
              {' '}| Type: {c.component_types?.type_code}  
              {' '}| Active: {c.is_active ? 'Yes' : 'No'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ComponentSetup;