import React from 'react';
import { X } from 'lucide-react';
import FabricDetailsContent from './FabricDetailsContent';

/**
 * FabricModal — modal wrapper around FabricDetailsContent.
 *
 * Props:
 *   fabric   {object|null}  The fabric to display. Pass null/undefined to hide.
 *   onClose  {function}     Called when the user closes the modal.
 */
export default function FabricModal({ fabric, onClose }) {
  if (!fabric) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Sticky header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">{fabric.name}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Shared product content */}
        <FabricDetailsContent fabric={fabric} onClose={onClose} />
      </div>
    </div>
  );
}