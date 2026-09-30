import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { useToast } from '../../context/ToastContext';
import goalService from '../../services/goalService';

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'Personal Growth',
  startDate: '',
  targetDate: '',
  currentValue: 0,
  targetValue: 100,
  unit: '',
  priority: 'Medium',
  status: 'In Progress'
};

const CATEGORIES = [
  'Education',
  'Career',
  'Skills',
  'Health & Fitness',
  'Finance',
  'Personal Growth',
  'Projects'
];

export default function GoalFormModal({ isOpen, onClose, onSaved, initialData }) {
  const toast = useToast();
  const isEdit = !!initialData;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const startD = initialData.startDate ? new Date(initialData.startDate) : null;
        const targetD = initialData.targetDate ? new Date(initialData.targetDate) : null;

        setForm({
          title: initialData.title || '',
          description: initialData.description || '',
          category: initialData.category || 'Personal Growth',
          startDate: startD && !isNaN(startD.getTime()) ? startD.toISOString().split('T')[0] : '',
          targetDate: targetD && !isNaN(targetD.getTime()) ? targetD.toISOString().split('T')[0] : '',
          currentValue: initialData.currentValue !== undefined ? initialData.currentValue : 0,
          targetValue: initialData.targetValue !== undefined ? initialData.targetValue : 100,
          unit: initialData.unit || '',
          priority: initialData.priority || 'Medium',
          status: initialData.status || 'In Progress'
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        setForm({
          ...EMPTY_FORM,
          startDate: today
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
    if (!form.title.trim()) e.title = 'Goal title is required.';
    if (Number(form.targetValue) <= 0) e.targetValue = 'Target value must be greater than 0.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const cur = Number(form.currentValue) || 0;
      const tgt = Number(form.targetValue) || 100;
      const prog = tgt > 0 ? Math.min(100, Math.round((cur / tgt) * 100)) : 0;

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category || null,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : null,
        currentValue: cur,
        targetValue: tgt,
        progress: prog,
        unit: form.unit.trim() || null,
        priority: form.priority,
        status: form.status
      };

      const saved = isEdit
        ? await goalService.updateGoal(initialData.id, payload)
        : await goalService.createGoal(payload);

      toast.success(isEdit ? 'Goal updated!' : 'Goal created!');
      if (onSaved) onSaved(saved, isEdit);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save goal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Life Goal' : 'Create New Goal'}
      description={isEdit ? 'Update your progress and target dates.' : 'Define an ambition with measurable targets.'}
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Goal')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Goal Title *"
          placeholder="e.g. Master System Design, Read 24 Books, Run Half Marathon"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          error={errors.title}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            value={form.category}
            onChange={e => set('category', e.target.value)}
            options={CATEGORIES}
          />
          <Select
            label="Priority"
            value={form.priority}
            onChange={e => set('priority', e.target.value)}
            options={['Low', 'Medium', 'High']}
          />
        </div>

        {/* Measurable progress numbers */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
          <span className="text-xs font-semibold text-slate-700 block">
            Target Metrics & Current Progress
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            <Input
              label="Current Value"
              type="number"
              min="0"
              value={form.currentValue}
              onChange={e => set('currentValue', e.target.value)}
            />
            <Input
              label="Target Value *"
              type="number"
              min="1"
              value={form.targetValue}
              onChange={e => set('targetValue', e.target.value)}
              error={errors.targetValue}
            />
            <Input
              label="Unit (optional)"
              placeholder="e.g. problems, km, hrs"
              value={form.unit}
              onChange={e => set('unit', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={e => set('startDate', e.target.value)}
          />
          <Input
            label="Target Deadline"
            type="date"
            value={form.targetDate}
            onChange={e => set('targetDate', e.target.value)}
          />
        </div>

        <Select
          label="Status"
          value={form.status}
          onChange={e => set('status', e.target.value)}
          options={['Not Started', 'In Progress', 'Completed', 'Archived']}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">Goal Description / Strategy</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Why is this goal important? What is your action roadmap?"
            rows={3}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}
