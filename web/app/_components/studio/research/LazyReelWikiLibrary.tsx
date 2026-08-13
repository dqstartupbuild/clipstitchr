"use client";

import { useMemo, useState } from "react";
import type { LazyReelWikiDocument } from "@/lib/clipstitchr/types/lazyreel/LazyReelWikiDocument";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

export function LazyReelWikiLibrary({
  documents,
}: {
  documents: LazyReelWikiDocument[];
}) {
  const [selectedSlug, setSelectedSlug] = useState(documents[0]?.slug ?? "");
  const selectedDocument = useMemo(
    () => documents.find((document) => document.slug === selectedSlug) ?? documents[0],
    [documents, selectedSlug],
  );

  return (
    <section className={styles.wikiLibrary} aria-labelledby="lazyreel-wiki-library">
      <header>
        <h2 id="lazyreel-wiki-library">Research library</h2>
        <p>
          Browse one saved Research note at a time. These notes capture the
          current reference set, not live market claims.
        </p>
      </header>
      {documents.length === 0 ? (
        <p className={styles.recordsStatus}>No Research notes are available in this reference set.</p>
      ) : (
        <>
          <label className={styles.wikiChooser}>
            Choose a note
            <select value={selectedDocument?.slug ?? ""} onChange={(event) => setSelectedSlug(event.target.value)}>
              <optgroup label="Niche notes">
                {documents.filter((document) => document.kind === "niche").map((document) => (
                  <option key={document.slug} value={document.slug}>{document.title}</option>
                ))}
              </optgroup>
              <optgroup label="Pattern notes">
                {documents.filter((document) => document.kind === "pattern").map((document) => (
                  <option key={document.slug} value={document.slug}>{document.title}</option>
                ))}
              </optgroup>
            </select>
          </label>
          {selectedDocument ? (
            <details className={styles.wikiDocument} open>
              <summary>{selectedDocument.title}</summary>
              <p className={styles.wikiSource}>Reference source: {selectedDocument.sourcePath}</p>
              <div className={styles.wikiContent}>{selectedDocument.content}</div>
            </details>
          ) : null}
        </>
      )}
    </section>
  );
}
