/** Small route diagram beside a "What I work on" block. */
export type FocusScene = 'ingest' | 'workflow' | 'security';

/**
 * Station names of a diagram: `stops` along the line in order, first and last drawn as the ends of the line; `branch`
 * a station on a loop from the second stop back to the first; `spur` a station at the end of a short spur from the
 * second stop.
 */
export type FocusSceneStops = { stops: string[]; branch?: string; spur?: string };

/**
 * Station names of the "What I work on" diagrams, kept in English and shown as written: steps, states and parts in
 * capitals like every station sign; file and product names (report.xlsx, Keycloak) exactly as they are spelled.
 */
export const focusScenes = {
  ingest: { stops: ['report.xlsx', 'PARSE', 'VALIDATE', 'FACTS'] },
  workflow: { stops: ['DRAFT', 'SUBMITTED', 'APPROVED'], branch: 'RETURNED' },
  security: { stops: ['CLIENT', 'GATEWAY', 'SERVICE'], spur: 'Keycloak' },
} satisfies Record<FocusScene, FocusSceneStops>;
