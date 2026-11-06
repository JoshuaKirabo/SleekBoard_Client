// Everything the hunt preferences popup offers, and what a hunt looks like before you've picked anything. The
// fields and their order follow Jobright's filters; the wording is ours where theirs was unclear.

export const LOCATION_SUGGESTIONS = [
  "United States", "Remote in the US", "New York, NY", "San Francisco, CA", "Seattle, WA", "Austin, TX", "Boston, MA",
  "Chicago, IL", "Los Angeles, CA", "Phoenix, AZ", "Canada", "United Kingdom",
];

export const INDUSTRY_SUGGESTIONS = [
  "Information Technology", "Artificial Intelligence (AI)", "Software", "Financial Services", "Fintech", "Consulting",
  "Healthcare", "E-commerce", "Education", "Gaming", "Cybersecurity",
];

export const SKILL_SUGGESTIONS = [
  "Java", "JavaScript", "TypeScript", "Python", "React", "Node.js", "SQL", "AWS", "Docker", "Kubernetes", "Bash",
  "C++", "Go", "PyTorch",
];

// Two columns, read across: Full-time and Contract on the first row, like Jobright.
export const JOB_TYPES = ["Full-time", "Contract", "Part-time", "Internship"];
export const WORK_MODELS = ["Onsite", "Hybrid", "Remote"];
export const LEVELS = ["Intern/New Grad", "Entry Level", "Mid Level", "Senior Level", "Lead/Staff", "Director/Executive"];
export const SPONSORSHIP = ["H1B sponsorship"];
export const LIMITS = ["Security clearance required", "US citizens only"];
export const ROLE_TYPES = ["Individual contributor (IC)", "Manager"];
export const STAGES = ["Early stage", "Growth stage", "Late stage", "Public company"];
export const STAFFING = ["Exclude staffing agencies"];

export const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
const thisYear = new Date().getFullYear();
export const YEARS = [0, 1, 2, 3].map((ahead) => String(thisYear + ahead));

// How new a job has to be. Jobright's four quick picks, plus Custom, because what counts as fresh is yours to say.
export const POSTED_PRESETS = [
  { label: "Past 24 hours", amount: 24, unit: "hours" },
  { label: "Past 3 days", amount: 3, unit: "days" },
  { label: "Past week", amount: 7, unit: "days" },
  { label: "Past month", amount: 30, unit: "days" },
];

// The two "up to a limit, or open to all" sliders.
export const SALARY = { max: 300000, step: 5000 };
export const EXPERIENCE = { max: 10, step: 1 };

export const EMPTY_HUNT =
  {
    roles: [], jobTypes: [], workModels: [], locations: [], levels: [], experience: { any: true, amount: 2 }, posted: null,
    salary: { any: true, amount: 80000 }, sponsorship: [], limits: [],
    industries: [], excludedIndustries: [], skills: [], excludedSkills: [], roleTypes: [],
    companies: [], stages: [], staffing: [], excludedCompanies: [],
    start: { year: "", season: "" }, graduation: { year: "", season: "" },
  };

// "24 hours", "3 days", "1 day".
export const postedLabel = ({ amount, unit }) => `${amount} ${amount === 1 ? unit.slice(0, -1) : unit}`;
