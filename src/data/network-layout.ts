import { checkTrack, endKey, hubs, lines, placePoints, pointKeys } from './network';

/** A point in the units of a map's viewBox. */
export type XY = [number, number];

/** Baseline start of a label and its text-anchor. */
export type LabelAt = [number, number, 'start' | 'middle' | 'end'];

/** Where a point of the network is drawn on a map. */
export type MapSpot = {
  /** Station, capsule or crossing centre; first point of the track for a line start; centre of the end bars. */
  xy: XY;
  /** Station, interchange and end: where the label is written. */
  label?: LabelAt;
  /** Interchange: shorter name written on this map when the full one does not fit; its link keeps the full name. */
  short?: string;
  /** Line start: centre of the route bullet; the company and the start year follow on its right. */
  bullet?: XY;
  /** End: centre of the "You are here" mark; its text follows on the right. */
  here?: XY;
  /** Interchange where two lines cross at right angles: a round stop instead of a capsule over parallel tracks. */
  crossing?: boolean;
};

export type MapLayout = {
  width: number;
  height: number;
  /** Track of each line by route number, from its start to the shared end; parallel tracks are `gap` apart. */
  tracks: Record<number, XY[]>;
  spots: Record<string, MapSpot>;
};

/** Distance between parallel tracks, and half the thickness of an interchange capsule, on both maps. */
export const trackGap = 12;
export const capsuleRadius = 6;

/**
 * Desktop map, drawn across the whole hero. The name block sits over its top-left corner (x < 420, y < 490), so
 * nothing is drawn there: line 3 starts on the left under that block, passes its station, climbs the gap on the
 * block's right, crosses line 1 at Java along the top and comes back down the right; lines 1 and 2 pass their
 * stations; the three lines then share a trunk of interchanges (pairs on the side of their two tracks, hubs across
 * all three) down to the end bars. Labels are set in the mono face, 0.6 of the font size a character (12 units,
 * hubs 13, the end 18): line 1 runs at x = 626 so that the longest station name on its left (about 152 units) keeps
 * clear of line 3 at x = 440, and every label stays inside the 960 × 560 frame.
 */
export const wideMap: MapLayout = {
  width: 960,
  height: 560,
  tracks: {
    1: [[626, 22], [626, 196], [656, 226], [698, 226], [728, 256], [728, 486]],
    2: [[740, 110], [740, 486]],
    3: [
      [24, 516], [410, 516], [440, 486], [440, 100], [470, 70], [890, 70], [920, 100], [920, 230], [890, 260],
      [782, 260], [752, 290], [752, 486],
    ],
  },
  spots: {
    'line-1': { xy: [626, 22], bullet: [652, 22] },
    'line-2': { xy: [740, 110], bullet: [766, 110] },
    'line-3': { xy: [24, 516], bullet: [34, 542] },
    'production-operations-management': { xy: [626, 126], label: [612, 131, 'end'] },
    'data-generation-sub-project': { xy: [626, 176], label: [612, 181, 'end'] },
    'customer-care-portal': { xy: [740, 160], label: [754, 165, 'start'] },
    'content-information-management-system': { xy: [740, 205], label: [754, 210, 'start'] },
    'reporting-workflow-platform': { xy: [250, 516], label: [250, 547, 'middle'] },
    java: { xy: [626, 70], label: [638, 94, 'start'], crossing: true },
    'spring-security': { xy: [734, 272], label: [714, 277, 'end'] },
    'sql-server': { xy: [734, 316], label: [714, 321, 'end'] },
    jpa: { xy: [746, 342], label: [766, 347, 'start'], short: 'JPA / Hibernate' },
    'apache-poi': { xy: [746, 368], label: [766, 373, 'start'] },
    docker: { xy: [746, 394], label: [766, 399, 'start'] },
    'spring-boot': { xy: [740, 424], label: [714, 430, 'end'] },
    redis: { xy: [740, 454], label: [714, 460, 'end'] },
    [endKey]: { xy: [740, 486], label: [714, 494, 'end'], here: [774, 486] },
  },
};

/**
 * Phone map, read from the top: each line starts on the right, runs left under its label and turns down into the
 * trunk, which goes through the hubs to the end bars. Its mono labels are larger in viewBox units (hubs 15, the end
 * 20, "You are here" 14), since the map is drawn from 280px wide; the longest ends at x = 268 of 320.
 */
export const compactMap: MapLayout = {
  width: 320,
  height: 270,
  tracks: {
    1: [[270, 40], [70, 40], [40, 70], [40, 250]],
    2: [[270, 80], [82, 80], [52, 110], [52, 250]],
    3: [[270, 120], [94, 120], [64, 150], [64, 250]],
  },
  spots: {
    'line-1': { xy: [270, 40], bullet: [110, 22] },
    'line-2': { xy: [270, 80], bullet: [110, 62] },
    'line-3': { xy: [270, 120], bullet: [110, 102] },
    'spring-boot': { xy: [52, 182], label: [78, 188, 'start'] },
    redis: { xy: [52, 214], label: [78, 220, 'start'] },
    [endKey]: { xy: [52, 250], label: [78, 258, 'start'], here: [134, 250] },
  },
};

/** Points the phone map shows: the line starts, the hubs every line goes through, and the end. */
export function compactKeys(): string[] {
  return [...pointKeys('start'), ...hubs().map((hub) => hub.key), endKey];
}

/**
 * Points of a map in network order, checked against the network (see placePoints). Also stops the build when a line
 * has no track, a track bends at another angle than 45° or 90°, or a track does not begin at its line start.
 */
export function placeMap(file: string, map: MapLayout, required: readonly string[] = pointKeys()) {
  lines.forEach((line) => {
    const track = map.tracks[line.number];
    if (!track) throw new Error(`Sơ đồ tuyến: ${file} chưa có đường cho tuyến ${line.number}.`);
    checkTrack(track, `${file}, tuyến ${line.number}`);
    const start = map.spots[line.key];
    if (start && (start.xy[0] !== track[0][0] || start.xy[1] !== track[0][1])) {
      throw new Error(`Sơ đồ tuyến: ${file}, tuyến ${line.number} không bắt đầu ở toạ độ của ga ${line.key}.`);
    }
  });
  return placePoints(file, map.spots, required);
}

/** SVG path data of a track. */
export function pathOf(points: readonly XY[]): string {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join('');
}

/** Seconds a data packet takes from the start of a track to its end: 80 units a second, kept within 8–14s. */
export function packetSeconds(points: readonly XY[]): number {
  const length = points
    .slice(1)
    .reduce((sum, [x, y], index) => sum + Math.hypot(x - points[index][0], y - points[index][1]), 0);
  return Math.round(Math.min(14, Math.max(8, length / 80)) * 10) / 10;
}

/** Direction of the segment from `a` to `b`: 'x' when it is horizontal, 'y' otherwise. */
export function along(a: XY, b: XY): 'x' | 'y' {
  return a[1] === b[1] ? 'x' : 'y';
}
