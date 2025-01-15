'use client';

import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

function SortableField({ field, isSelected, onSelect, onDelete, onMoveField }) {
  return (
    <div
      className={`group relative bg-white border rounded-lg p-4 mb-3 cursor-pointer ${
        isSelected ? 'border-blue-500 shadow-sm' : 'border-gray-200'
      }`}
      onClick={() => onSelect(field)}
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveField(field.id, 'up');
            }}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveField(field.id, 'down');
            }}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex-1">
          <div className="font-medium text-gray-900">{field.label}</div>
          <div className="text-sm text-gray-500">{field.type}</div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(field.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default function FormFieldsList({ fields, selectedFieldId, onFieldSelect, onFieldDelete, onMoveField }) {
  return (
    <div>
      {fields.map((field, index) => (
        <SortableField
          key={field.id}
          field={field}
          isSelected={field.id === selectedFieldId}
          onSelect={onFieldSelect}
          onDelete={onFieldDelete}
          onMoveField={(id, direction) => {
            if (direction === 'up' && index > 0) {
              onMoveField(id, 'up');
            } else if (direction === 'down' && index < fields.length - 1) {
              onMoveField(id, 'down');
            }
          }}
        />
      ))}
      {fields.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Click a field type from the toolbox to add it to your form
        </div>
      )}
    </div>
  );
}
