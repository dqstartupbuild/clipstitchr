"use client";

import { useEffect, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductSocialQueueForm } from "./ProductSocialQueueForm";

type ProductSocialQueueEditorProps = {
  productId: string;
};

export function ProductSocialQueueEditor({
  productId,
}: ProductSocialQueueEditorProps) {
  const { isAuthenticated } = useConvexAuth();
  const [savedFeedback, setSavedFeedback] = useState<{
    productId: string;
    message: string;
  } | null>(null);
  const queue = useQuery(
    api.productSocialQueues.getProductSocialQueue.getProductSocialQueue,
    isAuthenticated ? { productId } : "skip",
  );
  const ensureQueue = useMutation(
    api.productSocialQueues.ensureProductSocialQueue.ensureProductSocialQueue,
  );
  useEffect(() => {
    if (queue === null) {
      void ensureQueue({
        productId,
        now: new Date().toISOString(),
      });
    }
  }, [ensureQueue, productId, queue]);

  return (
    <section className="border-t border-border pt-5" aria-labelledby="queue-times">
      <h3 className="text-base font-bold text-text-primary" id="queue-times">
        Posting times
      </h3>
      <p className="mt-1 text-sm leading-6 text-text-secondary">
        Queue times belong to this product. ClipStitchr skips local times that
        do not exist when daylight saving time changes.
      </p>
      {queue === undefined || queue === null ? (
        <p className="mt-3 text-sm font-semibold text-text-secondary">
          Preparing this product&apos;s queue...
        </p>
      ) : (
        <ProductSocialQueueForm
          key={`${queue._id}:${queue.revision}`}
          onSaved={(message) => setSavedFeedback({ productId, message })}
          productId={productId}
          queue={queue}
        />
      )}
      {savedFeedback?.productId === productId ? (
        <p className="mt-3 text-sm font-semibold text-emerald-300">
          {savedFeedback.message}
        </p>
      ) : null}
    </section>
  );
}
