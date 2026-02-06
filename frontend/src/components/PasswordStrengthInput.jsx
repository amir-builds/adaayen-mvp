import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const PasswordStrengthInput = ({ value, onChange, placeholder = "Password", className = "" }) => {
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    const checkRequirements = (password) => {
      setRequirements({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      });
    };

    checkRequirements(value);
  }, [value]);

  const RequirementItem = ({ met, text }) => (
    <div className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
      met ? 'text-green-600' : 'text-gray-500'
    }`}>
      {met ? (
        <Check size={16} className="text-green-500 bg-green-100 rounded-full p-0.5" />
      ) : (
        <X size={16} className="text-gray-400" />
      )}
      <span className={met ? 'line-through' : ''}>{text}</span>
    </div>
  );

  const allMet = Object.values(requirements).every(req => req);
  const progress = Object.values(requirements).filter(req => req).length;
  const progressPercentage = (progress / 5) * 100;

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="password"
          value={value}
          onChange={onChange}
          className={`w-full border px-3 py-2 rounded transition-colors duration-200 ${
            allMet ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : 
            value ? 'border-orange-300 focus:border-orange-500 focus:ring-orange-500' : 
            'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } ${className}`}
          placeholder={placeholder}
        />
        {allMet && (
          <Check 
            size={20} 
            className="absolute right-3 top-3 text-green-500" 
          />
        )}
      </div>

      {/* Progress Bar */}
      {value && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              progressPercentage === 100 ? 'bg-green-500' : 
              progressPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      )}

      {/* Requirements List */}
      {value && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Password Requirements</span>
            <span className={`text-sm font-medium ${
              allMet ? 'text-green-600' : 'text-gray-500'
            }`}>
              {progress}/5 {allMet ? '✓' : ''}
            </span>
          </div>
          
          <div className="space-y-1">
            <RequirementItem 
              met={requirements.length} 
              text="At least 8 characters" 
            />
            <RequirementItem 
              met={requirements.uppercase} 
              text="One uppercase letter (A-Z)" 
            />
            <RequirementItem 
              met={requirements.lowercase} 
              text="One lowercase letter (a-z)" 
            />
            <RequirementItem 
              met={requirements.number} 
              text="One number (0-9)" 
            />
            <RequirementItem 
              met={requirements.special} 
              text="One special character (!@#$%^&* etc.)" 
            />
          </div>

          {/* Strength Indicator */}
          <div className="mt-3 pt-2 border-t">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Strength:</span>
              <span className={`text-xs font-medium ${
                progressPercentage === 100 ? 'text-green-600' : 
                progressPercentage >= 80 ? 'text-yellow-600' : 
                progressPercentage >= 60 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {progressPercentage === 100 ? 'Very Strong' : 
                 progressPercentage >= 80 ? 'Strong' : 
                 progressPercentage >= 60 ? 'Medium' : 
                 progressPercentage >= 40 ? 'Weak' : 'Very Weak'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthInput;