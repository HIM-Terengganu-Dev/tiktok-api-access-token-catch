
import React from 'react';
import type { StepCardProps } from '../types';

export const StepCard: React.FC<StepCardProps> = ({ stepNumber, title, children, id }) => {
  return (
    <div id={id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full">
      <div className="flex items-center mb-4">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm">
          {stepNumber}
        </span>
        <h2 className="ml-3 text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};
