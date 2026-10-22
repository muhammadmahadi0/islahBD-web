"use client";
import { FeatureListPage } from "../../components/FeatureList";
import { useTx } from "../../store/language-store";

export default function DuaPage() {
  const tx = useTx();
  return (
    <FeatureListPage
      file="dua.json"
      title={tx("দোআ")}
      subtitle={tx("বিষয়ভিত্তিক ও দৈনন্দিন দোআসমূহ")}
      icon="hands"
    />
  );
}
