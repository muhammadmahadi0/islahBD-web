import { redirect } from "next/navigation";

// Wallpaper lives inside /gallery (ported layout keeps both together).
export default function WallpaperRedirect() {
  redirect("/gallery");
}
