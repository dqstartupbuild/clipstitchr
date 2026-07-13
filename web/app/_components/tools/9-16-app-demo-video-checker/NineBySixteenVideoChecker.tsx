"use client";

import { Panel } from "@/app/_components/ui/Panel";
import { LocalVideoDropzone } from "@/app/_components/tools/video/LocalVideoDropzone";
import { NineBySixteenVideoCheckerResults } from "@/app/_components/tools/9-16-app-demo-video-checker/NineBySixteenVideoCheckerResults";
import { useLocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/useLocalVideoInspection";

export function NineBySixteenVideoChecker() {
  const {
    errorMessage,
    file,
    inspectFile,
    inspection,
    isInspecting,
  } = useLocalVideoInspection();

  return (
    <section className="px-6 py-16 md:py-20" aria-labelledby="video-checker-heading">
      <div className="mx-auto max-w-5xl">
        <Panel className="p-5 md:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-accent-dark">Check one file</p>
            <h2
              id="video-checker-heading"
              className="marketing-subheading mt-3 text-3xl text-text-primary md:text-4xl"
            >
              Is this demo ready for a 9:16 ad?
            </h2>
            <p className="mt-3 leading-7 text-text-secondary">
              Choose the exact file you plan to use. The checker reads its
              media facts locally and gives you a transparent result.
            </p>
          </div>

          <div className="mt-7">
            <LocalVideoDropzone
              errorMessage={errorMessage}
              file={file}
              inputId="nine-by-sixteen-video-file"
              isInspecting={isInspecting}
              onFile={inspectFile}
            />
          </div>

          {file && inspection ? (
            <NineBySixteenVideoCheckerResults
              file={file}
              inspection={inspection}
            />
          ) : null}
        </Panel>
      </div>
    </section>
  );
}
