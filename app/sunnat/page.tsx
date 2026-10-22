"use client";
import { FeatureListPage } from "../../components/FeatureList";
import { useTx } from "../../store/language-store";

export default function SunnatPage() {
  const tx = useTx();
  return (
    <FeatureListPage
      file="sunnat.json"
      title={tx("সুন্নাত ও আদব")}
      subtitle={tx("কিতাবুস সুন্নাহ — মুফতী মনসূরুল হক")}
      backHref="/"
      icon="leaf"
    />
  );
}
