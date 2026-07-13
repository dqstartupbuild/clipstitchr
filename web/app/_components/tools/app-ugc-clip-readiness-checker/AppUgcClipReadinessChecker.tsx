"use client";

import { useState } from "react";
import { AppUgcClipChecklist } from "@/app/_components/tools/app-ugc-clip-readiness-checker/AppUgcClipChecklist";
import { AppUgcClipReadinessResults } from "@/app/_components/tools/app-ugc-clip-readiness-checker/AppUgcClipReadinessResults";
import { AppUgcClipRoleField } from "@/app/_components/tools/app-ugc-clip-readiness-checker/AppUgcClipRoleField";
import { LocalVideoDropzone } from "@/app/_components/tools/video/LocalVideoDropzone";
import { Panel } from "@/app/_components/ui/Panel";
import type { AppUgcClipAnswers } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipAnswers";
import type { AppUgcClipRole } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipRole";
import { defaultAppUgcClipAnswers } from "@/lib/clipstitchr/tools/appUgcClipReadiness/defaultAppUgcClipAnswers";
import { useLocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/useLocalVideoInspection";

export function AppUgcClipReadinessChecker() {
  const [role, setRole] = useState<AppUgcClipRole>("spoken-hook");
  const [answers, setAnswers] = useState<AppUgcClipAnswers>({
    ...defaultAppUgcClipAnswers,
  });
  const { errorMessage, file, inspectFile, inspection, isInspecting } =
    useLocalVideoInspection();

  return (
    <section
      className="px-6 py-16 md:py-20"
      aria-labelledby="ugc-clip-checker-heading"
    >
      <div className="mx-auto max-w-5xl">
        <Panel className="p-5 md:p-8">
          <p className="text-sm font-bold text-accent-dark">
            Check the file, then watch the footage
          </p>
          <h2
            id="ugc-clip-checker-heading"
            className="marketing-subheading mt-3 text-3xl text-text-primary md:text-4xl"
          >
            Is this raw creator clip ready to reuse?
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-text-secondary">
            The browser reads technical facts. You answer the seven content and
            approval questions that software cannot honestly confirm here.
          </p>
          <div className="mt-7 grid gap-7">
            <AppUgcClipRoleField value={role} onChange={setRole} />
            <LocalVideoDropzone
              emptyPrompt="Drop one raw UGC clip here"
              errorMessage={errorMessage}
              file={file}
              inputId="app-ugc-clip-readiness-file"
              isInspecting={isInspecting}
              onFile={(nextFile) => {
                setAnswers({ ...defaultAppUgcClipAnswers });
                void inspectFile(nextFile);
              }}
            />
            <AppUgcClipChecklist
              answers={answers}
              role={role}
              onAnswer={(id, answer) =>
                setAnswers((current) => ({ ...current, [id]: answer }))
              }
            />
          </div>
          {file && inspection ? (
            <AppUgcClipReadinessResults
              answers={answers}
              file={file}
              inspection={inspection}
              role={role}
            />
          ) : null}
        </Panel>
      </div>
    </section>
  );
}
