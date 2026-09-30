import React, { useState } from 'react';
import {
  User,
  Palette,
  Bell,
  Shield,
  Save,
  Download,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';
import useAuth from '../hooks/useAuth';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [accentColor, setAccentColor] = useState('indigo');
  const [density, setDensity] = useState('comfortable');
  const [saveToast, setSaveToast] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [timezone, setTimezone] = useState('Asia/Kolkata (GMT+5:30)');

  // Notification toggles
  const [notifs, setNotifs] = useState({
    milestones: true,
    weeklyDigest: true,
    memoryReminders: true,
    browserAlerts: false
  });

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield }
  ];

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleExportData = () => {
    alert('Phase 1 demo: LifeOS package prepared for export (lifeos_backup_2025.json).');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences, visual appearance, notifications, and privacy options."
        breadcrumbs={['LifeOS', 'Settings']}
        actions={
          <Button icon={Save} onClick={handleSave}>
            Save Changes
          </Button>
        }
      />

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Preferences successfully saved to current session.</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Account Settings */}
      {activeTab === 'account' && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Personal Information</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details identify you across your timeline, exports, and profile.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Username Handle"
              value={user?.email ? '@' + user.email.split('@')[0] : ''}
              disabled
              helperText="Unique LifeOS handle for public timeline sharing"
            />
            <Select
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={[
                'Asia/Kolkata (GMT+5:30)',
                'Asia/Jakarta (GMT+7:00)',
                'America/New_York (EST)',
                'Europe/London (GMT)',
                'UTC'
              ]}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 block">Life Operating Start Year</span>
              <span className="text-xs text-slate-400">Baseline calendar year for timeline calculations</span>
            </div>
            <Badge variant="indigo">2022</Badge>
          </div>
        </Card>
      )}

      {/* Tab 2: Appearance Settings */}
      {activeTab === 'appearance' && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Theme & Aesthetics</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize the visual palette and spatial density of your LifeOS workstation.
            </p>
          </div>

          {/* Accent Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block uppercase tracking-wider">
              Primary SaaS Accent Color
            </label>
            <div className="flex items-center gap-3">
              {[
                { id: 'indigo', name: 'Indigo (Default)', bg: 'bg-indigo-600' },
                { id: 'blue', name: 'Sky Blue', bg: 'bg-blue-600' },
                { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-600' },
                { id: 'purple', name: 'Violet', bg: 'bg-purple-600' },
                { id: 'rose', name: 'Rose', bg: 'bg-rose-600' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAccentColor(c.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                    accentColor === c.id
                      ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${c.bg}`} />
                  <span className="hidden sm:inline">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Density Preference */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block uppercase tracking-wider">
              Interface Density
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                onClick={() => setDensity('comfortable')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  density === 'comfortable'
                    ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-semibold text-slate-900 block">Comfortable</span>
                <span className="text-[11px] text-slate-500">Generous margins and breathing room</span>
              </button>

              <button
                onClick={() => setDensity('compact')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  density === 'compact'
                    ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-semibold text-slate-900 block">Compact</span>
                <span className="text-[11px] text-slate-500">Dense information density</span>
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Notifications Settings */}
      {activeTab === 'notifications' && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Notification Preferences</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Decide when and how LifeOS reminds you of milestones, deadlines, and memories.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  Goal Milestones & Approaching Deadlines
                </span>
                <span className="text-xs text-slate-500">
                  Notify me when a goal target date is within 7 days
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifs.milestones}
                onChange={(e) => setNotifs({ ...notifs, milestones: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  Weekly Life Digest
                </span>
                <span className="text-xs text-slate-500">
                  Receive a consolidated Sunday summary of achievements and logs
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifs.weeklyDigest}
                onChange={(e) => setNotifs({ ...notifs, weeklyDigest: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  Memory "On This Day" Flashbacks
                </span>
                <span className="text-xs text-slate-500">
                  Surface past memories from exactly 1 or 2 years ago today
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifs.memoryReminders}
                onChange={(e) => setNotifs({ ...notifs, memoryReminders: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Privacy & Data Settings */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Data Portability & Export</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your data belongs to you. Download a copy of your entire life archive anytime.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Export LifeOS JSON Archive
                </span>
                <span className="text-xs text-slate-500">
                  Includes all events, goals, memories, document metadata, and notes
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={handleExportData}
              >
                Export JSON
              </Button>
            </div>
          </Card>

          <Card className="p-6 space-y-4 border-rose-200/80">
            <div>
              <h3 className="text-base font-semibold text-rose-700">Danger Zone</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Actions here permanently affect your local profile and stored preferences.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-rose-50/50 rounded-xl border border-rose-100">
              <div>
                <span className="text-xs font-semibold text-rose-900 block">
                  Reset Local Timeline Cache
                </span>
                <span className="text-xs text-rose-600/80">
                  Clear temporary cache memory and re-initialize mock baseline
                </span>
              </div>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => alert('Phase 1 demo: Local cache reset simulation.')}
              >
                Reset Cache
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
