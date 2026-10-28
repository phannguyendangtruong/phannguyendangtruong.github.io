export type Lang = 'en' | 'vi';
export type Text = Record<Lang, string>;
export type TextList = Record<Lang, string[]>;

export const ui = {
  navAbout: { en: 'About', vi: 'Giới thiệu' },
  navProjects: { en: 'Projects', vi: 'Dự án' },
  navExperience: { en: 'Experience', vi: 'Kinh nghiệm' },
  navSkills: { en: 'Skills', vi: 'Kỹ năng' },
  navResume: { en: 'Résumé', vi: 'CV' },
  navMain: { en: 'Main navigation', vi: 'Điều hướng chính' },
  openMenu: { en: 'Open menu', vi: 'Mở menu' },
  closeMenu: { en: 'Close menu', vi: 'Đóng menu' },
  switchLang: { en: 'Tiếng Việt', vi: 'English' },
  toggleTheme: { en: 'Toggle dark mode', vi: 'Đổi giao diện sáng/tối' },
  skipToContent: { en: 'Skip to content', vi: 'Bỏ qua đến nội dung' },
  newTab: { en: '(opens in a new tab)', vi: '(mở trong tab mới)' },
  viewProjects: { en: 'View projects', vi: 'Xem dự án' },
  viewExperience: { en: 'View experience', vi: 'Xem kinh nghiệm' },
  viewResume: { en: 'Read résumé', vi: 'Xem CV' },
  statYears: { en: 'years of experience', vi: 'năm kinh nghiệm' },
  statCompanies: { en: 'companies', vi: 'công ty' },
  statCompanyProjects: { en: 'company projects', vi: 'dự án tại công ty' },
  pauseAnimation: { en: 'Pause animation', vi: 'Tạm dừng hiệu ứng' },
  aboutLabel: { en: '// about', vi: '// giới thiệu' },
  projectsLabel: { en: '// projects', vi: '// dự án' },
  experienceLabel: { en: '// experience', vi: '// kinh nghiệm' },
  skillsLabel: { en: '// skills', vi: '// kỹ năng' },
  contactLabel: { en: '// contact', vi: '// liên hệ' },
  focusTitle: { en: 'What I work on', vi: 'Tôi làm gì' },
  projectsTitle: { en: 'Projects', vi: 'Dự án' },
  projectsIntro: {
    en: 'Personal projects built around the problems I solve at work. Data and organizations in them are fictional.',
    vi: 'Dự án cá nhân xoay quanh những bài toán tôi giải ở công việc. Dữ liệu và tổ chức trong đó đều là giả lập.',
  },
  summaryTitle: { en: 'Summary', vi: 'Tóm tắt' },
  experienceTitle: { en: 'Experience', vi: 'Kinh nghiệm' },
  periodPresent: { en: 'Present', vi: 'nay' },
  skillsTitle: { en: 'Skills', vi: 'Kỹ năng' },
  educationTitle: { en: 'Education', vi: 'Học vấn' },
  techLabel: { en: 'Technologies', vi: 'Công nghệ' },
  showMoreItems: { en: 'Show {n} more', vi: 'Xem thêm {n} ý' },
  showLess: { en: 'Show less', vi: 'Thu gọn' },
  showMoreTechOne: { en: 'Show 1 more technology', vi: 'Xem thêm 1 công nghệ' },
  showMoreTechMany: { en: 'Show {n} more technologies', vi: 'Xem thêm {n} công nghệ' },
  skillFilterOne: {
    en: '{name} – used in 1 project, filter Experience',
    vi: '{name} – dùng trong 1 dự án, lọc Kinh nghiệm',
  },
  skillFilterMany: {
    en: '{name} – used in {n} projects, filter Experience',
    vi: '{name} – dùng trong {n} dự án, lọc Kinh nghiệm',
  },
  filterStatus: { en: 'Filtering: {name}', vi: 'Đang lọc: {name}' },
  filterCountOne: { en: '1 project', vi: '1 dự án' },
  filterCountMany: { en: '{n} projects', vi: '{n} dự án' },
  filterClear: { en: 'Clear', vi: 'Bỏ lọc' },
  contactTitle: { en: 'Contact', vi: 'Liên hệ' },
  contactBody: {
    en: 'The best way to reach me is a message on LinkedIn.',
    vi: 'Cách nhanh nhất để liên hệ là nhắn tin qua LinkedIn.',
  },
  readCaseStudy: { en: 'Read the case study', vi: 'Đọc case study' },
  repository: { en: 'Repository', vi: 'Mã nguồn' },
  demo: { en: 'Live demo', vi: 'Demo' },
  repoSoon: { en: 'Repository will be public soon', vi: 'Mã nguồn sẽ sớm công khai' },
  projectArch: { en: 'Architecture', vi: 'Kiến trúc' },
  statusInProgress: { en: 'In progress', vi: 'Đang làm' },
  statusPlanned: { en: 'Planned', vi: 'Dự kiến' },
  statusDone: { en: 'Completed', vi: 'Đã xong' },
  backHome: { en: 'Back to home', vi: 'Về trang chủ' },
  resumeLabel: { en: '// résumé', vi: '// cv' },
  printResume: { en: 'Print or save as PDF', vi: 'In hoặc lưu PDF' },
  printHint: {
    en: 'Press Ctrl + P (⌘ + P on Mac) to print or save as PDF',
    vi: 'Dùng Ctrl + P (⌘ + P trên Mac) để in hoặc lưu PDF',
  },
  resumeNote: {
    en: 'Full résumé with contact details available on request.',
    vi: 'CV đầy đủ kèm thông tin liên hệ được gửi khi có yêu cầu.',
  },
  resumeDescription: {
    en: 'Résumé of Phan Nguyen Dang Truong, Java Backend Developer in Hanoi: experience, projects, skills. Printable as PDF.',
    vi: 'CV của Phan Nguyễn Đăng Trường, Lập trình viên Java Backend tại Hà Nội: kinh nghiệm, dự án, kỹ năng. In hoặc lưu được thành PDF.',
  },
  notFoundTitle: { en: 'Page not found', vi: 'Không tìm thấy trang' },
  footer: { en: 'Built with Astro. No trackers.', vi: 'Xây bằng Astro. Không theo dõi người dùng.' },
  cmdkOpen: { en: 'Open command palette', vi: 'Mở bảng lệnh' },
  cmdkTitle: { en: 'Command palette', vi: 'Bảng lệnh' },
  cmdkPlaceholder: { en: 'Type a command or section…', vi: 'Nhập lệnh hoặc tên mục…' },
  cmdkEmpty: { en: 'No matching commands', vi: 'Không có lệnh phù hợp' },
  cmdkGroupGo: { en: 'Go to', vi: 'Đi tới' },
  cmdkGroupPrefs: { en: 'Preferences', vi: 'Tùy chọn' },
  cmdkGroupLinks: { en: 'Links', vi: 'Liên kết' },
  cmdkCaseStudy: { en: '{name} case study', vi: 'Case study {name}' },
  cmdkSwitchTo: { en: 'Switch to', vi: 'Chuyển sang' },
  cmdkToLight: { en: 'Switch to light theme', vi: 'Chuyển sang giao diện sáng' },
  cmdkToDark: { en: 'Switch to dark theme', vi: 'Chuyển sang giao diện tối' },
  cmdkSelect: { en: 'select', vi: 'chọn' },
  cmdkRun: { en: 'run', vi: 'thực hiện' },
  cmdkClose: { en: 'close', vi: 'đóng' },
  apiOpen: { en: 'View profile as JSON', vi: 'Xem hồ sơ dạng JSON' },
  apiLabel: { en: '// api', vi: '// api' },
  apiTitle: { en: 'Profile as JSON', vi: 'Hồ sơ dạng JSON' },
  apiBody: { en: 'Response body', vi: 'Nội dung phản hồi' },
  apiCopy: { en: 'Copy JSON', vi: 'Sao chép JSON' },
  apiCopied: { en: 'Copied', vi: 'Đã chép' },
  apiCopySelect: {
    en: 'JSON selected: press Ctrl + C (⌘ + C on Mac) to copy',
    vi: 'Đã chọn JSON: nhấn Ctrl + C (⌘ + C trên Mac) để chép',
  },
  apiOpenFile: { en: 'Open {path}', vi: 'Mở {path}' },
  apiBack: { en: 'Back to page', vi: 'Quay lại giao diện' },
  apiOpened: { en: 'JSON view opened', vi: 'Đã mở chế độ xem JSON' },
  apiClosed: { en: 'Back to the page view', vi: 'Đã quay lại giao diện trang' },
  csTitle: { en: 'Case study', vi: 'Case study' },
  csEyebrow: { en: '// case study', vi: '// case study' },
  tocLabel: { en: 'On this page', vi: 'Trong trang này' },
  tocWhy: { en: 'Why', vi: 'Vì sao' },
  tocProblem: { en: 'Problem', vi: 'Bài toán' },
  tocArchitecture: { en: 'Architecture', vi: 'Kiến trúc' },
  tocDecisions: { en: 'Decisions', vi: 'Quyết định' },
  tocLifecycle: { en: 'Lifecycle', vi: 'Vòng đời' },
  tocStatus: { en: 'Status', vi: 'Tình trạng' },
  csWhyLabel: { en: '// 01 · why', vi: '// 01 · vì sao' },
  csProblemLabel: { en: '// 02 · problem', vi: '// 02 · bài toán' },
  csArchLabel: { en: '// 03 · architecture', vi: '// 03 · kiến trúc' },
  csDecisionsLabel: { en: '// 04 · decisions', vi: '// 04 · quyết định' },
  csLifecycleLabel: { en: '// 05 · lifecycle', vi: '// 05 · vòng đời' },
  csStatusLabel: { en: '// 06 · status', vi: '// 06 · tình trạng' },
  csWhyTitle: { en: 'Why this project', vi: 'Vì sao có dự án này' },
  csProblemTitle: { en: 'The problem', vi: 'Bài toán' },
  csArchTitle: { en: 'Architecture', vi: 'Kiến trúc' },
  csDecisionsTitle: { en: 'Key decisions', vi: 'Các quyết định chính' },
  csStatusTitle: { en: 'Where it stands', vi: 'Tình trạng hiện tại' },
  decisionWhy: { en: 'Why:', vi: 'Lý do:' },
  decisionTradeoff: { en: 'Trade-off:', vi: 'Đánh đổi:' },
  statusBuilt: { en: 'Built', vi: 'Đã có' },
  statusNext: { en: 'Next', vi: 'Tiếp theo' },
  statusUpdated: { en: 'updated {month}', vi: 'cập nhật {month}' },
  archHint: {
    en: 'Hover, tap or tab to a component to see its role and connections.',
    vi: 'Rê chuột, chạm hoặc dùng phím Tab vào một thành phần để xem vai trò và các kết nối.',
  },
  archConnected: { en: 'Connected to:', vi: 'Kết nối với:' },
  archClose: { en: 'Close description', vi: 'Đóng mô tả' },
  lcReturnTo: { en: '→ {state} ({label})', vi: '→ {state} ({label})' },
} satisfies Record<string, Text>;

export type UiKey = keyof typeof ui;

/** Key and symbol labels that read the same in both languages. */
export const keyLabels = {
  up: '↑',
  down: '↓',
  enter: 'Enter',
  esc: 'Esc',
  prompt: '>',
  paletteMac: '⌘K',
  paletteOther: 'Ctrl K',
};

/** Untranslated labels of the 404 page, shown as-is in both languages. */
export const notFoundLabels = {
  code: '404',
  status: 'status: 404 · route not found',
} as const;

/** Request labels of the JSON view (hero toggle, request bar), shown as-is in both languages. */
export const apiLabels = {
  braces: '{ }',
  method: 'GET',
  path: '/api/me',
  status: '200 OK',
  type: 'application/json',
  sizeUnit: 'KB',
} as const;

/** Separator of the screen reader sentences of the case study lifecycle. */
export const flowArrow = ' → ';

export function tr(key: keyof typeof ui, lang: Lang): string {
  return ui[key][lang];
}

/** Label with a count: the `one` key for 1, the `many` key otherwise; "{n}" is replaced by the count. */
export function trCount(one: UiKey, many: UiKey, count: number, lang: Lang): string {
  return tr(count === 1 ? one : many, lang).replace('{n}', String(count));
}

/** Path for a page in the given language, including the configured base path. */
export function localePath(lang: Lang, path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${lang === 'vi' ? '/vi' : ''}${clean}`;
}

const monthPattern = /^(0[1-9]|1[0-2])\/\d{4}$/;
const monthName = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' });

function formatMonth(value: string, lang: Lang): string {
  if (!monthPattern.test(value)) {
    throw new Error(`Dữ liệu nội dung: thời gian ${value} không đúng dạng MM/YYYY.`);
  }
  if (lang === 'vi') return value;
  const [month, year] = value.split('/').map(Number);
  return `${monthName.format(new Date(Date.UTC(year, month - 1, 1)))} ${year}`;
}

/** Work period from MM/YYYY values: "Jan 2026 – Present" in English, "01/2026 – nay" in Vietnamese. */
export function formatPeriod(start: string, end: string | undefined, lang: Lang): string {
  const last = end === undefined ? tr('periodPresent', lang) : formatMonth(end, lang);
  return `${formatMonth(start, lang)} – ${last}`;
}
