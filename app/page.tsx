import { redirect } from "next/navigation";

/** The site opens on the Motiva Physio case study. */
export default function Home() {
  redirect("/concept");
}
