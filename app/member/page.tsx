import { PageHead } from "../../components/ui";

export default function MemberPage() {
  return (
    <div className="animate-fade-up">
      <PageHead title="লাইফটাইম মেম্বার" subtitle="বিশেষ সদস্যপদ" icon="star" />
      <iframe
        src="https://islahbd.com/lifetime-member?isApp=true"
        className="card mt-3 h-[70vh] w-full"
        title="Lifetime member"
      />
    </div>
  );
}
