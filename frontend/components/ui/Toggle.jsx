'use client';

import { Switch } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

export default function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  className
}) {
  return (
    <Switch.Group>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {label && (
            <Switch.Label className="text-sm font-medium text-gray-700">
              {label}
            </Switch.Label>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        <Switch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={twMerge(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:ring-offset-2',
            checked ? 'bg-[#f6405f]' : 'bg-gray-200',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <span
            className={twMerge(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              checked ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
}