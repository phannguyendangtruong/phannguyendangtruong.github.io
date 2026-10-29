import { experience, monthIndex, type Job } from './profile';
import { skillKey, skillKeys, skillName } from './skill-keys';
import type { Text } from '../i18n/ui';

/** Colour tokens of the lines in src/styles/global.css, in route number order. */
const lineTokens = ['--line-1', '--line-2', '--line-3'] as const;
/** Tokens of the text set on each line colour (route bullets), in the same order. */
const onLineTokens = ['--on-line-1', '--on-line-2', '--on-line-3'] as const;

export type JobProject = Job['projects'][number];

/** A project of a job: a station on the line of that job. */
export type Station = {
  /** Map key: the English project name without the part in brackets, slugged ("customer-care-portal"). */
  key: string;
  /** Route number of the line. */
  line: number;
  name: Text;
  project: JobProject;
  /** Technology keys of the project (see skillKey), in order. */
  tech: string[];
};

/** A job as a line of the network; lines are numbered by start month, the first job is line 1. */
export type Line = {
  number: number;
  /** Map key of the start of the line: "line-1". */
  key: string;
  job: Job;
  /** CSS colour of the line: "var(--line-1)". */
  color: string;
  /** CSS colour of text on the line colour: "var(--on-line-1)". */
  textColor: string;
  stations: Station[];
};

/** A technology used at two companies or more: the interchange where their lines meet. */
export type Interchange = {
  /** Technology key (see skillKey), also its map key: "spring-boot". */
  key: string;
  /** Name in the skills list, otherwise as first written in a project. */
  name: string;
  /** Route numbers of the lines through it, ascending. */
  lines: number[];
  /** Keys of the stations whose project uses it. */
  stations: string[];
};

export type PointKind = 'start' | 'station' | 'interchange' | 'end';

/** A point a map can place: the start of a line, a station, an interchange or the shared end of all lines. */
export type MapPoint = { key: string; kind: PointKind; lines: number[] };

/** Map key of the shared end of all lines (the present). */
export const endKey = 'now';

function slug(value: string): string {
  const key = value
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!key) throw new Error(`Sơ đồ tuyến: không tạo được khoá ga từ tên dự án "${value}".`);
  return key;
}

function buildLines(): Line[] {
  const jobs = [...experience].sort((a, b) => monthIndex(a.start) - monthIndex(b.start));
  if (jobs.length > lineTokens.length) {
    throw new Error(
      `Dữ liệu nội dung: có ${jobs.length} công ty nhưng src/styles/global.css chỉ có ${lineTokens.length} màu tuyến (--line-1…).`,
    );
  }
  return jobs.map((job, index) => {
    const number = index + 1;
    return {
      number,
      key: `line-${number}`,
      job,
      color: `var(${lineTokens[index]})`,
      textColor: `var(${onLineTokens[index]})`,
      stations: job.projects.map((project) => ({
        key: slug(project.name.en),
        line: number,
        name: project.name,
        project,
        tech: skillKeys(project.tech),
      })),
    };
  });
}

/** Lines of the network in route order: line 1 is the first job of `experience`. */
export const lines: Line[] = buildLines();

type Found = { name: string; lines: Set<number>; stations: string[] };

function buildInterchanges(): Interchange[] {
  const found = new Map<string, Found>();
  lines.forEach((line) => {
    line.stations.forEach((station) => {
      station.project.tech.forEach((name) => {
        const key = skillKey(name);
        const entry: Found = found.get(key) ?? { name, lines: new Set<number>(), stations: [] };
        entry.lines.add(line.number);
        if (!entry.stations.includes(station.key)) entry.stations.push(station.key);
        found.set(key, entry);
      });
    });
  });
  return [...found.entries()]
    .filter(([, entry]) => entry.lines.size >= 2)
    .map(([key, entry]) => ({
      key,
      name: skillName(key, entry.name),
      lines: [...entry.lines].sort((a, b) => a - b),
      stations: entry.stations,
    }))
    .sort(
      (a, b) =>
        b.lines.length - a.lines.length || b.stations.length - a.stations.length || a.name.localeCompare(b.name, 'en'),
    );
}

/**
 * Interchanges computed from `experience`, never listed by hand: technologies used at two companies or more, those
 * with the most lines first.
 */
export const interchanges: Interchange[] = buildInterchanges();

/** Interchanges that every line goes through. */
export function hubs(): Interchange[] {
  return interchanges.filter((item) => item.lines.length === lines.length);
}

/** Line of a route number; stops the build for a number with no line. */
export function lineByNumber(number: number): Line {
  const line = lines.find((item) => item.number === number);
  if (!line) throw new Error(`Sơ đồ tuyến: không có tuyến số ${number}.`);
  return line;
}

/** CSS colour of a line by route number; without a number, the neutral colour of diagrams that belong to no job. */
export function lineColor(number?: number): string {
  return number === undefined ? 'var(--line-neutral)' : lineByNumber(number).color;
}

/** Line of a job of `experience`. */
export function lineOfJob(job: Job): Line {
  const line = lines.find((item) => item.job === job);
  if (!line) throw new Error(`Sơ đồ tuyến: công ty ${job.company.en} không có trong experience.`);
  return line;
}

/** Line of a project of `experience`. */
export function lineOfProject(project: JobProject): Line {
  const line = lines.find((item) => item.job.projects.includes(project));
  if (!line) throw new Error(`Sơ đồ tuyến: dự án ${project.name.en} không có trong experience.`);
  return line;
}

/** Lines whose projects use a technology, by name or key ('Kafka' or 'kafka'), in route order. */
export function linesOfTech(nameOrKey: string): Line[] {
  const key = skillKey(nameOrKey);
  return lines.filter((line) => line.stations.some((station) => station.tech.includes(key)));
}

/** Interchange of a technology by name or key; undefined when fewer than two companies use it. */
export function interchangeOf(nameOrKey: string): Interchange | undefined {
  const key = skillKey(nameOrKey);
  return interchanges.find((item) => item.key === key);
}

function uniqueKeys(points: MapPoint[]): MapPoint[] {
  const seen = new Set<string>();
  points.forEach(({ key }) => {
    if (seen.has(key)) throw new Error(`Sơ đồ tuyến: khoá ga bị trùng: ${key}.`);
    seen.add(key);
  });
  return points;
}

/** Every point of the network: line starts, stations line by line, interchanges, then the shared end. */
export const mapPoints: MapPoint[] = uniqueKeys([
  ...lines.map((line): MapPoint => ({ key: line.key, kind: 'start', lines: [line.number] })),
  ...lines.flatMap((line) =>
    line.stations.map((station): MapPoint => ({ key: station.key, kind: 'station', lines: [line.number] })),
  ),
  ...interchanges.map((item): MapPoint => ({ key: item.key, kind: 'interchange', lines: item.lines })),
  { key: endKey, kind: 'end', lines: lines.map((line) => line.number) },
]);

/** Keys of the points of the given kinds in network order; every point without an argument. */
export function pointKeys(...kinds: PointKind[]): string[] {
  return mapPoints.filter((point) => kinds.length === 0 || kinds.includes(point.kind)).map((point) => point.key);
}

/**
 * Hand-placed coordinates of a map checked against the network, returned as points in network order. Stops the build
 * when a key of `required` has no coordinates, or when a coordinate key is no longer a point of the network (project
 * renamed, technology no longer shared). `file` names the map in the message.
 */
export function placePoints<P>(
  file: string,
  layout: Record<string, P>,
  required: readonly string[] = pointKeys(),
): (MapPoint & { at: P })[] {
  const known = new Set(pointKeys());
  Object.keys(layout).forEach((key) => {
    if (!known.has(key)) throw new Error(`Sơ đồ tuyến: ${file} có toạ độ cho ga ${key} không còn trong dữ liệu.`);
  });
  required.forEach((key) => {
    if (!known.has(key)) throw new Error(`Sơ đồ tuyến: ${file} cần ga ${key} không có trong dữ liệu.`);
    if (!Object.hasOwn(layout, key)) throw new Error(`Sơ đồ tuyến: ${file} chưa có toạ độ cho ga ${key}.`);
  });
  return mapPoints.flatMap((point) => (Object.hasOwn(layout, point.key) ? [{ ...point, at: layout[point.key] }] : []));
}

/** Stops the build when a segment of a track is not horizontal, vertical or at 45°. */
export function checkTrack(points: readonly (readonly [number, number])[], label: string): void {
  if (points.length < 2) throw new Error(`Sơ đồ tuyến: ${label} cần ít nhất hai điểm.`);
  points.slice(1).forEach(([x, y], index) => {
    const [px, py] = points[index];
    const dx = Math.abs(x - px);
    const dy = Math.abs(y - py);
    if (dx < 0.01 || dy < 0.01 || Math.abs(dx - dy) < 0.01) return;
    throw new Error(`Sơ đồ tuyến: ${label}, đoạn (${px}, ${py}) → (${x}, ${y}) không nằm ngang, dọc hay chéo 45°.`);
  });
}
