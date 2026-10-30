import { education, experienceNewestFirst, isCurrentJob, profile, skills } from './profile';
import { formatPeriod, type Lang } from '../i18n/ui';

/** Path of the profile JSON file without the language prefix; the full link is `localePath(lang, profileJsonPath)`. */
export const profileJsonPath = '/api/me.json';

/** The profile served as /api/me.json: only what the page already shows publicly, never contact details. */
export type ProfileJson = {
  name: string;
  role: string;
  location: string;
  /** Year of birth; the key is left out when the profile has none. */
  born?: number;
  summary: string;
  links: { github: string; linkedin: string };
  stack: string[];
  experience: {
    company: string;
    role: string;
    period: string;
    current: boolean;
    projects: { name: string; summary: string; stack: string[] }[];
  }[];
  skills: Record<string, string[]>;
  education: { school: string; major?: string; period?: string };
};

/** Profile data in one language, experience newest first. */
export function profileJson(lang: Lang): ProfileJson {
  return {
    name: profile.name[lang],
    role: profile.role[lang],
    location: profile.location[lang],
    ...(profile.birthYear === undefined ? {} : { born: profile.birthYear }),
    summary: profile.tagline[lang],
    links: { github: profile.links.github, linkedin: profile.links.linkedin },
    stack: [...profile.coreTech],
    experience: experienceNewestFirst().map((job) => ({
      company: job.company[lang],
      role: job.role[lang],
      period: formatPeriod(job.start, job.end, lang),
      current: isCurrentJob(job),
      projects: job.projects.map((project) => ({
        name: project.name[lang],
        summary: project.summary[lang],
        stack: [...project.tech],
      })),
    })),
    skills: Object.fromEntries(skills.map((group): [string, string[]] => [group.group[lang], [...group.items]])),
    education: {
      school: education.school[lang],
      major: education.major?.[lang],
      period: education.period?.[lang],
    },
  };
}

/** Text of the JSON file: `profileJson` indented by two spaces, with a final newline. */
export function profileJsonText(lang: Lang): string {
  return `${JSON.stringify(profileJson(lang), null, 2)}\n`;
}

/** Size of a text in kilobytes (UTF-8 bytes / 1024) with one decimal, in the number format of the language. */
export function sizeInKb(text: string, lang: Lang): string {
  const kb = new TextEncoder().encode(text).length / 1024;
  return new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(kb);
}

export type JsonTokenKind = 'key' | 'string' | 'number' | 'literal' | 'punct' | 'space';

/** One line of a JSON text for the syntax colouring: its indent in characters and its tokens in order. */
export type JsonLine = { indent: number; tokens: { kind: JsonTokenKind; text: string }[] };

/** A string (a key when a colon follows), a number, true/false/null, punctuation or spaces of JSON.stringify output. */
const tokenPattern = /("(?:[^"\\]|\\.)*")(:?)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false|null)|([{}[\],:])|(\s+)/g;

/** Lines of a JSON text split into tokens at build time, so the page colours the code without a script. */
export function jsonLines(text: string): JsonLine[] {
  return text
    .replace(/\n$/, '')
    .split('\n')
    .map((line) => {
      const tokens: JsonLine['tokens'] = [];
      for (const [, str, colon, num, literal, punct, space] of line.matchAll(tokenPattern)) {
        if (str !== undefined) {
          tokens.push({ kind: colon ? 'key' : 'string', text: str });
          if (colon) tokens.push({ kind: 'punct', text: colon });
        } else if (num !== undefined) {
          tokens.push({ kind: 'number', text: num });
        } else if (literal !== undefined) {
          tokens.push({ kind: 'literal', text: literal });
        } else if (punct !== undefined) {
          tokens.push({ kind: 'punct', text: punct });
        } else if (space !== undefined) {
          tokens.push({ kind: 'space', text: space });
        }
      }
      return { indent: line.length - line.trimStart().length, tokens };
    });
}
