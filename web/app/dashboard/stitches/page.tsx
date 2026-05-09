import { redirect } from "next/navigation";

export default function StitchesPage() {
  redirect("/dashboard/uploads?tab=stitches");
}
