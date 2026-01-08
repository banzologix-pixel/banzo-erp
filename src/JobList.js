import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import JobOperations from './JobOperations';

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);

    const { data, error } = await supabase
  .from('jobs')
  .select(`
    id,
    quantity,
    due_date,
    status,
    item:items ( item_code, description, 
    production_minutes, 
    transport_install_hours )
  `)
  .order('due_date');

    if (!error) {

    // ⭐ INSERT THIS BLOCK RIGHT HERE ⭐
    const now = new Date();

    const jobsWithTime = data.map(job => {
      const due = new Date(job.due_date);

      // 1. Hours until due date
      const hoursUntilDue = (due - now) / (1000 * 60 * 60);

      // 2. Total production time required (in hours)
      const productionHours =
        (job.item.production_minutes * job.quantity) / 60;

      // 3. Transport + installation buffer (in hours)
      const bufferHours = job.item.transport_install_hours || 0;

      // Final calculation
      const timeLeft = hoursUntilDue - productionHours - bufferHours;

      return { ...job, time_left_hours: timeLeft };
    });

    // Sort by urgency
    jobsWithTime.sort((a, b) => a.time_left_hours - b.time_left_hours);

    // Save the sorted, enriched jobs
    setJobs(jobsWithTime);
  }

  setLoading(false);
}

  async function updateStatus(jobId, newStatus) {
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId);

    if (!error) loadJobs();
  }

  if (loading) return <div>Loading jobs...</div>;

return (
  <div>
    {selectedJob ? (
      <JobOperations 
        jobId={selectedJob} 
        onBack={() => setSelectedJob(null)} 
      />
    ) : (
      <>
        <h2>Job List / Status Board</h2>

        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Update</th>
              <th>View</th>
              <th>Left</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map(job => (
              <tr key={job.id}>
                <td>{job.item?.item_code}</td>
                <td>{job.item?.description}</td>
                <td>{job.quantity}</td>
                <td>{job.due_date}</td>
                <td>{job.status}</td>

                <td>
                  <select
                    value={job.status}
                    onChange={(e) => updateStatus(job.id, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>

                <td>
                  <button onClick={() => setSelectedJob(job.id)}>
                    View Ops
                  </button>
                </td>
                <td 
                style={{
    color:
      job.time_left_hours < 0 ? 'red' :
      job.time_left_hours < 24 ? 'orange' :
      'green'
  }}
>
  {job.time_left_hours.toFixed(1)}
</td>


              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}
  </div>
);
}

export default JobList;