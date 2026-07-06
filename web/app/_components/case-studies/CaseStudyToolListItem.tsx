type CaseStudyToolListItemProps = {
  tool: {
    label: string;
    url?: string;
  };
};

export function CaseStudyToolListItem({ tool }: CaseStudyToolListItemProps) {
  if (!tool.url) {
    return <li>{tool.label}</li>;
  }

  return (
    <li>
      <a
        href={tool.url}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-text-primary underline decoration-border underline-offset-4 transition hover:text-accent-dark"
      >
        {tool.label}
      </a>
    </li>
  );
}
