const proseClassName = [
  "space-y-6 text-base leading-8 text-text-secondary",
  "[&_h2]:mt-12 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:text-text-primary",
  "[&_h3]:mt-10 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-text-primary",
  "[&_h4]:mt-8 [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-text-primary",
  "[&_p]:text-base [&_p]:leading-8 [&_p]:text-text-secondary",
  "[&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:text-text-secondary",
  "[&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:text-text-secondary",
  "[&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/40 [&_a]:underline-offset-4",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-text-primary",
  "[&_code]:rounded [&_code]:bg-surface-elevated [&_code]:px-1.5 [&_code]:py-1 [&_code]:font-mono [&_code]:text-[0.95em] [&_code]:text-text-primary",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-surface-elevated [&_pre]:p-5",
  "[&_img]:rounded-2xl [&_img]:border [&_img]:border-border",
  "[&_hr]:my-10 [&_hr]:border-border",
].join(" ");

type RuntimeBlogArticleProps = {
  html: string;
};

export function RuntimeBlogArticle({ html }: RuntimeBlogArticleProps) {
  return (
    <article
      className={`mt-12 ${proseClassName}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
