import React from 'react';
import { IoTimeOutline, IoTrashOutline } from 'react-icons/io5';
import { Reminder } from './ReminderManager';
import styles from './ReminderList.module.scss';

interface ReminderListProps {
  reminders: Reminder[];
  onDelete: (id: number) => void;
}

const ReminderList: React.FC<ReminderListProps> = ({ reminders, onDelete }) => {
  if (!reminders.length) {
    return <div className={styles.empty}>No reminders set.</div>;
  }

  return (
    <div className={styles.list}>
      {reminders.map((reminder) => (
        <div key={reminder.id} className={styles.item}>
          <div className={styles.content}>
            <IoTimeOutline className={styles.icon} />
            <div>
              <p>{reminder.text}</p>
              <span>{reminder.time} • {reminder.frequency}</span>
            </div>
          </div>
          <button onClick={() => onDelete(reminder.id)} className={styles.deleteButton}>
            <IoTrashOutline />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ReminderList;
