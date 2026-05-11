import React, { useEffect, useRef, useState } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/**
 * UserMenu Component
 * 
 * Dropdown menu displaying:
 * - User profile information (name, email, role)
 * - Profile link
 * - Settings link
 * - Logout action
 * 
 * Requirements: 4.6
 */
export const UserMenu: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always redirect to login, even if logout API call fails
      window.location.href = '/login';
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar className="h-8 w-8">
          <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
            <span className="text-sm font-medium">{getUserInitials()}</span>
          </div>
        </Avatar>
        <span className="hidden text-sm font-medium md:inline-block">
          {user.email.split('@')[0]}
        </span>
        <ChevronDown
          className={cn(
            'hidden h-4 w-4 transition-transform md:inline-block',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </Button>

      {isOpen && (
        <div 
          className="absolute right-0 top-12 z-50 w-64 rounded-md border bg-card shadow-lg"
          role="menu"
          aria-label="User menu options"
        >
          {/* User info */}
          <div className="p-4" role="presentation">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                  <span className="font-medium">{getUserInitials()}</span>
                </div>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.email}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatRole(user.role)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Menu items */}
          <div className="p-2" role="group">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => { setIsOpen(false); navigate('/profile'); }}
              role="menuitem"
            >
              <User className="mr-2 h-4 w-4" aria-hidden="true" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => { setIsOpen(false); navigate('/settings'); }}
              role="menuitem"
            >
              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
              Settings
            </Button>
          </div>

          <Separator />

          {/* Logout */}
          <div className="p-2" role="group">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
              role="menuitem"
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
