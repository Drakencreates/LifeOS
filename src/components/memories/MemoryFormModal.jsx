import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useToast } from '../../context/ToastContext';
import memoryService from '../../services/memoryService';

const DEFAULT_MEMORY_PRESETS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
];

const EMPTY_FORM = {
  title: '',
  description: '',
  memoryDate: '',
  location: '',
  imageUrl: '',
  tags: ''
};

export default function MemoryFormModal({ isOpen, onClose, onSaved, initialData }) {
  const toast = useToast();
  const isEdit = !!initialData;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const d = new Date(initialData.memoryDate || initialData.date);
        const tagsStr = Array.isArray(initialData.tags)
          ? initialData.tags.join(', ')
          : initialData.tags || '';

        setForm({
          title: initialData.title || '',
          description: initialData.description || '',
          memoryDate: !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '',
          location: initialData.location || '',
          imageUrl: initialData.imageUrl || initialData.image || '',
          tags: tagsStr
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        setForm({
          ...EMPTY_FORM,
          memoryDate: today,
          imageUrl: DEFAULT_MEMORY_PRESETS[Math.floor(Math.random() * DEFAULT_MEMORY_PRESETS.length)]
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.memoryDate) e.memoryDate = 'Date is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        memoryDate: new Date(form.memoryDate).toISOString(),
        location: form.location.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        tags: form.tags.trim() || null
      };

      const saved = isEdit
        ? await memoryService.updateMemory(initialData.id, payload)
        : await memoryService.createMemory(payload);

      toast.success(isEdit ? 'Memory updated!' : 'Memory saved to vault!');
      if (onSaved) onSaved(saved, isEdit);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save memory.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Memory' : 'Capture New Memory'}
      description={isEdit ? 'Update your memory details.' : 'Preserve a story, photograph, and milestone moment in your vault.'}
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (isEdit ? 'Saving...' : 'Saving to Vault...') : (isEdit ? 'Save Changes' : 'Save Memory')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Memory Title *"
          placeholder="e.g. Graduation Day, Japan Trip, Hackathon Win"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          error={errors.title}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Date *"
            type="date"
            value={form.memoryDate}
            onChange={e => set('memoryDate', e.target.value)}
            error={errors.memoryDate}
          />
          <Input
            label="Location"
            placeholder="e.g. Tokyo, Japan or Campus Quad"
            value={form.location}
            onChange={e => set('location', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Image URL"
            placeholder="https://images.unsplash.com/..."
            value={form.imageUrl}
            onChange={e => set('imageUrl', e.target.value)}
          />
          {form.imageUrl && (
            <div className="mt-2 rounded-xl overflow-hidden h-28 w-full bg-slate-900 border border-slate-200">
              <img
                src={form.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_MEMORY_PRESETS[0];
                }}
              />
            </div>
          )}
          {/* Preset image suggestions */}
          <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">Presets:</span>
            {DEFAULT_MEMORY_PRESETS.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => set('imageUrl', url)}
                className="w-8 h-8 rounded-lg overflow-hidden border border-slate-300 hover:border-indigo-500 shrink-0 cursor-pointer transition-all"
              >
                <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Tags (comma separated)"
          placeholder="travel, friendship, milestone, tech"
          value={form.tags}
          onChange={e => set('tags', e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">Memory Story / Notes</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="What happened? Who were you with? What made this moment unforgettable?"
            rows={3}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}
