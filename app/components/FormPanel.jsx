"use client";

import React, { useState } from 'react';
import Field from './Field';
import { FaPlus, FaCheck } from 'react-icons/fa';
import styles from './styles.module.css';

export default function FormPanel() {
  const [fields, setFields] = useState([
    { id: 'nombre', label: 'Nombre', value: '' },
    { id: 'edad', label: 'Edad', value: '' },
    { id: 'sexo', label: 'Sexo', value: '' },
    { id: 'estatura', label: 'Estatura', value: '' }
  ]);
  const [newField, setNewField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("Vacío")


  const updateField = (idx) => (e) => {
    const updated = [...fields];
    updated[idx].value = e.target.value;
    setFields(updated);
  };

  const deleteField = (idx) => () => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const addField = () => {
    setNewField(true);
  };

  const saveField = () => {
    const newId = `field_${newFieldName}`;
    setFields([...fields, { id: newId, label: newFieldName, value: '' }]);
    setNewField(false);
    setNewFieldName("Vacío");
  };

  return (
    <div className={styles.formPanel}>
      <h2 className={styles.formTitle}>Formato</h2>
      {fields.map((f, i) => (
        <Field
          key={f.id}
          label={f.label}
          id={f.id}
          value={f.value}
          onChange={updateField(i)}
          onDelete={deleteField(i)}
        />
      ))}
      {newField ? (
        <div className={styles.postFormField}>
        <input placeholder="Nuevo campo" className={styles.newField} onChange={(e) => setNewFieldName(e.target.value)}></input>
        <button onClick={saveField} className={styles.saveButton}>
          <FaCheck className={styles.saveIcon} />
        </button>
        </div>
      ) : (
        <div className={styles.postFormField}>  
        <button
          onClick={addField}
          className="mx-auto block w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-200"
        >
          <FaPlus className="text-gray-600" />
        </button>
        <button
          className={styles.saveFormButton}
        >
          <p className='font-semibold'>Guardar</p>
        </button>
        </div>
      )}
    </div>
  );
}