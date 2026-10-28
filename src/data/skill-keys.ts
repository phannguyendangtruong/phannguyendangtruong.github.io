import { experience, skills } from './profile';

/**
 * Shared keys of technologies named differently in `skills` and in the project lists of `experience`.
 * Other names use the default key of `skillKey`.
 */
const skillAliases: Record<string, string> = {
  'Java (8–21)': 'java',
  'Java 21': 'java',
  'Java 8': 'java',
  'Spring Boot': 'spring-boot',
  'Spring Boot 3.5': 'spring-boot',
  'Spring Data JPA / Hibernate': 'jpa',
  'Hibernate/JPA': 'jpa',
  'Apache Kafka': 'kafka',
  'Kafka': 'kafka',
  'MinIO (S3)': 'minio',
  'MinIO': 'minio',
};

/**
 * Key of a technology name, the same in the skills grid and in the experience projects ('Apache Kafka' and 'Kafka'
 * give 'kafka'). Without an alias: lower case, the part in brackets dropped, other characters than letters and
 * digits turned into '-'.
 */
export function skillKey(name: string): string {
  const alias = skillAliases[name];
  if (alias) return alias;
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Distinct keys of a list of technology names, in order. */
export function skillKeys(names: string[]): string[] {
  return [...new Set(names.map(skillKey))];
}

/** Number of projects in `experience` that use the technology of the key. */
export function projectCountForSkill(key: string): number {
  return experience.reduce(
    (count, job) => count + job.projects.filter((project) => skillKeys(project.tech).includes(key)).length,
    0,
  );
}

/** Name of the key in the skills grid, so the filter reads the same from either block; `fallback` when it has none. */
export function skillName(key: string, fallback: string): string {
  const names = skills.flatMap((group) => group.items);
  return names.find((name) => skillKey(name) === key) ?? fallback;
}
