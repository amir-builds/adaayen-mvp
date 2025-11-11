import React from "react";
import { Link } from "react-router-dom";
import { Star, Layers, ShieldCheck, Images, Filter, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">About Adaayien</h1>
          <p className="mt-3 text-gray-600 max-w-3xl">
            Adaayien is a fabric-aware creative platform that helps independent creators
            showcase their work with trustworthy material provenance and human curation.
            We make it easy to link posts to fabrics, feature outstanding creations, and
            help visitors discover what truly matters: craft and authenticity.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/register"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700"
            >
              Become a Creator
            </Link>
            <Link
              to="/creators"
              className="inline-flex items-center px-5 py-2.5 rounded-full border border-purple-200 text-purple-700 font-medium hover:bg-purple-50"
            >
              Explore Creators
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900">Our Mission</h2>
            <p className="mt-2 text-gray-600">
              Empower creators to tell material-informed stories and connect with audiences
              through credible, fabric-linked posts—while giving admins the tools to curate
              quality work and uphold platform trust.
            </p>
          </div>
          <div className="p-6 border rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900">Our Vision</h2>
            <p className="mt-2 text-gray-600">
              A thriving ecosystem where craftsmanship is discoverable, provenance is clear,
              and curation highlights excellence—not just algorithms.
            </p>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900">What We Offer</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border rounded-xl">
              <div className="flex items-center gap-2 text-purple-700">
                <Layers size={20} />
                <span className="font-semibold">Fabric–Aware Posts</span>
              </div>
              <p className="mt-2 text-gray-600">
                Link your creations to specific fabrics for credible storytelling and
                richer discovery.
              </p>
            </div>
            <div className="p-6 bg-white border rounded-xl">
              <div className="flex items-center gap-2 text-purple-700">
                <Star size={20} />
                <span className="font-semibold">Featured Curation</span>
              </div>
              <p className="mt-2 text-gray-600">
                Admins elevate exemplary work with a clear featured signal—quality over
                hype.
              </p>
            </div>
            <div className="p-6 bg-white border rounded-xl">
              <div className="flex items-center gap-2 text-purple-700">
                <ShieldCheck size={20} />
                <span className="font-semibold">Role-Based Integrity</span>
              </div>
              <p className="mt-2 text-gray-600">
                Strong boundaries for creators, admins, and visitors—security and trust by
                design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-xl bg-white">
            <div className="flex items-center gap-2 text-purple-700"><Images size={20} /><span className="font-semibold">Creators</span></div>
            <p className="mt-2 text-gray-600">
              Register, upload images, and optionally link a fabric. Your post appears in feeds
              and can be considered for featuring.
            </p>
            <Link to="/register" className="inline-block mt-3 text-sm text-purple-700 font-medium hover:underline">Start posting →</Link>
          </div>
          <div className="p-6 border rounded-xl bg-white">
            <div className="flex items-center gap-2 text-purple-700"><Star size={20} /><span className="font-semibold">Admins</span></div>
            <p className="mt-2 text-gray-600">
              Review submissions, ensure attribution/quality, and toggle <em>Featured</em> to
              highlight the best work.
            </p>
            <Link to="/admin" className="inline-block mt-3 text-sm text-purple-700 font-medium hover:underline">Go to admin →</Link>
          </div>
          <div className="p-6 border rounded-xl bg-white">
            <div className="flex items-center gap-2 text-purple-700"><Filter size={20} /><span className="font-semibold">Visitors</span></div>
            <p className="mt-2 text-gray-600">
              Browse the feed, filter by fabric or featured, and discover credible, material‑informed
              stories.
            </p>
            <Link to="/" className="inline-block mt-3 text-sm text-purple-700 font-medium hover:underline">Explore feed →</Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900">Our Values</h2>
          <ul className="mt-4 grid md:grid-cols-2 gap-4 text-gray-700 list-disc list-inside">
            <li>Craft over clicks: elevate substance with transparent curation.</li>
            <li>Trust by default: validation, attribution, and clear roles.</li>
            <li>Open evolution: simple APIs and models ready for growth.</li>
            <li>Respect bandwidth: optimize media and prioritize performance.</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-6 border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Ready to share your next creation?</h3>
            <p className="text-gray-600">Join as a creator or explore featured posts to get inspired.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/register" className="px-5 py-2.5 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700">Join Now</Link>
            <Link to="/" className="px-5 py-2.5 rounded-full border border-purple-200 text-purple-700 font-medium hover:bg-purple-50">See Featured</Link>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500 flex items-center gap-2"><Users size={16}/> For media or partnerships, contact us at <a href="mailto:hello@adaayien.example" className="text-purple-700 hover:underline">hello@adaayien.example</a></p>
      </section>
    </div>
  );
}
