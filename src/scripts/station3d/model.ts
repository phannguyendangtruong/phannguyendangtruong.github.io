import { interchanges, lines, type Line } from '../../data/network';
import { placeMap, trackGap, wideMap, type LabelAt, type XY } from '../../data/network-layout';
import { isCurrentJob } from '../../data/profile';
import { projectCountForSkill } from '../../data/skill-keys';
import { tr, trCount, type Lang } from '../../i18n/ui';

export type { XY };

/** Side of its point a label is written on, on the desktop map: 'start' on the right, 'end' on the left. */
export type Side = LabelAt[2];

export type SceneLine = {
  number: number;
  /** CSS custom property of the line colour ("--line-1"). */
  token: string;
  /** Track from the start of the line to the shared end, in map units. */
  track: XY[];
  /** Hologram over the start of the line: the company in capitals, then "LINE 1 · SINCE 2023" under it. */
  title: string;
  subtitle: string;
  /** Card of the scene when the pointer is on the line (interact.ts): "Acme", "Line 1", "Line 1 · since 2023". */
  company: string;
  name: string;
  since: string;
};

export type SceneStation = { line: number; xy: XY; name: string; side: Side };

export type SceneInterchange = {
  /** Technology key, the same as the filter controls of the page (data-skill). */
  key: string;
  /** Full name, read by the filter; `text` is the label written on the map, shorter when the full one is long. */
  name: string;
  text: string;
  /** Parallel tracks the interchange spans; 1 for a crossing. */
  tracks: number;
  crossing: boolean;
  /** Every line goes through it. */
  hub: boolean;
  xy: XY;
  side: Side;
  /** Accessible name of its filter button. */
  aria: string;
};

/** Everything the 3D city draws, taken from the network and the desktop map when the site is built. */
export type SceneModel = {
  /** Size of the desktop map; the scene is centred on its middle. */
  width: number;
  height: number;
  /** Distance between parallel tracks, in map units. */
  gap: number;
  /** Route number of the line of the current job. */
  current: number;
  lines: SceneLine[];
  stations: SceneStation[];
  interchanges: SceneInterchange[];
  end: { xy: XY };
  /** "Now", "You are here", and the hint of the card of a line ("Click to go to this line"). */
  text: { now: string; here: string; go: string };
};

const file = 'src/data/network-layout.ts › wideMap';

function sideOf(key: string, label: LabelAt | undefined): Side {
  if (!label) throw new Error(`Cảnh 3D: ${file} chưa có vị trí nhãn cho ga ${key}.`);
  return label[2];
}

/** "--line-1" from "var(--line-1)". */
function tokenOf(css: string): string {
  const match = /^var\((--[a-z0-9-]+)\)$/.exec(css);
  if (!match) throw new Error(`Cảnh 3D: màu ${css} không phải một biến CSS.`);
  return match[1];
}

function currentLine(): Line {
  return lines.find((line) => isCurrentJob(line.job)) ?? lines[lines.length - 1];
}

/** Scene of the home page in one language; stops the build when the desktop map no longer matches the network. */
export function buildSceneModel(lang: Lang): SceneModel {
  const points = placeMap(file, wideMap);
  const lineOf = new Map(lines.map((line) => [line.key, line] as const));
  const stationOf = new Map(lines.flatMap((line) => line.stations.map((station) => [station.key, station] as const)));
  const junctionOf = new Map(interchanges.map((item) => [item.key, item] as const));
  const end = points.find((point) => point.kind === 'end');
  if (!end) throw new Error(`Cảnh 3D: ${file} chưa có toạ độ cho ga cuối.`);

  const sceneLines = points.flatMap((point): SceneLine[] => {
    const line = point.kind === 'start' ? lineOf.get(point.key) : undefined;
    if (!line) return [];
    const since = tr('mapLineSince', lang)
      .replace('{n}', String(line.number))
      .replace('{year}', line.job.start.split('/')[1]);
    return [
      {
        number: line.number,
        token: tokenOf(line.color),
        track: wideMap.tracks[line.number],
        title: line.job.company[lang].toLocaleUpperCase(lang),
        subtitle: since.toLocaleUpperCase(lang),
        company: line.job.company[lang],
        name: tr('mapLineName', lang).replace('{n}', String(line.number)),
        since,
      },
    ];
  });

  const stations = points.flatMap((point): SceneStation[] => {
    const station = point.kind === 'station' ? stationOf.get(point.key) : undefined;
    if (!station) return [];
    const name = (station.project.mapLabel ?? station.name)[lang];
    return [{ line: station.line, xy: point.at.xy, name, side: sideOf(point.key, point.at.label) }];
  });

  const junctions = points.flatMap((point): SceneInterchange[] => {
    const item = point.kind === 'interchange' ? junctionOf.get(point.key) : undefined;
    if (!item) return [];
    const crossing = point.at.crossing === true;
    const count = projectCountForSkill(item.key);
    return [
      {
        key: item.key,
        name: item.name,
        text: point.at.short ?? item.name,
        tracks: crossing ? 1 : item.lines.length,
        crossing,
        hub: item.lines.length === lines.length,
        xy: point.at.xy,
        side: sideOf(point.key, point.at.label),
        aria: trCount('skillFilterOne', 'skillFilterMany', count, lang).replace('{name}', item.name),
      },
    ];
  });

  return {
    width: wideMap.width,
    height: wideMap.height,
    gap: trackGap,
    current: currentLine().number,
    lines: sceneLines,
    stations,
    interchanges: junctions,
    end: { xy: end.at.xy },
    text: {
      now: tr('mapNow', lang).toLocaleUpperCase(lang),
      here: tr('mapHere', lang),
      go: tr('mapGoToLine', lang),
    },
  };
}
