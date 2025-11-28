import React, { useState } from "react";
import ContactModal from "./ContactModal";
import { Mail, MapPin, Calendar, Briefcase, Star, Award, CheckCircle } from "lucide-react";

const CreatorHeader = ({ creator, postCount = 0 }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600"></div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 gap-4">
            {/* Avatar and Name */}
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={creator.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ccircle cx='64' cy='50' r='20' fill='%239ca3af'/%3E%3Cpath d='M44 90c0-11 9-20 20-20s20 9 20 20' fill='%239ca3af'/%3E%3C/svg%3E"}
                  alt={creator.name}
                  className="w-32 h-32 rounded-xl object-cover ring-4 ring-white shadow-lg"
                  loading="lazy"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {creator.name}
                  </h1>
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-gray-500 mt-1">Professional Creator</p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4" />
              Contact Me
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-xl font-bold text-gray-900">5.0</span>
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <span className="text-xl font-bold text-gray-900">{postCount}</span>
              </div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="w-5 h-5 text-pink-600" />
                <span className="text-xl font-bold text-gray-900">0</span>
              </div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-xl font-bold text-gray-900">
                  {new Date(creator.createdAt).getFullYear()}
                </span>
              </div>
              <div className="text-sm text-gray-600">Member Since</div>
            </div>
          </div>

          {/* Bio */}
          {creator.bio && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {creator.bio}
              </p>
            </div>
          )}

          {/* Skills/Tags */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
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
            </div>
          </div>
        </div>
      </div>

      {open && (
        <ContactModal email={creator.email} onClose={() => setOpen(false)} />
      )}
    </>
  );
};

export default CreatorHeader;
