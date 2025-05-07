import React from 'react';
import { FaTrash } from 'react-icons/fa';
import styles from './styles.module.css';

export default function Field({ label, id, value, onChange, onDelete }) {
  return (
    <div className={styles.fieldContainer}>
      <label htmlFor={id} className={styles.fieldLabel}>{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        className={styles.inputField}
      />
      <button
        onClick={onDelete}
        className={styles.deleteButton}
      >
        <FaTrash className={styles.deleteIcon}/>
      </button>
    </div>
  );
}