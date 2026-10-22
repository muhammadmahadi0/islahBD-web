"use client";
import { FeatureListPage } from "../../components/FeatureList";
import { useTx } from "../../store/language-store";

export default function WazifaPage() {
  const tx = useTx();
  return (
    <FeatureListPage
      file="wazifa.json"
      title={tx("ওয়াজিফা ও দরূদ")}
      subtitle={tx("ছালেকীনের সকাল-সন্ধ্যার মা'মূলাত")}
      icon="sparkle"
    />
  );
}
