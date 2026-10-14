import InsightCard from "../components/dashboard/InsightCard.jsx";
import IndustriesCard from "../components/dashboard/IndustriesCard.jsx";
import MatchScoreCard from "../components/dashboard/MatchScoreCard.jsx";
import ResumeSuccessCard from "../components/dashboard/ResumeSuccessCard.jsx";

// Sample figures for now. Swap these for API data once the analytics endpoints exist.
const INSIGHTS = [
  { value: "3", lead: "Applications are waiting on a follow-up.", rest: "Replying within two days keeps you on the shortlist." },
  { value: "77%", lead: "Job openings seek multitalented individuals.", rest: "Adding a complimentary skill can improve your hiring chances." },
  { value: "12", lead: "New roles match your resume this week.", rest: "Most of them are in the industries you already applied to." },
  { value: "2x", lead: "Interviews come faster with a tailored resume.", rest: "Your second iteration is already outperforming the first." },
  { value: "48%", lead: "Of interviews came from your latest resume.", rest: "Keep iterating on the version that is working." },
];

const INDUSTRY_STATS = [
  { value: 58, label: "Applications" },
  { value: 7, label: "Industries" },
  { value: 15, label: "Interviews" },
];

const INDUSTRY_SERIES = [6, 8, 7, 9, 8, 12, 10, 9, 12, 17, 15, 18];
const INDUSTRY_LABELS = ["Jul 28", "Jul 29", "Jul 30", "Jul 31", "Aug 01"];

// White, cream and stone stand in for the reference's blue, green and yellow so the charts stay on brand.
const MATCH_BARS = [
  { name: "Jobs found", value: 104, fill: "bg-gradient-to-b from-ink to-ink/40", dot: "bg-ink" },
  { name: "Applications", value: 58, fill: "bg-gradient-to-b from-cream to-cream/40", dot: "bg-cream" },
  { name: "Interviews", value: 15, fill: "bg-gradient-to-b from-stone to-stone/40", dot: "bg-stone" },
];

const RESUME_SEGMENTS = [
  { name: "1st Iteration", value: 16, stroke: "stroke-ink", dot: "bg-ink" },
  { name: "2nd Iteration", value: 36, stroke: "stroke-stone", dot: "bg-stone" },
  { name: "3rd Iteration", value: 48, stroke: "stroke-cream", dot: "bg-cream" },
];

// Top row takes whatever height is spare, the bottom row sits at its natural height like the reference.
export default function Home()
  {
    return (
      <div className="flex w-full flex-1 flex-col gap-4">
        <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
          <InsightCard insights={INSIGHTS} />
          <IndustriesCard stats={INDUSTRY_STATS} series={INDUSTRY_SERIES} labels={INDUSTRY_LABELS} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,6fr)]">
          <MatchScoreCard score="56%" bars={MATCH_BARS} />
          <ResumeSuccessCard segments={RESUME_SEGMENTS} />
        </div>
      </div>
    );
  }
