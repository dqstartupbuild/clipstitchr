import { NotionKitTemplateCard } from "@/app/_components/tools/notion-kit/NotionKitTemplateCard";
import { notionKitTemplates } from "@/lib/clipstitchr/tools/notionKit/notionKitTemplates";

export function NotionKitWorkspace() {
  return (
    <section
      className="px-6 py-16 md:py-20"
      aria-label="Notion-ready CSV templates"
    >
      <div className="mx-auto max-w-5xl">
        <div className="marketing-card p-5 md:p-6">
          <p className="text-sm font-bold text-accent-dark">Import setup</p>
          <h2 className="marketing-subheading mt-2 text-3xl text-text-primary">
            Five real CSV files, ready for your workspace.
          </h2>
          <ol className="mt-5 grid gap-3 text-sm leading-6 text-text-secondary md:grid-cols-2">
            <li>
              1. Download each CSV and import it as a new Notion database.
            </li>
            <li>
              2. Change status-like columns from text to Select properties.
            </li>
            <li>
              3. Change date columns to Date and spend/count columns to Number.
            </li>
            <li>
              4. Link matching ID fields with Relations only after every table
              exists.
            </li>
            <li>
              5. Delete the example rows after checking your property types.
            </li>
          </ol>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {notionKitTemplates.map((template) => (
            <NotionKitTemplateCard key={template.name} template={template} />
          ))}
        </div>
      </div>
    </section>
  );
}
