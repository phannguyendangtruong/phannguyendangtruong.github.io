import type { Text } from '../i18n/ui';

/** Node of the hero diagram; x, y and w are viewBox units, only used for drawing. */
export type HeroNode = { id: string; x: number; y: number; w: number; kind?: 'broker' };
export type HeroEdge = { from: string; to: string };
/** Part of a terminal line; parts with a tone are highlighted. */
export type LogPart = { text: string; tone?: 'ok' | 'event' };
/** Small diagram at the top of a "What I work on" card. */
export type FocusScene = 'ingest' | 'workflow' | 'security';

/** Title bar label and accessible name of the hero illustration: a generic report pipeline, not a named project. */
export const heroFrame = {
  label: { en: 'report-pipeline · illustration', vi: 'report-pipeline · minh hoạ' } satisfies Text,
  aria: {
    en: 'Report pipeline illustration: services exchanging events and sample log lines',
    vi: 'Minh hoạ pipeline báo cáo: các service trao đổi sự kiện và các dòng log mẫu',
  } satisfies Text,
};

/** Demo data of the illustration in the home page hero; strings stay in English. */
export const heroDiagram = {
  width: 560,
  height: 262,
  nodeHeight: 36,
  nodes: [
    { id: 'web', x: 20, y: 24, w: 88 },
    { id: 'gateway', x: 148, y: 24, w: 110 },
    { id: 'submission-service', x: 298, y: 24, w: 164 },
    { id: 'kafka', x: 320, y: 114, w: 120, kind: 'broker' },
    { id: 'ingestion-service', x: 220, y: 206, w: 152 },
    { id: 'notification-service', x: 388, y: 206, w: 168 },
  ] as HeroNode[],
  edges: [
    { from: 'web', to: 'gateway' },
    { from: 'gateway', to: 'submission-service' },
    { from: 'submission-service', to: 'kafka' },
    { from: 'kafka', to: 'ingestion-service' },
    { from: 'kafka', to: 'notification-service' },
  ] as HeroEdge[],
};

export const heroLog: LogPart[][] = [
  [{ text: 'ingest report.xlsx … validated · ' }, { text: '0 errors', tone: 'ok' }],
  [{ text: 'outbox → kafka: ' }, { text: 'report.submitted', tone: 'event' }],
  [{ text: 'shedlock: reminder-job ' }, { text: 'acquired', tone: 'ok' }],
];

export const termPrompt = '›';

/** Labels of the focus card diagrams, code-like and kept in English; box widths follow the label length. */
export const focusScenes = {
  ingest: { file: '.xlsx', parser: 'parser' },
  workflow: { draft: 'DRAFT', submitted: 'SUBMITTED', approved: 'APPROVED' },
  security: { client: 'client', gateway: 'gateway', service: 'service' },
} satisfies Record<FocusScene, Record<string, string>>;

/** Command line typed once in the contact panel, next to the LinkedIn button. */
export const contactCommand = { prompt: '$', text: 'connect --via linkedin' };
