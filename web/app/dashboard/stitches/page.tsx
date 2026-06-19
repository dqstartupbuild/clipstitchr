import { redirect } from "next/navigation";

export default function StitchesPage() {
  redirect("/dashboard/library?tab=stitches");
}
