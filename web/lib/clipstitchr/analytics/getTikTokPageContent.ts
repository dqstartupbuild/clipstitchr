import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";

type TikTokPageContent = {
  contentCategory: string;
  contentId: string;
  contentName: string;
};

const toolPageContent = Object.fromEntries(
  publicToolKeys.map((key) => {
    const tool = publicToolCatalog[key];

    return [
      tool.pathname,
      {
        contentCategory: "Tools",
        contentId: tool.tiktokContentId,
        contentName: tool.name,
      },
    ];
  }),
) as Record<string, TikTokPageContent>;

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
    contentCategory: "Auth",
    contentId: "sign_up",
    contentName: "Sign up",
  },
  "/terms": {
    contentCategory: "Legal",
    contentId: "terms",
    contentName: "Terms of Use",
  },
  "/tools": {
    contentCategory: "Tools",
    contentId: "tools",
    contentName: "App marketing tools",
  },
  ...toolPageContent,
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
