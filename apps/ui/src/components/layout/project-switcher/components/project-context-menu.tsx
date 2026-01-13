import { useEffect, useRef, useState } from 'react';
import { Edit2, Trash2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import type { Project } from '@/lib/electron';
import { EditProjectDialog } from './edit-project-dialog';

interface ProjectContextMenuProps {
  project: Project;
  position: { x: number; y: number };
  onClose: () => void;
}

export function ProjectContextMenu({ project, position, onClose }: ProjectContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { moveProjectToTrash } = useAppStore();
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleEdit = () => {
    setShowEditDialog(true);
    onClose();
  };

  const handleRemove = () => {
    if (confirm(`Move "${project.name}" to trash?`)) {
      moveProjectToTrash(project.id);
    }
    onClose();
  };

  return (
    <>
      <div
        ref={menuRef}
        className={cn(
          'fixed z-[100] min-w-48 rounded-lg',
          'bg-popover text-popover-foreground',
          'border border-border shadow-lg',
          'animate-in fade-in zoom-in-95 duration-100'
        )}
        style={{
          top: position.y,
          left: position.x,
        }}
        data-testid="project-context-menu"
      >
        <div className="p-1">
          <button
            onClick={handleEdit}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-md',
              'text-sm font-medium text-left',
              'hover:bg-accent transition-colors',
              'focus:outline-none focus:bg-accent'
            )}
            data-testid="edit-project-button"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Name & Icon</span>
          </button>

          <button
            onClick={handleRemove}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-md',
              'text-sm font-medium text-left',
              'text-destructive hover:bg-destructive/10',
              'transition-colors',
              'focus:outline-none focus:bg-destructive/10'
            )}
            data-testid="remove-project-button"
          >
            <Trash2 className="w-4 h-4" />
            <span>Move to Trash</span>
          </button>
        </div>
      </div>

      {showEditDialog && (
        <EditProjectDialog
          project={project}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </>
  );
}
