import * as profileData from './profile';
import { ui } from '../i18n/ui';

const emailPattern = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const phonePattern = /\+?\d(?:[ .-]?\d){8,}/;
const optionalUrlKeys = ['repoUrl', 'demoUrl'];
const caseStudyPath = /^\.\/case-studies\/(.+)\.ts$/;

/** Data files that later features add; each glob is empty until the file exists. */
const extraModules = {
  ...import.meta.glob('./hero.ts', { eager: true }),
  ...import.meta.glob('./case-studies/*.ts', { eager: true }),
};

/** Reference fields of a case study file; only these are read here, so the check does not depend on the case study page files. */
type CaseStudyRefs = {
  slug: string;
  architecture: {
    diagram: {
      nodes: { id: string }[];
      edges: { id: string; from: string; to: string }[];
      labels: { edges: string[] }[];
    };
  };
  lifecycle: {
    main: { code: string }[];
    branches: { code: string; from: string }[];
    returns: { from: string; to: string }[];
  };
};

let checked = false;

function lastKey(path: string): string {
  return path.split('.').pop() ?? '';
}

function isUrlKey(path: string): boolean {
  return path.startsWith('profile.links.') || optionalUrlKeys.includes(lastKey(path));
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.includes('.');
  } catch (_) {
    return false;
  }
}

function checkString(value: string, file: string, path: string): void {
  if (value.trim() === '') {
    if (optionalUrlKeys.includes(lastKey(path))) return;
    throw new Error(`Dữ liệu nội dung: chuỗi rỗng tại ${file} › ${path}.`);
  }
  if (isUrlKey(path)) {
    if (!isHttpsUrl(value)) {
      throw new Error(`Dữ liệu nội dung: URL không hợp lệ tại ${file} › ${path}: ${value}. Cần dạng https://…`);
    }
    return;
  }
  if (emailPattern.test(value) || phonePattern.test(value)) {
    throw new Error(
      `Dữ liệu nội dung: ${file} › ${path} có dạng email hoặc số điện thoại, không được đưa lên trang công khai.`,
    );
  }
}

function walk(value: unknown, file: string, path: string): void {
  if (typeof value === 'string') {
    checkString(value, file, path);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, file, `${path}[${index}]`));
    return;
  }
  if (value === null || typeof value !== 'object') return;
  const record = value as Record<string, unknown>;
  if (Array.isArray(record.en) && Array.isArray(record.vi) && record.en.length !== record.vi.length) {
    throw new Error(
      `Dữ liệu nội dung: ${file} › ${path} có ${record.en.length} dòng tiếng Anh nhưng ${record.vi.length} dòng tiếng Việt.`,
    );
  }
  Object.entries(record).forEach(([key, item]) => walk(item, file, `${path}.${key}`));
}

function checkSlugs(): void {
  const seen = new Set<string>();
  profileData.projects.forEach((project) => {
    if (!project.slug) return;
    if (seen.has(project.slug)) {
      throw new Error(`Dữ liệu nội dung: slug dự án bị trùng: ${project.slug}.`);
    }
    seen.add(project.slug);
  });
}

/**
 * Data files to check: hero.ts and the case study of each project slug. A case study file whose slug is not in
 * `projects` is never built (the project was taken off the site), so it is left out until it is deleted.
 */
function checkedModules(): [string, unknown][] {
  const slugs = new Set(profileData.projects.flatMap((project) => (project.slug ? [project.slug] : [])));
  return Object.entries(extraModules).filter(([modulePath]) => {
    const match = caseStudyPath.exec(modulePath);
    return !match || slugs.has(match[1]);
  });
}

/** Set of the given ids; stops at the first duplicate. */
function uniqueIds(ids: string[], file: string): Set<string> {
  const seen = new Set<string>();
  ids.forEach((id) => {
    if (seen.has(id)) {
      throw new Error(`Dữ liệu nội dung: ${file} có mã trùng: ${id}.`);
    }
    seen.add(id);
  });
  return seen;
}

function checkReference(ids: Set<string>, value: string, file: string, path: string): void {
  if (ids.has(value)) return;
  throw new Error(`Dữ liệu nội dung: ${file} › ${path} trỏ tới ${value} không tồn tại.`);
}

function checkCaseStudy(name: string, caseStudy: CaseStudyRefs): void {
  const file = `src/data/case-studies/${name}.ts`;
  if (caseStudy.slug !== name) {
    throw new Error(`Dữ liệu nội dung: ${file} › slug trỏ tới ${caseStudy.slug} không tồn tại.`);
  }
  const { nodes, edges, labels } = caseStudy.architecture.diagram;
  const nodeIds = uniqueIds(nodes.map((node) => node.id), file);
  const edgeIds = uniqueIds(edges.map((edge) => edge.id), file);
  edges.forEach((edge, index) => {
    (['from', 'to'] as const).forEach((end) => {
      checkReference(nodeIds, edge[end], file, `architecture.diagram.edges[${index}].${end}`);
    });
  });
  labels.forEach((label, index) => {
    label.edges.forEach((edgeId, position) => {
      checkReference(edgeIds, edgeId, file, `architecture.diagram.labels[${index}].edges[${position}]`);
    });
  });
  const { main, branches, returns } = caseStudy.lifecycle;
  const mainCodes = new Set(main.map((state) => state.code));
  const allCodes = uniqueIds([...main, ...branches].map((state) => state.code), file);
  branches.forEach((branch, index) => {
    checkReference(mainCodes, branch.from, file, `lifecycle.branches[${index}].from`);
  });
  returns.forEach((transition, index) => {
    (['from', 'to'] as const).forEach((end) => {
      checkReference(allCodes, transition[end], file, `lifecycle.returns[${index}].${end}`);
    });
  });
}

/** Reference checks inside each checked src/data/case-studies/<slug>.ts. */
function checkCaseStudies(modules: [string, unknown][]): void {
  modules.forEach(([modulePath, module]) => {
    const match = caseStudyPath.exec(modulePath);
    const caseStudy = (module as { caseStudy?: CaseStudyRefs }).caseStudy;
    if (match && caseStudy) checkCaseStudy(match[1], caseStudy);
  });
}

/** Stops the build at the first content error; runs once per build. */
export function validateContent(): void {
  if (checked) return;
  Object.entries(profileData).forEach(([name, value]) => walk(value, 'src/data/profile.ts', name));
  walk(ui, 'src/i18n/ui.ts', 'ui');
  const modules = checkedModules();
  modules.forEach(([modulePath, module]) => {
    const file = `src/data/${modulePath.replace(/^\.\//, '')}`;
    Object.entries(module as Record<string, unknown>).forEach(([name, value]) => walk(value, file, name));
  });
  checkSlugs();
  checkCaseStudies(modules);
  checked = true;
}
