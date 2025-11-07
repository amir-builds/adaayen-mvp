import React from "react";
import { Mail, Calendar, MapPin, Award, Briefcase, Languages } from "lucide-react";

const CreatorAbout = ({ creator }) => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Main Bio Column */}
      <div className="md:col-span-2 space-y-6">
        {/* Bio */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            About Me
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {creator.bio || "This creator hasn't added a bio yet."}
          </p>
        </div>

        {/* Experience/Portfolio */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" />
            Experience
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Textile Designer</h4>
                <p className="text-sm text-gray-500">Freelance</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(creator.createdAt).getFullYear()} - Present</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Skills & Expertise
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
              Textile Design
            </span>
            <span className="px-4 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium">
              Fashion Design
            </span>
            <span className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
              Pattern Making
            </span>
            <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium">
              Creative Direction
            </span>
            <span className="px-4 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium">
              Color Theory
            </span>
            <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
              Digital Design
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar Column */}
      <div className="space-y-6">
        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Info</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm text-gray-900 break-all">{creator.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Member Since</p>
                <p className="text-sm text-gray-900">
                  {new Date(creator.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Location</p>
                <p className="text-sm text-gray-900">Available Worldwide</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Languages className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Languages</p>
                <p className="text-sm text-gray-900">English</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Badge */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Verified Creator</h3>
          </div>
          <p className="text-sm text-gray-600">
            This creator has been verified and maintains high standards of quality and professionalism.
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-semibold text-gray-900">1 hour</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-sm font-semibold text-green-600">100%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">On Budget</span>
              <span className="text-sm font-semibold text-green-600">100%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">On Time</span>
              <span className="text-sm font-semibold text-green-600">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorAbout;
