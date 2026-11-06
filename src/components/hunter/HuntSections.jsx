import {
  LOCATION_SUGGESTIONS, INDUSTRY_SUGGESTIONS, SKILL_SUGGESTIONS, JOB_TYPES, WORK_MODELS, LEVELS, SPONSORSHIP, LIMITS,
  ROLE_TYPES, STAGES, STAFFING, SALARY, EXPERIENCE,
} from "./huntOptions.js";
import { ALL_ROLES } from "./roleCatalog.js";
import { Field, Folded } from "./fields/Field.jsx";
import TagField from "./fields/TagField.jsx";
import ChoiceTiles from "./fields/ChoiceTiles.jsx";
import PostedWithin from "./fields/PostedWithin.jsx";
import LimitField from "./fields/LimitField.jsx";
import WhenField from "./fields/WhenField.jsx";

const sum = (...lists) => lists.reduce((total, list) => total + list.length, 0);
const filled = (when) => (when.year ? 1 : 0) + (when.season ? 1 : 0);
const limited = (limit) => (limit.any ? 0 : 1);

const thousands = (amount) => `$${Math.round(amount / 1000)}k or more a year`;
const years = (amount) => (amount === 0 ? "No experience required" : `Up to ${amount}${amount === EXPERIENCE.max ? "+" : ""} ${amount === 1 ? "year" : "years"} required`);

// The popup's sections in Jobright's order: what the left-hand list shows, and how many picks each one holds.
export const SECTIONS = [
  {
    id: "basics",
    title: "Basic job criteria",
    hint: "Job function, type, work model…",
    count: (hunt) => sum(hunt.roles, hunt.jobTypes, hunt.workModels, hunt.locations, hunt.levels) + limited(hunt.experience) + (hunt.posted ? 1 : 0),
  },
  {
    id: "pay",
    title: "Compensation and sponsorship",
    hint: "Annual salary, H1B sponsorship",
    count: (hunt) => limited(hunt.salary) + sum(hunt.sponsorship, hunt.limits),
  },
  {
    id: "interests",
    title: "Areas of interest",
    hint: "Industry, skill, role type",
    count: (hunt) => sum(hunt.industries, hunt.excludedIndustries, hunt.skills, hunt.excludedSkills, hunt.roleTypes),
  },
  {
    id: "companies",
    title: "Company insights",
    hint: "Companies, stage, staffing agencies",
    count: (hunt) => sum(hunt.companies, hunt.stages, hunt.staffing, hunt.excludedCompanies),
  },
  {
    id: "timing",
    title: "Timing",
    hint: "Start and graduation dates",
    count: (hunt) => filled(hunt.start) + filled(hunt.graduation),
  },
];

function Section({ id, index, children })
  {
    const { title } = SECTIONS[index];
    return (
      <section id={`hunt-${id}`} data-section={id} className="rise scroll-mt-6 space-y-7 pb-12" style={{ "--i": index + 1 }}>
        <h3 className="text-[22px] leading-tight font-bold tracking-[-0.015em]">{title}</h3>
        {children}
      </section>
    );
  }

// Everything you can tell the hunter, section by section. `set(key)` hands back a setter for one preference, and
// `clear(key, empty)` a Clear all for it, or nothing while it's already empty.
export default function HuntSections({ hunt, set, rolesInput })
  {
    const clear = (key, empty = []) =>
      {
        const value = hunt[key];
        const isEmpty = Array.isArray(value) ? !value.length : !value;
        return isEmpty ? undefined : () => set(key)(empty);
      };

    return (
      <>
        <Section id="basics" index={0}>
          <Field label="Job function" hint="Pick from the list for the best results, or type one and press Enter.">
            <TagField label="Job function" values={hunt.roles} onChange={set("roles")} suggestions={ALL_ROLES} placeholder="Please select/enter your expected job function" big menu inputRef={rolesInput} />
          </Field>
          <Field label="Job type">
            <ChoiceTiles options={JOB_TYPES} values={hunt.jobTypes} onChange={set("jobTypes")} />
          </Field>
          <Field label="Work model">
            <ChoiceTiles options={WORK_MODELS} values={hunt.workModels} onChange={set("workModels")} />
          </Field>
          <Field label="Location">
            <TagField label="Location" values={hunt.locations} onChange={set("locations")} suggestions={LOCATION_SUGGESTIONS} placeholder="A city, state or country" />
          </Field>
          <Field label="Experience level">
            <ChoiceTiles options={LEVELS} values={hunt.levels} onChange={set("levels")} />
          </Field>
          <Field label="Required experience" hint="Skip jobs that ask for more years than this.">
            <LimitField value={hunt.experience} onChange={set("experience")} max={EXPERIENCE.max} step={EXPERIENCE.step} describe={years} anyLabel="Any requirements" sliderLabel="Most years of experience a job may ask for" />
          </Field>
          <Field label="Date posted" hint="How new a job has to be for me to bring it to you." onClear={clear("posted", null)}>
            <PostedWithin value={hunt.posted} onChange={set("posted")} />
          </Field>
        </Section>

        <Section id="pay" index={1}>
          <Field label="Minimum annual salary">
            <LimitField value={hunt.salary} onChange={set("salary")} max={SALARY.max} step={SALARY.step} describe={thousands} anyLabel="Any salary" sliderLabel="Minimum yearly salary" />
          </Field>
          <Field label="Work authorization" hint="Jobs that say they sponsor H1B, or come from companies that have recently sponsored H1B for similar roles.">
            <ChoiceTiles options={SPONSORSHIP} values={hunt.sponsorship} onChange={set("sponsorship")} />
          </Field>
          <Field label="Exclude jobs with limitations">
            <ChoiceTiles options={LIMITS} values={hunt.limits} onChange={set("limits")} />
          </Field>
        </Section>

        <Section id="interests" index={2}>
          <Field label="Industry" onClear={clear("industries")}>
            <TagField label="Industry" values={hunt.industries} onChange={set("industries")} suggestions={INDUSTRY_SUGGESTIONS} placeholder="Software, Fintech…" />
          </Field>
          <Folded label="Excluded industries" count={hunt.excludedIndustries.length}>
            <TagField label="Excluded industries" values={hunt.excludedIndustries} onChange={set("excludedIndustries")} suggestions={INDUSTRY_SUGGESTIONS} placeholder="An industry" />
          </Folded>
          <Field label="Skill" onClear={clear("skills")}>
            <TagField label="Skill" values={hunt.skills} onChange={set("skills")} suggestions={SKILL_SUGGESTIONS} placeholder="Java, Python, AWS…" />
          </Field>
          <Folded label="Excluded skills" count={hunt.excludedSkills.length}>
            <TagField label="Excluded skills" values={hunt.excludedSkills} onChange={set("excludedSkills")} suggestions={SKILL_SUGGESTIONS} placeholder="A skill" />
          </Folded>
          <Field label="Role type" onClear={clear("roleTypes")}>
            <ChoiceTiles options={ROLE_TYPES} values={hunt.roleTypes} onChange={set("roleTypes")} />
          </Field>
        </Section>

        <Section id="companies" index={3}>
          <Field label="Company" hint="Leave it empty to hear about any company." onClear={clear("companies")}>
            <TagField label="Company" values={hunt.companies} onChange={set("companies")} placeholder="NVIDIA, Stripe…" />
          </Field>
          <Field label="Company stage" onClear={clear("stages")}>
            <ChoiceTiles options={STAGES} values={hunt.stages} onChange={set("stages")} />
          </Field>
          <Field label="Job source">
            <ChoiceTiles options={STAFFING} values={hunt.staffing} onChange={set("staffing")} />
          </Field>
          <Field label="Exclude company" onClear={clear("excludedCompanies")}>
            <TagField label="Exclude company" values={hunt.excludedCompanies} onChange={set("excludedCompanies")} placeholder="A company" />
          </Field>
        </Section>

        <Section id="timing" index={4}>
          <Field label="Start time">
            <WhenField label="Start" value={hunt.start} onChange={set("start")} />
          </Field>
          <Field label="Graduation time">
            <WhenField label="Graduation" value={hunt.graduation} onChange={set("graduation")} />
          </Field>
        </Section>
      </>
    );
  }
