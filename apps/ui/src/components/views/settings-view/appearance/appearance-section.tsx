import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Palette, Moon, Sun, Edit2 } from 'lucide-react';
import { darkThemes, lightThemes } from '@/config/theme-options';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { IconPicker } from '@/components/layout/project-switcher/components/icon-picker';
import type { Theme, Project } from '../shared/types';

interface AppearanceSectionProps {
  effectiveTheme: Theme;
  currentProject: Project | null;
  onThemeChange: (theme: Theme) => void;
}

export function AppearanceSection({
  effectiveTheme,
  currentProject,
  onThemeChange,
}: AppearanceSectionProps) {
  const { setProjectIcon, setProjectName } = useAppStore();
  const [activeTab, setActiveTab] = useState<'dark' | 'light'>('dark');
  const [editingProject, setEditingProject] = useState(false);
  const [projectName, setProjectNameLocal] = useState(currentProject?.name || '');
  const [projectIcon, setProjectIconLocal] = useState<string | null>(
    (currentProject as any)?.icon || null
  );

  const themesToShow = activeTab === 'dark' ? darkThemes : lightThemes;

  const handleSaveProjectDetails = () => {
    if (!currentProject) return;
    if (projectName.trim() !== currentProject.name) {
      setProjectName(currentProject.id, projectName.trim());
    }
    if (projectIcon !== (currentProject as any)?.icon) {
      setProjectIcon(currentProject.id, projectIcon);
    }
    setEditingProject(false);
  };

  const handleCancelEdit = () => {
    setProjectNameLocal(currentProject?.name || '');
    setProjectIconLocal((currentProject as any)?.icon || null);
    setEditingProject(false);
  };

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden',
        'border border-border/50',
        'bg-gradient-to-br from-card/90 via-card/70 to-card/80 backdrop-blur-xl',
        'shadow-sm shadow-black/5'
      )}
    >
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-transparent via-accent/5 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center border border-brand-500/20">
            <Palette className="w-5 h-5 text-brand-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Appearance</h2>
        </div>
        <p className="text-sm text-muted-foreground/80 ml-12">
          Customize the look and feel of your application.
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Project Details Section */}
        {currentProject && (
          <div className="space-y-4 pb-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-medium">Project Details</Label>
              {!editingProject && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingProject(true)}
                  className="h-8"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
              )}
            </div>

            {editingProject ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name-settings">Project Name</Label>
                  <Input
                    id="project-name-settings"
                    value={projectName}
                    onChange={(e) => setProjectNameLocal(e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project Icon</Label>
                  <IconPicker
                    selectedIcon={projectIcon}
                    onSelectIcon={setProjectIconLocal}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProjectDetails} disabled={!projectName.trim()}>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border/50">
                  <div className="text-sm">
                    <div className="font-medium text-foreground">{currentProject.name}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">{currentProject.path}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Theme Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-medium">
              Theme{' '}
              <span className="text-muted-foreground font-normal">
                {currentProject ? `(for ${currentProject.name})` : '(Global)'}
              </span>
            </Label>
            {/* Dark/Light Tabs */}
            <div className="flex gap-1 p-1 rounded-lg bg-accent/30">
              <button
                onClick={() => setActiveTab('dark')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                  activeTab === 'dark'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Moon className="w-3.5 h-3.5" />
                Dark
              </button>
              <button
                onClick={() => setActiveTab('light')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                  activeTab === 'light'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Sun className="w-3.5 h-3.5" />
                Light
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {themesToShow.map(({ value, label, Icon, testId, color }) => {
              const isActive = effectiveTheme === value;
              return (
                <button
                  key={value}
                  onClick={() => onThemeChange(value)}
                  className={cn(
                    'group flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl',
                    'text-sm font-medium transition-all duration-200 ease-out',
                    isActive
                      ? [
                          'bg-gradient-to-br from-brand-500/15 to-brand-600/10',
                          'border-2 border-brand-500/40',
                          'text-foreground',
                          'shadow-md shadow-brand-500/10',
                        ]
                      : [
                          'bg-accent/30 hover:bg-accent/50',
                          'border border-border/50 hover:border-border',
                          'text-muted-foreground hover:text-foreground',
                          'hover:shadow-sm',
                        ],
                    'hover:scale-[1.02] active:scale-[0.98]'
                  )}
                  data-testid={testId}
                >
                  <Icon className="w-4 h-4 transition-all duration-200" style={{ color }} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
