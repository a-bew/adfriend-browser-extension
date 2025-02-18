import React, { useState } from 'react';
import { Reminder } from './ReminderManager';
import styles from './ReminderForm.module.scss';

interface ReminderFormProps {
  onSubmit: (reminder: Reminder) => void;
  onClose: (i:boolean) => void;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ onSubmit, onClose }) => {
  const [reminder, setReminder] = useState<Reminder>({
    id: Date.now(),
    text: '',
    time: '',
    frequency: 'once',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit(reminder);
    onClose(false);    
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3>Add New Reminder</h3>
      
      <div>
        <label>
          Reminder Text
          <input
            type="text"
            value={reminder.text}
            onChange={(e) => setReminder({ ...reminder, text: e.target.value })}
            placeholder="Enter your reminder text"
            required
          />
        </label>
      </div>
      
      <div>
        <label>
          Time
          <input
            type="time"
            value={reminder.time}
            onChange={(e) => setReminder({ ...reminder, time: e.target.value })}
            required
          />
        </label>
      </div>
      
      <div>
        <label>
          Frequency
          <select
            value={reminder.frequency}
            onChange={(e) => setReminder({ ...reminder, frequency: e.target.value as 'once' | 'daily' | 'weekly' })}
          >
            <option value="once">Once</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
      </div>

      <button type="submit" className={styles.submitButton}>
        Add Reminder
      </button>
    </form>
  );
};

export default ReminderForm;
