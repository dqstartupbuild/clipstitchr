"use client";

import { useState } from "react";
import { Panel } from "@/app/_components/ui/Panel";
import { ProductDemoChecklist } from "@/app/_components/tools/product-demo-readiness-checker/ProductDemoChecklist";
import { ProductDemoReadinessResults } from "@/app/_components/tools/product-demo-readiness-checker/ProductDemoReadinessResults";
import { ProductDemoUseField } from "@/app/_components/tools/product-demo-readiness-checker/ProductDemoUseField";
import { LocalVideoDropzone } from "@/app/_components/tools/video/LocalVideoDropzone";
import { useLocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/useLocalVideoInspection";
import type { ProductDemoAnswers } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoAnswers";
import type { ProductDemoUse } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoUse";
import { defaultProductDemoAnswers } from "@/lib/clipstitchr/tools/productDemoReadiness/defaultProductDemoAnswers";

export function ProductDemoReadinessChecker() {
  const [use, setUse] = useState<ProductDemoUse>("short-form-ad");
  const [answers, setAnswers] = useState<ProductDemoAnswers>({
    ...defaultProductDemoAnswers,
  });
  const {
    errorMessage,
    file,
    inspectFile,
    inspection,
    isInspecting,
  } = useLocalVideoInspection();

  return (
    <section
      className="px-6 py-16 md:py-20"
      aria-labelledby="product-demo-checker-heading"
    >
      <div className="mx-auto max-w-5xl">
        <Panel className="p-5 md:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-accent-dark">
              Check the file and the story
            </p>
            <h2
              id="product-demo-checker-heading"
              className="marketing-subheading mt-3 text-3xl text-text-primary md:text-4xl"
            >
              Is this product demo ready to test?
            </h2>
            <p className="mt-3 leading-7 text-text-secondary">
              The browser can read the technical facts. You answer the eight
              questions that require a real person to watch the demo.
            </p>
          </div>

          <div className="mt-7 grid gap-7">
            <ProductDemoUseField onChange={setUse} value={use} />
            <LocalVideoDropzone
              errorMessage={errorMessage}
              file={file}
              inputId="product-demo-readiness-file"
              isInspecting={isInspecting}
              onFile={(nextFile) => {
                setAnswers({ ...defaultProductDemoAnswers });
                void inspectFile(nextFile);
              }}
            />
            <ProductDemoChecklist
              answers={answers}
              onAnswer={(id, answer) =>
                setAnswers((current) => ({ ...current, [id]: answer }))
              }
            />
          </div>

          {file && inspection ? (
            <ProductDemoReadinessResults
              answers={answers}
              file={file}
              inspection={inspection}
              use={use}
            />
          ) : null}
        </Panel>
      </div>
    </section>
  );
}
