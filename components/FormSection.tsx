
import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <fieldset className="space-y-4 border-t border-gray-700 pt-5">
      <legend className="text-lg font-semibold text-teal-400 -mt-8 px-2 bg-gray-800">{title}</legend>
      {children}
    </fieldset>
  );
};
