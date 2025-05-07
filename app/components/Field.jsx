import React from 'react';
import { FaTrash } from 'react-icons/fa';

export default function Field({ label, id, value, onChange, onDelete }) {
  return (
    <div className="relative flex items-center mt-4">
      <label htmlFor={id} className="w-16 text-sm text-gray-600">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
      />
      <button
        onClick={onDelete}
        className="absolute right-2 text-gray-400 hover:text-gray-600"
      >
        <FaTrash />
      </button>
    </div>
  );
}