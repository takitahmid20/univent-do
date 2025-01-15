'use client';

import { Plus, X } from 'lucide-react';
import { useEffect } from 'react';

export default function FormFieldEditor({ field, onUpdate }) {
  // Debug log when component mounts or field changes
  useEffect(() => {
    console.log('FormFieldEditor received field:', field);
  }, [field]);

  const handleChange = (key, value) => {
    console.log('Handling change:', key, value); // Debug log
    onUpdate({ [key]: value });
  };

  const handleAddOption = () => {
    const newOptions = [...(field.options || []), `Option ${(field.options || []).length + 1}`];
    onUpdate({ options: newOptions });
  };

  const handleUpdateOption = (index, value) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const handleDeleteOption = (index) => {
    const newOptions = (field.options || []).filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="border-b pb-4">
        <h3 className="font-semibold text-gray-900">Field Properties</h3>
        <p className="text-sm text-gray-500 mt-1">Customize your form field</p>
      </div>
      
      <div className="space-y-6">
        {/* Label */}
        <div>
          <label htmlFor="field-label" className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            id="field-label"
            type="text"
            value={field.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
          />
        </div>

        {/* Placeholder */}
        {!['checkbox', 'radio', 'file'].includes(field.type) && (
          <div>
            <label htmlFor="field-placeholder" className="block text-sm font-medium text-gray-700 mb-1">
              Placeholder Text
            </label>
            <input
              id="field-placeholder"
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              placeholder="Enter placeholder text"
            />
          </div>
        )}

        {/* Required Field */}
        <div className="flex items-center space-x-3 pt-2">
          <input
            type="checkbox"
            id="required-field"
            checked={field.required || false}
            onChange={(e) => handleChange('required', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <label htmlFor="required-field" className="text-sm text-gray-700">
            Required field
          </label>
        </div>

        {/* Options for select, radio, checkbox */}
        {['select', 'radio', 'checkbox'].includes(field.type) && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Options
            </label>
            <div className="space-y-3">
              {(field.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleUpdateOption(index, e.target.value)}
                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => handleDeleteOption(index)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
                    title="Delete option"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddOption}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Add Option</span>
              </button>
            </div>
          </div>
        )}

        {/* Validation */}
        {field.type === 'text' && (
          <div>
            <label htmlFor="max-length" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Length
            </label>
            <input
              id="max-length"
              type="number"
              value={field.validation?.maxLength || ''}
              onChange={(e) => handleChange('validation', {
                ...field.validation,
                maxLength: e.target.value
              })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              min="0"
            />
          </div>
        )}

        {field.type === 'number' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="min-value" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Value
              </label>
              <input
                id="min-value"
                type="number"
                value={field.validation?.min || ''}
                onChange={(e) => handleChange('validation', {
                  ...field.validation,
                  min: e.target.value
                })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
            <div>
              <label htmlFor="max-value" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Value
              </label>
              <input
                id="max-value"
                type="number"
                value={field.validation?.max || ''}
                onChange={(e) => handleChange('validation', {
                  ...field.validation,
                  max: e.target.value
                })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
          </div>
        )}

        {field.type === 'file' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="allowed-types" className="block text-sm font-medium text-gray-700 mb-1">
                Allowed File Types
              </label>
              <input
                id="allowed-types"
                type="text"
                placeholder=".pdf, .doc, .docx"
                value={field.validation?.allowedTypes || ''}
                onChange={(e) => handleChange('validation', {
                  ...field.validation,
                  allowedTypes: e.target.value
                })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter file extensions separated by commas
              </p>
            </div>
            <div>
              <label htmlFor="max-size" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum File Size (MB)
              </label>
              <input
                id="max-size"
                type="number"
                value={field.validation?.maxSize || ''}
                onChange={(e) => handleChange('validation', {
                  ...field.validation,
                  maxSize: e.target.value
                })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                min="0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
