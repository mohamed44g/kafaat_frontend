"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  formatDuration,
  type Category,
  type Course,
  type Instructor,
  type SubscriptionPlan,
  type BankTransferSettings,
  type LiveSession,
} from "../lib/api";
const ContentCrud = dynamic(() => import("./content-crud"));
const SubscriptionPlanManagement = dynamic(
  () => import("./subscription-plan-management"),
);
const SubscriptionAssignment = dynamic(
  () => import("./subscription-assignment"),
);
const BankTransferSettingsForm = dynamic(
  () => import("./bank-transfer-settings"),
);
const LiveSessionManagement = dynamic(
  () => import("./live-session-management"),
);

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isSubscribed: boolean;
  subscriptionEndsAt: string | null;
}

interface DashboardProps {
  courses: Course[];
  categories: Category[];
  instructors: Instructor[];
  users: DashboardUser[];
  plans: SubscriptionPlan[];
  bankTransfer: BankTransferSettings;
  liveSessions: LiveSession[];
}

type Section =
  | "overview"
  | "courses"
  | "categories"
  | "instructors"
  | "videos"
  | "live"
  | "users"
  | "plans"
  | "subscriptions"
  | "payments"
  | "admins"
  | "settings";
const groups: {
  label: string;
  items: { id: Section; label: string }[];
}[] = [
  {
    label: "الرئيسية",
    items: [{ id: "overview", label: "نظرة عامة" }],
  },
  {
    label: "إدارة المحتوى",
    items: [
      { id: "courses", label: "الدورات" },
      { id: "categories", label: "الأقسام" },
      { id: "instructors", label: "المدربون" },
      { id: "videos", label: "الفيديوهات" },
      { id: "live", label: "الجلسات المباشرة" },
    ],
  },
  {
    label: "إدارة المنصة",
    items: [
      { id: "users", label: "المستخدمون" },
      { id: "plans", label: "الباقات" },
      { id: "subscriptions", label: "الاشتراكات" },
      { id: "payments", label: "التحويل البنكي" },
      { id: "admins", label: "المسؤولون" },
      { id: "settings", label: "الإعدادات" },
    ],
  },
];
function DashboardIcon({ name }: { name: Section }) {
  const paths: Record<Section, React.ReactNode> = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    courses: (
      <>
        <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z" />
        <path d="M4 5v16a2 2 0 0 1 2-2M8 7h8M8 11h8" />
      </>
    ),
    categories: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    instructors: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
    videos: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m10 9 5 3-5 3z" />
      </>
    ),
    live: (
      <>
        <rect x="3" y="5" width="13" height="14" rx="2" />
        <path d="m16 10 5-3v10l-5-3z" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1" />
      </>
    ),
    subscriptions: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    plans: (
      <>
        <path d="M20 12 12 20 4 12l8-8 8 8z" />
        <path d="m8 12 4 4 4-4" />
      </>
    ),
    payments: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20M6 15h4" />
      </>
    ),
    admins: (
      <>
        <path d="M12 22s7-3 7-9V5l-7-3-7 3v8c0 6 7 9 7 9z" />
        <circle cx="12" cy="10" r="2" />
        <path d="M9 16a3 3 0 0 1 6 0" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 3-.2-.1a1.7 1.7 0 0 0-2.9.8v.3h-4v-.3a1.7 1.7 0 0 0-2.9-.8l-.2.1-1.7-3 .1-.1a1.7 1.7 0 0 0-.5-2.7l-.2-.1v-3.4l.2-.1a1.7 1.7 0 0 0 .5-2.7l-.1-.1 1.7-3 .2.1a1.7 1.7 0 0 0 2.9-.8V3h4v.3a1.7 1.7 0 0 0 2.9.8l.2-.1 1.7 3-.1.1a1.7 1.7 0 0 0 .5 2.7l.2.1v3.4l-.2.1a1.7 1.7 0 0 0-.9.6z" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {paths[name]}
    </svg>
  );
}

const panel = "rounded-2xl border border-[#e9eeeb] bg-white";
const badge =
  "inline-flex rounded-full bg-[#e8f8ef] px-3 py-1 text-xs font-semibold text-[#0a9d70]";
function buildRows({
  courses,
  categories,
  instructors,
  users,
}: DashboardProps): Partial<
  Record<Section, { columns: string[]; data: string[][]; description: string }>
> {
  const userRows = users.map((user) => [
    user.name,
    user.email,
    user.role === "student" ? "طالب" : "مسؤول",
    user.isSubscribed ? "نشط" : "غير نشط",
  ]);
  return {
    courses: {
      columns: ["الدورة", "القسم", "المدة", "الدروس"],
      data: courses.map((course) => [
        course.title,
        course.category.title,
        formatDuration(course.totalTime),
        String(course.totalVideo),
      ]),
      description: "إدارة الدورات والمحتوى التدريبي.",
    },
    categories: {
      columns: ["القسم", "عدد الدورات"],
      data: categories.map((category) => [
        category.title,
        String(
          courses.filter((course) => course.categoryId === category.id).length,
        ),
      ]),
      description: "تنظيم الدورات حسب المجالات المهنية.",
    },
    instructors: {
      columns: ["المدرب", "النبذة", "الدورات"],
      data: instructors.map((instructor) => [
        instructor.name,
        instructor.bio,
        String(
          courses.filter((course) => course.instructorId === instructor.id)
            .length,
        ),
      ]),
      description: "إدارة ملفات المدربين وربطهم بالدورات.",
    },
    videos: {
      columns: ["الفيديو", "الدورة", "نوع الوصول", "الحالة"],
      data: courses.flatMap((course) =>
        (course.videos ?? []).map((video) => [
          video.title,
          course.title,
          video.isFree ? "مجاني" : "للمشتركين",
          video.streamStatus,
        ]),
      ),
      description: "متابعة الفيديوهات والمعاينات المجانية.",
    },
    users: {
      columns: ["المستخدم", "البريد الإلكتروني", "الدور", "الاشتراك"],
      data: userRows,
      description: "متابعة حسابات الطلاب وحالة اشتراكهم.",
    },
    subscriptions: {
      columns: ["المستخدم", "البداية", "الانتهاء", "الحالة"],
      data: users
        .filter((user) => user.subscriptionEndsAt)
        .map((user) => [
          user.name,
          "—",
          new Intl.DateTimeFormat("ar-SA").format(
            new Date(user.subscriptionEndsAt!),
          ),
          user.isSubscribed ? "نشط" : "منتهي",
        ]),
      description: "متابعة الاشتراكات وتواريخ بدايتها وانتهائها.",
    },
    admins: {
      columns: ["المسؤول", "البريد الإلكتروني", "الدور"],
      data: users
        .filter((user) => user.role !== "student")
        .map((user) => [user.name, user.email, user.role]),
      description: "إدارة أدوار المسؤولين متاحة للمدير العام.",
    },
  };
}
function Table({ columns, data }: { columns: string[]; data: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-right text-sm">
        <thead className="bg-[#f9fbfa] text-xs text-[#8a9690]">
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col" className="px-6 py-4 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-[#f0f3f1]">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-6 py-4 ${j === 0 ? "font-semibold text-[#252b3d]" : "text-[#7b8581]"}`}
                >
                  {["نشط", "ناجح", "جاهز", "مجدولة"].includes(cell) ? (
                    <span className={badge}>{cell}</span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Overview({
  go,
  courses,
  users,
}: {
  go: (section: Section) => void;
  courses: Course[];
  users: DashboardUser[];
}) {
  const metrics = [
    [
      "المشتركون النشطون",
      String(users.filter((user) => user.isSubscribed).length),
      "مشترك نشط",
      "users",
    ],
    ["الإيراد الشهري المتكرر", "—", "الدفع مؤجل", "payments"],
    [
      "إجمالي الطلاب",
      String(users.filter((user) => user.role === "student").length),
      "حساب طالب",
      "instructors",
    ],
    ["الدورات", String(courses.length), "دورات تدريبية", "courses"],
  ] as const;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, unit, icon]) => (
          <div key={label} className={`${panel} p-5`}>
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-[#89938e]">{label}</p>
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf9f1] text-xl text-[#00b780]"
                aria-hidden="true"
              >
                <DashboardIcon name={icon} />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-[#20263a]">
              {value}
            </p>
            <p className="mt-2 text-xs text-[#9aa49e]">{unit}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className={`${panel} p-6`}>
          <h2 className="font-bold">حالة الاشتراكات</h2>
          <p className="mt-1 text-xs text-[#9aa49e]">
            أرقام مباشرة من الحسابات المسجلة.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[#e8f9f0] p-5">
              <p className="text-sm text-[#62756b]">اشتراكات نشطة</p>
              <p className="mt-2 text-3xl font-bold text-[#0a9d70]">
                {users.filter((user) => user.isSubscribed).length}
              </p>
            </div>
            <div className="rounded-xl bg-[#f7faf8] p-5">
              <p className="text-sm text-[#62756b]">بدون اشتراك نشط</p>
              <p className="mt-2 text-3xl font-bold text-[#20263a]">
                {users.filter((user) => !user.isSubscribed).length}
              </p>
            </div>
          </div>
        </section>
        <section className={`${panel} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">أحدث الدورات</h2>
              <p className="mt-1 text-xs text-[#9aa49e]">
                بيانات مباشرة من الكتالوج
              </p>
            </div>
            <button
              onClick={() => go("courses")}
              className="text-xs font-semibold text-[#00ad79]"
            >
              عرض الكل ←
            </button>
          </div>
          <div className="mt-6 space-y-5">
            {courses.slice(0, 3).map((c) => (
              <div key={c.slug} className="flex items-center gap-3">
                <div
                  className="h-12 w-14 shrink-0 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url('${c.thumbnailUrl ?? ""}')` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.title}</p>
                  <p className="mt-1 text-xs text-[#9aa49e]">
                    {c.category.title}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#78827c]">
                  {c.totalVideo} دروس
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className={`${panel} overflow-hidden`}>
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="font-bold">أحدث المستخدمين</h2>
              <p className="mt-1 text-xs text-[#9aa49e]">
                الحسابات المضافة مؤخرًا
              </p>
            </div>
            <button
              onClick={() => go("users")}
              className="text-xs font-semibold text-[#00ad79]"
            >
              عرض الكل ←
            </button>
          </div>
          <Table
            columns={["المستخدم", "البريد الإلكتروني", "الدور", "الاشتراك"]}
            data={users
              .slice(0, 5)
              .map((user) => [
                user.name,
                user.email,
                user.role,
                user.isSubscribed ? "نشط" : "غير نشط",
              ])}
          />
        </section>
        <section className={`${panel} p-6`}>
          <h2 className="font-bold">محتوى المنصة</h2>
          <p className="mt-1 text-xs text-[#9aa49e]">
            أضف الأقسام، المدربين والدورات من تبويبات إدارة المحتوى.
          </p>
          <button
            onClick={() => go("courses")}
            className="mt-5 rounded-xl bg-[#06cc8f] px-4 py-2.5 text-sm font-bold text-white"
          >
            إدارة الدورات
          </button>
        </section>
      </div>
    </>
  );
}
export default function Dashboard(props: DashboardProps) {
  const [section, setSection] = useState<Section>("overview");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const rows = buildRows(props);
  const { courses, users } = props;
  const label =
    groups.flatMap((group) => group.items).find((item) => item.id === section)
      ?.label ?? "نظرة عامة";
  const current = rows[section];
  const filtered =
    current?.data.filter((row) =>
      row.some((value) =>
        value.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    ) ?? [];
  function navigate(id: Section) {
    setSection(id);
    setSearch("");
    setDrawerOpen(false);
  }
  return (
    <main className="dashboard-shell min-h-screen flex-1 bg-[#f5f8f6]">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <aside
          className={`relative hidden w-full shrink-0 border-b border-[#e7eeea] bg-white p-4 transition-[width] duration-300 sm:p-5 lg:block lg:min-h-screen lg:border-b-0 lg:border-l lg:px-3 lg:py-7 ${sidebarOpen ? "lg:w-60" : "lg:w-20"}`}
        >
          <div
            className={`mb-5 flex items-center gap-2 px-3 lg:mb-7 ${sidebarOpen ? "justify-start" : "justify-center px-0"}`}
          >
            <Image
              src="/kafaat-logo.png"
              alt="كفاءات"
              width={1024}
              height={610}
              className={`${sidebarOpen ? "h-10" : "h-8"} w-auto`}
            />
            <span
              className={`text-xs font-medium text-[#9ba69f] ${sidebarOpen ? "" : "hidden"}`}
            >
              / الإدارة
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen((current) => !current)}
            aria-label={
              sidebarOpen ? "تصغير الشريط الجانبي" : "توسيع الشريط الجانبي"
            }
            title={sidebarOpen ? "تصغير القائمة" : "توسيع القائمة"}
            className="absolute -left-4 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#dfe8e2] bg-white text-[#52625a] shadow-sm transition hover:bg-[#eaf9f1] hover:text-[#009d70] lg:flex"
          >
            <ChevronIcon expanded={sidebarOpen} />
          </button>
          <nav
            aria-label="أقسام لوحة الإدارة"
            className="flex gap-6 overflow-x-auto lg:block"
          >
            {groups.map((group) => (
              <div
                key={group.label}
                className={`mb-5 min-w-max lg:min-w-0 ${sidebarOpen ? "" : "lg:flex lg:flex-col lg:items-center"}`}
              >
                <p
                  className={`mb-2 px-3 text-[11px] font-semibold text-[#a6b0aa] ${sidebarOpen ? "" : "lg:sr-only"}`}
                >
                  {group.label}
                </p>
                <div
                  className={`flex gap-1 lg:flex-col ${sidebarOpen ? "" : "lg:items-center"}`}
                >
                  {group.items.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      aria-current={section === item.id ? "page" : undefined}
                      title={item.label}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm font-semibold transition ${sidebarOpen ? "w-full" : "lg:h-11 lg:w-11 lg:justify-center lg:px-0"} ${section === item.id ? "bg-[#e8f9f0] text-[#00a875]" : "text-[#7e8982] hover:bg-[#f6faf7]"}`}
                    >
                      <DashboardIcon name={item.id} />
                      <span className={sidebarOpen ? "" : "lg:sr-only"}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#e4ebe6] bg-white px-4 py-3 shadow-sm lg:hidden">
            <div className="flex items-center gap-2">
              <Image
                src="/kafaat-logo.png"
                alt="كفاءات"
                width={1024}
                height={610}
                className="h-11 w-auto"
              />
              <span className="text-xs font-medium text-[#9ba69f]">
                / الإدارة
              </span>
            </div>
            <button
              type="button"
              aria-label="فتح قائمة الإدارة"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfe8e2] bg-white text-[#20263a]"
            >
              <MenuIcon />
            </button>
          </div>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#9aa49e]">لوحة الإدارة / {label}</p>
              <h1 className="mt-2 text-2xl font-bold text-[#20263a]">
                {section === "overview" ? "مرحبًا بك في لوحة الإدارة" : label}
              </h1>
              <p className="mt-2 text-sm text-[#9aa49e]">
                {section === "overview"
                  ? "إليك نظرة عامة على أداء الأكاديمية اليوم."
                  : (current?.description ?? "إعدادات المنصة وإدارتها.")}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-[#e9eeeb] bg-white px-4 py-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e7f8ef] font-bold text-[#00a875]">
                م
              </span>
              <div>
                <p className="text-xs font-bold">مدير المنصة</p>
                <p className="mt-1 text-[11px] text-[#9aa49e]">مدير عام</p>
              </div>
            </div>
          </div>
          {section === "overview" ? (
            <Overview go={navigate} courses={courses} users={users} />
          ) : section === "plans" ? (
            <section className={`${panel} overflow-hidden`}>
              <div className="p-6">
                <h2 className="font-bold">إدارة باقات الاشتراك</h2>
                <p className="mt-1 text-xs text-[#9aa49e]">
                  تحكم في السعر والمدة والمميزات وصلاحيات الوصول.
                </p>
              </div>
              <SubscriptionPlanManagement plans={props.plans} />
            </section>
          ) : section === "payments" ? (
            <section className={`${panel} overflow-hidden`}>
              <div className="border-b border-[#edf0ee] p-6">
                <h2 className="font-bold">بيانات التحويل البنكي</h2>
                <p className="mt-1 text-xs text-[#9aa49e]">
                  عدّل الحساب البنكي ورقم واتساب الدعم الظاهرين للعملاء.
                </p>
              </div>
              <BankTransferSettingsForm settings={props.bankTransfer} />
            </section>
          ) : section === "live" ? (
            <section className={`${panel} overflow-hidden`}>
              <div className="p-6">
                <h2 className="font-bold">إدارة الجلسات المباشرة</h2>
                <p className="mt-1 text-xs text-[#9aa49e]">
                  أنشئ المواعيد وعدّلها وابدأ الاجتماع كمضيف. الدخول للطلاب متاح
                  للباقة البريميوم فقط.
                </p>
              </div>
              <LiveSessionManagement initialSessions={props.liveSessions} />
            </section>
          ) : ["courses", "categories", "instructors", "videos"].includes(
              section,
            ) ? (
            <section className={`${panel} overflow-hidden`}>
              <div className="p-6">
                <h2 className="font-bold">{label}</h2>
                <p className="mt-1 text-xs text-[#9aa49e]">
                  كل التعديلات تُحفظ في قاعدة البيانات مباشرة.
                </p>
              </div>
              <ContentCrud
                resource={
                  section as "courses" | "categories" | "instructors" | "videos"
                }
                courses={props.courses}
                categories={props.categories}
                instructors={props.instructors}
              />
            </section>
          ) : current ? (
            <section className={`${panel} overflow-hidden`}>
              <div className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <h2 className="font-bold">{label}</h2>
                  <p className="mt-1 text-xs text-[#9aa49e]">
                    {filtered.length} نتائج
                  </p>
                </div>
                <label className="sr-only" htmlFor="dashboard-search">
                  بحث في {label}
                </label>
                <input
                  id="dashboard-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث..."
                  className="w-full rounded-xl border border-[#e6ece8] px-4 py-2.5 text-sm outline-none focus:border-[#06cc8f] sm:w-60"
                />
              </div>
              {section === "subscriptions" && (
                <SubscriptionAssignment
                  users={props.users}
                  plans={props.plans}
                />
              )}
              {filtered.length ? (
                <Table columns={current.columns} data={filtered} />
              ) : (
                <p className="border-t border-[#edf0ee] p-8 text-center text-sm text-[#929c96]">
                  لا توجد نتائج مطابقة للبحث.
                </p>
              )}
            </section>
          ) : (
            <section className={`${panel} p-8`}>
              <h2 className="font-bold">إعدادات المنصة</h2>
              <p className="mt-3 text-sm leading-7 text-[#929c96]">
                إعدادات المنصة وإدارتها ستكون متاحة عند ربط لوحة الإدارة.
              </p>
            </section>
          )}
        </div>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="إغلاق قائمة الإدارة"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-[#17213d]/45"
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="قائمة الإدارة"
              className="absolute inset-y-0 right-0 w-[min(20rem,88vw)] overflow-y-auto bg-white p-5 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between border-b border-[#edf0ee] pb-5">
                <div className="flex items-center gap-2">
                  <Image
                    src="/kafaat-logo.png"
                    alt="كفاءات"
                    width={1024}
                    height={610}
                    className="h-12 w-auto"
                  />
                  <span className="text-xs font-medium text-[#9ba69f]">
                    / الإدارة
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="إغلاق قائمة الإدارة"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f7f4] text-xl text-[#20263a]"
                >
                  ×
                </button>
              </div>
              <nav aria-label="أقسام لوحة الإدارة">
                {groups.map((group) => (
                  <div key={group.label} className="mb-5">
                    <p className="mb-2 px-3 text-[11px] font-semibold text-[#a6b0aa]">
                      {group.label}
                    </p>
                    <div className="grid gap-1">
                      {group.items.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => navigate(item.id)}
                          aria-current={
                            section === item.id ? "page" : undefined
                          }
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-sm font-semibold transition ${section === item.id ? "bg-[#e8f9f0] text-[#00a875]" : "text-[#7e8982] hover:bg-[#f6faf7]"}`}
                        >
                          <DashboardIcon name={item.id} />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={expanded ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}
