// Everything the hunt preferences popup offers, and what a hunt looks like before you've picked anything.

export const LOCATION_SUGGESTIONS = [
  "United States", "Remote in the US", "New York, NY", "San Francisco, CA", "Seattle, WA", "Austin, TX", "Boston, MA",
  "Chicago, IL", "Los Angeles, CA", "Phoenix, AZ", "Canada", "United Kingdom",
];

export const INDUSTRY_SUGGESTIONS = [
  "Information Technology", "Artificial Intelligence", "Software", "Financial Services", "Fintech", "Consulting",
  "Healthcare", "E-commerce", "Education", "Gaming", "Cybersecurity",
];

export const SKILL_SUGGESTIONS = [
  "Java", "JavaScript", "TypeScript", "Python", "React", "Node.js", "SQL", "AWS", "Docker", "Kubernetes", "Bash",
  "C++", "Go", "PyTorch",
];

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
export const WORK_MODELS = ["Onsite", "Hybrid", "Remote"];
export const LEVELS = ["Intern/New grad", "Entry level", "Mid level", "Senior"];
export const SPONSORSHIP = ["Needs H1B sponsorship"];
export const LIMITS = ["Security clearance required", "US citizens only"];
export const ROLE_TYPES = ["Individual contributor", "Manager"];
export const STAGES = ["Early stage", "Growth stage", "Late stage", "Public company"];
export const STAFFING = ["Skip staffing agencies"];

export const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
const thisYear = new Date().getFullYear();
export const YEARS = [0, 1, 2, 3].map((ahead) => String(thisYear + ahead));

// How new a job has to be. You pick it; the quick picks are only shortcuts.
export const POSTED_PRESETS = [
  { amount: 6, unit: "hours" },
  { amount: 24, unit: "hours" },
  { amount: 3, unit: "days" },
  { amount: 7, unit: "days" },
];

export const SALARY_MAX = 300000;
export const SALARY_STEP = 5000;

export const EMPTY_HUNT =
  {
    roles: [], excludedTitles: [], jobTypes: [], workModels: [], levels: [], locations: [], posted: null,
    salary: { any: true, min: 80000 }, sponsorship: [], limits: [],
    industries: [], excludedIndustries: [], skills: [], excludedSkills: [], roleTypes: [],
    companies: [], excludedCompanies: [], stages: [], staffing: [],
    start: { year: "", season: "" }, graduation: { year: "", season: "" },
  };

// "24 hours", "3 days", "1 day".
export const postedLabel = ({ amount, unit }) => `${amount} ${amount === 1 ? unit.slice(0, -1) : unit}`;
