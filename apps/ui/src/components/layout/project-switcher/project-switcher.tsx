import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { ProjectSwitcherItem } from './components/project-switcher-item';
import { ProjectContextMenu } from './components/project-context-menu';
import type { Project } from '@/lib/electron';

export function ProjectSwitcher() {
  const navigate = useNavigate();
  const { projects, currentProject, setCurrentProject } = useAppStore();
  const [contextMenuProject, setContextMenuProject] = useState<Project | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(
    null
  );

  const handleContextMenu = (project: Project, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenuProject(project);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenuProject(null);
    setContextMenuPosition(null);
  };

  const handleProjectClick = (project: Project) => {
    setCurrentProject(project);
    // Navigate to board view when switching projects
    navigate({ to: '/board' });
  };

  const handleNewProject = () => {
    // Navigate to dashboard where users can create new projects
    navigate({ to: '/dashboard' });
  };

  return (
    <>
      <aside
        className={cn(
          'flex-shrink-0 flex flex-col w-16 z-50 relative',
          // Glass morphism background with gradient
          'bg-gradient-to-b from-sidebar/95 via-sidebar/85 to-sidebar/90 backdrop-blur-2xl',
          // Premium border with subtle glow
          'border-r border-border/60 shadow-[1px_0_20px_-5px_rgba(0,0,0,0.1)]'
        )}
        data-testid="project-switcher"
      >
        {/* Projects List */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-2">
          {projects.map((project) => (
            <ProjectSwitcherItem
              key={project.id}
              project={project}
              isActive={currentProject?.id === project.id}
              onClick={() => handleProjectClick(project)}
              onContextMenu={(e) => handleContextMenu(project, e)}
            />
          ))}
        </div>

        {/* Add Project Button */}
        <div className="p-2 border-t border-border/40">
          <button
            onClick={handleNewProject}
            className={cn(
              'w-full aspect-square rounded-xl flex items-center justify-center',
              'transition-all duration-200 ease-out',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-accent/50 border border-transparent hover:border-border/40',
              'hover:shadow-sm hover:scale-105 active:scale-95'
            )}
            title="New Project"
            data-testid="new-project-button"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Context Menu */}
      {contextMenuProject && contextMenuPosition && (
        <ProjectContextMenu
          project={contextMenuProject}
          position={contextMenuPosition}
          onClose={handleCloseContextMenu}
        />
      )}
    </>
  );
}
