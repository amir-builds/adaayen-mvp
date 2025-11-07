import React from "react";
import { Grid, User, Award } from "lucide-react";

const CreatorTabs = ({ active = "posts", onChange }) => {
  const tabs = [
    { id: "posts", label: "Portfolio", icon: Grid },
    { id: "about", label: "About", icon: User },
  ];

  return (
    <div className="border-b border-gray-200 bg-white rounded-t-xl">
      <div className="flex gap-1 px-2 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 font-medium rounded-t-lg transition-all
                ${isActive 
                  ? "bg-white text-purple-600 border-b-2 border-purple-600" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CreatorTabs;
