import { ResourceDownloadButton } from "@/app/_components/tools/resources/ResourceDownloadButton";
import { createNotionKitTemplateCsv } from "@/lib/clipstitchr/tools/notionKit/createNotionKitTemplateCsv";
import type { NotionKitTemplate } from "@/lib/clipstitchr/tools/notionKit/NotionKitTemplate";

type NotionKitTemplateCardProps = {
  template: NotionKitTemplate;
};

export function NotionKitTemplateCard({
  template,
}: NotionKitTemplateCardProps) {
  return (
    <article className="marketing-card p-5 md:p-6">
      <h3 className="marketing-subheading text-2xl text-text-primary">
        {template.name}
      </h3>
      <p className="mt-3 leading-7 text-text-secondary">
        {template.description}
      </p>
      <p className="mt-4 text-sm font-bold text-text-primary">
        {template.columns.length} columns · {template.rows.length} example rows
      </p>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-text-secondary">
        {template.propertyNotes.map((note) => (
          <li key={note}>• {note}</li>
        ))}
      </ul>
      <ResourceDownloadButton
        contents={createNotionKitTemplateCsv(template)}
        fileName={template.fileName}
        label={`Download ${template.name} CSV`}
        type="text/csv;charset=utf-8"
      />
    </article>
  );
}
