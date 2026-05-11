import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon, User, Bell, Shield, Database,
  Sun, Moon, Monitor, Globe, Clock, ChevronRight,
  Smartphone, Key, LogOut, AlertTriangle, CheckCircle2,
  Loader2, Lock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useToast } from '@/hooks/useToast';
import apiClient from '@/services/api';

// ─── Notification Preferences ───────────────────────────────────────────────

const NOTIF_STORAGE_KEY = 'notif-prefs';

type NotifChannel = 'email' | 'inApp';
type NotifCategory =
  | 'leave'
  | 'payroll'
  | 'attendance'
  | 'performance'
  | 'training'
  | 'announcements';

interface NotifPrefs {
  [category: string]: { [channel in NotifChannel]: boolean };
}

const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  leave:         { email: true,  inApp: true  },
  payroll:       { email: true,  inApp: true  },
  attendance:    { email: false, inApp: true  },
  performance:   { email: true,  inApp: true  },
  training:      { email: false, inApp: true  },
  announcements: { email: true,  inApp: true  },
};

const CATEGORY_LABELS: Record<NotifCategory, string> = {
  leave:         'Leave Requests & Approvals',
  payroll:       'Payroll & Salary',
  attendance:    'Attendance Alerts',
  performance:   'Performance Reviews',
  training:      'Training & Certifications',
  announcements: 'Company Announcements',
};

function loadNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    return raw ? { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(raw) } : DEFAULT_NOTIF_PREFS;
  } catch {
    return DEFAULT_NOTIF_PREFS;
  }
}

// ─── Notifications Tab ───────────────────────────────────────────────────────

const NotificationsTab: React.FC = () => {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<NotifPrefs>(loadNotifPrefs);
  const [saved, setSaved] = useState(false);

  const toggle = (category: string, channel: NotifChannel) => {
    setPrefs((prev) => ({
      ...prev,
      [category]: { ...prev[category], [channel]: !prev[category]?.[channel] },
    }));
    setSaved(false);
  };

  const save = () => {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(prefs));
    setSaved(true);
    toast({ type: 'success', message: 'Notification preferences saved' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Channels</CardTitle>
          <CardDescription>Choose how you want to be notified for each category.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Header row */}
          <div className="grid grid-cols-[1fr_80px_80px] gap-2 mb-3 px-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">Email</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">In-App</span>
          </div>

          <div className="space-y-1">
            {(Object.keys(CATEGORY_LABELS) as NotifCategory[]).map((cat, idx, arr) => (
              <React.Fragment key={cat}>
                <div className="grid grid-cols-[1fr_80px_80px] gap-2 items-center py-3 px-1">
                  <span className="text-sm font-medium">{CATEGORY_LABELS[cat]}</span>
                  <div className="flex justify-center">
                    <Switch
                      checked={prefs[cat]?.email ?? false}
                      onCheckedChange={() => toggle(cat, 'email')}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={prefs[cat]?.inApp ?? false}
                      onCheckedChange={() => toggle(cat, 'inApp')}
                    />
                  </div>
                </div>
                {idx < arr.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
        <Button className="ml-auto" onClick={save}>Save Preferences</Button>
      </div>
    </div>
  );
};

// ─── Security Tab ────────────────────────────────────────────────────────────

const SecurityTab: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();

  // MFA state
  const [mfaStep, setMfaStep] = useState<'idle' | 'setup' | 'verify'>('idle');
  const [mfaQr, setMfaQr] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  // Password change state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwLoading, setPwLoading] = useState(false);

  const startMfaSetup = async () => {
    setMfaLoading(true);
    try {
      const res = await apiClient.post('/auth/mfa/setup');
      setMfaQr(res.data?.qrCode ?? res.data?.data?.qrCode ?? '');
      setMfaSecret(res.data?.secret ?? res.data?.data?.secret ?? '');
      setMfaStep('setup');
    } catch (err: any) {
      toast({ type: 'error', message: err.response?.data?.message || 'Failed to start MFA setup' });
    } finally {
      setMfaLoading(false);
    }
  };

  const enableMfa = async () => {
    if (!mfaToken.trim()) return;
    setMfaLoading(true);
    try {
      await apiClient.post('/auth/mfa/enable', { token: mfaToken });
      updateUser({ mfaEnabled: true });
      setMfaStep('idle');
      setMfaToken('');
      toast({ type: 'success', message: 'MFA enabled successfully' });
    } catch (err: any) {
      toast({ type: 'error', message: err.response?.data?.message || 'Invalid verification code' });
    } finally {
      setMfaLoading(false);
    }
  };

  const disableMfa = async () => {
    if (!mfaToken.trim()) return;
    setMfaLoading(true);
    try {
      await apiClient.post('/auth/mfa/disable', { token: mfaToken });
      updateUser({ mfaEnabled: false });
      setMfaStep('idle');
      setMfaToken('');
      toast({ type: 'success', message: 'MFA disabled' });
    } catch (err: any) {
      toast({ type: 'error', message: err.response?.data?.message || 'Invalid verification code' });
    } finally {
      setMfaLoading(false);
    }
  };

  const validatePassword = () => {
    const errors: Record<string, string> = {};
    if (!pwForm.current) errors.current = 'Required';
    if (!pwForm.next) errors.next = 'Required';
    else if (pwForm.next.length < 8) errors.next = 'Minimum 8 characters';
    if (pwForm.next !== pwForm.confirm) errors.confirm = 'Passwords do not match';
    return errors;
  };

  const changePassword = async () => {
    const errors = validatePassword();
    if (Object.keys(errors).length) { setPwErrors(errors); return; }
    setPwErrors({});
    setPwLoading(true);
    try {
      await apiClient.post('/auth/password/change', {
        current_password: pwForm.current,
        new_password: pwForm.next,
      });
      setPwForm({ current: '', next: '', confirm: '' });
      toast({ type: 'success', message: 'Password changed successfully' });
    } catch (err: any) {
      toast({ type: 'error', message: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPwLoading(false);
    }
  };

  const lastLogin = user?.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Unknown';

  return (
    <div className="space-y-6">
      {/* MFA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="h-4 w-4" /> Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Authenticator App</p>
              <p className="text-xs text-muted-foreground">Use an app like Google Authenticator or Authy</p>
            </div>
            <Badge className={user?.mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}>
              {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          {/* Setup flow */}
          {!user?.mfaEnabled && mfaStep === 'idle' && (
            <Button variant="outline" size="sm" onClick={startMfaSetup} disabled={mfaLoading}>
              {mfaLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Set Up MFA
            </Button>
          )}

          {mfaStep === 'setup' && (
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">Scan this QR code with your authenticator app</p>
              {mfaQr ? (
                <img src={mfaQr} alt="MFA QR Code" className="h-40 w-40 border rounded" />
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Or enter this secret key manually:</p>
                  <code className="block rounded bg-muted px-2 py-1 text-xs font-mono break-all">{mfaSecret}</code>
                </div>
              )}
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="mfa-token" className="text-xs">Verification Code</Label>
                  <Input
                    id="mfa-token"
                    placeholder="6-digit code"
                    maxLength={6}
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <Button size="sm" onClick={enableMfa} disabled={mfaLoading || mfaToken.length < 6}>
                  {mfaLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Verify & Enable
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setMfaStep('idle'); setMfaToken(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Disable flow */}
          {user?.mfaEnabled && mfaStep === 'idle' && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/40 hover:bg-destructive/5"
              onClick={() => setMfaStep('verify')}
            >
              Disable MFA
            </Button>
          )}

          {user?.mfaEnabled && mfaStep === 'verify' && (
            <div className="space-y-3 rounded-lg border border-destructive/30 p-4">
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" /> Enter your authenticator code to confirm
              </p>
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="mfa-disable-token" className="text-xs">Verification Code</Label>
                  <Input
                    id="mfa-disable-token"
                    placeholder="6-digit code"
                    maxLength={6}
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={disableMfa}
                  disabled={mfaLoading || mfaToken.length < 6}
                >
                  {mfaLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Disable
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setMfaStep('idle'); setMfaToken(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-w-md">
          <div className="space-y-1">
            <Label htmlFor="cur-pw" className="text-xs">Current Password</Label>
            <Input
              id="cur-pw"
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
              placeholder="Enter current password"
            />
            {pwErrors.current && <p className="text-xs text-destructive">{pwErrors.current}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-pw" className="text-xs">New Password</Label>
            <Input
              id="new-pw"
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
              placeholder="At least 8 characters"
            />
            {pwErrors.next && <p className="text-xs text-destructive">{pwErrors.next}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="conf-pw" className="text-xs">Confirm New Password</Label>
            <Input
              id="conf-pw"
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="Repeat new password"
            />
            {pwErrors.confirm && <p className="text-xs text-destructive">{pwErrors.confirm}</p>}
          </div>
          <Button size="sm" onClick={changePassword} disabled={pwLoading}>
            {pwLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Active Session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4" /> Active Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Current Session</p>
              <p className="text-xs text-muted-foreground">Last login: {lastLogin}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── System Tab ──────────────────────────────────────────────────────────────

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
];

const SystemTab: React.FC = () => {
  const { theme, setTheme } = useUIStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [timezone, setTimezone] = useState(
    () => localStorage.getItem('app-timezone') || 'Asia/Kolkata'
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem('app-language') || 'en'
  );

  const saveSystemPrefs = () => {
    localStorage.setItem('app-timezone', timezone);
    localStorage.setItem('app-language', language);
    toast({ type: 'success', message: 'System preferences saved' });
  };

  const isAdmin = user?.role === 'super_admin' || user?.role === 'it_admin';

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="h-4 w-4" /> Appearance
          </CardTitle>
          <CardDescription>Choose how the application looks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { value: 'light', label: 'Light', Icon: Sun },
              { value: 'dark',  label: 'Dark',  Icon: Moon },
            ].map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value as 'light' | 'dark')}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  theme === value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <Icon className={`h-5 w-5 ${theme === value ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${theme === value ? 'text-primary' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {theme === value && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Locale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" /> Language & Region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="language" className="text-xs font-medium">Language</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="en">English</option>
                <option value="hi" disabled>Hindi (coming soon)</option>
                <option value="mr" disabled>Marathi (coming soon)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone" className="flex items-center gap-1 text-xs font-medium">
                <Clock className="h-3 w-3" /> Timezone
              </Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
          <Button size="sm" onClick={saveSystemPrefs}>Save Preferences</Button>
        </CardContent>
      </Card>

      {/* Admin-only system info */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" /> System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Application', value: 'Pharma ERP' },
                { label: 'Environment', value: import.meta.env.MODE ?? 'development' },
                { label: 'API Base', value: import.meta.env.VITE_API_URL ?? '/api/v1' },
                { label: 'Build', value: import.meta.env.VITE_APP_VERSION ?? '1.0.0' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 border-b last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono text-xs font-medium">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ─── Main Settings Page ──────────────────────────────────────────────────────

const Settings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and application preferences.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" /> System
          </TabsTrigger>
        </TabsList>

        {/* ── Profile Settings ── */}
        <TabsContent value="profile" className="mt-4">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => navigate('/profile')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Update Profile</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Edit your personal info, contact details, and profile photo
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications ── */}
        <TabsContent value="notifications" className="mt-4">
          <NotificationsTab />
        </TabsContent>

        {/* ── Security ── */}
        <TabsContent value="security" className="mt-4">
          <SecurityTab />
        </TabsContent>

        {/* ── System ── */}
        <TabsContent value="system" className="mt-4">
          <SystemTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
