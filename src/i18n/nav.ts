import { projects, shownProjects, type Project } from '../data/profile';
import type { Lang, UiKey } from './ui';

const allHomeSections = ['about', 'projects', 'experience', 'skills', 'contact'] as const;

export type HomeSection = (typeof allHomeSections)[number];

/**
 * Section anchors of the home page in display order, shared by the nav, the language switch and the command palette.
 * The projects block is left out while no project is shown (see shownProjects in src/data/profile.ts).
 */
export const homeSections: HomeSection[] = allHomeSections.filter(
  (id) => id !== 'projects' || shownProjects().length > 0,
);

export type NavKey = 'about' | 'projects' | 'experience' | 'skills' | 'resume';

type NavItem = { key: NavKey; label: UiKey; target: string };

const allNavItems: NavItem[] = [
  { key: 'about', label: 'navAbout', target: '/#about' },
  { key: 'projects', label: 'navProjects', target: '/#projects' },
  { key: 'experience', label: 'navExperience', target: '/#experience' },
  { key: 'skills', label: 'navSkills', target: '/#skills' },
  { key: 'resume', label: 'navResume', target: '/resume/' },
];

/** Nav items in display order; the full target is `localePath(lang, target)`. Projects only while the home page has that block. */
export const navItems: NavItem[] = allNavItems.filter(
  (item) => item.key !== 'projects' || homeSections.includes('projects'),
);

export function otherLang(lang: Lang): Lang {
  return lang === 'en' ? 'vi' : 'en';
}

/** Case study data files (src/data/case-studies/<slug>.ts); empty when there is none. */
const caseStudyFiles = Object.keys(import.meta.glob('../data/case-studies/*.ts'));

/** Projects with a case study page, in declaration order: a slug, not planned, and a data file named after the slug. */
export function caseStudyProjects(): Project[] {
  return projects.filter((project) => {
    if (!project.slug || project.status === 'planned') return false;
    return caseStudyFiles.some((file) => file.endsWith(`/${project.slug}.ts`));
  });
}

export type CaseSectionId = 'why' | 'problem' | 'architecture' | 'decisions' | 'lifecycle' | 'status';

/** Sections of a case study page in display order; `id` is the anchor in both languages. Without `title` the heading comes from the data file. */
export const caseSections: { id: CaseSectionId; toc: UiKey; label: UiKey; title?: UiKey }[] = [
  { id: 'why', toc: 'tocWhy', label: 'csWhyLabel', title: 'csWhyTitle' },
  { id: 'problem', toc: 'tocProblem', label: 'csProblemLabel', title: 'csProblemTitle' },
  { id: 'architecture', toc: 'tocArchitecture', label: 'csArchLabel', title: 'csArchTitle' },
  { id: 'decisions', toc: 'tocDecisions', label: 'csDecisionsLabel', title: 'csDecisionsTitle' },
  { id: 'lifecycle', toc: 'tocLifecycle', label: 'csLifecycleLabel' },
  { id: 'status', toc: 'tocStatus', label: 'csStatusLabel', title: 'csStatusTitle' },
];
