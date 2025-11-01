import React, { useEffect, useState } from 'react';
import api from '../utils/api';

// Reusable form for create & update
function FabricForm({ initial = {}, onCancel, onSaved }) {
  const [name, setName] = useState(initial.name || '');
  const [description, setDescription] = useState(initial.description || '');
  const [price, setPrice] = useState(initial.price || '');
  const [fabricType, setFabricType] = useState(initial.fabricType || '');
  const [color, setColor] = useState(initial.color || '');
  const [inStock, setInStock] = useState(initial.inStock ?? true);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onFileChange = (e) => setFiles(Array.from(e.target.files || []));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('description', description);
      fd.append('price', price);
      fd.append('fabricType', fabricType);
      fd.append('color', color);
      fd.append('inStock', inStock);
      files.forEach((f) => fd.append('images', f));

      let res;
      if (initial._id) {
        res = await api.put(`/fabrics/${initial._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.post('/fabrics', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      onSaved(res.data.fabric || res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="text-red-600">{error}</div>}
      <input className="w-full border px-2 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="w-full border px-2 py-2" placeholder="Fabric type" value={fabricType} onChange={(e) => setFabricType(e.target.value)} />
      <input className="w-full border px-2 py-2" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} />
      <input className="w-full border px-2 py-2" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
      <textarea className="w-full border px-2 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In Stock</label>
      </div>
      <div>
        <label className="block text-sm font-medium">Images (you can add multiple)</label>
        <input type="file" multiple accept="image/*" onChange={onFileChange} />
        <div className="flex gap-2 mt-2">
          {files.map((f, i) => <div key={i} className="text-sm bg-gray-100 px-2 py-1 rounded">{f.name}</div>)}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const fetchFabrics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fabrics');
      const data = Array.isArray(res.data) ? res.data : res.data.fabrics || res.data;
      setFabrics(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load fabrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFabrics(); }, []);

  const onDelete = async (id) => {
    if (!confirm('Delete this fabric?')) return;
    try {
      await api.delete(`/fabrics/${id}`);
      setFabrics((s) => s.filter((f) => f._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const onSaved = (fabric) => {
    setFabrics((prev) => {
      const idx = prev.findIndex((p) => p._id === fabric._id);
      if (idx >= 0) {
        const copy = [...prev]; copy[idx] = fabric; return copy;
      }
      return [fabric, ...prev];
    });
    setEditing(null);
    setShowNew(false);
    try { window.dispatchEvent(new CustomEvent('fabric:created', { detail: fabric })); } catch (e) { /* ignore */ }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard — Fabrics</h1>
        <div className="flex gap-2">
          <button onClick={() => { setEditing(null); setShowNew(true); }} className="bg-green-600 text-white px-3 py-2 rounded">Add Fabric</button>
          <button onClick={fetchFabrics} className="px-3 py-2 border rounded">Refresh</button>
        </div>
      </div>

      {showNew && (
        <div className="mb-6 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Add new fabric</h2>
          <FabricForm initial={{}} onCancel={() => setShowNew(false)} onSaved={onSaved} />
        </div>
      )}

      {editing && (
        <div className="mb-6 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Edit fabric</h2>
          <FabricForm initial={editing} onCancel={() => setEditing(null)} onSaved={onSaved} />
        </div>
      )}

      {loading ? (
        <div>Loading fabrics...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fabrics.map((f) => (
            <div key={f._id} className="bg-white p-4 rounded shadow">
              <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center">
                {f.images && f.images[0] ? (
                  <img src={f.images[0]} alt={f.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-gray-400">No image</div>
                )}
              </div>
              <h3 className="font-semibold">{f.name}</h3>
              <div className="text-sm text-gray-600">{f.fabricType} • {f.color}</div>
              <div className="mt-2 font-medium">₹{f.price}</div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setEditing(f); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-3 py-1 border rounded">Edit</button>
                <button onClick={() => onDelete(f._id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
