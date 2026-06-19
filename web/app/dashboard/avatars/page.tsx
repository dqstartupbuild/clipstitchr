import { redirect } from "next/navigation";

export default function AvatarsPage() {
  redirect("/dashboard/library?tab=avatars");
}
