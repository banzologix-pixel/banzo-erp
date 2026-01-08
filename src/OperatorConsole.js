import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function OperatorConsole() {
  const [department, setDepartment] = useState('');
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qualityOp, setQualityOp] = useState(null);
  const [qualityResult, setQualityResult] = useState('');
  const [qualityNotes, setQualityNotes] = useState('');

  // Load operations when department changes
  useEffect(() => {
    if (department) {
       loadOps();
  }
}, [department]);

  async function loadOps() {
    setLoading(true);

    const { data, error } = await supabase
      .from('item_operations')
      .select(`
  id,
  job_id,
  operation_id,
  estimated_minutes,
  department,
  status,
  actual_start,
  actual_end,
  jobs (
    quantity_ordered,
    due_date,
    items (item_code,
      transport_install_hours
    )
  ),
  operations (
    name
  )
`)
      

      .eq('department', department)
      .order('sequence_no', { ascending: true });
      
      console.log("Supabase data:", data);
  //console.log("Supabase error:", error.message);

      if (error) {
  console.error('Supabase error:', error.message || error);
}
{
      const opsWithTime = data.map(op => {
        const now = new Date();
        const due = new Date(op.jobs?.due_date);
        const hoursUntilDue = (due - now) / (1000 * 60 * 60);
        const operationHours = (op.estimated_minutes * op.jobs.quantity) / 60;
        const bufferHours = op.jobs.items?.transport_install_hours || 0;
        const timeLeft = hoursUntilDue - operationHours - bufferHours;
        const itemCode = op.jobs.items?.item_code || 'Unknown Item';

        return { ...op, time_left_hours: timeLeft };
      });

      opsWithTime.sort((a, b) => a.time_left_hours - b.time_left_hours);
      setOperations(opsWithTime);
    }

    setLoading(false);
  }

  // Start Work
  async function startWork(op) {
    await supabase
      .from('job_operations')
      .update({
        actual_start: new Date().toISOString(),
        status: 'In Progress'
      })
      .eq('id', op.id);

    loadOps();
  }

  // Finish Work → triggers quality modal
  async function finishWork(op) {
    const end = new Date();
    const start = new Date(op.actual_start);
    const diffMinutes = Math.round((end - start) / 60000);

    await supabase
      .from('job_operations')
      .update({
        actual_end: end.toISOString(),
        actual_minutes: diffMinutes,
        status: 'Awaiting Quality'
      })
      .eq('id', op.id);

    setQualityOp(op);
  }

  // Submit Quality
  async function submitQuality() {
    await supabase
      .from('job_operations')
      .update({
        quality_result: qualityResult,
        quality_notes: qualityNotes,
        status: 'Done'
      })
      .eq('id', qualityOp.id);

    setQualityOp(null);
    setQualityResult('');
    setQualityNotes('');
    loadOps();
    }

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: 'auto' }}>
      <h2>Operator Console</h2>

      {/* Department Selector */}
      <label>Department:</label>
      <select
        value={department}
        onChange={e => setDepartment(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 20 }}
      >
        <option value="">Select Department</option>
        <option value="Cutting">Cutting</option>
        <option value="Welding">Welding</option>
        <option value="Assembly">Assembly</option>
        <option value="Packing">Packing</option>
      </select>

      {loading && <div>Loading...</div>}

      {/* Operations List */}
      {operations.map(op => (
        <div
          key={op.id}
          style={{
            border: '1px solid #ccc',
            padding: 15,
            marginBottom: 15,
            borderRadius: 8,
            background:
              op.time_left_hours < 0
                ? '#ffdddd'
                : op.time_left_hours < 24
                ? '#fff4cc'
                : '#ddffdd'
          }}
        >
          <h3>{op.item_operations?.operation_name}</h3>
          <p><strong>Job:</strong> {op.job_id}</p>
          <p><strong>Seq:</strong> {op.sequence}</p>
          <p><strong>Hours Left:</strong> {op.time_left_hours.toFixed(1)}</p>
          <p><strong>Status:</strong> {op.status}</p>

          {op.status === 'Not Started' && (
            <button
              onClick={() => startWork(op)}
              style={{ width: '100%', padding: 12, background: '#007bff', color: 'white', border: 'none', borderRadius: 6 }}
            >
              START WORK
            </button>
          )}

          {op.status === 'In Progress' && (
            <button
              onClick={() => finishWork(op)}
              style={{ width: '100%', padding: 12, background: '#28a745', color: 'white', border: 'none', borderRadius: 6 }}
            >
              FINISH WORK
            </button>
          )}
        </div>
      ))}

      {/* Quality Modal */}
      {qualityOp && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
        >
          <div style={{ background: 'white', padding: 20, borderRadius: 8, width: '90%', maxWidth: 400 }}>
            <h3>Quality Check</h3>

            <label>Result:</label>
            <select
              value={qualityResult}
              onChange={e => setQualityResult(e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 10 }}
            >
              <option value="">Select</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
              <option value="Rework Needed">Rework Needed</option>
              <option value="Scrap">Scrap</option>
            </select>

            <label>Notes:</label>
            <textarea
              value={qualityNotes}
              onChange={e => setQualityNotes(e.target.value)}
              style={{ width: '100%', padding: 10, height: 80 }}
            />

            <button
              onClick={submitQuality}
              style={{ width: '100%', padding: 12, background: '#28a745', color: 'white', border: 'none', borderRadius: 6, marginTop: 10 }}
            >
              SUBMIT QUALITY
            </button>
          </div>
        </div>
      )}
           </div> //* closes main Operator Console container *
  );
} // closes OperatorConsole function

export default OperatorConsole;