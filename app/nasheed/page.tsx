import { redirect } from "next/navigation";

// NasheedScreen lives on as /hamdnaat (ported from beta HamdNaatView).
export default function NasheedRedirect() {
  redirect("/hamdnaat");
}
