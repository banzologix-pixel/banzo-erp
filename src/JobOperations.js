import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function JobOperations({ jobId, onBack }) {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOperations();
  }, [jobId]);

  async function loadOperations() {
    setLoading(true);

    const { data, error } = await supabase
      .from('job_operations')
      .select(`
        id,
        sequence,
        estimated_minutes,
        department,
        item_operations (
          operation_name,
          description
        ),
        jobs (
          due_date,
          quantity,
          item (
            transport_install_hours
          )
        )
      `)
      .eq('job_id', jobId)
      .order('sequence');
if (!error) {

  const now = new Date();

  const opsWithTime = data.map(op => {
    const due = new Date(op.jobs?.due_date);

    const hoursUntilDue = (due - now) / (1000 * 60 * 60);

    const operationHours =
      (op.estimated_minutes * op.jobs.quantity) / 60;

    const bufferHours =
      op.jobs.item?.transport_install_hours || 0;

    const timeLeft =
      hoursUntilDue - operationHours - bufferHours;

    return { ...op, time_left_hours: timeLeft };
  });

  opsWithTime.sort(
    (a, b) => a.time_left_hours - b.time_left_hours
  );

  setOperations(opsWithTime);
}

    if (!error) {
      const now = new Date();

      const opsWithTime = data.map(op => {
        const due = new Date(op.jobs?.due_date);

        // 1. Hours until due date
        const hoursUntilDue = (due - now) / (1000 * 60 * 60);

        // 2. Operation time required (in hours)
        const operationHours =
          (op.estimated_minutes * op.jobs.quantity) / 60;

        // 3. Transport + installation buffer (in hours)
        const bufferHours =
          op.jobs.item?.transport_install_hours || 0;

        // Final calculation
        const timeLeft =
          hoursUntilDue - operationHours - bufferHours;

        return { ...op, time_left_hours: timeLeft };
      });

      // Sort by urgency (lowest hours left = highest priority)
      opsWithTime.sort(
        (a, b) => a.time_left_hours - b.time_left_hours
      );

      setOperations(opsWithTime);
    }

    setLoading(false);
  }

  if (loading) return <div>Loading operations...</div>;

  return (
    <div>
      <h2>Job Operations</h2>
      <button onClick={onBack}>Back to Job List</button>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Seq</th>
            <th>Operation</th>
            <th>Description</th>
            <th>Department</th>
            <th>Est. Minutes</th>
            <th>Hours Left</th>
          </tr>
        </thead>

        <tbody>
          {operations.map(op => (
            <tr key={op.id}>
              <td>{op.sequence}</td>
              <td>{op.item_operations?.operation_name}</td>
              <td>{op.item_operations?.description}</td>
              <td>{op.department}</td>
              <td>{op.estimated_minutes}</td>

              <td
                style={{
                  color:
                    op.time_left_hours < 0
                      ? 'red'
                      : op.time_left_hours < 24
                      ? 'orange'
                      : 'green'
                }}
              >
                {op.time_left_hours.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobOperations;