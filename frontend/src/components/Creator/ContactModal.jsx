import React, { useState } from "react";
import { Mail, Copy, X, CheckCircle } from "lucide-react";

const ContactModal = ({ email, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to copy email");
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Mail className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Contact Creator</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            You can reach this creator at:
          </p>

          {/* Email Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-mono text-sm text-gray-900 truncate">{email}</span>
            </div>
            
            <button
              onClick={copy}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0
                ${copied 
                  ? "bg-green-100 text-green-700" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }
              `}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <a
              href={`mailto:${email}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              <Mail className="w-4 h-4" />
              Open Email Client
            </a>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
