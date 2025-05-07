"use client";

import React, { useState } from 'react';
import Field from './Field';
import { FaPlus } from 'react-icons/fa';

export default function FormPanel() {
  const [fields, setFields] = useState([
    { id: 'nombre', label: 'Nombre', value: '' },
    { id: 'edad', label: 'Edad', value: '' },
    { id: 'sexo', label: 'Sexo', value: '' },
    { id: 'estatura', label: 'Estatura', value: '' }
  ]);

  const updateField = (idx) => (e) => {
    const updated = [...fields];
    updated[idx].value = e.target.value;
    setFields(updated);
  };

  const deleteField = (idx) => () => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const addField = () => {
    const newId = `field_${Date.now()}`;
    setFields([...fields, { id: newId, label: 'Nuevo', value: '' }]);
  };

  return (
    <div className="flex-1 bg-gray-100 rounded-md p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-2">Formato</h2>
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
      <div className="my-6 border-t border-gray-300"></div>
      <button
        onClick={addField}
        className="mx-auto block w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-200"
      >
        <FaPlus className="text-gray-600" />
      </button>
    </div>
  );
}