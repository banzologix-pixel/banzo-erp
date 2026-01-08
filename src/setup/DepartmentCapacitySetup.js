import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function DepartmentSetup() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    setLoading(true);
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading departments:', error);
      setLoading(false);
      return;
    }

    setDepartments(data);
    setLoading(false);
  }

  async function updateDepartment(dep) {
    const netMinutes =
      dep.shift_minutes - dep.break_minutes - dep.meeting_minutes;

    const dailyCapacity = dep.operators * netMinutes;

    const { error } = await supabase
      .from('departments')
      .update({
        operators: dep.operators,
        shift_minutes: dep.shift_minutes,
        break_minutes: dep.break_minutes,
        meeting_minutes: dep.meeting_minutes,
        daily_capacity_minutes: dailyCapacity,
      })
      .eq('id', dep.id);

    if (error) {
      console.error('Error updating department:', error);
      return;
    }

    loadDepartments();
  }

 async function saveDepartmentCapacity(dep) {
  const netMinutes =
    dep.shift_minutes - dep.break_minutes - dep.meeting_minutes;

  const dailyCapacity = dep.operators * netMinutes;

  const effectiveFrom =
    dep.effective_from || new Date().toISOString().split('T')[0]; // fallback to today

  const { data, error } = await supabase
    .from('department_capacity')
    .upsert([
      {
        department_id: dep.id,
        planned_operators: dep.operators,
        effective_from: effectiveFrom,
        daily_capacity_minutes: dailyCapacity,
      },
    ], {
      onConflict: ['department_id', 'effective_from'],
    });

  if (error) {
    console.error("Error saving department capacity:", error);
    return;
  }

  console.log("Capacity saved:", data);
}

  if (loading) return <div>Loading departments...</div>;

  return (
    <div>
      <h2>Department Capacity Setup</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Department</th>
            <th>Operators</th>
            <th>Shift (min)</th>
            <th>Breaks (min)</th>
            <th>Meetings (min)</th>
            <th>Daily Capacity</th>
            <th>Save</th>
          </tr>
        </thead>

        <tbody>
          {departments.map((dep) => (
            <tr key={dep.id}>
              <td>{dep.name}</td>

              <td>
                <input
                  type="number"
                  value={dep.operators || 0}
                  onChange={(e) =>
                    setDepartments((prev) =>
                      prev.map((d) =>
                        d.id === dep.id
                          ? { ...d, operators: Number(e.target.value) }
                          : d
                      )
                    )
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={dep.shift_minutes || 0}
                  onChange={(e) =>
                    setDepartments((prev) =>
                      prev.map((d) =>
                        d.id === dep.id
                          ? { ...d, shift_minutes: Number(e.target.value) }
                          : d
                      )
                    )
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={dep.break_minutes || 0}
                  onChange={(e) =>
                    setDepartments((prev) =>
                      prev.map((d) =>
                        d.id === dep.id
                          ? { ...d, break_minutes: Number(e.target.value) }
                          : d
                      )
                    )
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={dep.meeting_minutes || 0}
                  onChange={(e) =>
                    setDepartments((prev) =>
                      prev.map((d) =>
                        d.id === dep.id
                          ? { ...d, meeting_minutes: Number(e.target.value) }
                          : d
                      )
                    )
                  }
                />
              </td>

              <td>{dep.daily_capacity_minutes || 0}</td>

              <td>
                <button onClick={() => {
  updateDepartment(dep);
  saveDepartmentCapacity(dep);
}}>
  Save
</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentSetup;