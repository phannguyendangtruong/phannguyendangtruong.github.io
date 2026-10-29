import type { FocusScene } from './hero';
import type { Lang, Text, TextList, UiKey } from '../i18n/ui';

export const profile = {
  name: { en: 'Phan Nguyen Dang Truong', vi: 'Phan Nguyễn Đăng Trường' } satisfies Text,
  role: { en: 'Java Backend Developer', vi: 'Lập trình viên Java Backend' } satisfies Text,
  location: { en: 'Hanoi, Vietnam', vi: 'Hà Nội, Việt Nam' } satisfies Text,
  /** Job title on the line under the name in the hero, written the same in both languages. */
  jobTitle: 'Java Backend Developer',
  /** City on the line under the name in the hero. */
  city: { en: 'Hanoi', vi: 'Hà Nội' } satisfies Text,
  tagline: {
    en: 'I build backend systems where data correctness matters: report ingestion, submission and approval workflows, scheduled jobs and notifications — with Java 21, Spring Boot, Kafka and Keycloak.',
    vi: 'Tôi xây dựng hệ thống backend nơi dữ liệu phải chính xác: tiếp nhận báo cáo, quy trình nộp – duyệt, job định kỳ và thông báo – với Java 21, Spring Boot, Kafka và Keycloak.',
  } satisfies Text,
  about: {
    en: [
      'Java backend developer with 3 years of experience building Spring Boot services, from internal operations systems and customer self-service portals to microservices for a large-scale reporting platform.',
      'My day-to-day work is data-heavy business workflows: parsing Excel/CSV submissions into structured data, submission lifecycles with review and approval, ShedLock-coordinated reminder jobs, email notifications, and Keycloak-based access control across services. I also contribute on the frontend with React when a feature needs it.',
      'I want to grow into a full-cycle engineer: owning system design, production quality and operations, not only features.',
    ],
    vi: [
      'Lập trình viên Java backend với 3 năm kinh nghiệm xây dựng service Spring Boot: từ hệ thống quản lý vận hành nội bộ, cổng dịch vụ trực tuyến cho khách hàng, đến microservices cho một nền tảng báo cáo quy mô lớn.',
      'Công việc hằng ngày của tôi là các quy trình nghiệp vụ nhiều dữ liệu: đọc file Excel/CSV thành dữ liệu có cấu trúc, vòng đời nộp – duyệt báo cáo, job nhắc hạn chạy với ShedLock, thông báo email và phân quyền bằng Keycloak giữa các service. Khi tính năng cần, tôi làm cả phần giao diện bằng React.',
      'Mục tiêu của tôi là trở thành kỹ sư làm trọn vòng đời sản phẩm: chịu trách nhiệm thiết kế hệ thống, chất lượng và vận hành production, không chỉ viết tính năng.',
    ],
  } satisfies TextList,
  links: {
    github: 'https://github.com/phannguyendangtruong',
    linkedin: 'https://www.linkedin.com/in/pndangtruong',
  },
  /** Display names of `links`, so components never hard-code them. */
  linkNames: {
    github: 'GitHub',
    linkedin: 'LinkedIn',
  },
  /** Fixed whole numbers (not computed from `experience`); `years` is shown on the hero line. */
  stats: { years: 3, companies: 3, companyProjects: 6 },
  /** Main technologies, listed in the profile JSON. */
  coreTech: ['Java 21', 'Spring Boot', 'Kafka', 'Keycloak'],
};

/**
 * Share images (1200×630 PNG, path under BASE_URL such as 'og/default-en.png'); null means no og:image tags.
 * The default ones are made by `npm run images` (scripts/make-images.mjs).
 */
export const shareImages: Record<'default', Record<Lang, string | null>> = {
  default: { en: 'og/default-en.png', vi: 'og/default-vi.png' },
};

/** `scene` draws a small static route diagram beside the text (see focusScenes in src/data/hero.ts). */
export const focusAreas: { title: Text; body: Text; scene?: FocusScene }[] = [
  {
    title: { en: 'Data ingestion & validation', vi: 'Tiếp nhận & kiểm tra dữ liệu' },
    body: {
      en: 'Pipelines that turn Excel/CSV report submissions into normalized, queryable data, with template-driven validation and clear error feedback.',
      vi: 'Pipeline biến file báo cáo Excel/CSV thành dữ liệu chuẩn hoá, truy vấn được, kiểm tra theo biểu mẫu và trả lỗi rõ ràng.',
    },
    scene: 'ingest',
  },
  {
    title: { en: 'Workflows & scheduling', vi: 'Quy trình & job định kỳ' },
    body: {
      en: 'Submission lifecycles with review and approval, deadline reminders and overdue warnings that run safely on several instances, and email notifications.',
      vi: 'Vòng đời nộp – duyệt, nhắc hạn và cảnh báo quá hạn chạy an toàn trên nhiều instance, thông báo qua email.',
    },
    scene: 'workflow',
  },
  {
    title: { en: 'Security & integration', vi: 'Bảo mật & tích hợp' },
    body: {
      en: 'OAuth2/OIDC with Keycloak across microservices, Kafka messaging, object storage, and integrations with payment gateways and third-party systems.',
      vi: 'OAuth2/OIDC với Keycloak giữa các microservice, Kafka, object storage và tích hợp với cổng thanh toán, hệ thống bên thứ ba.',
    },
    scene: 'security',
  },
];

/** Groups of the interchange table on the home page and of the CV, in display order. */
export const skills: { group: Text; items: string[] }[] = [
  { group: { en: 'Languages', vi: 'Ngôn ngữ' }, items: ['Java (8–21)', 'SQL', 'JavaScript'] },
  {
    group: { en: 'Backend', vi: 'Backend' },
    items: ['Spring Boot', 'Spring MVC', 'Spring Security', 'Spring Data JPA / Hibernate', 'MapStruct', 'REST APIs', 'Microservices'],
  },
  {
    group: { en: 'Data', vi: 'Dữ liệu' },
    items: ['Oracle', 'PostgreSQL', 'SQL Server', 'MySQL', 'MongoDB', 'Redis', 'Liquibase'],
  },
  { group: { en: 'Messaging & storage', vi: 'Messaging & lưu trữ' }, items: ['Apache Kafka', 'MinIO (S3)'] },
  { group: { en: 'Security', vi: 'Bảo mật' }, items: ['Keycloak', 'OAuth2 / OIDC', 'JWT'] },
  {
    group: { en: 'Tools', vi: 'Công cụ' },
    items: ['Docker', 'Apache POI', 'Thymeleaf', 'ShedLock', 'Maven / Gradle', 'Git'],
  },
  { group: { en: 'Frontend', vi: 'Frontend' }, items: ['React'] },
];

export type Job = {
  company: Text;
  role: Text;
  /** Start month as MM/YYYY. */
  start: string;
  /** End month as MM/YYYY; missing for the current job. */
  end?: string;
  /** `mapLabel`: short station name on the home page map; the map falls back to `name`. */
  projects: { name: Text; mapLabel?: Text; subsystems?: Text; summary: Text; bullets?: TextList; tech: string[] }[];
};

export const experience: Job[] = [
  {
    company: { en: 'Viettel', vi: 'Viettel' },
    role: { en: 'Java Developer', vi: 'Java Developer' },
    start: '01/2026',
    projects: [
      {
        name: { en: 'Reporting & workflow platform', vi: 'Nền tảng báo cáo & quy trình nghiệp vụ' },
        mapLabel: { en: 'Reporting & workflow', vi: 'Báo cáo & quy trình' },
        summary: {
          en: 'Backend microservices for a large-scale platform that collects, validates and monitors periodic reports from many organizations.',
          vi: 'Microservices backend cho nền tảng quy mô lớn thu thập, kiểm tra và theo dõi báo cáo định kỳ từ nhiều đơn vị.',
        },
        bullets: {
          en: [
            'Reporting module: input/output report templates, report submission and validation, indicator management, permission groups and audit logging.',
            'Report data ingestion pipelines that parse Excel/CSV submissions and normalize them into structured fact storage for report generation.',
            'Workflow module: the submission lifecycle (submit, resubmit, approval), evaluation and scoring rules, alert scanning.',
            'Scheduled jobs and async processing with ShedLock for deadline reminders, overdue warnings, evaluation workflows and Excel exports; email notifications with Thymeleaf templates.',
            'Redis caching, Kafka messaging, MinIO object storage and Keycloak (OAuth2) across internal service calls.',
          ],
          vi: [
            'Phân hệ báo cáo: biểu mẫu báo cáo đầu vào/đầu ra, nộp và kiểm tra báo cáo, quản lý chỉ tiêu, nhóm quyền, nhật ký kiểm toán.',
            'Pipeline tiếp nhận dữ liệu báo cáo: đọc file Excel/CSV và chuẩn hoá thành dữ liệu có cấu trúc để sinh báo cáo.',
            'Phân hệ quy trình: vòng đời nộp (nộp, nộp lại, phê duyệt), tiêu chí đánh giá và chấm điểm, quét cảnh báo.',
            'Job định kỳ và xử lý bất đồng bộ với ShedLock cho nhắc hạn, cảnh báo quá hạn, quy trình đánh giá, xuất Excel; thông báo email theo template Thymeleaf.',
            'Redis cache, Kafka, MinIO và Keycloak (OAuth2) giữa các service nội bộ.',
          ],
        },
        tech: ['Java 21', 'Spring Boot 3.5', 'Hibernate/JPA', 'Oracle', 'Redis', 'Kafka', 'MinIO', 'Keycloak', 'Liquibase', 'MapStruct', 'Apache POI', 'Thymeleaf', 'ShedLock', 'Docker'],
      },
    ],
  },
  {
    company: { en: 'Ami Viet Nam', vi: 'Ami Việt Nam' },
    role: { en: 'Backend Developer', vi: 'Backend Developer' },
    start: '01/2025',
    end: '12/2025',
    projects: [
      {
        name: { en: 'Customer care portal (team of 2)', vi: 'Cổng chăm sóc khách hàng (nhóm 2 người)' },
        mapLabel: { en: 'Customer portal', vi: 'Cổng khách hàng' },
        summary: {
          en: 'Online self-service portal for a large customer base: account management, online payment, service requests with progress tracking, and document verification. Bilingual, with Redis caching and integrations with internal systems, partner platforms and payment gateways.',
          vi: 'Cổng dịch vụ trực tuyến cho lượng lớn khách hàng: quản lý tài khoản, thanh toán trực tuyến, gửi yêu cầu dịch vụ và theo dõi tiến độ, xác thực chứng từ. Song ngữ, có Redis cache và tích hợp với hệ thống nội bộ, nền tảng đối tác và cổng thanh toán.',
        },
        tech: ['Spring Boot', 'Spring MVC', 'Spring Security', 'Hibernate/JPA', 'Redis', 'WebSocket', 'SQL Server'],
      },
      {
        name: { en: 'Content & information management system (team of 3)', vi: 'Hệ thống quản lý nội dung & thông tin (nhóm 3 người)' },
        mapLabel: { en: 'Content management', vi: 'Quản lý nội dung' },
        summary: {
          en: 'Fullstack platform for content, documents, news, a digital library and specialised reference data: role-based access with JWT, Q&A, statistics and reporting, Excel import/export.',
          vi: 'Nền tảng fullstack quản lý nội dung, văn bản, tin tức, thư viện số và dữ liệu chuyên ngành: phân quyền với JWT, hỏi đáp, thống kê báo cáo, nhập/xuất Excel.',
        },
        tech: ['Spring Boot', 'Spring Security', 'MongoDB', 'React', 'JWT', 'Apache POI', 'Docker'],
      },
    ],
  },
  {
    company: { en: 'City Ascom', vi: 'City Ascom' },
    role: { en: 'Backend Developer', vi: 'Backend Developer' },
    start: '10/2023',
    end: '12/2024',
    projects: [
      {
        name: { en: 'Production operations management (team of 10)', vi: 'Quản lý vận hành sản xuất (nhóm 10 người)' },
        mapLabel: { en: 'Production operations', vi: 'Vận hành sản xuất' },
        summary: {
          en: 'Backend for human resources, work assignment, progress evaluation and worker task-status updates.',
          vi: 'Backend cho nhân sự, giao việc, đánh giá tiến độ và cập nhật trạng thái công việc của công nhân.',
        },
        tech: ['Spring Boot', 'Spring Security', 'Redis', 'PostgreSQL'],
      },
      {
        name: { en: 'Data generation sub-project (team of 4)', vi: 'Dự án con sinh dữ liệu (nhóm 4 người)' },
        mapLabel: { en: 'Data generation', vi: 'Sinh dữ liệu' },
        summary: {
          en: 'Backend handling client input and data-generation requests for the parent project.',
          vi: 'Backend xử lý dữ liệu đầu vào và yêu cầu sinh dữ liệu từ phía client cho dự án mẹ.',
        },
        tech: ['Java 8', 'MySQL', 'SQL Server'],
      },
    ],
  },
];

export const education: { school: Text; major?: Text; period?: Text } = {
  school: { en: 'University of Information Technology — Vietnam National University', vi: 'Trường ĐH Công nghệ Thông tin — ĐHQG' } satisfies Text,
};

export type ProjectStatus = 'in-progress' | 'done' | 'planned';

export type Project = {
  slug?: string;
  name: string;
  status: ProjectStatus;
  summary: Text;
  points?: TextList;
  /** Main parts of the system in order, shown as code chips on the large home page card. */
  arch?: string[];
  tech: string[];
  repoUrl?: string;
  demoUrl?: string;
};

/** Label key of each project status, shared by every place that shows a status badge. */
export const statusLabel: Record<ProjectStatus, UiKey> = {
  'in-progress': 'statusInProgress',
  done: 'statusDone',
  planned: 'statusPlanned',
};

/** Set repoUrl/demoUrl once the repository is public and the demo is deployed. */
export const projects: Project[] = [
  {
    name: 'SheetFlow',
    status: 'planned',
    summary: {
      en: 'Open-source Spring Boot starter for streaming large Excel/CSV imports with declarative validation and cell-level error reports.',
      vi: 'Spring Boot starter mã nguồn mở để import file Excel/CSV lớn theo stream, kiểm tra khai báo và báo lỗi theo từng ô.',
    },
    tech: ['Java', 'Spring Boot', 'Apache POI', 'JMH'],
  },
  {
    name: 'PayRecon',
    status: 'planned',
    summary: {
      en: 'Bill payment and reconciliation: orchestrated saga with a simulated payment provider, idempotency keys, double-entry ledger and Spring Batch reconciliation.',
      vi: 'Thanh toán hoá đơn và đối soát: saga điều phối với cổng thanh toán giả lập, idempotency key, sổ cái kép và đối soát bằng Spring Batch.',
    },
    tech: ['Java', 'Spring Modulith', 'Spring Batch', 'PostgreSQL', 'Redis'],
  },
];

/** Hide planned projects from the home page by setting this to false. */
export const showPlannedProjects = false;

/**
 * Projects shown on the home page, in declaration order: planned ones only while showPlannedProjects is true.
 * With none, the home page drops its Projects block, the nav its Projects item and the command palette its command.
 */
export function shownProjects(): Project[] {
  return projects.filter((project) => project.status !== 'planned' || showPlannedProjects);
}

export function t<T>(value: Record<Lang, T>, lang: Lang): T {
  return value[lang];
}

/** MM/YYYY as a month count (year × 12 + month), for ordering. */
export function monthIndex(value: string): number {
  const [month, year] = value.split('/').map(Number);
  return year * 12 + month;
}

/** Copy of `experience` sorted by start month, newest first; equal starts keep their declared order. */
export function experienceNewestFirst(): Job[] {
  return [...experience].sort((a, b) => monthIndex(b.start) - monthIndex(a.start));
}

/** A job without an end month is the current one. */
export function isCurrentJob(job: Job): boolean {
  return job.end === undefined;
}
