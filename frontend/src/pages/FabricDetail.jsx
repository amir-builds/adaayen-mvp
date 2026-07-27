import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getFabricById } from '../utils/fabricAPI';
import FabricDetailsContent from '../components/FabricDetailsContent';

/**
 * FabricDetail — full-page view of a single fabric at /shop/:fabricId.
 *
 * Data strategy:
 *   1. If navigated from the grid, location.state.fabric holds the already-fetched
 *      object → renders instantly, zero additional network requests.
 *   2. If the URL is opened directly, refreshed, or shared, falls back to
 *      GET /api/fabrics/:fabricId.
 */
export default function FabricDetail() {
  const { fabricId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // Seed state from navigation if available; skip loading entirely in that case.
  const [fabric, setFabric] = useState(state?.fabric ?? null);
  const [loading, setLoading] = useState(!state?.fabric);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If we already have the fabric from navigation state, nothing to do.
    if (state?.fabric) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    getFabricById(fabricId)
      .then((data) => {
        if (!cancelled) setFabric(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [fabricId]); // re-fetch if fabricId changes (browser forward/back between detail pages)

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-6" />
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="h-16 bg-gray-100 border-b" />
              <div className="md:flex">
                <div className="md:w-3/5 p-6">
                  <div className="h-96 bg-gray-200 rounded-xl mb-4" />
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded-lg" />
                    ))}
                  </div>
                </div>
                <div className="md:w-2/5 p-6 border-l space-y-4">
                  <div className="h-10 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                  <div className="h-24 bg-gray-200 rounded" />
                  <div className="h-32 bg-gray-200 rounded" />
                  <div className="h-12 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error / not found ───────────────────────────────────────────────────
  if (error || !fabric) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-16 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Fabric not found</h1>
          <p className="text-gray-500 mb-6">
            This fabric may have been removed or the link is incorrect.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition"
          >
            <ArrowLeft size={18} />
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  // ── Full-page product view ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 font-medium mb-6 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </button>

        {/* Product card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Page header (mirrors modal sticky header style) */}
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900">{fabric.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{fabric.fabricType}</p>
          </div>

          {/* Shared product content — identical to what FabricModal renders */}
          <FabricDetailsContent fabric={fabric} />
        </div>
      </div>
    </div>
  );
}
