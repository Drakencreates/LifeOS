import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { LogOut, AlertCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogoutConfirm = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex">
      {/* Sidebar (Desktop and Mobile Drawer) */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <Navbar
          isCollapsed={isCollapsed}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sign Out of LifeOS"
        description="Are you sure you want to exit your personal operating session?"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={LogOut}
              onClick={handleLogoutConfirm}
            >
              Confirm Sign Out
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-2">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-500 leading-relaxed">
            Your life logs and timeline data are saved locally. You can sign right back in anytime to continue documenting your life journey.
          </div>
        </div>
      </Modal>
    </div>
  );
}
