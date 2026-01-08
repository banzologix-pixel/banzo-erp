import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function CreateJob() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase.from('items').select('*');
      if (error) console.error('Error fetching items:', error);
      else setItems(data);
    }
    fetchItems();
  }, []);

  async function handleCreateJob() {
    if (!selectedItem) {
    console.error("No item selected — cannot create job.");
    return;
  }

    const { data, error } = await supabase.from('jobs').insert([
      {
        item_id: selectedItem,
        quantity_ordered: parseInt(quantity),
        due_date: dueDate,
        priority,
      },
    ])
    .select();

    if (error || !data || !data[0]) {
  console.error('Error creating job:', error || 'No data returned');
  return;
}

const jobId = data[0].id;

console.log('Insert response:', { data, error });

    const { data: bom, error: bomError } = await supabase
      .from('bom')
      .select('*')
      .eq('component_item_id', selectedItem);

    if (bomError) {
      console.error('Error fetching BOM:', bomError);
      return;
    }

    const materials = bom.map((entry) => ({
      job_id: jobId,
      material_id: entry.material_id,
      quantity: entry.quantity * parseInt(quantity),
    }));

    const { error: materialsError } = await supabase
      .from('job_materials')
      .insert(materials);

    if (materialsError) {
      console.error('Error inserting job materials:', materialsError);
    }

    const operations = bom.map((entry) => ({
      job_id: jobId,
      operation_id: entry.operation_id,
      duration: entry.duration * parseInt(quantity),
    }));

    const { error: operationsError } = await supabase
      .from('job_operations')
      .insert(operations);

    if (operationsError) {
      console.error('Error inserting job operations:', operationsError);
    }

    console.log('Job created with materials and operations:', jobId);
  }

  return (
    <div>
      <h2>Create Job</h2>

      <label>Item:</label>
      <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
        <option value="">Select an item</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>{item.item_code}</option>
        ))}
      </select>

      <br />

      <label>Quantity:</label>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <br />

      <label>Due Date:</label>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <br />

      <label>Priority:</label>
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <br /><br />

      <button onClick={handleCreateJob}>Create Job</button>
    </div>
  );
}

export default CreateJob;