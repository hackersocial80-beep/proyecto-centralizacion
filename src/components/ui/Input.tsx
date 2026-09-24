import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const Input = ({
  label,
  error,
  required,
  helperText,
  className = '',
  ...props
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        className={`w-full rounded-lg border ${
          error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-[#5cb89a] focus:ring-[#5cb89a]/20'
        } bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 ${className}`}
        {...props}
      />
      {error ? (
        <span className="text-[11px] text-red-500 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-[11px] text-gray-400">{helperText}</span>
      ) : null}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const Select = ({
  label,
  error,
  required,
  helperText,
  className = '',
  ...props
}: SelectProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <select
        className={`w-full rounded-lg border ${
          error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-[#5cb89a] focus:ring-[#5cb89a]/20'
        } bg-white px-3 py-2 text-sm text-gray-800 transition-all focus:outline-none focus:ring-2 ${className}`}
        {...props}
      />
      {error ? (
        <span className="text-[11px] text-red-500 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-[11px] text-gray-400">{helperText}</span>
      ) : null}
    </div>
  );
};
