"use client";
import { FeatureListPage } from "../../components/FeatureList";
import { useTx } from "../../store/language-store";

export default function HajjPage() {
  const tx = useTx();
  return (
    <FeatureListPage
      file="hajj_umrah.json"
      title={tx("হজ ও ওমরাহ")}
      subtitle={tx("তামাত্তু হজ ও ওমরাহর ধাপে ধাপে গাইড — দোআ, নিয়ম, ম্যাপ, চেকলিস্ট")}
      backHref="/"
    
      icon="kaaba"
    />
  );
}
