import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import JobOperations from './JobOperations';

function DepartmentQueue({ department, onBack }) {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    loadDepartmentOps();
  }, [department]);

  async function loadDepartmentOps() {
    setLoading(true);

    const { data, error } = await supabase
      .from('job_operations')
      .select(`
        id,
        sequence,
        estimated_minutes,
        department,
        job_id,
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
      .eq('department', department)
      .order('sequence');

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

      // Sort by urgency
      opsWithTime.sort(
        (a, b) => a.time_left_hours - b.time_left_hours
      );

      setOperations(opsWithTime);
    }

    setLoading(false);
  }

  if (loading) return <div>Loading department queue...</div>;

  // If a job is selected, show the drill-down
  if (selectedJob) {
    return (
      <JobOperations
        jobId={selectedJob}
        onBack={() => setSelectedJob(null)}
      />
    );
  }

  return (
    <div>
      <h2>{department} Department Queue</h2>
      <button onClick={onBack}>Back</button>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Seq</th>
            <th>Operation</th>
            <th>Description</th>
            <th>Job Qty</th>
            <th>Est. Minutes</th>
            <th>Hours Left</th>
            <th>View Job</th>
          </tr>
        </thead>

        <tbody>
          {operations.map(op => (
            <tr key={op.id}>
              <td>{op.sequence}</td>
              <td>{op.item_operations?.operation_name}</td>
              <td>{op.item_operations?.description}</td>
              <td>{op.jobs?.quantity}</td>
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

              <td>
                <button onClick={() => setSelectedJob(op.job_id)}>
                  View Job
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentQueue;