import {
  LOCATION_SUGGESTIONS, INDUSTRY_SUGGESTIONS, SKILL_SUGGESTIONS, JOB_TYPES, WORK_MODELS, LEVELS, SPONSORSHIP, LIMITS,
  ROLE_TYPES, STAGES, STAFFING, SALARY, EXPERIENCE,
} from "./huntOptions.js";
import { ALL_ROLES } from "./roleCatalog.js";
import { Field } from "./fields/Field.jsx";
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
    count: (hunt) => sum(hunt.roles, hunt.jobTypes, hunt.workModels, hunt.locations, hunt.levels) + limited(hunt.experience) + (hunt.posted ? 1 : 0),
  },
  {
    id: "pay",
    title: "Compensation and sponsorship",
    count: (hunt) => limited(hunt.salary) + sum(hunt.sponsorship, hunt.limits),
  },
  {
    id: "interests",
    title: "Areas of interest",
    count: (hunt) => sum(hunt.industries, hunt.skills, hunt.roleTypes),
  },
  {
    id: "companies",
    title: "Company insights",
    count: (hunt) => sum(hunt.companies, hunt.stages, hunt.staffing, hunt.excludedCompanies),
  },
  {
    id: "timing",
    title: "Timing",
    count: (hunt) => filled(hunt.start) + filled(hunt.graduation),
  },
];

function Section({ id, index, children })
  {
    const { title } = SECTIONS[index];
    return (
      <section id={`hunt-${id}`} data-section={id} className="rise scroll-mt-6 pb-14" style={{ "--i": index + 1 }}>
        <h3 className="mb-5 text-[18px] leading-tight font-semibold tracking-[-0.01em]">{title}</h3>
        <div className="space-y-8">{children}</div>
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

    // The same for a year-and-season pair, which is empty when neither half is picked.
    const clearWhen = (key) => (filled(hunt[key]) ? () => set(key)({ year: "", season: "" }) : undefined);

    return (
      <>
        <Section id="basics" index={0}>
          <Field label="Job function" required onClear={clear("roles")}>
            <TagField label="Job function" values={hunt.roles} onChange={set("roles")} suggestions={ALL_ROLES} placeholder="Please select/enter your expected job function" big menu inputRef={rolesInput} />
          </Field>
          <Field label="Date posted" required onClear={clear("posted", null)}>
            <PostedWithin value={hunt.posted} onChange={set("posted")} />
          </Field>
          <Field label="Job type" onClear={clear("jobTypes")}>
            <ChoiceTiles options={JOB_TYPES} values={hunt.jobTypes} onChange={set("jobTypes")} />
          </Field>
          <Field label="Work model" onClear={clear("workModels")}>
            <ChoiceTiles options={WORK_MODELS} values={hunt.workModels} onChange={set("workModels")} />
          </Field>
          <Field label="Location" onClear={clear("locations")}>
            <TagField label="Location" values={hunt.locations} onChange={set("locations")} suggestions={LOCATION_SUGGESTIONS} placeholder="A city, state or country" places />
          </Field>
          <Field label="Experience level" onClear={clear("levels")}>
            <ChoiceTiles options={LEVELS} values={hunt.levels} onChange={set("levels")} />
          </Field>
          <Field label="Required experience">
            <LimitField value={hunt.experience} onChange={set("experience")} max={EXPERIENCE.max} step={EXPERIENCE.step} describe={years} anyLabel="Any requirements" sliderLabel="Most years of experience a job may ask for" />
          </Field>
        </Section>

        <Section id="pay" index={1}>
          <Field label="Minimum annual salary">
            <LimitField value={hunt.salary} onChange={set("salary")} max={SALARY.max} step={SALARY.step} describe={thousands} anyLabel="Any salary" sliderLabel="Minimum yearly salary" />
          </Field>
          <Field label="Work authorization">
            <ChoiceTiles options={SPONSORSHIP} values={hunt.sponsorship} onChange={set("sponsorship")} />
          </Field>
          <Field label="Exclude jobs with limitations" onClear={clear("limits")}>
            <ChoiceTiles options={LIMITS} values={hunt.limits} onChange={set("limits")} />
          </Field>
        </Section>

        <Section id="interests" index={2}>
          <Field label="Industry" onClear={clear("industries")}>
            <TagField label="Industry" values={hunt.industries} onChange={set("industries")} suggestions={INDUSTRY_SUGGESTIONS} />
          </Field>
          <Field label="Skill" onClear={clear("skills")}>
            <TagField label="Skill" values={hunt.skills} onChange={set("skills")} suggestions={SKILL_SUGGESTIONS} />
          </Field>
          <Field label="Role type" onClear={clear("roleTypes")}>
            <ChoiceTiles options={ROLE_TYPES} values={hunt.roleTypes} onChange={set("roleTypes")} />
          </Field>
        </Section>

        <Section id="companies" index={3}>
          <Field label="Company" onClear={clear("companies")}>
            <TagField label="Company" values={hunt.companies} onChange={set("companies")} />
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
          <Field label="Start time" onClear={clearWhen("start")}>
            <WhenField label="Start" value={hunt.start} onChange={set("start")} />
          </Field>
          <Field label="Graduation time" onClear={clearWhen("graduation")}>
            <WhenField label="Graduation" value={hunt.graduation} onChange={set("graduation")} />
          </Field>
        </Section>
      </>
    );
  }
