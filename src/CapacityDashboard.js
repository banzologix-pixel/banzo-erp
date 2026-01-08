import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function CapacityDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCapacity() {
      setLoading(true);

      // 1) Fetch job_operations (assumes estimated_minutes is total for that job & op)
      const { data: jobOps, error: jobOpsError } = await supabase
        .from('job_operations')
        .select('job_id, operation_id, estimated_minutes');

      if (jobOpsError) {
        console.error('Error fetching job_operations:', jobOpsError);
        setLoading(false);
        return;
      }

      // 2) Fetch operations (must include department and daily capacity)
      const { data: operations, error: operationsError } = await supabase
        .from('operations')
        .select('id, name, department_id, daily_capacity_minutes');

      if (operationsError) {
        console.error('Error fetching operations:', operationsError);
        setLoading(false);
        return;
      }

      // 3) Fetch departments
      const { data: departments, error: departmentsError } = await supabase
        .from('departments')
        .select('id, name');

      if (departmentsError) {
        console.error('Error fetching departments:', departmentsError);
        setLoading(false);
        return;
      }

      // Lookups for joins
      const opById = new Map(operations.map(op => [op.id, op]));
      const deptById = new Map(departments.map(dept => [dept.id, dept]));

      // 4) Aggregate load per department (sum of estimated_minutes)
      const loadByDeptId = new Map();

      for (const jo of jobOps) {
        const op = opById.get(jo.operation_id);
        if (!op) continue;
        const deptId = op.department_id;
        if (!deptId) continue;

        const prev = loadByDeptId.get(deptId) || 0;
        loadByDeptId.set(deptId, prev + Number(jo.estimated_minutes || 0));
      }

      // 5) Build rows for the dashboard
      const result = [];

      for (const dept of departments) {
        const deptId = dept.id;

        // Sum capacity of all operations in this department
        const deptOps = operations.filter(op => op.department_id === deptId);
        const totalCapacity =
          deptOps.reduce(
            (sum, op) => sum + Number(op.daily_capacity_minutes || 0),
            0
          );

        const totalLoad = loadByDeptId.get(deptId) || 0;

        let status = 'OK';
        let color = 'green';

        if (totalCapacity === 0) {
          status = 'No capacity defined';
          color = 'gray';
        } else {
          const ratio = totalLoad / totalCapacity;
          if (ratio > 1) {
            status = 'Overloaded';
            color = 'red';
          } else if (ratio > 0.8) {
            status = 'Near capacity';
            color = 'orange';
          } else {
            status = 'Healthy';
            color = 'green';
          }
        }

        result.push({
          departmentName: dept.name,
          totalLoad,
          totalCapacity,
          status,
          color,
        });
      }

      setRows(result);
      setLoading(false);
    }

    loadCapacity();
  }, []);

  if (loading) {
    return <div>Loading capacity...</div>;
  }

  return (
    <div>
      <h2>Capacity Dashboard</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Department</th>
            <th>Total Load (minutes)</th>
            <th>Total Capacity (minutes)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.departmentName}>
              <td>{row.departmentName}</td>
              <td>{row.totalLoad}</td>
              <td>{row.totalCapacity}</td>
              <td style={{ color: row.color, fontWeight: 'bold' }}>
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CapacityDashboard;