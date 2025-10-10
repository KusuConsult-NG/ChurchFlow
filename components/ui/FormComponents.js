// components/ui/FormComponents.js
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

// Input component with validation
export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className='block text-sm font-medium text-gray-700'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      <div className='relative'>
        <input
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300'
          } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          {...props}
        />

        {isPassword && (
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute inset-y-0 right-0 pr-3 flex items-center'
          >
            {showPassword ? (
              <EyeSlashIcon className='h-5 w-5 text-gray-400' />
            ) : (
              <EyeIcon className='h-5 w-5 text-gray-400' />
            )}
          </button>
        )}
      </div>

      {error && <p className='text-sm text-red-600'>{error}</p>}
    </div>
  );
};

// Textarea component
export const Textarea = ({
  label,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  rows = 3,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className='block text-sm font-medium text-gray-700'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300'
        }`}
        {...props}
      />

      {error && <p className='text-sm text-red-600'>{error}</p>}
    </div>
  );
};

// Select component
export const Select = ({
  label,
  value,
  onChange,
  options,
  error,
  placeholder = 'Select an option',
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className='block text-sm font-medium text-gray-700'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      <select
        value={value}
        onChange={onChange}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300'
        }`}
        {...props}
      >
        <option value=''>{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className='text-sm text-red-600'>{error}</p>}
    </div>
  );
};

// Checkbox component
export const Checkbox = ({
  label,
  checked,
  onChange,
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className='flex items-center'>
        <input
          type='checkbox'
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
            disabled ? 'cursor-not-allowed' : ''
          }`}
          {...props}
        />
        {label && (
          <label className='ml-2 block text-sm text-gray-900'>{label}</label>
        )}
      </div>

      {error && <p className='text-sm text-red-600'>{error}</p>}
    </div>
  );
};

// Radio group component
export const RadioGroup = ({
  label,
  value,
  onChange,
  options,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className='block text-sm font-medium text-gray-700'>
          {label}
        </label>
      )}

      <div className='space-y-2'>
        {options.map(option => (
          <div key={option.value} className='flex items-center'>
            <input
              type='radio'
              id={option.value}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
              {...props}
            />
            <label
              htmlFor={option.value}
              className='ml-2 block text-sm text-gray-900'
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>

      {error && <p className='text-sm text-red-600'>{error}</p>}
    </div>
  );
};

// File upload component
export const FileUpload = ({
  label,
  onChange,
  error,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  className = '',
  ...props
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = e => {
    const files = e.target.files;
    handleFiles(files);
  };

  const handleFiles = files => {
    setFileError('');

    if (files.length === 0) return;

    // Check file size
    for (const file of files) {
      if (file.size > maxSize) {
        setFileError(
          `File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`
        );
        return;
      }
    }

    onChange(files);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className='block text-sm font-medium text-gray-700'>
          {label}
        </label>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : error || fileError
              ? 'border-red-300'
              : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type='file'
          onChange={handleFileInput}
          accept={accept}
          multiple={multiple}
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
          {...props}
        />

        <div className='space-y-2'>
          <svg
            className='mx-auto h-12 w-12 text-gray-400'
            stroke='currentColor'
            fill='none'
            viewBox='0 0 48 48'
          >
            <path
              d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>

          <div className='text-sm text-gray-600'>
            <span className='font-medium text-blue-600 hover:text-blue-500'>
              Click to upload
            </span>{' '}
            or drag and drop
          </div>

          <p className='text-xs text-gray-500'>
            {accept ? `Accepted formats: ${accept}` : 'Any file type'}
            {multiple && ' (Multiple files allowed)'}
          </p>
        </div>
      </div>

      {(error || fileError) && (
        <p className='text-sm text-red-600'>{error || fileError}</p>
      )}
    </div>
  );
};

// Form validation hook
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }

    return '';
  };

  const handleChange = (fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));

    const error = validate(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleBlur = fieldName => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validate(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validationRules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    );

    return isValid;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0
  };
};



