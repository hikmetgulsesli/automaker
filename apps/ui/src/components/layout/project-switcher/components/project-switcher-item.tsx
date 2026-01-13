import { Folder, LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/electron';

interface ProjectSwitcherItemProps {
  project: Project;
  isActive: boolean;
  onClick: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
}

export function ProjectSwitcherItem({
  project,
  isActive,
  onClick,
  onContextMenu,
}: ProjectSwitcherItemProps) {
  // Get the icon component from lucide-react
  const getIconComponent = (): LucideIcon => {
    if (project.icon && project.icon in LucideIcons) {
      return (LucideIcons as Record<string, LucideIcon>)[project.icon];
    }
    return Folder;
  };

  const IconComponent = getIconComponent();

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        'group w-full aspect-square rounded-xl flex items-center justify-center relative overflow-hidden',
        'transition-all duration-200 ease-out',
        isActive
          ? [
              // Active: Premium gradient with glow
              'bg-gradient-to-r from-brand-500/20 via-brand-500/15 to-brand-600/10',
              'border border-brand-500/30',
              'shadow-md shadow-brand-500/10',
            ]
          : [
              // Inactive: Subtle hover state
              'hover:bg-accent/50',
              'border border-transparent hover:border-border/40',
              'hover:shadow-sm',
            ],
        'hover:scale-105 active:scale-95'
      )}
      title={project.name}
      data-testid={`project-switcher-${project.id}`}
    >
      <IconComponent
        className={cn(
          'w-6 h-6 transition-all duration-200',
          isActive
            ? 'text-brand-500 drop-shadow-sm'
            : 'text-muted-foreground group-hover:text-brand-400 group-hover:scale-110'
        )}
      />

      {/* Tooltip on hover */}
      <span
        className={cn(
          'absolute left-full ml-3 px-2.5 py-1.5 rounded-lg',
          'bg-popover text-popover-foreground text-xs font-medium',
          'border border-border shadow-lg',
          'opacity-0 group-hover:opacity-100',
          'transition-all duration-200 whitespace-nowrap z-50',
          'translate-x-1 group-hover:translate-x-0 pointer-events-none'
        )}
      >
        {project.name}
      </span>
    </button>
  );
}
