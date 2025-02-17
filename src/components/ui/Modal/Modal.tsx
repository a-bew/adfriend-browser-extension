import React, { ReactNode } from 'react';
import { IoClose } from 'react-icons/io5';
import styles from './Modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>
          <IoClose size={20} />
        </button>
        <div>
        {children}

        </div>
      </div>
    </div>
  );
};

export default Modal;
