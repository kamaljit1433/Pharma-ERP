/**
 * MainLayout Example
 * 
 * This file demonstrates how to use the MainLayout component.
 * It's not part of the production code but serves as documentation.
 */

import React from 'react';
import { MainLayout } from './MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUIStore } from '@/store/uiStore';

export const MainLayoutExample: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <MainLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>MainLayout Component Example</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This is an example of the MainLayout component. The layout includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>A responsive sidebar that collapses on mobile devices</li>
              <li>A header section for navigation and user controls</li>
              <li>A main content area (this section)</li>
              <li>Automatic handling of different screen sizes</li>
            </ul>

            <div className="pt-4">
              <p className="mb-2 font-medium">Current Sidebar State:</p>
              <p className="text-sm text-muted-foreground mb-4">
                Sidebar is currently: <strong>{sidebarOpen ? 'Open' : 'Closed'}</strong>
              </p>
              <Button onClick={toggleSidebar}>
                Toggle Sidebar
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="mb-2 font-medium">Responsive Breakpoints:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>📱 Mobile: &lt; 768px - Sidebar overlays content</li>
                <li>📱 Tablet: 768px - 1024px - Sidebar can be toggled</li>
                <li>💻 Desktop: &gt; 1024px - Sidebar is visible by default</li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <p className="mb-2 font-medium">Try it out:</p>
              <p className="text-sm text-muted-foreground">
                Resize your browser window to see how the layout adapts to different screen sizes.
                On mobile, the sidebar will overlay the content with a backdrop.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample Content Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is a sample content card to demonstrate how content flows within the MainLayout.
              The main content area is scrollable and responsive.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Another Content Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Multiple cards can be stacked vertically. The layout handles overflow with scrolling.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MainLayoutExample;
