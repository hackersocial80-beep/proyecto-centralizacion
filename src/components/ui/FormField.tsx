import React from "react";

interface FormFieldProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children, className = "" }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-gray-600">
          {label}
        </label>
      )}
      {children}
    </div>
  );
};
