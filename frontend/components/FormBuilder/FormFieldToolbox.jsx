'use client';

import {
  Type,
  AlignLeft,
  Hash,
  Mail,
  Phone,
  List,
  CheckSquare,
  Circle,
  Calendar,
  Upload,
  Link,
  Map,
  Clock
} from 'lucide-react';

const fieldTypes = [
  { type: 'text', label: 'Short Text', icon: Type },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'select', label: 'Dropdown', icon: List },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'radio', label: 'Radio Group', icon: Circle },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'time', label: 'Time', icon: Clock },
  { type: 'file', label: 'File Upload', icon: Upload },
  { type: 'url', label: 'Website URL', icon: Link },
  { type: 'address', label: 'Address', icon: Map }
];

export default function FormFieldToolbox({ onAddField }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Form Fields</h3>
      <div className="space-y-2">
        {fieldTypes.map((field) => {
          const Icon = field.icon;
          return (
            <button
              key={field.type}
              onClick={() => onAddField(field.type)}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors"
            >
              <Icon className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700">{field.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
