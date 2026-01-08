import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function AddDepartment() {
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [breakMinutes, setBreakMinutes] = useState('');
  const [meetingMinutes, setMeetingMinutes] = useState('');
  const [shiftMinutes, setShiftMinutes] = useState('');
  const [operators, setOperators] = useState('');
  const [dailyCapacityMinutes, setDailyCapacityMinutes] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
  const breakVal = parseInt(breakMinutes) || 0;
  const meetingVal = parseInt(meetingMinutes) || 0;
  const shiftVal = parseInt(shiftMinutes) || 0;
  const ops = parseInt(operators) || 0;

  const net = shiftVal - breakVal - meetingVal;
  const capacity = net > 0 ? net * ops : 0;

  setDailyCapacityMinutes(capacity);
}, [breakMinutes, meetingMinutes, shiftMinutes, operators]);

  async function saveDepartment() {
    const { error } = await supabase
      .from('departments')
      .insert([{
        name,
        is_active: isActive,
        break_minutes: breakMinutes,
        meeting_minutes: meetingMinutes,
        shift_minutes: shiftMinutes,
        daily_capacity_minutes: dailyCapacityMinutes,
        operators
      }]);

    if (error) {
      setMessage('Error saving department: ' + error.message);
    } else {
      setMessage('Department saved successfully!');
      setName('');
      setIsActive(true);
      setBreakMinutes('');
      setMeetingMinutes('');
      setShiftMinutes('');
      setDailyCapacityMinutes('');
      setOperators('');
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Add Department</h1>

      <label>Department Name:</label>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Break Minutes:</label>
      <input
        type="number"
        value={breakMinutes}
        onChange={e => setBreakMinutes(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Meeting Minutes:</label>
      <input
        type="number"
        value={meetingMinutes}
        onChange={e => setMeetingMinutes(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Shift Minutes:</label>
      <input
        type="number"
        value={shiftMinutes}
        onChange={e => setShiftMinutes(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Operators:</label>
      <input
        type="number"
        value={operators}
        onChange={e => setOperators(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Daily Capacity Minutes (calculated):</label>
      <input
        type="number"
        value={dailyCapacityMinutes}
        readOnly
        style={{ display: 'block', marginBottom: '10px', backgroundColor: '#f0f0f0' }}
      />

      <label>
        <input
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
        />
        Active Department
      </label>

      <br /><br />

      <button onClick={saveDepartment}>Save Department</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default AddDepartment;