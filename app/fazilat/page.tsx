"use client";
import { FeatureListPage } from "../../components/FeatureList";
import { useTx } from "../../store/language-store";

export default function FazilatPage() {
  const tx = useTx();
  return (
    <FeatureListPage
      file="fazilat.json"
      title={tx("ফযীলত লাইব্রেরি")}
      subtitle={tx("সূরা ও আমলের সওয়াব ও ফযীলত")}
      backHref="/"
      icon="gem"
    />
  );
}
