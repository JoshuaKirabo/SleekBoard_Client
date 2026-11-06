// The roles the picker offers, by field and then by kind of work. Our own list; typing anything else still works.
export const ROLE_CATALOG = [
  {
    name: "Software, Internet and AI",
    groups: [
      { name: "Software engineering", roles: ["Software Engineer", "Backend Engineer", "Frontend Engineer", "Full Stack Engineer", "Java Engineer", "Python Engineer", "Mobile Engineer", "iOS Engineer", "Android Engineer", "Embedded Engineer", "Game Developer"] },
      { name: "AI and machine learning", roles: ["Machine Learning Engineer", "AI Engineer", "LLM Engineer", "Machine Learning/AI Researcher", "Machine Learning, Deep Learning", "Machine Learning, Model Training and Inference", "Machine Learning, Operations (ML Ops)", "Machine Learning, Infrastructure", "Machine Learning, Search System", "Machine Learning, Ads", "Computer Vision Engineer", "NLP Engineer", "Data Annotation/AI Tutor"] },
      { name: "Data", roles: ["Data Scientist", "Data Engineer", "Data Analyst", "Analytics Engineer", "Business Intelligence Analyst"] },
      { name: "Infrastructure and security", roles: ["DevOps Engineer", "Site Reliability Engineer", "Cloud Engineer", "Platform Engineer", "Security Engineer", "Network Engineer"] },
      { name: "Quality and IT", roles: ["QA Engineer", "Test Automation Engineer", "Solutions Engineer", "IT Support Specialist", "Systems Administrator"] },
    ],
  },
  {
    name: "Product",
    groups: [
      { name: "Product management", roles: ["Product Manager", "Technical Product Manager", "Associate Product Manager", "Product Owner"] },
      { name: "Programs and projects", roles: ["Program Manager", "Technical Program Manager", "Project Manager", "Scrum Master"] },
      { name: "Product operations", roles: ["Product Operations", "Product Analyst"] },
    ],
  },
  {
    name: "Creative and Design",
    groups: [
      { name: "Product design", roles: ["Product Designer", "UX Designer", "UI Designer", "UX Researcher", "Interaction Designer"] },
      { name: "Visual and brand", roles: ["Graphic Designer", "Brand Designer", "Illustrator", "Motion Designer"] },
      { name: "Content", roles: ["Video Editor", "Content Creator", "Photographer"] },
    ],
  },
  {
    name: "Marketing",
    groups: [
      { name: "Content and SEO", roles: ["Content Marketing", "Social Media Manager", "SEO Specialist", "Copywriter"] },
      { name: "Brand and communications", roles: ["Brand Manager", "Public Relations", "Event Marketing", "Community Manager"] },
      { name: "Growth", roles: ["Growth Marketing", "Performance Marketing", "Advertising Specialist", "Marketing Analyst"] },
      { name: "Product marketing", roles: ["Product Marketing Manager"] },
    ],
  },
  {
    name: "Sales",
    groups: [
      { name: "Selling", roles: ["Account Executive", "Account Manager", "Sales Development Representative", "Business Development Representative"] },
      { name: "Technical sales", roles: ["Sales Engineer", "Solutions Consultant"] },
      { name: "Partnerships", roles: ["Partnerships Manager", "Channel Sales Manager"] },
    ],
  },
  {
    name: "Customer Service",
    groups: [
      { name: "Support and success", roles: ["Customer Support Specialist", "Technical Support Engineer", "Customer Success Manager", "Implementation Specialist"] },
    ],
  },
  {
    name: "Consulting",
    groups: [
      { name: "Strategy", roles: ["Management Consultant", "Strategy Analyst", "Business Analyst"] },
      { name: "Technology", roles: ["Technology Consultant", "IT Consultant", "ERP Consultant"] },
      { name: "Risk and advisory", roles: ["Risk Consultant", "Forensic Consultant"] },
    ],
  },
  {
    name: "Finance",
    groups: [
      { name: "Accounting", roles: ["Accountant", "Staff Accountant", "Auditor", "Tax Associate", "Bookkeeper"] },
      { name: "Banking and investing", roles: ["Investment Banking Analyst", "Financial Analyst", "Equity Research Analyst", "Quantitative Analyst", "Trader"] },
      { name: "Corporate finance", roles: ["FP&A Analyst", "Treasury Analyst", "Controller"] },
      { name: "Risk and compliance", roles: ["Risk Analyst", "Compliance Analyst", "Credit Analyst"] },
    ],
  },
  {
    name: "Healthcare",
    groups: [
      { name: "Clinical", roles: ["Registered Nurse", "Medical Assistant", "Physician Assistant", "Pharmacist"] },
      { name: "Research and health tech", roles: ["Clinical Research Coordinator", "Health Data Analyst", "Biomedical Engineer"] },
      { name: "Administration", roles: ["Medical Billing Specialist", "Healthcare Administrator"] },
    ],
  },
  {
    name: "Electrical Engineering",
    groups: [
      { name: "Hardware", roles: ["Electrical Engineer", "Hardware Engineer", "FPGA Engineer", "PCB Designer"] },
      { name: "Chips", roles: ["ASIC Design Engineer", "Verification Engineer", "Semiconductor Process Engineer"] },
      { name: "Systems", roles: ["Firmware Engineer", "Controls Engineer", "RF Engineer", "Power Systems Engineer"] },
    ],
  },
  {
    name: "Mechanical and Civil Engineering",
    groups: [
      { name: "Engineering", roles: ["Mechanical Engineer", "Civil Engineer", "Structural Engineer", "Aerospace Engineer", "Robotics Engineer"] },
    ],
  },
  {
    name: "Production and Manufacturing",
    groups: [
      { name: "Manufacturing", roles: ["Manufacturing Engineer", "Process Engineer", "Quality Engineer", "Industrial Engineer"] },
      { name: "Supply chain", roles: ["Supply Chain Analyst", "Logistics Coordinator", "Procurement Specialist", "Operations Analyst"] },
    ],
  },
  {
    name: "HR, Admin and Legal",
    groups: [
      { name: "People", roles: ["Recruiter", "Talent Acquisition Coordinator", "HR Generalist", "People Operations"] },
      { name: "Admin", roles: ["Administrative Assistant", "Executive Assistant", "Office Manager"] },
      { name: "Legal", roles: ["Paralegal", "Legal Assistant", "Contracts Manager", "Compliance Specialist"] },
    ],
  },
  {
    name: "Education",
    groups: [
      { name: "Teaching", roles: ["Teacher", "Teaching Assistant", "Tutor", "Instructional Designer"] },
    ],
  },
];

// Every role in one flat list, for matching what you type.
export const ALL_ROLES = ROLE_CATALOG.flatMap((field) => field.groups.flatMap((group) => group.roles));

// The roles that contain what you typed, still grouped by field, so a search reads like a smaller catalog.
export const searchCatalog = (query) =>
  {
    const needle = query.trim().toLowerCase();
    return ROLE_CATALOG
      .map((field) => ({ name: field.name, roles: field.groups.flatMap((group) => group.roles).filter((role) => role.toLowerCase().includes(needle)) }))
      .filter((field) => field.roles.length);
  };
