import {
  BadgeCheck,
  BadgeDollarSign,
  Calculator,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  FlaskConical,
  Gauge,
  ListVideo,
  Map,
  NotebookPen,
  PanelsTopLeft,
  RectangleVertical,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { PublicToolIconKey } from "@/lib/clipstitchr/tools/catalog/PublicToolIconKey";

type PublicToolIconProps = {
  iconKey: PublicToolIconKey;
};

export function PublicToolIcon({ iconKey }: PublicToolIconProps) {
  const className = "h-6 w-6";

  switch (iconKey) {
    case "calculator":
      return <Calculator aria-hidden className={className} />;
    case "sparkles":
      return <Sparkles aria-hidden className={className} />;
    case "clipboard-check":
      return <ClipboardCheck aria-hidden className={className} />;
    case "gauge":
      return <Gauge aria-hidden className={className} />;
    case "notebook-pen":
      return <NotebookPen aria-hidden className={className} />;
    case "refresh-cw":
      return <RefreshCw aria-hidden className={className} />;
    case "rectangle-vertical":
      return <RectangleVertical aria-hidden className={className} />;
    case "flask-conical":
      return <FlaskConical aria-hidden className={className} />;
    case "panels-top-left":
      return <PanelsTopLeft aria-hidden className={className} />;
    case "circle-dollar-sign":
      return <CircleDollarSign aria-hidden className={className} />;
    case "badge-dollar-sign":
      return <BadgeDollarSign aria-hidden className={className} />;
    case "chart-no-axes-combined":
      return <ChartNoAxesCombined aria-hidden className={className} />;
    case "list-video":
      return <ListVideo aria-hidden className={className} />;
    case "badge-check":
      return <BadgeCheck aria-hidden className={className} />;
    case "map":
      return <Map aria-hidden className={className} />;
  }
}
