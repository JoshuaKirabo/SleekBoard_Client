import {
  LOCATION_SUGGESTIONS, INDUSTRY_SUGGESTIONS, SKILL_SUGGESTIONS,
  JOB_TYPES, WORK_MODELS, LEVELS, SPONSORSHIP, LIMITS, ROLE_TYPES, STAGES, STAFFING,
} from "./huntOptions.js";
import { ALL_ROLES } from "./roleCatalog.js";
import { Field, Folded } from "./fields/Field.jsx";
import TagField from "./fields/TagField.jsx";
import ChoiceTiles from "./fields/ChoiceTiles.jsx";
import PostedWithin from "./fields/PostedWithin.jsx";
import SalaryField from "./fields/SalaryField.jsx";
import WhenField from "./fields/WhenField.jsx";

const sum = (...lists) => lists.reduce((total, list) => total + list.length, 0);
const filled = (when) => (when.year ? 1 : 0) + (when.season ? 1 : 0);

// The popup's sections in order: what the left-hand list shows, and how many picks each one holds.
export const SECTIONS = [
  {
    id: "basics",
    title: "The job",
    hint: "Roles, type, level, where",
    count: (hunt) => sum(hunt.roles, hunt.excludedTitles, hunt.jobTypes, hunt.workModels, hunt.levels, hunt.locations) + (hunt.posted ? 1 : 0),
  },
  {
    id: "pay",
    title: "Pay and visa",
    hint: "Salary, sponsorship, limits",
    count: (hunt) => (hunt.salary.any ? 0 : 1) + sum(hunt.sponsorship, hunt.limits),
  },
  {
    id: "interests",
    title: "Interests",
    hint: "Industries, skills, role type",
    count: (hunt) => sum(hunt.industries, hunt.excludedIndustries, hunt.skills, hunt.excludedSkills, hunt.roleTypes),
  },
  {
    id: "companies",
    title: "Companies",
    hint: "Pick or skip companies, stage",
    count: (hunt) => sum(hunt.companies, hunt.excludedCompanies, hunt.stages, hunt.staffing),
  },
  {
    id: "timing",
    title: "Timing",
    hint: "Start and graduation dates",
    count: (hunt) => filled(hunt.start) + filled(hunt.graduation),
  },
];

function Section({ id, title, index, children })
  {
    return (
      <section id={`hunt-${id}`} data-section={id} className="rise scroll-mt-6 space-y-7 pb-12" style={{ "--i": index + 1 }}>
        <h3 className="text-[22px] leading-tight font-bold tracking-[-0.015em]">{title}</h3>
        {children}
      </section>
    );
  }

// Everything you can tell the hunter, section by section. `set(key)` hands back a setter for one preference.
export default function HuntSections({ hunt, set, rolesInput })
  {
    return (
      <>
        <Section id="basics" title="The job" index={0}>
          <Field label="Roles" hint="The jobs you want. Pick from the list, or type one and press Enter.">
            <TagField label="Roles" values={hunt.roles} onChange={set("roles")} suggestions={ALL_ROLES} placeholder="Please select/enter your expected job function" big menu inputRef={rolesInput} />
          </Field>
          <Folded label="Titles to skip" count={hunt.excludedTitles.length}>
            <TagField label="Titles to skip" values={hunt.excludedTitles} onChange={set("excludedTitles")} placeholder="Senior, Staff, Principal…" />
          </Folded>
          <Field label="Posted within" hint="How new a job has to be for me to bring it to you.">
            <PostedWithin value={hunt.posted} onChange={set("posted")} />
          </Field>
          <Field label="Job type">
            <ChoiceTiles options={JOB_TYPES} values={hunt.jobTypes} onChange={set("jobTypes")} />
          </Field>
          <Field label="Work model">
            <ChoiceTiles options={WORK_MODELS} values={hunt.workModels} onChange={set("workModels")} columns="sm:grid-cols-3" />
          </Field>
          <Field label="Level">
            <ChoiceTiles options={LEVELS} values={hunt.levels} onChange={set("levels")} />
          </Field>
          <Field label="Where">
            <TagField label="Locations" values={hunt.locations} onChange={set("locations")} suggestions={LOCATION_SUGGESTIONS} placeholder="A city, state or country" />
          </Field>
        </Section>

        <Section id="pay" title="Pay and visa" index={1}>
          <Field label="Lowest salary">
            <SalaryField value={hunt.salary} onChange={set("salary")} />
          </Field>
          <Field label="Sponsorship" hint="Only jobs that say they sponsor, or companies that have sponsored this kind of role before.">
            <ChoiceTiles options={SPONSORSHIP} values={hunt.sponsorship} onChange={set("sponsorship")} />
          </Field>
          <Field label="Leave out jobs that need">
            <ChoiceTiles options={LIMITS} values={hunt.limits} onChange={set("limits")} />
          </Field>
        </Section>

        <Section id="interests" title="Interests" index={2}>
          <Field label="Industries">
            <TagField label="Industries" values={hunt.industries} onChange={set("industries")} suggestions={INDUSTRY_SUGGESTIONS} placeholder="Software, Fintech…" />
          </Field>
          <Folded label="Industries to skip" count={hunt.excludedIndustries.length}>
            <TagField label="Industries to skip" values={hunt.excludedIndustries} onChange={set("excludedIndustries")} suggestions={INDUSTRY_SUGGESTIONS} placeholder="An industry" />
          </Folded>
          <Field label="Skills">
            <TagField label="Skills" values={hunt.skills} onChange={set("skills")} suggestions={SKILL_SUGGESTIONS} placeholder="Java, Python, AWS…" />
          </Field>
          <Folded label="Skills to skip" count={hunt.excludedSkills.length}>
            <TagField label="Skills to skip" values={hunt.excludedSkills} onChange={set("excludedSkills")} suggestions={SKILL_SUGGESTIONS} placeholder="A skill" />
          </Folded>
          <Field label="Role type">
            <ChoiceTiles options={ROLE_TYPES} values={hunt.roleTypes} onChange={set("roleTypes")} />
          </Field>
        </Section>

        <Section id="companies" title="Companies" index={3}>
          <Field label="Companies you want" hint="Leave it empty to hear about any company.">
            <TagField label="Companies you want" values={hunt.companies} onChange={set("companies")} placeholder="NVIDIA, Stripe…" />
          </Field>
          <Field label="Companies to skip">
            <TagField label="Companies to skip" values={hunt.excludedCompanies} onChange={set("excludedCompanies")} placeholder="A company" />
          </Field>
          <Field label="Company stage">
            <ChoiceTiles options={STAGES} values={hunt.stages} onChange={set("stages")} />
          </Field>
          <Field label="Job source">
            <ChoiceTiles options={STAFFING} values={hunt.staffing} onChange={set("staffing")} />
          </Field>
        </Section>

        <Section id="timing" title="Timing" index={4}>
          <Field label="When you can start">
            <WhenField label="Start" value={hunt.start} onChange={set("start")} />
          </Field>
          <Field label="When you graduate">
            <WhenField label="Graduation" value={hunt.graduation} onChange={set("graduation")} />
          </Field>
        </Section>
      </>
    );
  }
