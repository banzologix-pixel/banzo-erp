import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function UomSetup() {
  const [uoms, setUoms] = useState([]);
  const [newUom, setNewUom] = useState('');

  useEffect(() => {
    fetchUoms();
  }, []);

  async function fetchUoms() {
    const { data, error } = await supabase.from('uoms').select('*');
    if (!error) setUoms(data);
  }

  async function saveUom() {
    if (!newUom) return;

    await supabase.from('uoms').insert([{ code: newUom }]);
    setNewUom('');
    fetchUoms();
  }

  return (
    <div>
      <h2>UOM Setup</h2>

      <input
        type="text"
        placeholder="UOM Code (e.g. EA, KG)"
        value={newUom}
        onChange={(e) => setNewUom(e.target.value)}
      />
      <button onClick={saveUom}>Save UOM</button>

      <h3>Existing UOMs</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>UOM Code</th>
          </tr>
        </thead>
        <tbody>
          {uoms.map((uom) => (
            <tr key={uom.id}>
              <td>{uom.code}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UomSetup;