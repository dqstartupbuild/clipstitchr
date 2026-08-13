"use client";

import { useMemo, useState } from "react";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StudioStitchCreativeBriefOption } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchCreativeBriefOption";
import { createProductStudioStitchBrief } from "@/lib/clipstitchr/hooks/studioStitch/createProductStudioStitchBrief";
import { useCreateStudioStitchRun } from "@/lib/clipstitchr/hooks/studioStitch/useCreateStudioStitchRun";
import { useStudioStitchHookLabBrief } from "@/lib/clipstitchr/hooks/studioStitch/useStudioStitchHookLabBrief";
import { useStudioStitchHookLabPosts } from "@/lib/clipstitchr/hooks/studioStitch/useStudioStitchHookLabPosts";
import { useStudioStitchKnownRunIds } from "@/lib/clipstitchr/hooks/studioStitch/useStudioStitchKnownRunIds";
import { useStudioStitchLazyReelBriefs } from "@/lib/clipstitchr/hooks/studioStitch/useStudioStitchLazyReelBriefs";
import { useStudioStitchMusicTracks } from "@/lib/clipstitchr/hooks/studioStitch/useStudioStitchMusicTracks";
import { useStudioStitchSourceCatalog } from "@/lib/clipstitchr/hooks/studioStitch/useStudioStitchSourceCatalog";
import { StudioStitchHookLabBriefPicker } from "./StudioStitchHookLabBriefPicker";
import { StudioStitchRecipeBuilder } from "./StudioStitchRecipeBuilder";
import { StudioStitchRecipeLibrary } from "./StudioStitchRecipeLibrary";
import { StudioStitchRunExplorer } from "./StudioStitchRunExplorer";
import { createStudioStitchSampleRun } from "./createStudioStitchSampleRun";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchWorkspace({
  initialBriefId,
  initialSourceId,
  product,
}: {
  initialBriefId?: string;
  initialSourceId?: string;
  product: ProductProfile;
}) {
  const productId = product.id;
  const sourceState = useStudioStitchSourceCatalog(productId);
  const musicState = useStudioStitchMusicTracks(true);
  const hookLabState = useStudioStitchHookLabPosts();
  const [hookLabPostId, setHookLabPostId] = useState("");
  const hookLabBrief = useStudioStitchHookLabBrief(productId, hookLabPostId);
  const lazyReelBriefs = useStudioStitchLazyReelBriefs(productId);
  const [recipeReloadSignal, setRecipeReloadSignal] = useState(0);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const knownRuns = useStudioStitchKnownRunIds(productId);
  const runCreation = useCreateStudioStitchRun(productId);
  const sources = [...sourceState.catalog.videoClips, ...sourceState.catalog.stitches];
  const briefOptions = useMemo(() => {
    const options: StudioStitchCreativeBriefOption[] = [
      {
        id: "product-grounding",
        source: "product",
        title: `${product.name} foundation`,
        note: "Built from this saved Product's problem, proof, audience, and CTA.",
        brief: createProductStudioStitchBrief(product),
      },
      ...lazyReelBriefs,
    ];
    if (hookLabBrief) {
      options.splice(1, 0, {
        id: hookLabBrief.id,
        source: "hookLab",
        title: hookLabBrief.brief.directionName,
        note: "Approved in Hook Lab for Stitchr.",
        brief: hookLabBrief.brief,
      });
    }
    return options;
  }, [hookLabBrief, lazyReelBriefs, product]);

  return (
    <div className={styles.workspace}>
      <section className={styles.inputSources}>
        <StudioStitchHookLabBriefPicker
          onSelect={setHookLabPostId}
          posts={hookLabState.posts}
          selectedPostId={hookLabPostId}
        />
        {hookLabPostId && hookLabBrief === undefined ? (
          <p className={styles.loadingLine} role="status">
            Checking this post for an approved Stitchr brief...
          </p>
        ) : hookLabPostId && hookLabBrief === null ? (
          <p className={styles.sourceNotice}>
            That Hook Lab post has no approved Stitchr brief yet. Approve its
            brief in Hook Lab, or use Product or Research direction here.
          </p>
        ) : null}
      </section>
      {sourceState.isLoading ? (
        <p className={styles.loadingLine} role="status">Opening owned Studio footage...</p>
      ) : sourceState.error ? (
        <div className={styles.inlineError} role="alert"><p>{sourceState.error}</p><button onClick={() => void sourceState.reload()} type="button">Try again</button></div>
      ) : (
        <StudioStitchRecipeBuilder
          briefOptions={briefOptions}
          initialBriefId={initialBriefId}
          initialSourceId={initialSourceId}
          musicTracks={musicState.tracks}
          onSaved={() => setRecipeReloadSignal((value) => value + 1)}
          productId={productId}
          sources={sources}
        />
      )}
      <StudioStitchRecipeLibrary
        isCreatingRun={runCreation.isCreating}
        onCreateRun={(count) => void createStudioStitchSampleRun(count, selectedRecipeIds, runCreation.createRun, knownRuns.remember, setSelectedRunId, setSelectedRecipeIds)}
        onSelectedIdsChange={setSelectedRecipeIds}
        productId={productId}
        reloadSignal={recipeReloadSignal}
        runError={runCreation.error}
        selectedIds={selectedRecipeIds}
      />
      <StudioStitchRunExplorer
        knownRunIds={knownRuns.ids}
        onRememberRun={knownRuns.remember}
        onSelectRun={setSelectedRunId}
        productId={productId}
        selectedRunId={selectedRunId}
      />
    </div>
  );
}
