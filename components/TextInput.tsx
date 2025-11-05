
import React from 'react';
import type { TextInputProps } from '../types';

export const TextInput: React.FC<TextInputProps> = ({ label, id, value, onChange, placeholder, type = 'text', description }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <input
          type={type}
          name={id}
          id={id}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>
      {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
    </div>
  );
};
