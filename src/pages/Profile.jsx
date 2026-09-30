import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Globe,
  Mail,
  Edit3,
  Award,
  BookOpen,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import useAuth from '../hooks/useAuth';
import useUserData from '../hooks/useUserData';

export default function Profile() {
  const { user } = useAuth();
  const { profile: userProfile, events, goals, memories, documents } = useUserData();

  const [profile, setProfile] = useState(() => ({
    ...userProfile,
    ...(user || {}),
    stats: {
      totalEvents: events.length,
      goalsCompleted: goals.filter(g => g.status === 'Completed').length,
      activeGoals: goals.filter(g => g.status === 'In Progress').length,
      memoriesCaptured: memories.length,
      documentsArchived: documents.length,
      lifeScore: userProfile.stats?.lifeScore || 0
    }
  }));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personal Profile"
        description="Your core digital identity, life credentials, and overall progress stats in LifeOS."
        breadcrumbs={['LifeOS', 'Profile']}
        actions={
          <Button
            icon={Edit3}
            variant="secondary"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </Button>
        }
      />

      {/* Hero Profile Header Card */}
      <Card className="overflow-hidden border border-slate-200">
        <div className="h-36 sm:h-44 bg-linear-to-r from-indigo-700 via-indigo-600 to-sky-600 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            <div className="flex items-end gap-4">
              <Avatar
                src={profile.avatar}
                name={profile.name}
                size="2xl"
                status="online"
                className="ring-4 ring-white"
              />
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {profile.name}
                  </h2>
                  <Badge variant="indigo" size="sm">
                    Verified Scholar
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {profile.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined {profile.joinedDate}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed mt-2">
            {profile.bio}
          </p>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{profile.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800">
              <Globe className="w-4 h-4 text-slate-400" />
              <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                {profile.website}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <span className="text-2xl sm:text-3xl font-bold text-indigo-600">
            {profile.stats.totalEvents}
          </span>
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mt-1">
            Timeline Events
          </span>
        </Card>

        <Card className="p-4 text-center">
          <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
            {profile.stats.goalsCompleted}
          </span>
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mt-1">
            Goals Accomplished
          </span>
        </Card>

        <Card className="p-4 text-center">
          <span className="text-2xl sm:text-3xl font-bold text-purple-600">
            {profile.stats.memoriesCaptured}
          </span>
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mt-1">
            Memories Saved
          </span>
        </Card>

        <Card className="p-4 text-center">
          <span className="text-2xl sm:text-3xl font-bold text-sky-600">
            {profile.stats.documentsArchived}
          </span>
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mt-1">
            Verified Records
          </span>
        </Card>
      </div>

      {/* Life Dimensions & Milestones Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Life Dimensions */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-900">Life Dimensions Mastery</h3>
            <Badge variant="indigo">Balanced</Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700">Computer Science & Algorithms</span>
                <span className="text-indigo-600 font-semibold">92%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700">Full Stack System Development</span>
                <span className="text-indigo-600 font-semibold">85%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700">International & Cultural Exposure</span>
                <span className="text-indigo-600 font-semibold">78%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700">Open Source & Hackathon Delivery</span>
                <span className="text-indigo-600 font-semibold">88%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Milestone Badges */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-900">Life Milestones Earned</h3>
            <Badge variant="amber">4 Badges</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">BTech Scholar</p>
                <p className="text-[11px] text-slate-500">Commenced 2022</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Global Exchange</p>
                <p className="text-[11px] text-slate-500">Indonesia 2023</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">150+ DSA Solved</p>
                <p className="text-[11px] text-slate-500">Algorithmic Ace</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Hackathon Finalist</p>
                <p className="text-[11px] text-slate-500">Bengaluru 2025</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Personal Profile"
        description="Update your public identity details and biography."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                alert('Phase 1 demo: Profile updated in memory.');
                setIsEditModalOpen(false);
              }}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
          <Input
            label="Headline / Role"
            value={profile.role}
            onChange={(e) => setProfile({ ...profile, role: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Location"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
            <Input
              label="Website"
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Biography</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
