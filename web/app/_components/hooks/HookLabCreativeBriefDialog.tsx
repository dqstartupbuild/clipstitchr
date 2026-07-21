"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { createHookLabCreativeBrief } from "@/lib/clipstitchr/client/createHookLabCreativeBrief";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { useDialogFocusManagement } from "@/lib/clipstitchr/hooks/useDialogFocusManagement";
import type { HookLabCreativeBrief } from "@/lib/clipstitchr/types/HookLabCreativeBrief";
import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";
import type { HookLabDestinationTool } from "@/lib/clipstitchr/types/HookLabDestinationTool";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";
import type { HookLibraryTemplateSummary } from "@/lib/clipstitchr/types/HookLibraryTemplateSummary";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";
import { HookLabCreativeBriefField } from "./HookLabCreativeBriefField";

export function HookLabCreativeBriefDialog({
  post,
  templates,
  onClose,
}: {
  post: HookLabPost;
  templates: HookLibraryTemplateSummary[];
  onClose: () => void;
}) {
  const router = useRouter();
  const dialogRef = useDialogFocusManagement<HTMLElement>(onClose);
  const products = useDashboardProduct();
  const updateBrief = useMutation(api.hookLabCreativeBriefs.update.update);
  const approveBrief = useMutation(api.hookLabCreativeBriefs.approve.approve);
  const availableProducts = products.products.filter(
    (product) => !products.lockedProductIds.includes(product.id),
  );
  const [productId, setProductId] = useState(
    products.activeProductId ?? availableProducts[0]?.id ?? "",
  );
  const [destinationTool, setDestinationTool] =
    useState<HookLabDestinationTool>("clipr");
  const [hookTemplateId, setHookTemplateId] = useState(templates[0]?.id ?? "");
  const [brief, setBrief] = useState<HookLabCreativeBrief | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstAvailableProductId = availableProducts[0]?.id ?? "";
  const selectedProductId = availableProducts.some(
    (product) => product.id === productId,
  )
    ? productId
    : firstAvailableProductId;

  const updateContent = (
    key: keyof HookLabCreativeBriefContent,
    value: string,
  ) => {
    if (!brief) {
      return;
    }

    const nextValue =
      key === "beatScript" || key === "footageNeeds"
        ? value.split("\n").map((item) => item.trim()).filter(Boolean)
        : value;

    setBrief({
      ...brief,
      brief: { ...brief.brief, [key]: nextValue },
    });
  };

  const generate = async () => {
    setIsWorking(true);
    setError(null);

    try {
      const result = await createHookLabCreativeBrief({
        destinationTool,
        hookTemplateId: hookTemplateId || undefined,
        productId: selectedProductId,
        sourcePostId: post.id,
      });

      setBrief(result.brief);
    } catch (nextError) {
      setError(getErrorMessage(nextError, "Unable to create this brief."));
    } finally {
      setIsWorking(false);
    }
  };

  const openTool = async () => {
    if (!brief) {
      return;
    }

    setIsWorking(true);
    setError(null);

    try {
      await updateBrief({ brief: brief.brief, id: brief.id });
      await approveBrief({ id: brief.id });
      const product = products.products.find((item) => item.id === brief.productId);

      if (product && products.activeProductId !== product.id) {
        await products.setActiveProduct(product);
      }

      router.push(`/dashboard/${brief.destinationTool}?brief=${encodeURIComponent(brief.id)}`);
    } catch (nextError) {
      setError(getErrorMessage(nextError, "Unable to open this brief."));
      setIsWorking(false);
    }
  };

  return (
    <div
      className="dashboard-dialog-viewport"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <article
        ref={dialogRef}
        aria-labelledby="hook-lab-brief-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-[0_5px_10px_rgba(30,24,19,0.16)] sm:max-h-[calc(100dvh-3rem)]"
        role="dialog"
        tabIndex={-1}
      >
        <header className="flex items-start justify-between gap-4 p-4 pb-2 sm:p-5 sm:pb-2">
          <div>
            <h2 className="text-xl font-bold text-text-primary" id="hook-lab-brief-title">
              {brief ? "Review your creative brief" : "Use this format"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              The structure comes from the report. Every product detail comes
              from the saved product you choose.
            </p>
          </div>
          <IconButton
            icon={<X aria-hidden className="size-4" />}
            label="Close creative brief"
            onClick={onClose}
          />
        </header>
        <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
          {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}
          {!brief ? (
            <div className="grid gap-5">
              {!availableProducts.length ? (
                <DashboardAlert variant="info">
                  Add or unlock a saved product before creating a brief.
                </DashboardAlert>
              ) : null}
              <label className="grid gap-2 text-sm font-semibold text-text-primary">
                Saved product
                <select
                  className="min-h-10 rounded-lg border border-border bg-surface px-3 text-sm font-normal outline-none focus:border-accent"
                  value={selectedProductId}
                  onChange={(event) => setProductId(event.currentTarget.value)}
                >
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-text-primary">
                Create in
                <select
                  className="min-h-10 rounded-lg border border-border bg-surface px-3 text-sm font-normal outline-none focus:border-accent"
                  value={destinationTool}
                  onChange={(event) =>
                    setDestinationTool(event.currentTarget.value as HookLabDestinationTool)
                  }
                >
                  <option value="clipr">Clipr</option>
                  <option value="stitchr">Stitchr</option>
                  <option value="swipr">Swipr</option>
                </select>
              </label>
              {templates.length ? (
                <label className="grid gap-2 text-sm font-semibold text-text-primary">
                  Hook Library starting point
                  <select
                    className="min-h-10 rounded-lg border border-border bg-surface px-3 text-sm font-normal outline-none focus:border-accent"
                    value={hookTemplateId}
                    onChange={(event) => setHookTemplateId(event.currentTarget.value)}
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.categoryName}: {template.template}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <Button
                className="justify-self-start"
                disabled={!selectedProductId}
                isLoading={isWorking}
                type="button"
                onClick={() => void generate()}
              >
                Create brief
              </Button>
            </div>
          ) : (
            <div className="grid gap-5">
              <HookLabCreativeBriefField
                label="Direction name"
                value={brief.brief.directionName}
                onChange={(value) => updateContent("directionName", value)}
              />
              <HookLabCreativeBriefField
                label="Opening visual"
                value={brief.brief.openingVisual}
                onChange={(value) => updateContent("openingVisual", value)}
              />
              <HookLabCreativeBriefField
                label="Hook"
                value={brief.brief.hook}
                onChange={(value) => updateContent("hook", value)}
              />
              <HookLabCreativeBriefField
                label="Sound-off overlay"
                value={brief.brief.soundOffOverlay}
                onChange={(value) => updateContent("soundOffOverlay", value)}
              />
              <HookLabCreativeBriefField
                label="Beat-by-beat script, one beat per line"
                value={brief.brief.beatScript.join("\n")}
                onChange={(value) => updateContent("beatScript", value)}
              />
              <HookLabCreativeBriefField
                label="Footage needed, one shot per line"
                value={brief.brief.footageNeeds.join("\n")}
                onChange={(value) => updateContent("footageNeeds", value)}
              />
              <HookLabCreativeBriefField
                label="Product proof"
                value={brief.brief.productProof}
                onChange={(value) => updateContent("productProof", value)}
              />
              <HookLabCreativeBriefField
                label="Call to action"
                value={brief.brief.callToAction}
                onChange={(value) => updateContent("callToAction", value)}
              />
              <Button
                className="justify-self-start"
                icon={<ArrowUpRight aria-hidden className="size-4" />}
                isLoading={isWorking}
                type="button"
                onClick={() => void openTool()}
              >
                Save and open {brief.destinationTool[0]?.toUpperCase()}
                {brief.destinationTool.slice(1)}
              </Button>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
