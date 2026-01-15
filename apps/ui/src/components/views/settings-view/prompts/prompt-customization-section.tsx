import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquareText,
  Bot,
  KanbanSquare,
  Sparkles,
  RotateCcw,
  Info,
  AlertTriangle,
  GitCommitHorizontal,
  Type,
  CheckCircle,
  Lightbulb,
  FileCode,
  FileText,
  Wand2,
  Cog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PromptCustomization, CustomPrompt } from '@automaker/types';
import {
  DEFAULT_AUTO_MODE_PROMPTS,
  DEFAULT_AGENT_PROMPTS,
  DEFAULT_BACKLOG_PLAN_PROMPTS,
  DEFAULT_ENHANCEMENT_PROMPTS,
  DEFAULT_COMMIT_MESSAGE_PROMPTS,
  DEFAULT_TITLE_GENERATION_PROMPTS,
  DEFAULT_ISSUE_VALIDATION_PROMPTS,
  DEFAULT_IDEATION_PROMPTS,
  DEFAULT_APP_SPEC_PROMPTS,
  DEFAULT_CONTEXT_DESCRIPTION_PROMPTS,
  DEFAULT_SUGGESTIONS_PROMPTS,
  DEFAULT_TASK_EXECUTION_PROMPTS,
} from '@automaker/prompts';

// =============================================================================
// Types
// =============================================================================

interface PromptCustomizationSectionProps {
  promptCustomization?: PromptCustomization;
  onPromptCustomizationChange: (customization: PromptCustomization) => void;
}

interface PromptFieldProps {
  label: string;
  description: string;
  defaultValue: string;
  customValue?: CustomPrompt;
  onCustomValueChange: (value: CustomPrompt | undefined) => void;
  critical?: boolean;
}

/** Configuration for a single prompt field */
interface PromptFieldConfig {
  key: string;
  label: string;
  description: string;
  defaultValue: string;
  critical?: boolean;
}

/** Banner type for tabs */
type BannerType = 'info' | 'warning';

interface BannerConfig {
  type: BannerType;
  title: string;
  description: string;
}

/** Configuration for a tab with prompt fields */
interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  title: string;
  category: keyof PromptCustomization;
  banner?: BannerConfig;
  fields: PromptFieldConfig[];
  /** For tabs with grouped sections (like Auto Mode) */
  sections?: {
    title?: string;
    banner?: BannerConfig;
    fields: PromptFieldConfig[];
  }[];
}

// =============================================================================
// Tab Configuration
// =============================================================================

const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'auto-mode',
    label: 'Auto Mode',
    icon: Bot,
    title: 'Auto Mode Prompts',
    category: 'autoMode',
    banner: {
      type: 'info',
      title: 'Planning Mode Markers',
      description:
        'Planning prompts use special markers like [PLAN_GENERATED] and [SPEC_GENERATED] to control the Auto Mode workflow. These markers must be preserved for proper functionality.',
    },
    fields: [
      {
        key: 'planningLite',
        label: 'Planning: Lite Mode',
        description: 'Quick planning outline without approval requirement',
        defaultValue: DEFAULT_AUTO_MODE_PROMPTS.planningLite,
        critical: true,
      },
      {
        key: 'planningLiteWithApproval',
        label: 'Planning: Lite with Approval',
        description: 'Planning outline that waits for user approval',
        defaultValue: DEFAULT_AUTO_MODE_PROMPTS.planningLiteWithApproval,
        critical: true,
      },
      {
        key: 'planningSpec',
        label: 'Planning: Spec Mode',
        description: 'Detailed specification with task breakdown',
        defaultValue: DEFAULT_AUTO_MODE_PROMPTS.planningSpec,
        critical: true,
      },
      {
        key: 'planningFull',
        label: 'Planning: Full SDD Mode',
        description: 'Comprehensive Software Design Document with phased implementation',
        defaultValue: DEFAULT_AUTO_MODE_PROMPTS.planningFull,
        critical: true,
      },
    ],
    sections: [
      {
        title: 'Template Prompts',
        banner: {
          type: 'info',
          title: 'Template Variables',
          description:
            'Template prompts use Handlebars syntax for variable substitution. Available variables include {{featureId}}, {{title}}, {{description}}, etc.',
        },
        fields: [
          {
            key: 'featurePromptTemplate',
            label: 'Feature Prompt Template',
            description:
              'Template for building feature implementation prompts. Variables: featureId, title, description, spec, imagePaths, dependencies, verificationInstructions',
            defaultValue: DEFAULT_AUTO_MODE_PROMPTS.featurePromptTemplate,
          },
          {
            key: 'followUpPromptTemplate',
            label: 'Follow-up Prompt Template',
            description:
              'Template for follow-up prompts when resuming work. Variables: featurePrompt, previousContext, followUpInstructions',
            defaultValue: DEFAULT_AUTO_MODE_PROMPTS.followUpPromptTemplate,
          },
          {
            key: 'continuationPromptTemplate',
            label: 'Continuation Prompt Template',
            description:
              'Template for continuation prompts. Variables: featurePrompt, previousContext',
            defaultValue: DEFAULT_AUTO_MODE_PROMPTS.continuationPromptTemplate,
          },
          {
            key: 'pipelineStepPromptTemplate',
            label: 'Pipeline Step Prompt Template',
            description:
              'Template for pipeline step execution prompts. Variables: stepName, featurePrompt, previousContext, stepInstructions',
            defaultValue: DEFAULT_AUTO_MODE_PROMPTS.pipelineStepPromptTemplate,
          },
        ],
      },
    ],
  },
  {
    id: 'agent',
    label: 'Agent',
    icon: MessageSquareText,
    title: 'Agent Runner Prompts',
    category: 'agent',
    fields: [
      {
        key: 'systemPrompt',
        label: 'System Prompt',
        description: "Defines the AI's role and behavior in interactive chat sessions",
        defaultValue: DEFAULT_AGENT_PROMPTS.systemPrompt,
      },
    ],
  },
  {
    id: 'backlog-plan',
    label: 'Backlog',
    icon: KanbanSquare,
    title: 'Backlog Planning Prompts',
    category: 'backlogPlan',
    banner: {
      type: 'warning',
      title: 'Warning: Critical Prompts',
      description:
        'Backlog plan prompts require a strict JSON output format. Modifying these prompts incorrectly can break the backlog planning feature and potentially corrupt your feature data. Only customize if you fully understand the expected output structure.',
    },
    fields: [
      {
        key: 'systemPrompt',
        label: 'System Prompt',
        description:
          'Defines how the AI modifies the feature backlog (Plan button on Kanban board)',
        defaultValue: DEFAULT_BACKLOG_PLAN_PROMPTS.systemPrompt,
        critical: true,
      },
      {
        key: 'userPromptTemplate',
        label: 'User Prompt Template',
        description:
          'Template for the user prompt sent to the AI. Variables: currentFeatures, userRequest',
        defaultValue: DEFAULT_BACKLOG_PLAN_PROMPTS.userPromptTemplate,
        critical: true,
      },
    ],
  },
  {
    id: 'enhancement',
    label: 'Enhancement',
    icon: Sparkles,
    title: 'Enhancement Prompts',
    category: 'enhancement',
    fields: [
      {
        key: 'improveSystemPrompt',
        label: 'Improve Mode',
        description: 'Transform vague requests into clear, actionable tasks',
        defaultValue: DEFAULT_ENHANCEMENT_PROMPTS.improveSystemPrompt,
      },
      {
        key: 'technicalSystemPrompt',
        label: 'Technical Mode',
        description: 'Add implementation details and technical specifications',
        defaultValue: DEFAULT_ENHANCEMENT_PROMPTS.technicalSystemPrompt,
      },
      {
        key: 'simplifySystemPrompt',
        label: 'Simplify Mode',
        description: 'Make verbose descriptions concise and focused',
        defaultValue: DEFAULT_ENHANCEMENT_PROMPTS.simplifySystemPrompt,
      },
      {
        key: 'acceptanceSystemPrompt',
        label: 'Acceptance Criteria Mode',
        description: 'Add testable acceptance criteria to descriptions',
        defaultValue: DEFAULT_ENHANCEMENT_PROMPTS.acceptanceSystemPrompt,
      },
      {
        key: 'uxReviewerSystemPrompt',
        label: 'User Experience Mode',
        description: 'Review and enhance from a user experience and design perspective',
        defaultValue: DEFAULT_ENHANCEMENT_PROMPTS.uxReviewerSystemPrompt,
      },
    ],
  },
  {
    id: 'commit-message',
    label: 'Commit',
    icon: GitCommitHorizontal,
    title: 'Commit Message Prompts',
    category: 'commitMessage',
    fields: [
      {
        key: 'systemPrompt',
        label: 'System Prompt',
        description:
          'Instructions for generating git commit messages from diffs. The AI will receive the git diff and generate a conventional commit message.',
        defaultValue: DEFAULT_COMMIT_MESSAGE_PROMPTS.systemPrompt,
      },
    ],
  },
  {
    id: 'title-generation',
    label: 'Title',
    icon: Type,
    title: 'Title Generation Prompts',
    category: 'titleGeneration',
    fields: [
      {
        key: 'systemPrompt',
        label: 'System Prompt',
        description:
          'Instructions for generating concise, descriptive feature titles from descriptions. Used when auto-generating titles for new features.',
        defaultValue: DEFAULT_TITLE_GENERATION_PROMPTS.systemPrompt,
      },
    ],
  },
  {
    id: 'issue-validation',
    label: 'Issues',
    icon: CheckCircle,
    title: 'Issue Validation Prompts',
    category: 'issueValidation',
    banner: {
      type: 'warning',
      title: 'Warning: Critical Prompt',
      description:
        'The issue validation prompt guides the AI through a structured validation process and expects specific output format. Modifying this prompt incorrectly may affect validation accuracy.',
    },
    fields: [
      {
        key: 'systemPrompt',
        label: 'System Prompt',
        description:
          'Instructions for validating GitHub issues against the codebase. Guides the AI to determine if issues are valid, invalid, or need clarification.',
        defaultValue: DEFAULT_ISSUE_VALIDATION_PROMPTS.systemPrompt,
        critical: true,
      },
    ],
  },
  {
    id: 'ideation',
    label: 'Ideation',
    icon: Lightbulb,
    title: 'Ideation Prompts',
    category: 'ideation',
    fields: [
      {
        key: 'ideationSystemPrompt',
        label: 'Ideation Chat System Prompt',
        description:
          'System prompt for AI-powered ideation chat conversations. Guides the AI to brainstorm and suggest feature ideas.',
        defaultValue: DEFAULT_IDEATION_PROMPTS.ideationSystemPrompt,
      },
      {
        key: 'suggestionsSystemPrompt',
        label: 'Suggestions System Prompt',
        description:
          'System prompt for generating structured feature suggestions. Used when generating batch suggestions from prompts.',
        defaultValue: DEFAULT_IDEATION_PROMPTS.suggestionsSystemPrompt,
        critical: true,
      },
    ],
  },
  {
    id: 'app-spec',
    label: 'App Spec',
    icon: FileCode,
    title: 'App Specification Prompts',
    category: 'appSpec',
    fields: [
      {
        key: 'generateSpecSystemPrompt',
        label: 'Generate Spec System Prompt',
        description: 'System prompt for generating project specifications from overview',
        defaultValue: DEFAULT_APP_SPEC_PROMPTS.generateSpecSystemPrompt,
      },
      {
        key: 'structuredSpecInstructions',
        label: 'Structured Spec Instructions',
        description: 'Instructions for structured specification output format',
        defaultValue: DEFAULT_APP_SPEC_PROMPTS.structuredSpecInstructions,
        critical: true,
      },
      {
        key: 'generateFeaturesFromSpecPrompt',
        label: 'Generate Features from Spec',
        description: 'Prompt for generating features from a project specification',
        defaultValue: DEFAULT_APP_SPEC_PROMPTS.generateFeaturesFromSpecPrompt,
        critical: true,
      },
    ],
  },
  {
    id: 'context-description',
    label: 'Context',
    icon: FileText,
    title: 'Context Description Prompts',
    category: 'contextDescription',
    fields: [
      {
        key: 'describeFilePrompt',
        label: 'Describe File Prompt',
        description: 'Prompt for generating descriptions of text files added as context',
        defaultValue: DEFAULT_CONTEXT_DESCRIPTION_PROMPTS.describeFilePrompt,
      },
      {
        key: 'describeImagePrompt',
        label: 'Describe Image Prompt',
        description: 'Prompt for generating descriptions of images added as context',
        defaultValue: DEFAULT_CONTEXT_DESCRIPTION_PROMPTS.describeImagePrompt,
      },
    ],
  },
  {
    id: 'suggestions',
    label: 'Suggestions',
    icon: Wand2,
    title: 'Suggestions Prompts',
    category: 'suggestions',
    fields: [
      {
        key: 'featuresPrompt',
        label: 'Features Suggestion Prompt',
        description: 'Prompt for analyzing the project and suggesting new features',
        defaultValue: DEFAULT_SUGGESTIONS_PROMPTS.featuresPrompt,
      },
      {
        key: 'refactoringPrompt',
        label: 'Refactoring Suggestion Prompt',
        description: 'Prompt for identifying refactoring opportunities',
        defaultValue: DEFAULT_SUGGESTIONS_PROMPTS.refactoringPrompt,
      },
      {
        key: 'securityPrompt',
        label: 'Security Suggestion Prompt',
        description: 'Prompt for analyzing security vulnerabilities',
        defaultValue: DEFAULT_SUGGESTIONS_PROMPTS.securityPrompt,
      },
      {
        key: 'performancePrompt',
        label: 'Performance Suggestion Prompt',
        description: 'Prompt for identifying performance issues',
        defaultValue: DEFAULT_SUGGESTIONS_PROMPTS.performancePrompt,
      },
      {
        key: 'baseTemplate',
        label: 'Base Template',
        description: 'Base template applied to all suggestion types',
        defaultValue: DEFAULT_SUGGESTIONS_PROMPTS.baseTemplate,
      },
    ],
  },
  {
    id: 'task-execution',
    label: 'Tasks',
    icon: Cog,
    title: 'Task Execution Prompts',
    category: 'taskExecution',
    banner: {
      type: 'info',
      title: 'Template Variables',
      description:
        'Task execution prompts use Handlebars syntax for variable substitution. Variables include {{taskId}}, {{taskDescription}}, {{completedTasks}}, etc.',
    },
    fields: [
      {
        key: 'taskPromptTemplate',
        label: 'Task Prompt Template',
        description: 'Template for building individual task execution prompts',
        defaultValue: DEFAULT_TASK_EXECUTION_PROMPTS.taskPromptTemplate,
      },
      {
        key: 'implementationInstructions',
        label: 'Implementation Instructions',
        description: 'Instructions appended to feature implementation prompts',
        defaultValue: DEFAULT_TASK_EXECUTION_PROMPTS.implementationInstructions,
      },
      {
        key: 'playwrightVerificationInstructions',
        label: 'Playwright Verification Instructions',
        description: 'Instructions for automated Playwright verification (when enabled)',
        defaultValue: DEFAULT_TASK_EXECUTION_PROMPTS.playwrightVerificationInstructions,
      },
      {
        key: 'learningExtractionSystemPrompt',
        label: 'Learning Extraction System Prompt',
        description: 'System prompt for extracting learnings/ADRs from implementation output',
        defaultValue: DEFAULT_TASK_EXECUTION_PROMPTS.learningExtractionSystemPrompt,
        critical: true,
      },
      {
        key: 'learningExtractionUserPromptTemplate',
        label: 'Learning Extraction User Template',
        description:
          'User prompt template for learning extraction. Variables: featureTitle, implementationLog',
        defaultValue: DEFAULT_TASK_EXECUTION_PROMPTS.learningExtractionUserPromptTemplate,
        critical: true,
      },
      {
        key: 'planRevisionTemplate',
        label: 'Plan Revision Template',
        description:
          'Template for prompting plan revisions. Variables: planVersion, previousPlan, userFeedback',
        defaultValue: DEFAULT_TASK_EXECUTION_PROMPTS.planRevisionTemplate,
      },
      {
        key: 'continuationAfterApprovalTemplate',
        label: 'Continuation After Approval Template',
        description:
          'Template for continuation after plan approval. Variables: userFeedback, approvedPlan',
        defaultValue: DEFAULT_TASK_EXECUTION_PROMPTS.continuationAfterApprovalTemplate,
      },
      {
        key: 'resumeFeatureTemplate',
        label: 'Resume Feature Template',
        description:
          'Template for resuming interrupted features. Variables: featurePrompt, previousContext',
        defaultValue: DEFAULT_TASK_EXECUTION_PROMPTS.resumeFeatureTemplate,
      },
      {
        key: 'projectAnalysisPrompt',
        label: 'Project Analysis Prompt',
        description: 'Prompt for AI-powered project analysis',
        defaultValue: DEFAULT_TASK_EXECUTION_PROMPTS.projectAnalysisPrompt,
      },
    ],
  },
];

// =============================================================================
// Helper Components
// =============================================================================

/**
 * Calculate dynamic minimum height based on content length
 */
function calculateMinHeight(text: string): string {
  const lines = text.split('\n').length;
  const estimatedLines = Math.max(lines, Math.ceil(text.length / 80));
  const minHeight = Math.min(Math.max(120, estimatedLines * 20), 600);
  return `${minHeight}px`;
}

/**
 * Renders an info or warning banner
 */
function Banner({ config }: { config: BannerConfig }) {
  const isWarning = config.type === 'warning';
  const Icon = isWarning ? AlertTriangle : Info;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl',
        isWarning
          ? 'bg-amber-500/10 border border-amber-500/20'
          : 'bg-blue-500/10 border border-blue-500/20'
      )}
    >
      <Icon
        className={cn('w-5 h-5 mt-0.5 shrink-0', isWarning ? 'text-amber-500' : 'text-blue-500')}
      />
      <div className="space-y-1">
        <p className="text-sm text-foreground font-medium">{config.title}</p>
        <p className="text-xs text-muted-foreground/80 leading-relaxed">{config.description}</p>
      </div>
    </div>
  );
}

/**
 * PromptField Component - Shows a prompt with toggle for custom/default mode
 */
function PromptField({
  label,
  description,
  defaultValue,
  customValue,
  onCustomValueChange,
  critical = false,
}: PromptFieldProps) {
  const isEnabled = customValue?.enabled ?? false;
  const displayValue = isEnabled ? (customValue?.value ?? defaultValue) : defaultValue;
  const minHeight = calculateMinHeight(displayValue);

  const handleToggle = (enabled: boolean) => {
    const value = customValue?.value ?? defaultValue;
    onCustomValueChange({ value, enabled });
  };

  const handleTextChange = (newValue: string) => {
    if (isEnabled) {
      onCustomValueChange({ value: newValue, enabled: true });
    }
  };

  return (
    <div className="space-y-2">
      {critical && isEnabled && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium text-amber-500">Critical Prompt</p>
            <p className="text-xs text-muted-foreground mt-1">
              This prompt requires a specific output format. Changing it incorrectly may break
              functionality. Only modify if you understand the expected structure.
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label htmlFor={label} className="text-sm font-medium">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{isEnabled ? 'Custom' : 'Default'}</span>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-brand-500"
          />
        </div>
      </div>
      <Textarea
        id={label}
        value={displayValue}
        onChange={(e) => handleTextChange(e.target.value)}
        readOnly={!isEnabled}
        style={{ minHeight }}
        className={cn(
          'font-mono text-xs resize-y',
          !isEnabled && 'cursor-not-allowed bg-muted/50 text-muted-foreground'
        )}
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

/**
 * Renders a list of prompt fields from configuration
 */
function PromptFieldList({
  fields,
  category,
  promptCustomization,
  updatePrompt,
}: {
  fields: PromptFieldConfig[];
  category: keyof PromptCustomization;
  promptCustomization?: PromptCustomization;
  updatePrompt: (
    category: keyof PromptCustomization,
    field: string,
    value: CustomPrompt | undefined
  ) => void;
}) {
  return (
    <>
      {fields.map((field) => (
        <PromptField
          key={field.key}
          label={field.label}
          description={field.description}
          defaultValue={field.defaultValue}
          customValue={
            (promptCustomization?.[category] as Record<string, CustomPrompt> | undefined)?.[
              field.key
            ]
          }
          onCustomValueChange={(value) => updatePrompt(category, field.key, value)}
          critical={field.critical}
        />
      ))}
    </>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function PromptCustomizationSection({
  promptCustomization = {},
  onPromptCustomizationChange,
}: PromptCustomizationSectionProps) {
  const [activeTab, setActiveTab] = useState('auto-mode');

  const updatePrompt = (
    category: keyof PromptCustomization,
    field: string,
    value: CustomPrompt | undefined
  ) => {
    const updated = {
      ...promptCustomization,
      [category]: {
        ...promptCustomization[category],
        [field]: value,
      },
    };
    onPromptCustomizationChange(updated);
  };

  const resetToDefaults = (category: keyof PromptCustomization) => {
    const updated = {
      ...promptCustomization,
      [category]: {},
    };
    onPromptCustomizationChange(updated);
  };

  const resetAllToDefaults = () => {
    onPromptCustomizationChange({});
  };

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden',
        'border border-border/50',
        'bg-gradient-to-br from-card/90 via-card/70 to-card/80 backdrop-blur-xl',
        'shadow-sm shadow-black/5'
      )}
      data-testid="prompt-customization-section"
    >
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-transparent via-accent/5 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center border border-brand-500/20">
              <MessageSquareText className="w-5 h-5 text-brand-500" />
            </div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Prompt Customization
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={resetAllToDefaults} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset All to Defaults
          </Button>
        </div>
        <p className="text-sm text-muted-foreground/80 ml-12">
          Customize AI prompts for Auto Mode, Agent Runner, and other features.
        </p>
      </div>

      {/* Info Banner */}
      <div className="px-6 pt-6">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm text-foreground font-medium">How to Customize Prompts</p>
            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              Toggle the switch to enable custom mode and edit the prompt. When disabled, the
              default built-in prompt is used. You can use the default as a starting point by
              enabling the toggle.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 gap-1 h-auto w-full bg-transparent p-0">
            {TAB_CONFIGS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TAB_CONFIGS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6 mt-6">
              {/* Tab Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground">{tab.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetToDefaults(tab.category)}
                  className="gap-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Section
                </Button>
              </div>

              {/* Tab Banner */}
              {tab.banner && <Banner config={tab.banner} />}

              {/* Main Fields */}
              {tab.fields.length > 0 && (
                <div className="space-y-4">
                  <PromptFieldList
                    fields={tab.fields}
                    category={tab.category}
                    promptCustomization={promptCustomization}
                    updatePrompt={updatePrompt}
                  />
                </div>
              )}

              {/* Sections (for tabs like Auto Mode with grouped fields) */}
              {tab.sections?.map((section, idx) => (
                <div key={idx} className="pt-4 border-t border-border/50">
                  {section.title && (
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">
                      {section.title}
                    </h4>
                  )}
                  {section.banner && (
                    <div className="mb-4">
                      <Banner config={section.banner} />
                    </div>
                  )}
                  <div className="space-y-4">
                    <PromptFieldList
                      fields={section.fields}
                      category={tab.category}
                      promptCustomization={promptCustomization}
                      updatePrompt={updatePrompt}
                    />
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
