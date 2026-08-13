import type { LazyReelWorkflowDefinition } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowDefinition";
import { lazyReelFormatDeconstructorWorkflow } from "./workflows/lazyReelFormatDeconstructorWorkflow";
import { lazyReelFormatPromptBuilderWorkflow } from "./workflows/lazyReelFormatPromptBuilderWorkflow";
import { lazyReelHiggsfieldDirectorWorkflow } from "./workflows/lazyReelHiggsfieldDirectorWorkflow";
import { lazyReelUgcAdDirectorWorkflow } from "./workflows/lazyReelUgcAdDirectorWorkflow";
import { lazyReelUgcAdGeneratorWorkflow } from "./workflows/lazyReelUgcAdGeneratorWorkflow";
import { lazyReelVideoEditorWorkflow } from "./workflows/lazyReelVideoEditorWorkflow";

export function listLazyReelWorkflowDefinitions(): LazyReelWorkflowDefinition[] {
  return [
    lazyReelFormatDeconstructorWorkflow,
    lazyReelFormatPromptBuilderWorkflow,
    lazyReelHiggsfieldDirectorWorkflow,
    lazyReelUgcAdDirectorWorkflow,
    lazyReelUgcAdGeneratorWorkflow,
    lazyReelVideoEditorWorkflow,
  ];
}
