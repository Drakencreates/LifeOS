import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { useToast } from '../../context/ToastContext';
import eventService from '../../services/eventService';

const EMPTY_FORM = {
  title: '',
  description: '',
  eventDate: '',
  eventTime: '',
  location: '',
  categoryId: '',
  importance: 'Normal',
  visibility: 'Private'
};

export default function EventFormModal({ isOpen, onClose, onSaved, initialData, categories = [] }) {
  const toast = useToast();
  const isEdit = !!initialData;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const d = new Date(initialData.eventDate);
        setForm({
          title: initialData.title || '',
          description: initialData.description || '',
          eventDate: !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '',
          eventTime: !isNaN(d.getTime()) ? d.toTimeString().slice(0, 5) : '',
          location: initialData.location || '',
          categoryId: initialData.categoryId || '',
          importance: initialData.importance || 'Normal',
          visibility: initialData.visibility || 'Private'
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        setForm({ ...EMPTY_FORM, eventDate: today });
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
    if (!form.eventDate) e.eventDate = 'Date is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const dateStr = form.eventTime
        ? `${form.eventDate}T${form.eventTime}:00`
        : `${form.eventDate}T00:00:00`;
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        eventDate: new Date(dateStr).toISOString(),
        location: form.location.trim() || null,
        categoryId: form.categoryId || null,
        importance: form.importance,
        visibility: form.visibility
      };

      const saved = isEdit
        ? await eventService.updateEvent(initialData.id, payload)
        : await eventService.createEvent(payload);

      toast.success(isEdit ? 'Event updated successfully!' : 'Event created successfully!');
      if (onSaved) onSaved(saved, isEdit);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Life Event' : 'Add New Life Event'}
      description={isEdit ? 'Update the details for this life event.' : 'Log a milestone, achievement, or life moment.'}
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Event')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Event Title *"
          placeholder="e.g. Mastered Next.js, Started Job, Bought Home"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          error={errors.title}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Date *"
            type="date"
            value={form.eventDate}
            onChange={e => set('eventDate', e.target.value)}
            error={errors.eventDate}
          />
          <Input
            label="Time (optional)"
            type="time"
            value={form.eventTime}
            onChange={e => set('eventTime', e.target.value)}
          />
        </div>

        <Input
          label="Location"
          placeholder="e.g. San Francisco, CA or Remote"
          value={form.location}
          onChange={e => set('location', e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            value={form.categoryId}
            onChange={e => set('categoryId', e.target.value)}
            placeholder="— Select Category —"
            options={categories.map(c => ({ value: c.id, label: c.name }))}
          />
          <Select
            label="Importance"
            value={form.importance}
            onChange={e => set('importance', e.target.value)}
            options={['Normal', 'Important', 'Milestone']}
          />
        </div>

        <Select
          label="Visibility"
          value={form.visibility}
          onChange={e => set('visibility', e.target.value)}
          options={['Private', 'Public']}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">Description</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="What made this moment significant in your journey? Add details, thoughts, or reflections..."
            rows={3}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}
