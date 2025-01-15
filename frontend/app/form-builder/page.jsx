'use client';

import { useState } from 'react';
import FormBuilder from '@/components/FormBuilder/FormBuilder';

export default function FormBuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <FormBuilder />
        </div>
      </div>
    </div>
  );
}
