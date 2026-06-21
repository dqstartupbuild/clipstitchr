type TikTokPageContent = {
  contentCategory: string;
  contentId: string;
  contentName: string;
};

const staticPageContent: Record<string, TikTokPageContent> = {
  "/": {
    contentCategory: "Marketing site",
    contentId: "home",
    contentName: "Homepage",
  },
  "/blog": {
    contentCategory: "Content",
    contentId: "blog",
    contentName: "Blog",
  },
  "/docs": {
    contentCategory: "Content",
    contentId: "docs",
    contentName: "Docs",
  },
  "/case-studies": {
    contentCategory: "Content",
    contentId: "case_studies",
    contentName: "Case Studies",
  },
  "/privacy": {
    contentCategory: "Legal",
    contentId: "privacy",
    contentName: "Privacy Policy",
  },
  "/sign-in": {
    contentCategory: "Auth",
    contentId: "sign_in",
    contentName: "Sign in",
  },
  "/sign-up": {
    contentCategory: "Waitlist",
    contentId: "waitlist",
    contentName: "Waitlist",
  },
  "/terms": {
    contentCategory: "Legal",
    contentId: "terms",
    contentName: "Terms of Use",
  },
};

export function getTikTokPageContent(pathname: string): TikTokPageContent {
  if (staticPageContent[pathname]) {
    return staticPageContent[pathname];
  }

  if (pathname.startsWith("/blog/")) {
    return {
      contentCategory: "Content",
      contentId: "blog_article",
      contentName: "Blog article",
    };
  }

  if (pathname.startsWith("/case-studies/")) {
    return {
      contentCategory: "Content",
      contentId: "case_study",
      contentName: "Case study",
    };
  }

  if (pathname.startsWith("/dashboard")) {
    return {
      contentCategory: "App",
      contentId: "dashboard",
      contentName: "Dashboard",
    };
  }

  if (pathname.startsWith("/docs/")) {
    return {
      contentCategory: "Content",
      contentId: "docs_article",
      contentName: "Docs article",
    };
  }

  return {
    contentCategory: "Website",
    contentId: pathname.replace(/^\//, "").replace(/\W+/g, "_") || "page",
    contentName: "Website page",
  };
}
