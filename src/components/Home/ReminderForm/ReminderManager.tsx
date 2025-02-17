import React, { useState } from 'react';
import ReminderForm from './ReminderForm';
import styles from './ReminderManager.module.scss';
import Modal from '@/components/ui/Modal/Modal';
import ReminderList from './ReminderList';

export interface Reminder {
  id: number;
  text: string;
  time: string;
  frequency: 'once' | 'daily' | 'weekly';
}

interface ReminderManagerProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Reminder) => void;
  onDeleteReminder: (id: number) => void;
}

const ReminderManager: React.FC<ReminderManagerProps> = ({
  reminders,
  onAddReminder,
  onDeleteReminder,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenReminderList, setIsModalOpenReminderList] = useState(false);

  return (
    <div >
      <div className={styles.section}>
        <h2>Reminders</h2>

        <div className={styles.reminderButtons}>
            <button
                onClick={() => setIsModalOpen(true)}
                className={styles.addButton}
            >
             Add Reminders
            </button>

            <button
            onClick={() => setIsModalOpenReminderList(true)}
            className={styles.addButton}
            >
            Show Reminders
            </button>

        </div>
      </div>

      <Modal isOpen={isModalOpenReminderList} onClose={() => setIsModalOpenReminderList(false)}>
          <ReminderList reminders={reminders} onDelete={onDeleteReminder} />
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ReminderForm 
          onSubmit={onAddReminder} 
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default ReminderManager;
