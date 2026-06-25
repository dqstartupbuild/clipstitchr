"use client";

import { useEffect } from "react";

function scrollToHash(hash: string) {
  if (!hash || hash === "#") {
    return;
  }

  const id = hash.startsWith("#") ? hash.slice(1) : hash;

  if (!id) {
    return;
  }

  const target = window.document.getElementById(id);

  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function useBlogSmoothScroll() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href || !href.startsWith("#")) {
        return;
      }

      const samePageAnchor =
        anchor.pathname === window.location.pathname &&
        anchor.host === window.location.host;

      if (!samePageAnchor) {
        return;
      }

      event.preventDefault();
      scrollToHash(href);

      if (window.history && window.history.replaceState) {
        const newUrl = `${window.location.pathname}${window.location.search}${href}`;
        window.history.replaceState(null, "", newUrl);
      }
    }

    function handleHashChange() {
      scrollToHash(window.location.hash);
    }

    window.document.addEventListener("click", handleClick);
    window.addEventListener("hashchange", handleHashChange);

    if (window.location.hash) {
      const initialHash = window.location.hash;

      requestAnimationFrame(() => {
        scrollToHash(initialHash);
      });
    }

    return () => {
      window.document.removeEventListener("click", handleClick);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);
}