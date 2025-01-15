'use client';

import { useState } from 'react';
import { Menu, X, ChevronLeft } from 'lucide-react';
import FormFieldToolbox from './FormFieldToolbox';
import FormFieldEditor from './FormFieldEditor';
import FormFieldsList from './FormFieldsList';

export default function FormBuilder() {
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleAddField = (fieldType) => {
    const newField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      label: `New ${fieldType}`,
      required: false,
      options: fieldType === 'select' || fieldType === 'radio' ? ['Option 1'] : [],
      placeholder: '',
      validation: {}
    };

    setFormFields([...formFields, newField]);
    setSelectedField(newField);
  };

  const handleFieldUpdate = (fieldId, updates) => {
    console.log('Updating field:', fieldId, updates);
    
    setFormFields(prevFields => {
      const newFields = prevFields.map(field => {
        if (field.id === fieldId) {
          const updatedField = { ...field, ...updates };
          console.log('Updated field:', updatedField);
          return updatedField;
        }
        return field;
      });
      return newFields;
    });

    if (selectedField?.id === fieldId) {
      setSelectedField(prev => ({ ...prev, ...updates }));
    }
  };

  const handleDeleteField = (fieldId) => {
    setFormFields(formFields.filter(field => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleMoveField = (fieldId, direction) => {
    const index = formFields.findIndex(field => field.id === fieldId);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === formFields.length - 1)
    ) {
      return;
    }

    const newFields = [...formFields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFormFields(newFields);
  };

  const handleSaveForm = async () => {
    const formData = {
      title: formTitle,
      description: formDescription,
      fields: formFields
    };

    try {
      console.log('Form data to save:', formData);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50"> 
      <div className="flex h-[calc(100vh-4rem)]"> 
        {/* Left Sidebar Toggle Button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="fixed top-20 left-4 z-30 lg:hidden bg-white p-2 rounded-lg shadow-md text-gray-600 hover:text-gray-900"
        >
          {showSidebar ? <ChevronLeft className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Left Sidebar */}
        <div
          className={`${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:relative top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-20 overflow-y-auto`}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Form Fields</h2>
            <FormFieldToolbox onAddField={handleAddField} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto p-4 lg:p-6">
            {/* Form Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-3xl font-bold border-0 border-b-2 border-transparent focus:border-blue-600 focus:ring-0 bg-transparent px-0"
                placeholder="Form Title"
              />
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full mt-4 text-gray-600 border-0 border-b-2 border-transparent focus:border-blue-600 focus:ring-0 bg-transparent resize-none px-0"
                placeholder="Form Description"
                rows={2}
              />
            </div>

            {/* Form Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Form Preview */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-sm min-h-[600px] p-6">
                  <FormFieldsList
                    fields={formFields}
                    selectedFieldId={selectedField?.id}
                    onFieldSelect={setSelectedField}
                    onFieldDelete={handleDeleteField}
                    onMoveField={handleMoveField}
                  />
                </div>
              </div>

              {/* Field Editor */}
              <div className="lg:col-span-1">
                {selectedField ? (
                  <FormFieldEditor
                    key={selectedField.id}
                    field={selectedField}
                    onUpdate={(updates) => handleFieldUpdate(selectedField.id, updates)}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                    Select a field to edit its properties
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 pb-6 text-center">
              <button
                onClick={handleSaveForm}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Save Form
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {showSidebar && (
        <div
          className="lg:hidden fixed inset-0 top-16 bg-black bg-opacity-50 z-10"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}
