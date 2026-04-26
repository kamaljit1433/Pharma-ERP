import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Settings as SettingsIcon, User, Bell, Shield, Database } from 'lucide-react';

const sections = [
  {
    icon: User,
    title: 'Profile Settings',
    description: 'Update your personal information and preferences.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Configure how and when you receive notifications.',
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Manage passwords, MFA, and active sessions.',
  },
  {
    icon: Database,
    title: 'System',
    description: 'System configuration and administrative settings.',
  },
];

const Settings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        Settings
      </h1>
      <p className="mt-1 text-sm text-gray-500">Manage your account and application preferences.</p>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {sections.map(({ icon: Icon, title, description }) => (
        <Card key={title} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className="rounded-lg bg-blue-50 p-2">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-base">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default Settings;
