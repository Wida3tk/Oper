"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Armchair,
  BadgeDollarSign,
  Bell,
  BookOpenCheck,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  Copy,
  DatabaseBackup,
  Download,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  Database,
  FileChartColumn,
  FolderKanban,
  HandCoins,
  House,
  LayoutDashboard,
  Landmark,
  Layers3,
  ListChecks,
  LogOut,
  Mail,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  PhoneCall,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  UserRoundCheck,
  UserPlus,
  UsersRound,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

type View =
  | "dashboard"
  | "work"
  | "customers"
  | "reservations"
  | "direct-programs"
  | "contact"
  | "registration"
  | "assignment"
  | "finance"
  | "reports"
  | "users"
  | "programs"
  | "control"
  | "new";
type NavIcon =
  | "dashboard"
  | "tasks"
  | "customers"
  | "contact"
  | "registration"
  | "assignment"
  | "reservations"
  | "finance"
  | "users"
  | "programs"
  | "reports";
type NavItem = [View, string, NavIcon, number?];
const navIcons: Record<NavIcon, LucideIcon> = {
  dashboard: House,
  tasks: ListChecks,
  customers: Database,
  contact: CircleUserRound,
  registration: ClipboardCheck,
  assignment: Layers3,
  reservations: CalendarDays,
  finance: HandCoins,
  users: Settings2,
  programs: FolderKanban,
  reports: FileChartColumn,
};
function BrandMark({ withText = true }: { withText?: boolean }) {
  return (
    <div className={`brand-mark ${withText ? "with-text" : ""}`}>
      <img className="brand-symbol" src="/sulukera-icon.png" alt="" />
      {withText && (
        <div className="brand-wordmark">
          <img src="/sulukera-wordmark-white-v2.png" alt="سلوكيرا" />
        </div>
      )}
    </div>
  );
}
const navGroups: {
  id: string;
  label: string;
  icon?: LucideIcon;
  collapsible?: boolean;
  items: NavItem[];
}[] = [
  {
    id: "start",
    label: "البداية",
    items: [
      ["dashboard", "الرئيسية", "dashboard"],
      ["work", "مركز العمليات", "tasks"],
    ],
  },
  {
    id: "customers",
    label: "العملاء",
    icon: UsersRound,
    collapsible: true,
    items: [
      ["contact", "تسليم العميل", "contact"],
      ["registration", "تهيئة العميل", "registration"],
      ["assignment", "تفعيل المقررات", "assignment"],
    ],
  },
  {
    id: "program-management",
    label: "إدارة البرامج",
    icon: FolderKanban,
    collapsible: true,
    items: [
      ["customers", "قاعدة بيانات العملاء", "customers"],
      ["direct-programs", "عملاء البرامج المباشرة", "programs"],
      ["reservations", "حجوزات المقاعد", "reservations"],
    ],
  },
  {
    id: "settings",
    label: "الإعدادات",
    icon: Settings2,
    collapsible: true,
    items: [
      ["control", "لوحة التحكم", "users"],
      ["reports", "التقارير", "reports"],
    ],
  },
  {
    id: "finance",
    label: "المالية",
    icon: Landmark,
    collapsible: true,
    items: [["finance", "المبيعات والتحصيل", "finance"]],
  },
];
const initialPeople = [
  {
    id: "SLK-2048",
    name: "سارة محمد",
    phone: "055 321 9840",
    program: "تحليل السلوك التطبيقي",
    track: "ABAT",
    cohort: "الدفعة 18",
    source: "المتجر",
    owner: "ليان",
    state: "بانتظار التسجيل",
    tone: "amber",
    due: "متابعة اليوم، 12:30 م",
    paid: 4250,
    total: 6500,
  },
  {
    id: "SLK-2047",
    name: "عمر خالد",
    phone: "050 918 3721",
    program: "إدارة السلوك التنظيمي",
    track: "P",
    cohort: "الدفعة 18",
    source: "تسجيل مباشر",
    owner: "نور",
    state: "بانتظار الإسناد",
    tone: "blue",
    due: "منذ ساعتين",
    paid: 8000,
    total: 8000,
  },
  {
    id: "SLK-2046",
    name: "ريم عبدالله",
    phone: "053 645 2280",
    program: "تحليل السلوك التطبيقي",
    track: "QBA",
    cohort: "—",
    source: "المنصة",
    owner: "ليان",
    state: "تم التواصل",
    tone: "violet",
    due: "متابعة غداً",
    paid: 3000,
    total: 9500,
  },
  {
    id: "SLK-2045",
    name: "فيصل أحمد",
    phone: "056 122 8304",
    program: "التعليم المستمر",
    track: "RBT",
    cohort: "—",
    source: "تمارا",
    owner: "مها",
    state: "مكتمل",
    tone: "green",
    due: "لا إجراء مطلوب",
    paid: 2400,
    total: 2400,
  },
  {
    id: "SLK-2044",
    name: "نجلاء صالح",
    phone: "054 827 1036",
    program: "الاقتصاد السلوكي",
    track: "برنامج الممارس",
    cohort: "—",
    source: "عصارة",
    owner: "نور",
    state: "مكتمل",
    tone: "green",
    due: "تم التفعيل تلقائياً",
    paid: 3200,
    total: 3200,
  },
  {
    id: "SLK-2043",
    name: "هدى إبراهيم",
    phone: "057 422 6951",
    program: "الاقتصاد السلوكي",
    track: "التصميم السلوكي",
    cohort: "—",
    source: "سلة",
    owner: "ليان",
    state: "بانتظار الإسناد",
    tone: "blue",
    due: "إسناد اليوم",
    paid: 1500,
    total: 3000,
  },
  {
    id: "SLK-2042",
    name: "محمد القحطاني",
    phone: "059 731 2840",
    program: "الاقتصاد السلوكي",
    track: "برنامج الممارس",
    cohort: "—",
    source: "دفع مباشر",
    owner: "مها",
    state: "تم التواصل",
    tone: "violet",
    due: "متابعة غداً",
    paid: 1000,
    total: 3200,
  },
];
const people = initialPeople;
const tasks = [
  [
    "09:30",
    "التواصل مع سارة لاستكمال التسجيل",
    "سارة محمد · SLK-2048",
    "أكاديمية",
    "amber",
  ],
  [
    "11:00",
    "التحقق من الدفعة الثانية",
    "ريم عبدالله · 2,000 ر.س",
    "مالية",
    "red",
  ],
  ["12:30", "إسناد مقررات برنامج OBM", "عمر خالد · الدفعة 18", "إسناد", "blue"],
  [
    "14:00",
    "مراجعة طلب جديد من المتجر",
    "نجلاء صالح · SLK-2049",
    "مبيعات",
    "violet",
  ],
];
const titles: Record<View, [string, string]> = {
  dashboard: ["الرئيسية", "ملخص شامل لحركة العمليات والمبيعات والتحصيل"],
  work: ["مركز العمليات", "المواعيد التشغيلية والاستثناءات التي تحتاج تدخلاً"],
  customers: ["قاعدة بيانات العملاء", "العملاء الذين اكتملت رحلتهم التشغيلية"],
  reservations: [
    "حجوزات المقاعد",
    "الحجوزات المؤكدة وطلبات النقل والتحويل إلى تسجيل",
  ],
  "direct-programs": [
    "عملاء البرامج المباشرة",
    "الدفعات المجدولة التي تنتقل إلى التهيئة في تاريخ الإسناد",
  ],
  contact: ["تسليم العميل", "تسجيل بيانات العميل ومتابعة عملاء التجربة"],
  registration: [
    "تهيئة العميل",
    "متابعة بيانات العميل وتجهيزه قبل تفعيل مقرراته",
  ],
  assignment: ["تفعيل المقررات", "العملاء الجاهزون لتفعيل البرنامج والمقررات"],
  finance: [
    "المالية",
    "إدارة المبيعات والتحصيل والمراجعات المالية في مكان واحد",
  ],
  programs: ["إدارة البرامج", "أضف البرامج وتحكم بظهورها في تسجيل العميل"],
  reports: ["التقارير الإدارية", "مؤشرات الأداء وجودة العمليات"],
  users: [
    "المستخدمون والصلاحيات",
    "إضافة أعضاء الفريق وتحديد صلاحية كل مستخدم",
  ],
  control: [
    "لوحة التحكم",
    "إدارة المستخدمين والصلاحيات وبرامج النظام من مكان واحد",
  ],
  new: [
    "تسجيل عميل جديد",
    "تسجيل الطلب مرة واحدة يُنشئ إجراءات الأقسام تلقائياً",
  ],
};

export default function Home() {
  return <AuthGate />;
}
function AuthGate() {
  const [checking, setChecking] = useState(true),
    [authenticated, setAuthenticated] = useState(false),
    [setup, setSetup] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    fetch("/api/auth")
      .then(async (r) => {
        const data = await r.json();
        setAuthenticated(Boolean(data.authenticated));
        setSetup(Boolean(data.setupRequired));
        if (data.email) setEmail(data.email);
      })
      .finally(() => setChecking(false));
  }, []);
  const login = async () => {
    setSaving(true);
    setError("");
    try {
      const r = await fetch("/api/auth", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: setup ? "setup" : "login",
            email,
            password,
          }),
        }),
        raw = await r.text();
      let data: Record<string, unknown> = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {}
      if (!r.ok)
        throw new Error(
          String(data.error || "تعذر إنشاء جلسة الدخول. أعد المحاولة."),
        );
      if (!data.ok) throw new Error("لم يكتمل إنشاء الحساب");
      setAuthenticated(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  if (checking) return <div className="auth-loading">جارٍ تجهيز النظام...</div>;
  if (authenticated) return <OperationsApp />;
  return (
    <main className="login-page" dir="rtl">
      <section className="login-visual">
        <div className="login-brand">
          <BrandMark />
        </div>
        <div>
          <em>مساحة عمل واحدة</em>
          <h1>
            كل رحلة عميل.
            <br />
            واضحة وتحت السيطرة.
          </h1>
          <p>
            تابع العملاء والبرامج والدفعات ومهام الفريق من نظام عمليات متكامل
            وآمن.
          </p>
        </div>
        <small>بيئة محمية بواسطة Cloudflare Access</small>
      </section>
      <section className="login-form">
        <div>
          <BrandMark />
          <h2>{setup ? "إنشاء كلمة مرور المدير" : "مرحباً بعودتك"}</h2>
          <p>
            {setup
              ? "هذه أول مرة. أنشئ كلمة مرور داخلية لحساب الإدارة."
              : "أدخل بيانات حسابك للوصول إلى مساحة العمل."}
          </p>
          <label>
            البريد الإلكتروني
            <input
              type="email"
              value={email}
              disabled={setup}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@sulukera.com"
            />
          </label>
          <label>
            كلمة المرور
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 أحرف على الأقل"
              onKeyDown={(e) => e.key === "Enter" && void login()}
            />
          </label>
          {error && <div className="login-error">{error}</div>}
          <button
            className="primary"
            disabled={saving || !email || password.length < 8}
            onClick={login}
          >
            {saving
              ? "جارٍ الدخول..."
              : setup
                ? "إنشاء الحساب والدخول"
                : "تسجيل الدخول"}
          </button>
          <small>للدخول يجب أن يكون بريدك مضافاً من إدارة المستخدمين.</small>
        </div>
      </section>
    </main>
  );
}

function OperationsApp() {
  const [view, setView] = useState<View>("dashboard"),
    [query, setQuery] = useState(""),
    [people, setPeople] = useState(initialPeople),
    [selected, setSelected] = useState(initialPeople[0]),
    [panel, setPanel] = useState(false),
    [taskCount, setTaskCount] = useState(0),
    [navCounts, setNavCounts] = useState<Partial<Record<View, number>>>({}),
    [openGroups, setOpenGroups] = useState<string[]>([]),
    [sidebarCollapsed, setSidebarCollapsed] = useState(false),
    [mobileOpen, setMobileOpen] = useState(false),
    [accountOpen, setAccountOpen] = useState(false),
    [notificationsOpen, setNotificationsOpen] = useState(false),
    [successNotice, setSuccessNotice] = useState<{ id: number; message: string } | null>(null),
    [currentUser, setCurrentUser] = useState({
      name: "الإدارة",
      email: "",
      roles: ["admin"] as string[],
      permissions: ["*"] as string[],
    });
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const showSuccess = (event: Event) => {
      const message = (event as CustomEvent<{ message?: string }>).detail?.message || "تم التحديث بنجاح";
      setSuccessNotice({ id: Date.now(), message });
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setSuccessNotice(null), 3200);
    };
    window.addEventListener("sulukera:success", showSuccess);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("sulukera:success", showSuccess);
    };
  }, []);
  useEffect(() => {
    const localizeDates = () =>
      document
        .querySelectorAll<HTMLInputElement>('input[type="date"]')
        .forEach((input) => {
          input.lang = "en-US";
          input.dir = "ltr";
          input.setAttribute("aria-description", "Date format: MM/DD/YYYY");
        });
    localizeDates();
    const observer = new MutationObserver(localizeDates);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const refresh = async () => {
      const [tasksResult, enrollmentsResult, reservationsResult, directResult, financeResult] =
        await Promise.allSettled([
          apiJson("/api/tasks"),
          apiJson("/api/enrollments"),
          apiJson(`/api/reservations?kind=${encodeURIComponent("حجز مقعد")}`),
          apiJson(`/api/reservations?kind=${encodeURIComponent("برنامج مباشر")}`),
          apiJson("/api/finance"),
        ]);
      if (tasksResult.status === "fulfilled") {
        setTaskCount((tasksResult.value.tasks || []).length);
      }
      const enrollments =
        enrollmentsResult.status === "fulfilled"
          ? enrollmentsResult.value.enrollments || []
          : [];
      const reservations =
        reservationsResult.status === "fulfilled"
          ? reservationsResult.value.reservations || []
          : [];
      const direct =
        directResult.status === "fulfilled"
          ? directResult.value.reservations || []
          : [];
      const finance =
        financeResult.status === "fulfilled"
          ? financeResult.value.orders || []
          : [];
      setNavCounts({
        contact: enrollments.filter((row: LiveEnrollment) => row.status === "جديد").length,
        registration: enrollments.filter(
          (row: LiveEnrollment) => row.status === "تم التواصل",
        ).length,
        assignment: enrollments.filter((row: LiveEnrollment) =>
          ["اكتمل التسجيل", "تم إنشاء الحساب"].includes(row.status),
        ).length,
        reservations: reservations.filter(
          (row: LiveReservation) => row.status !== "تم التحويل",
        ).length,
        "direct-programs": direct.filter(
          (row: LiveReservation) => row.status !== "تم التحويل",
        ).length,
        finance: finance.filter(
          (row: FinanceOrder) =>
            row.finance_review_status === "pending" ||
            row.installments?.some(
              (installment: FinanceInstallment) =>
                installment.display_status === "متأخر",
            ),
        ).length,
      });
    };
    refresh();
    apiJson("/api/auth")
      .then((data) =>
        setCurrentUser({
          name: data.name || data.email?.split("@")[0] || "المستخدم",
          email: data.email || "",
          roles: data.roles || [],
          permissions: data.permissions || [],
        }),
      )
      .catch(() => {});
    window.addEventListener("sulukera:data-changed", refresh);
    return () => window.removeEventListener("sulukera:data-changed", refresh);
  }, []);
  useEffect(() => {
    if (!panel) return;
    document.body.classList.add("customer-drawer-open");
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("customer-drawer-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [panel]);
  const list = useMemo(
    () =>
      people.filter((p) => `${p.name} ${p.id} ${p.program}`.includes(query)),
    [query],
  );
  const open = (p: (typeof initialPeople)[number]) => {
    setSelected(p);
    setPanel(true);
  };
  const updateWorkflow = (state: string, tone: string, due: string) => {
    Object.assign(selected, { state, tone, due });
    setSelected({ ...selected });
    setPeople([...people]);
  };
  const openWhatsApp = () => {
    const digits = selected.phone
      .replace(/\D/g, "")
      .replace(/^00/, "")
      .replace(/^0/, "966");
    const message = `مرحباً ${selected.name}، معك فريق سلوكيرا بخصوص تسجيلك في برنامج ${selected.program}. يسعدنا خدمتك واستكمال الإجراء معك.`;
    window.open(
      `https://wa.me/${digits}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  const selectedDetails = selected as typeof selected & {
    email?: string;
    orderId?: string;
    seatFee?: number;
  };
  const has = (permission: string) =>
    currentUser.roles.includes("admin") ||
    currentUser.permissions.includes("*") ||
    currentUser.permissions.includes(permission);
  const canOpen = (id: View) =>
    ["dashboard", "work"].includes(id) ||
    (id === "customers" && has("customers.view")) ||
    (["contact", "registration"].includes(id) && has("customers.manage")) ||
    (id === "assignment" && has("programs.activate")) ||
    (["reservations", "direct-programs"].includes(id) &&
      has("reservations.manage")) ||
    (id === "finance" && has("finance.view")) ||
    (id === "reports" && has("reports.view")) ||
    (id === "users" && has("users.manage")) ||
    (id === "programs" && currentUser.roles.includes("admin")) ||
    (id === "control" && currentUser.roles.includes("admin"));
  const visibleNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(([id]) => canOpen(id)),
    }))
    .filter((group) => group.items.length);
  const go = (id: View) => {
    setView(id);
    setMobileOpen(false);
  };
  useEffect(() => {
    const activeGroup = visibleNavGroups.find((group) =>
      group.items.some(([id]) => id === view),
    );
    if (activeGroup?.collapsible) {
      setOpenGroups((current) =>
        current.includes(activeGroup.id)
          ? current
          : [...current, activeGroup.id],
      );
    }
  }, [view]);
  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.reload();
  };
  const todayLabel = new Intl.DateTimeFormat("ar-SA-u-nu-latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const headerNotifications = [
    { view: "work" as View, label: "عملاء بحاجة إلى متابعة اليوم", count: taskCount },
    { view: "contact" as View, label: "بانتظار تسليم العميل", count: navCounts.contact || 0 },
    { view: "registration" as View, label: "بانتظار تهيئة العميل", count: navCounts.registration || 0 },
    { view: "assignment" as View, label: "بانتظار تفعيل المقررات", count: navCounts.assignment || 0 },
    { view: "finance" as View, label: "بانتظار الإجراء المالي", count: navCounts.finance || 0 },
  ].filter((item) => item.count > 0 && canOpen(item.view));
  return (
    <main className="shell" dir="rtl">
      {successNotice && (
        <div className="success-toast" role="status" aria-live="polite" key={successNotice.id}>
          <ShieldCheck size={21} />
          <div><b>{successNotice.message}</b><span>تم حفظ التغيير في النظام</span></div>
          <button type="button" aria-label="إغلاق الإشعار" onClick={() => setSuccessNotice(null)}>×</button>
        </div>
      )}
      {mobileOpen && (
        <button
          className="mobile-nav-overlay"
          aria-label="إغلاق القائمة"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`sidebar ${mobileOpen ? "mobile-open" : ""} ${sidebarCollapsed ? "collapsed" : ""}`}
      >
        <button
          className="mobile-nav-close"
          aria-label="إغلاق القائمة"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="brand">
          <BrandMark />
          <button
            className="sidebar-collapse"
            aria-label={sidebarCollapsed ? "توسيع القائمة" : "تصغير القائمة"}
            title={sidebarCollapsed ? "توسيع القائمة" : "تصغير القائمة"}
            onClick={() => setSidebarCollapsed((value) => !value)}
          >
            {sidebarCollapsed ? (
              <PanelRightOpen size={18} />
            ) : (
              <PanelRightClose size={18} />
            )}
          </button>
        </div>
        <div className="workspace">
          <i />
          <div>
            <b>بيئة العمل</b>
            <span>متصل وآمن</span>
          </div>
          <em>⌄</em>
        </div>
        <nav>
          {visibleNavGroups.map((group) => {
            const expanded =
              !group.collapsible || openGroups.includes(group.id);
            const GroupIcon = group.icon;
            const groupCount = group.items.reduce(
              (sum, [id]) => sum + Number(navCounts[id] || 0),
              0,
            );
            return (
              <section
                className={`nav-group ${group.collapsible ? "collapsible" : "static"} ${expanded ? "expanded" : ""}`}
                key={group.id}
              >
                {group.collapsible ? (
                  <button
                    className={`nav-group-trigger ${group.items.some(([id]) => id === view) ? "current" : ""}`}
                    aria-expanded={expanded}
                    onClick={() => {
                      if (sidebarCollapsed) {
                        setSidebarCollapsed(false);
                        setOpenGroups((current) =>
                          current.includes(group.id)
                            ? current
                            : [...current, group.id],
                        );
                        return;
                      }
                      setOpenGroups((current) =>
                        current.includes(group.id)
                          ? current.filter((id) => id !== group.id)
                          : [...current, group.id],
                      );
                    }}
                  >
                    <i>{GroupIcon && <GroupIcon size={18} strokeWidth={1.8} />}</i>
                    <span>{group.label}</span>
                    {groupCount > 0 && <em>{groupCount}</em>}
                    <ChevronDown className="nav-chevron" size={15} />
                  </button>
                ) : (
                  group.id !== "start" && (
                    <p className="nav-label">{group.label}</p>
                  )
                )}
                <div className="nav-group-items">
                  {group.items.map(([id, label, icon, badge]) => {
                    const Icon = navIcons[icon],
                      visibleBadge =
                        id === "work"
                          ? taskCount
                          : navCounts[id] ?? badge;
                    return (
                      <button
                        key={id}
                        className={view === id ? "active" : ""}
                        onClick={() => go(id)}
                      >
                        <i>
                          <Icon size={17} strokeWidth={1.8} />
                        </i>
                        <span>{label}</span>
                        {Boolean(visibleBadge) && <em>{visibleBadge}</em>}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </nav>
        <div className="health">
          <span>سلامة النظام</span>
          <b>كل الأنظمة تعمل</b>
          <strong>99.9%</strong>
          <i>
            <u />
          </i>
        </div>
        <div className="profile">
          <i>{currentUser.name.slice(0, 2)}</i>
          <div>
            <b>{currentUser.name}</b>
            <span>
              {currentUser.roles.includes("admin")
                ? "مدير النظام"
                : currentUser.roles
                    .map((role) => roleNames[role] || role)
                    .join("، ")}
            </span>
          </div>
          <button
            className="logout-button"
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
            onClick={logout}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <section className={`main ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <header className="topbar">
          <button
            className="mobile-menu-button"
            aria-label="فتح القائمة"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="topbar-page">
            <b>{titles[view][0]}</b>
            <span>{titles[view][1]}</span>
          </div>
          <label className="global-search">
            <Search size={18} />
            <input
              aria-label="البحث في العملاء والطلبات والبرامج"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) go("customers");
              }}
              placeholder="ابحث عن عميل، رقم طلب أو برنامج..."
            />
          </label>
          <div className="top-notifications">
            <button
              className="bell"
              title="الإشعارات"
              aria-label="الإشعارات"
              aria-expanded={notificationsOpen}
              onClick={() => {
                setNotificationsOpen((value) => !value);
                setAccountOpen(false);
              }}
            >
              <Bell size={18} />
              {headerNotifications.length > 0 && <i>{headerNotifications.length}</i>}
            </button>
            {notificationsOpen && (
              <div className="notifications-menu">
                <header><b>الإشعارات</b><span>{headerNotifications.length} أقسام تحتاج متابعة</span></header>
                {headerNotifications.length ? headerNotifications.map((item) => (
                  <button key={item.view} onClick={() => { go(item.view); setNotificationsOpen(false); }}>
                    <span><b>{item.label}</b><small>انقر لفتح القائمة ومتابعتها</small></span>
                    <em>{item.count}</em>
                  </button>
                )) : <p>لا توجد إشعارات جديدة حاليًا</p>}
              </div>
            )}
          </div>
          {has("customers.manage") && (
            <button className="primary" onClick={() => go("new")}>
              <UserPlus size={17} />
              <span>تسجيل عميل</span>
            </button>
          )}
          <div className="top-account">
            <button
              className="top-account-trigger"
              onClick={() => { setAccountOpen((value) => !value); setNotificationsOpen(false); }}
              aria-expanded={accountOpen}
            >
              <i>{currentUser.name.slice(0, 2)}</i>
              <span>
                <b>{currentUser.name}</b>
                <small>{currentUser.roles.includes("admin") ? "مدير النظام" : currentUser.roles.map((role) => roleNames[role] || role).join("، ")}</small>
              </span>
              <ChevronDown size={15} />
            </button>
            {accountOpen && (
              <div className="top-account-menu">
                <div><b>{currentUser.name}</b><span>{currentUser.email}</span></div>
                <button onClick={logout}><LogOut size={16} /> تسجيل الخروج</button>
              </div>
            )}
          </div>
        </header>
        <div className="content">
          <div className="page-date">اليوم · {todayLabel}</div>
          {view === "dashboard" && (
            <>
              <HomeDashboard onOpenTasks={() => setView("work")} />
            </>
          )}
          {view === "work" && <LiveWork onNavigate={go} />}
          {view === "customers" && <LiveCustomers query={query} open={open} />}
          {view === "reservations" && <Reservations />}
          {view === "direct-programs" && <Reservations kind="برنامج مباشر" />}
          {view === "contact" && (
            <>
              <TrialHandoff />
              <Registration done={() => setView("customers")} />
            </>
          )}
          {view === "registration" && <LiveAcademy focus="registration" canManagePaymentReference={currentUser.roles.some((role) => ["admin", "sales", "finance"].includes(role))} />}
          {view === "assignment" && <LiveAcademy focus="assignment" canManagePaymentReference={currentUser.roles.some((role) => ["admin", "sales", "finance"].includes(role))} />}
          {view === "finance" && (
            <>
              <TransferReviews />
              <LiveFinance />
            </>
          )}
          {view === "programs" && <Programs />}
          {view === "reports" && (
            <>
              <BackupCenter />
              <LiveReports />
            </>
          )}
          {view === "users" && <Users />}
          {view === "control" && <ControlPanel />}
          {view === "new" && <Registration done={() => setView("customers")} />}
        </div>
      </section>
      {panel && (
        <>
          <div className="overlay" onClick={() => setPanel(false)} />
          <aside
            className="drawer customer-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-drawer-title"
          >
            <button
              className="close"
              aria-label="إغلاق ملف العميل"
              onClick={() => setPanel(false)}
            >
              ×
            </button>
            <div className="person">
              <i>{selected.name.slice(0, 2)}</i>
              <div>
                <h2 id="customer-drawer-title">{selected.name}</h2>
                <p>
                  {selected.id} · {selected.phone}
                </p>
              </div>
            </div>
            <div className="actions">
              <button className="whatsapp" onClick={openWhatsApp}>
                <FaWhatsapp size={18} />
                واتساب
              </button>
              <button
                className="email-action"
                disabled={!selectedDetails.email}
                onClick={() =>
                  (window.location.href = `mailto:${selectedDetails.email}`)
                }
              >
                <Mail size={17} />
                إيميل
              </button>
            </div>
            <Section title="بيانات العميل والتسجيل">
              <div className="info customer-data">
                <label>
                  البريد الإلكتروني<b>{selectedDetails.email || "—"}</b>
                </label>
                <label>
                  رقم الجوال<b>{selected.phone}</b>
                </label>
                <label>
                  البرنامج<b>{selected.program}</b>
                </label>
                <label>
                  المسار<b>{selected.track}</b>
                </label>
                <label>
                  قناة الشراء<b>{selected.source}</b>
                </label>
                <label>
                  رقم الطلب<b>{selectedDetails.orderId || "—"}</b>
                </label>
                <label className="customer-cohort-field">
                  رقم الدفعة
                  <b>{selected.cohort && selected.cohort !== "—" ? selected.cohort : "غير متاح"}</b>
                  {has("customers.manage") && <CustomerCohortEditor customer={selectedDetails} onSaved={(cohort) => { setSelected({...selected,cohort} as typeof selected); setPeople((current) => current.map((item) => item.id === selected.id ? {...item,cohort} : item)); window.dispatchEvent(new CustomEvent("sulukera:data-changed")); }} />}
                </label>
              </div>
              {has("customers.manage") && (
                <CustomerDataEditor
                  customer={selectedDetails}
                  onSaved={(customer) => {
                    setSelected({
                      ...selected,
                      name: customer.name,
                      phone: customer.phone,
                      source: customer.source,
                      email: customer.email,
                    } as typeof selected);
                    window.dispatchEvent(new CustomEvent("sulukera:data-changed"));
                  }}
                />
              )}
            </Section>
            <Section title="حالة العميل">
              <div className={`status ${selected.tone}`}>
                <b>{selected.state}</b>
                <span>{selected.due}</span>
              </div>
              <p className="workflow-help live-note">
                تتحدث هذه الحالة تلقائياً عند تنفيذ الإجراء من قائمة التواصل أو
                التسجيل أو الإسناد.
              </p>
            </Section>
            <Section title="الملخص المالي">
              <div className="money">
                <p>
                  قيمة الطلب
                  <b>
                    {selected.total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    ر.س
                  </b>
                </p>
                <p>
                  المدفوع من قيمة البرنامج
                  <b>
                    {selected.paid.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    ر.س
                  </b>
                </p>
                {Number(selectedDetails.seatFee || 0)>0&&<p className="seat-fee-paid">رسوم المقعد المدفوعة<b>{Number(selectedDetails.seatFee).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} ر.س</b></p>}
                {Number(selectedDetails.seatFee || 0)>0&&<p className="actual-paid-total">إجمالي المدفوع فعلياً<b>{(selected.paid+Number(selectedDetails.seatFee)).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} ر.س</b></p>}
              </div>
              <div className="progress">
                <i
                  style={{
                    width: `${selected.total ? (selected.paid / selected.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </Section>
            <Section title="آخر النشاطات">
              <CustomerEditHistory customerId={selected.id} />
            </Section>
            <Section title="تحديثات العميل">
              <CustomerNotes customerId={selected.id} />
            </Section>
            {currentUser.roles.includes("admin") && (
              <Section title="إدارة الملف">
                <AdminDeleteCustomer
                  customerId={selected.id}
                  customerName={selected.name}
                  onDeleted={() => {
                    setPanel(false);
                    setPeople((current) =>
                      current.filter((customer) => customer.id !== selected.id),
                    );
                    window.dispatchEvent(new Event("sulukera:data-changed"));
                  }}
                />
              </Section>
            )}
          </aside>
        </>
      )}
    </main>
  );
}

type EditableCustomer = typeof initialPeople[number] & { email?: string; orderId?: string };
function CustomerDataEditor({ customer, onSaved }: { customer: EditableCustomer; onSaved: (customer: { name: string; phone: string; email: string; source: string }) => void }) {
  const [editing, setEditing] = useState(false), [name, setName] = useState(customer.name), [phone, setPhone] = useState(customer.phone), [email, setEmail] = useState(customer.email || ""), [source, setSource] = useState(customer.source), [saving, setSaving] = useState(false), [error, setError] = useState("");
  useEffect(() => { setName(customer.name); setPhone(customer.phone); setEmail(customer.email || ""); setSource(customer.source) }, [customer.id, customer.name, customer.phone, customer.email, customer.source]);
  const save = async () => { setSaving(true); setError(""); try { await apiJson("/api/customers", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ customerId: customer.id, name, phone, email, source, cohort: customer.cohort === "—" ? "" : customer.cohort }) }); onSaved({ name, phone, email, source }); setEditing(false); window.dispatchEvent(new CustomEvent("sulukera:customer-history-changed", { detail: customer.id })) } catch (e) { setError((e as Error).message) } finally { setSaving(false) } };
  if (!editing) return <button className="customer-edit-trigger" onClick={() => setEditing(true)}>تعديل بيانات العميل</button>;
  return <div className="customer-edit-form"><label>اسم العميل<input value={name} onChange={e => setName(e.target.value)} /></label><label>رقم الجوال<input type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></label><label>البريد الإلكتروني<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label><label>مصدر الشراء<input value={source} onChange={e => setSource(e.target.value)} /></label>{error && <div className="ops-error compact">{error}</div>}<div><button className="primary" disabled={saving || !name || !phone || !email} onClick={save}>{saving ? "جارٍ الحفظ…" : "حفظ التعديلات"}</button><button className="secondary" disabled={saving} onClick={() => setEditing(false)}>إلغاء</button></div></div>
}

function CustomerCohortEditor({ customer, onSaved }: { customer: EditableCustomer; onSaved: (cohort: string) => void }) {
  const current = customer.cohort === "—" ? "" : String(customer.cohort || "");
  const [editing, setEditing] = useState(false), [cohort, setCohort] = useState(current), [saving, setSaving] = useState(false), [error, setError] = useState("");
  useEffect(() => { setCohort(current); setEditing(false); setError("") }, [customer.id, current]);
  const save = async () => {
    if (!cohort.trim()) return;
    setSaving(true); setError("");
    try {
      await apiJson("/api/customers", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ customerId: customer.id, name: customer.name, phone: customer.phone, email: customer.email, source: customer.source, cohort: cohort.trim() }) });
      onSaved(cohort.trim()); setEditing(false);
      window.dispatchEvent(new CustomEvent("sulukera:customer-history-changed", { detail: customer.id }));
    } catch (e) { setError((e as Error).message) } finally { setSaving(false) }
  };
  if (!editing) return <button type="button" className="customer-cohort-trigger" onClick={() => setEditing(true)}>{current ? "تعديل رقم الدفعة" : "+ إضافة رقم الدفعة"}</button>;
  return <span className="customer-cohort-editor"><input autoFocus value={cohort} onChange={(e) => setCohort(e.target.value)} placeholder="مثال: الدفعة 12"/><button type="button" disabled={saving || !cohort.trim() || cohort.trim() === current} onClick={save}>{saving ? "..." : "حفظ"}</button><button type="button" disabled={saving} onClick={() => { setCohort(current); setEditing(false) }}>إلغاء</button>{error && <small>{error}</small>}</span>;
}

type CustomerHistoryRow = { id: string; actor_email: string; actor_name?: string; details: string; created_at: string };
function CustomerEditHistory({ customerId }: { customerId: string }) {
  const [rows, setRows] = useState<CustomerHistoryRow[]>([]);
  const load = () => apiJson(`/api/customers/history?customerId=${encodeURIComponent(customerId)}`).then(data => setRows(data.history || [])).catch(() => setRows([]));
  useEffect(() => { void load(); const refresh = (event: Event) => { if ((event as CustomEvent).detail === customerId) void load() }; window.addEventListener("sulukera:customer-history-changed", refresh); return () => window.removeEventListener("sulukera:customer-history-changed", refresh) }, [customerId]);
  const labels: Record<string, string> = { name: "الاسم", phone: "رقم الجوال", email: "البريد الإلكتروني", source: "مصدر الشراء", cohort: "رقم الدفعة" };
  if (!rows.length) return <div className="customer-history-empty">لا توجد تعديلات مسجلة على بيانات العميل.</div>;
  return <div className="customer-edit-history">{rows.map(row => { let changes: Record<string, { from: string; to: string }> = {}; try { changes = JSON.parse(row.details || "{}").changes || {} } catch {} return <article key={row.id}><header><b>تعديل بيانات العميل</b><span>{new Date(row.created_at).toLocaleString("ar-SA-u-nu-latn")}</span></header>{Object.entries(changes).map(([field, change]) => <p key={field}><b>{labels[field] || field}</b><del>{change.from || "فارغ"}</del><i>←</i><ins>{change.to || "فارغ"}</ins></p>)}<footer>تم التعديل بواسطة: <b>{row.actor_name || row.actor_email}</b></footer></article>})}</div>
}

type CustomerNoteRow = {
  id: string;
  note: string;
  created_by_email: string;
  created_at: string;
};
function CustomerNotes({ customerId }: { customerId: string }) {
  const [notes, setNotes] = useState<CustomerNoteRow[]>([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const load = () =>
    apiJson(`/api/customers/notes?customerId=${encodeURIComponent(customerId)}`)
      .then((data) => setNotes(data.notes || []))
      .catch((e) => setError(e.message));
  useEffect(() => {
    setText("");
    setError("");
    void load();
  }, [customerId]);
  const save = async () => {
    if (!text.trim()) return;
    setSaving(true);
    setError("");
    try {
      const data = await apiJson("/api/customers/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customerId, note: text }),
      });
      setNotes((current) => [data.note, ...current]);
      setText("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="customer-note-log">
      <div className="customer-note-entry">
        <textarea
          rows={2}
          maxLength={1000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب تحديثاً جديداً عن العميل..."
        />
        <button
          className="primary"
          disabled={saving || !text.trim()}
          onClick={() => void save()}
        >
          {saving ? "جارٍ الحفظ…" : "حفظ التحديث"}
        </button>
      </div>
      {error && <div className="ops-error compact">{error}</div>}
      <div className="customer-note-lines">
        {notes.map((row) => (
          <article key={row.id}>
            <i />
            <div>
              <p>{row.note}</p>
              <span>
                {row.created_by_email} ·{" "}
                {new Date(row.created_at).toLocaleString("ar-SA-u-nu-latn")}
              </span>
            </div>
          </article>
        ))}
        {!notes.length && (
          <div className="customer-history-empty">
            لا توجد تحديثات مسجلة على العميل.
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDeleteCustomer({
  customerId,
  customerName,
  onDeleted,
}: {
  customerId: string;
  customerName: string;
  onDeleted: () => void;
}) {
  const [confirming, setConfirming] = useState(false),
    [typed, setTyped] = useState(""),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const remove = async () => {
    setSaving(true);
    setError("");
    try {
      await apiJson("/api/customers", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      onDeleted();
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  };
  return (
    <>
      <button
        className="admin-delete-customer"
        onClick={() => setConfirming(true)}
      >
        حذف العميل
      </button>
      {confirming && (
        <div
          className="delete-confirm-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-customer-title"
        >
          <section>
            <h2 id="delete-customer-title">تأكيد حذف العميل</h2>
            <p>
              سيُخفى ملف <b>{customerName}</b> من النظام وتُغلق متابعاته
              المفتوحة. تُحذف دفعاته وأقساطه ومبالغه من المبيعات والتحصيل،
              ويُحفظ سجل التدقيق فقط.
            </p>
            <label>
              اكتب اسم العميل للتأكيد
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={customerName}
              />
            </label>
            {error && <div className="ops-error compact">{error}</div>}
            <div>
              <button
                className="secondary"
                disabled={saving}
                onClick={() => {
                  setConfirming(false);
                  setTyped("");
                  setError("");
                }}
              >
                إلغاء
              </button>
              <button
                className="danger-confirm"
                disabled={saving || typed.trim() !== customerName.trim()}
                onClick={remove}
              >
                {saving ? "جارٍ الحذف…" : "حذف العميل وبياناته المالية"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function Dashboard({ open }: { open: (p: (typeof people)[number]) => void }) {
  return (
    <>
      <div className="kpis">
        <Kpi
          title="طلبات هذا الشهر"
          value="128"
          tag="+12.5%"
          note="مقارنة بالشهر الماضي"
          tone="blue"
        />
        <Kpi
          title="بانتظار الأكاديمية"
          value="17"
          tag="5 عاجلة"
          note="تجاوزت وقت الاستلام"
          tone="amber"
        />
        <Kpi
          title="التحصيل هذا الشهر"
          value="184,250"
          tag="ر.س"
          note="من أصل 221,000 ر.س"
          tone="green"
        />
        <Kpi
          title="مستحقات متأخرة"
          value="23,500"
          tag="8 أقساط"
          note="تحتاج متابعة مالية"
          tone="red"
        />
      </div>
      <div className="dashboard-grid">
        <Card title="الأولويات اليوم" action="عرض كل المهام">
          <TaskList />
        </Card>
        <Card title="تدفق عمليات الأكاديمية" action="فتح لوحة الأكاديمية">
          <div className="flow">
            {[
              ["17", "جديد", "gray"],
              ["12", "تم التواصل", "violet"],
              ["9", "بانتظار التسجيل", "amber"],
              ["6", "بانتظار الإسناد", "blue"],
              ["84", "مكتمل", "green"],
            ].map(([n, l, t]) => (
              <div key={l}>
                <i className={t}>{n}</i>
                <span>{l}</span>
              </div>
            ))}
          </div>
          <div className="sla">
            <span>متوسط إكمال التهيئة</span>
            <b>1.8 يوم</b>
            <em>الهدف: أقل من يومين</em>
          </div>
        </Card>
        <div className="latest">
          <Card title="أحدث التسجيلات" action="عرض جميع التسجيلات">
            <CustomerTable list={people} open={open} />
          </Card>
        </div>
        <Card title="نبض التحصيل" action="التفاصيل المالية">
          <div className="ring">
            <div>
              <b>83%</b>
              <span>نسبة التحصيل</span>
            </div>
          </div>
          <div className="legend">
            <p>
              <i className="green" />
              تم التحصيل<b>184,250 ر.س</b>
            </p>
            <p>
              <i className="amber" />
              قادم<b>13,250 ر.س</b>
            </p>
            <p>
              <i className="red" />
              متأخر<b>23,500 ر.س</b>
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
function Work() {
  return (
    <div className="board">
      {["متأخرة", "اليوم", "قادمة"].map((col, i) => (
        <section key={col}>
          <header>
            <b>{col}</b>
            <span>{[2, 4, 7][i]}</span>
          </header>
          {tasks.slice(i === 2 ? 1 : 0, i === 0 ? 2 : 4).map((t) => (
            <article key={t[1]}>
              <em className={t[4]}>{t[3]}</em>
              <h3>{t[1]}</h3>
              <p>{t[2]}</p>
              <footer>
                ◷ {t[0]}
                <i>{i === 1 ? "ن" : "ل"}</i>
              </footer>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
function Customers({
  list,
  open,
}: {
  list: typeof people;
  open: (p: (typeof people)[number]) => void;
}) {
  const [program, setProgram] = useState("الكل"),
    [source, setSource] = useState("الكل"),
    [status, setStatus] = useState("الكل");
  const programs = [
    "الكل",
    ...Array.from(new Set(people.map((p) => p.program))),
  ];
  const sources = ["الكل", ...Array.from(new Set(people.map((p) => p.source)))];
  const filtered = list.filter(
    (p) =>
      (program === "الكل" || p.program === program) &&
      (source === "الكل" || p.source === source) &&
      (status === "الكل" ||
        (status === "مكتمل" ? p.state === "مكتمل" : p.state !== "مكتمل")),
  );
  const active = program !== "الكل" || source !== "الكل" || status !== "الكل";
  return (
    <>
      <div className="customer-summary">
        <div>
          <span>إجمالي العملاء</span>
          <b>{people.length}</b>
        </div>
        <div>
          <span>النتائج المعروضة</span>
          <b>{filtered.length}</b>
        </div>
        <div>
          <span>برامج نشطة</span>
          <b>{new Set(people.map((p) => p.program)).size}</b>
        </div>
        <div>
          <span>يحتاجون إجراء</span>
          <b>{people.filter((p) => p.state !== "مكتمل").length}</b>
        </div>
      </div>
      <div className="card full customer-directory">
        <div className="directory-head">
          <div>
            <h2>دليل العملاء</h2>
            <p>ابحث من الشريط العلوي أو خصّص القائمة باستخدام التصفيات.</p>
          </div>
          {active && (
            <button
              onClick={() => {
                setProgram("الكل");
                setSource("الكل");
                setStatus("الكل");
              }}
            >
              × مسح التصفيات
            </button>
          )}
        </div>
        <div className="directory-filters">
          <label>
            <span>البرنامج</span>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
            >
              {programs.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span>مصدر الشراء</span>
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              {sources.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span>حالة الملف</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>الكل</option>
              <option>نشط</option>
              <option>مكتمل</option>
            </select>
          </label>
          <div className="result-count">
            <b>{filtered.length}</b>
            <span>عميل مطابق</span>
          </div>
        </div>
        {filtered.length ? (
          <CustomerTable list={filtered} open={open} />
        ) : (
          <div className="empty-results">
            <i>⌕</i>
            <b>لا توجد نتائج مطابقة</b>
            <p>جرّب تغيير البرنامج أو مصدر الشراء.</p>
          </div>
        )}
      </div>
    </>
  );
}
function Academy({ open }: { open: (p: (typeof people)[number]) => void }) {
  return (
    <div className="kanban">
      {[
        "جديد",
        "تم التواصل",
        "بانتظار التسجيل",
        "بانتظار الإسناد",
        "مكتمل",
      ].map((col, i) => (
        <section key={col}>
          <header>
            <b>{col}</b>
            <span>{i === 4 ? 84 : [3, 2, 2, 1][i]}</span>
          </header>
          {people
            .filter((_, n) => (i === 4 ? n === 3 : n === i))
            .map((p) => (
              <article key={p.id} onClick={() => open(p)}>
                <b>{p.name}</b>
                <small>{p.id}</small>
                <p>{p.program}</p>
                <em>{p.due}</em>
                <footer>
                  <span>{p.track}</span>
                  <i>{p.owner[0]}</i>
                </footer>
              </article>
            ))}
        </section>
      ))}
    </div>
  );
}
function Finance({ open }: { open: (p: (typeof people)[number]) => void }) {
  return (
    <>
      <div className="kpis">
        <Kpi
          title="إجمالي المستحق"
          value="221,000"
          tag="ر.س"
          note="الشهر الحالي"
          tone="blue"
        />
        <Kpi
          title="تم التحصيل"
          value="184,250"
          tag="83%"
          note="من إجمالي المستحق"
          tone="green"
        />
        <Kpi
          title="قادم خلال 7 أيام"
          value="13,250"
          tag="6 أقساط"
          note="تذكير تلقائي مجدول"
          tone="amber"
        />
        <Kpi
          title="متأخر"
          value="23,500"
          tag="8 أقساط"
          note="3 تحتاج تصعيد"
          tone="red"
        />
      </div>
      <Card title="متابعة الأقساط" action="تصدير التقرير">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>العميل</th>
                <th>الطلب</th>
                <th>المبلغ</th>
                <th>الاستحقاق</th>
                <th>الحالة</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {people.map((p, i) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.name}</b>
                    <small>{p.phone}</small>
                  </td>
                  <td>{p.id}</td>
                  <td>
                    <b>{["2,250", "2,000", "1,500", "—"][i]} ر.س</b>
                  </td>
                  <td>{["اليوم", "متأخر 3 أيام", "27 يوليو", "مسدد"][i]}</td>
                  <td>
                    <span
                      className={`pill ${["amber", "red", "blue", "green"][i]}`}
                    >
                      {["مستحق اليوم", "متأخر", "قادم", "مسدد"][i]}
                    </span>
                  </td>
                  <td>
                    <button className="link" onClick={() => open(p)}>
                      فتح الملف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
function Reports() {
  return (
    <div className="reports">
      <Card title="التسجيلات حسب البرنامج" action="آخر 30 يوم">
        <div className="bars">
          {[
            ["تحليل السلوك التطبيقي", 74],
            ["إدارة السلوك التنظيمي", 52],
            ["التعليم المستمر", 31],
            ["الاقتصاد السلوكي", 18],
          ].map(([n, v]) => (
            <div key={n}>
              <span>{n}</span>
              <i>
                <u style={{ width: `${v}%` }} />
              </i>
              <b>{v}</b>
            </div>
          ))}
        </div>
      </Card>
      <Card title="كفاءة رحلة التسجيل" action="هذا الشهر">
        <div className="metric">
          <b>1.8</b>
          <span>يوم متوسط التهيئة</span>
          <em>↓ 14% تحسن</em>
        </div>
        <div className="mini">
          <p>
            <b>4.2 س</b>أول تواصل
          </p>
          <p>
            <b>91%</b>إكمال التسجيل
          </p>
          <p>
            <b>96%</b>دقة البيانات
          </p>
        </div>
      </Card>
    </div>
  );
}

const internationalPhonePattern = /^\+[1-9]\d{8,14}$/;
const normalizePhoneInput = (value: string) => {
  const cleaned = value.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
  return cleaned.startsWith("+") ? `+${cleaned.slice(1).replace(/\+/g, "")}` : `+${cleaned.replace(/\+/g, "")}`;
};

function Registration({ done }: { done: () => void }) {
  const [step, setStep] = useState(1),
    [saved, setSaved] = useState(false),
    [saving, setSaving] = useState(false),
    [saveError, setSaveError] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [form, setForm] = useState({
    name: "",
    phone: "+966",
    email: "",
    journey: "اشتراك",
    programId: "PRG-ABA",
    program: "تحليل السلوك التطبيقي",
    track: "ABAT",
    delivery: "مسجل",
    language: "العربية",
    cohort: "",
    startDate: "",
    assignmentDate: "",
    source: "عصارة",
    payment: "دفع كامل",
    method: "عصارة",
    reference: "",
    amount: "",
    contractTotal: "",
    discount: "0",
    seatReserved: "لا",
    seatFee: "",
    competencyAssessment: "لا",
  });
  const [proof, setProof] = useState({ name: "", data: "" });
  useEffect(() => {
    apiJson("/api/programs")
      .then((data) => {
        const list: Program[] = data.programs || [];
        setPrograms(list);
        const selected = list.find((p) => p.id === form.programId) || list[0];
        if (selected)
          setForm((f) => ({
            ...f,
            programId: selected.id,
            program: selected.name,
            track: selected.tracks?.[0]?.name || "",
          }));
      })
      .catch((e) => setSaveError(e.message));
  }, []);
  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));
  const selectProgram = (programId: string) => {
    const program = programs.find((p) => p.id === programId);
    if (program)
      setForm((f) => ({
        ...f,
        programId,
        program: program.name,
        track:
          program.name.includes("التعليم المستمر") && f.delivery === "مسجل"
            ? ""
            : program.tracks?.[0]?.name || "",
        seatReserved: "لا",
        seatFee: "",
        competencyAssessment: "لا",
      }));
  };
  const selectedProgram = programs.find((p) => p.id === form.programId);
  const isAbat = selectedProgram?.name.includes("تحليل السلوك التطبيقي") && form.track.toUpperCase() === "ABAT";
  const isObm = Boolean(selectedProgram?.name.includes("إدارة السلوك التنظيمي"));
  const isContinuingEducation = Boolean(selectedProgram?.name.includes("التعليم المستمر"));
  const isSupervision = form.journey === "إشراف";
  const directProgram = form.journey === "برنامج مباشر";
  const seatReservationEligible =
    isSupervision ||
    (form.source !== "عصارة" &&
      form.delivery === "مباشر" &&
      ["تحليل السلوك التطبيقي", "إدارة السلوك التنظيمي"].some((name) =>
        selectedProgram?.name.includes(name),
      ));
  const hasSeatReservation =
    seatReservationEligible && form.seatReserved === "نعم";
  const asara = form.source === "عصارة";
  const directPayment = form.source === "دفع مباشر";
  const scheduledJourney = isSupervision || (!asara && (directProgram || hasSeatReservation));
  const reservationDatesInvalid =
    scheduledJourney &&
    (!form.cohort ||
      !form.startDate ||
      !form.assignmentDate ||
      form.assignmentDate > form.startDate);
  const baseTotal = Number(form.contractTotal || 0);
  const discountPercent = Number(form.discount || 0);
  const discountedTotal = Math.round(
    baseTotal * (1 - discountPercent / 100) * 100,
  ) / 100;
  const seatFee = hasSeatReservation ? (isSupervision ? 50 : Number(form.seatFee || 0)) : 0;
  const finalTotal = discountedTotal;
  const payableAmount =
    form.payment === "أقساط" ? Number(form.amount || 0) : finalTotal;
  const phoneInvalid = !internationalPhonePattern.test(form.phone);
  const readProof = (file?: File) => {
    setSaveError("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSaveError("صورة التحويل يجب أن تكون JPG أو PNG أو WEBP");
      return;
    }
    if (file.size > 1024 * 1024) {
      setSaveError("حجم صورة التحويل يجب ألا يتجاوز 1 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setProof({ name: file.name, data: String(reader.result || "") });
    reader.onerror = () => setSaveError("تعذر قراءة صورة التحويل");
    reader.readAsDataURL(file);
  };
  const missingProof =
    form.journey !== "تجربة" &&
    directPayment &&
    form.method === "تحويل بنكي" &&
    !proof.data;
  const missingPaytabsReference =
    form.journey !== "تجربة" &&
    directPayment &&
    form.method === "Paytabs" &&
    !/^https?:\/\/\S+$/i.test(form.reference.trim());
  const next = () => {
    setSaveError("");
    if (step === 1 && (!form.name || !form.phone || !form.email || phoneInvalid)) {
      setSaveError(
        phoneInvalid
          ? "رقم الجوال يجب أن يبدأ بمفتاح الدولة، مثال: +9665xxxxxxxx"
          : "الاسم والجوال والبريد الإلكتروني حقول إلزامية",
      );
      return;
    }
    if (
      step === 2 &&
      (!form.programId ||
        !form.delivery ||
        (isObm && !isSupervision && !form.language) ||
        (Boolean(selectedProgram?.tracks?.length) && !isContinuingEducation && !form.track) ||
        (isContinuingEducation && form.delivery === "مباشر" && !form.track) ||
        (scheduledJourney && !form.cohort) ||
        (hasSeatReservation && !(seatFee > 0)) ||
        reservationDatesInvalid)
    ) {
      setSaveError(
        hasSeatReservation && !(seatFee > 0)
          ? "يلزم إدخال مبلغ حجز المقعد"
          : reservationDatesInvalid
          ? "يلزم إدخال تاريخ بدء البرنامج وتاريخ إسناد يسبقه أو يساويه"
          : form.delivery === "مباشر"
            ? `يلزم تحديد البرنامج والمسار${isObm ? " واللغة" : ""} واسم الدفعة`
            : `يلزم تحديد البرنامج والمسار ونمط البرنامج${isObm ? " واللغة" : ""}`,
      );
      return;
    }
    if (step === 3 && form.journey !== "تجربة") {
      if (!(baseTotal > 0) || !(discountedTotal > 0)) {
        setSaveError("يلزم إدخال المبلغ الأساسي قبل المتابعة");
        return;
      }
      if (
        form.payment === "أقساط" &&
        (!(payableAmount > 0) || payableAmount >= finalTotal)
      ) {
        setSaveError(
          "الدفعة الأولى يجب أن تكون أكبر من صفر وأقل من إجمالي البرنامج",
        );
        return;
      }
      if (missingProof) {
        setSaveError("يلزم إرفاق صورة التحويل البنكي قبل المتابعة");
        return;
      }
      if (missingPaytabsReference) {
        setSaveError("يلزم إضافة رابط مرجع السداد من Paytabs");
        return;
      }
    }
    setStep(step + 1);
  };
  const submit = async () => {
    setSaveError("");
    if (!form.name || !form.phone || !form.email || phoneInvalid) {
      setSaveError("يلزم استكمال الاسم والجوال والبريد قبل الحفظ");
      setStep(1);
      return;
    }
    if (
      !form.programId ||
      !form.delivery ||
      (isObm && !isSupervision && !form.language) ||
      (Boolean(selectedProgram?.tracks?.length) && !isContinuingEducation && !form.track) ||
      (isContinuingEducation && form.delivery === "مباشر" && !form.track) ||
      (scheduledJourney && !form.cohort) ||
      (hasSeatReservation && !(seatFee > 0)) ||
      reservationDatesInvalid
    ) {
      setSaveError(
        reservationDatesInvalid
          ? "يلزم إدخال تاريخ بدء البرنامج وتاريخ إسناد صحيحين"
          : "يلزم استكمال خيارات البرنامج والدفعة",
      );
      setStep(2);
      return;
    }
    if (
      form.journey !== "تجربة" &&
      (!(baseTotal > 0) ||
        !(finalTotal > 0) ||
        (form.payment === "أقساط" &&
          (!(payableAmount > 0) || payableAmount >= finalTotal)))
    ) {
      setSaveError("تحقق من المبلغ الأساسي والخصم والدفعة الأولى");
      setStep(3);
      return;
    }
    if (missingProof) {
      setSaveError("يلزم إرفاق صورة التحويل البنكي قبل تسجيل العميل");
      setStep(3);
      return;
    }
    if (missingPaytabsReference) {
      setSaveError("يلزم إضافة رابط مرجع السداد من Paytabs");
      setStep(3);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: payableAmount,
        contractTotal: finalTotal,
        baseTotal,
        discountPercent,
        competencyAssessment: Boolean(isAbat && form.competencyAssessment === "نعم"),
        seatReserved: hasSeatReservation,
        seatFee,
        proofAssetKey: proof.data,
        proofFileName: proof.name,
        mode: form.journey === "تجربة" ? "trial" : "payment",
        purchaseType: isSupervision ? "إشراف" : "برنامج",
      };
      const r = await fetch("/api/intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "تعذر الحفظ");
      setSaved(true);
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : "تعذر الحفظ في قاعدة البيانات",
      );
    } finally {
      setSaving(false);
    }
  };
  const steps = [
    "بيانات العميل",
    "تفاصيل البرنامج",
    "الدفع وطريقة السداد",
    "مراجعة البيانات",
  ];
  if (saved)
    return (
      <div className="register-success">
        <i>✓</i>
        <h2>تم تسجيل العميل</h2>
        <p>
          {form.journey === "تجربة"
            ? "تم تسجيل العميل وبدء فترة التجربة."
            : form.journey === "برنامج مباشر"
              ? "تم تسجيل العميل وإضافته إلى البرامج المباشرة."
              : form.journey === "إشراف"
                ? "تم تسجيل عميل الإشراف وجدولة انتقاله إلى التهيئة."
              : "تم تسجيل العميل بنجاح وإضافته إلى النظام."}
        </p>
        <div>
          <button className="secondary" onClick={() => setSaved(false)}>
            تسجيل عميل آخر
          </button>
          <button className="primary" onClick={done}>
            فتح قائمة العملاء
          </button>
        </div>
      </div>
    );
  return (
    <div className="register-layout">
      <aside className="stepper">
        {steps.map((s, i) => (
          <button
            key={s}
            className={
              step === i + 1 ? "current" : step > i + 1 ? "complete" : ""
            }
            onClick={() => setStep(i + 1)}
          >
            <i>{step > i + 1 ? "✓" : i + 1}</i>
            <span>
              <b>{s}</b>
              <small>
                {
                  [
                    "بيانات العميل",
                    "البرنامج والمسار",
                    "وسيلة الدفع وخطة السداد",
                    "تدقيق البيانات والإجراءات",
                  ][i]
                }
              </small>
            </span>
          </button>
        ))}
      </aside>
      <section className="form-card">
        {step === 1 && (
          <>
            <FormHead
              n="01"
              title="بيانات العميل"
              text="أدخل بيانات العميل الأساسية لبدء التسجيل والمتابعة."
            />
            <div className="field-grid">
              <Field label="اسم العميل الكامل *">
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="مثال: سارة محمد العتيبي"
                />
              </Field>
              <Field label="رقم الجوال *">
                <input
                  type="tel"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) =>
                    set("phone", normalizePhoneInput(e.target.value))
                  }
                  placeholder="+9665xxxxxxxx"
                />
                <small className="field-help">
                  أدخل مفتاح الدولة أولاً؛ الافتراضي للسعودية +966
                </small>
              </Field>
              <Field label="البريد الإلكتروني *">
                <input
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="name@example.com"
                />
              </Field>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <FormHead
              n="02"
              title="البرنامج"
              text="اختر البرنامج ونوع الاشتراك ونمط تقديمه."
            />
            <div className="field-grid">
              <Field label="البرنامج *">
                <select
                  required
                  value={form.programId}
                  onChange={(e) => selectProgram(e.target.value)}
                >
                  {programs.map((program) => (
                    <option value={program.id} key={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </Field>
              {Boolean(selectedProgram?.tracks?.length) && !isContinuingEducation && (
                <Field label="المسار *">
                  <select
                    required
                    value={form.track}
                    onChange={(e) => setForm((current) => ({
                      ...current,
                      track: e.target.value,
                      delivery: e.target.value.toUpperCase() === "ABAT" ? "مسجل" : current.delivery,
                      competencyAssessment: e.target.value.toUpperCase() === "ABAT" ? current.competencyAssessment : "لا",
                    }))}
                  >
                    {selectedProgram?.tracks?.map((track) => (
                      <option key={track.name}>{track.name}</option>
                    ))}
                  </select>
                </Field>
              )}
              {isAbat && (
                <Field label="مع تقييم كفاءة؟ *">
                  <select required value={form.competencyAssessment} onChange={(e) => set("competencyAssessment", e.target.value)}>
                    <option>لا</option>
                    <option>نعم</option>
                  </select>
                </Field>
              )}
              <Field label="نوع الاشتراك *">
                <select
                  required
                  value={form.journey}
                  onChange={(e) => set("journey", e.target.value)}
                >
                  <option>اشتراك</option>
                  <option>برنامج مباشر</option>
                  <option>إشراف</option>
                  <option>تجربة</option>
                </select>
              </Field>
              {!isAbat && !isSupervision && <Field label="نمط البرنامج *">
                <select
                  required
                  value={form.delivery}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      delivery: e.target.value,
                      track: isContinuingEducation
                        ? e.target.value === "مباشر"
                          ? selectedProgram?.tracks?.[0]?.name || ""
                          : ""
                        : current.track,
                      seatReserved:
                        e.target.value === "مباشر"
                          ? current.seatReserved
                          : "لا",
                      seatFee:
                        e.target.value === "مباشر" ? current.seatFee : "",
                    }))
                  }
                >
                  <option>مسجل</option>
                  <option>مباشر</option>
                </select>
              </Field>}
              {isContinuingEducation && form.delivery === "مباشر" && (
                <Field label="اسم البرنامج المباشر *">
                  <select required value={form.track} onChange={(e) => set("track", e.target.value)}>
                    {selectedProgram?.tracks?.map((track) => <option key={track.name}>{track.name}</option>)}
                  </select>
                </Field>
              )}
              {isContinuingEducation && form.delivery === "مسجل" && (
                <Field label="اسم البرنامج المسجل — اختياري">
                  <input value={form.track} onChange={(e) => set("track", e.target.value)} placeholder="اكتب اسم البرنامج عند الحاجة" />
                </Field>
              )}
              {seatReservationEligible && (
                <Field label="هل تم حجز المقعد؟ *">
                  <select
                    required
                    value={form.seatReserved}
                    onChange={(e) => {
                      set("seatReserved", e.target.value);
                      if (e.target.value === "لا") set("seatFee", "");
                    }}
                  >
                    <option>لا</option>
                    <option>نعم</option>
                  </select>
                </Field>
              )}
              {hasSeatReservation && (
                <Field label="مبلغ حجز المقعد *">
                  <input
                    required
                    inputMode="decimal"
                    dir="ltr"
                    value={isSupervision ? "50" : form.seatFee}
                    readOnly={isSupervision}
                    onChange={(e) => set("seatFee", e.target.value)}
                    placeholder="0.00 ر.س"
                  />
                  <small className="field-help">
                    {isSupervision
                      ? "رسوم مقعد الإشراف ثابتة: 50 ر.س، ولا تدخل ضمن قيمة العقد أو الخصم."
                      : "مبلغ ثابت يُضاف بعد الخصم ولا تُطبق عليه نسبة الخصم."}
                  </small>
                </Field>
              )}
              {isObm && !isSupervision && <Field label="اللغة *">
                <select
                  required
                  value={form.language}
                  onChange={(e) => set("language", e.target.value)}
                >
                  <option>العربية</option>
                  <option>الإنجليزية</option>
                </select>
              </Field>}
              {scheduledJourney && (
                <Field label="اسم الدفعة *">
                  <input
                    required
                    value={form.cohort}
                    onChange={(e) => set("cohort", e.target.value)}
                    placeholder="مثال: دفعة سبتمبر 2026"
                  />
                </Field>
              )}
              {scheduledJourney && (
                <Field label="تاريخ بدء البرنامج *">
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                  />
                </Field>
              )}
              {scheduledJourney && (
                <Field label="تاريخ الإسناد *">
                  <input
                    required
                    type="date"
                    max={form.startDate || undefined}
                    value={form.assignmentDate}
                    onChange={(e) => set("assignmentDate", e.target.value)}
                  />
                </Field>
              )}
            </div>
            {scheduledJourney ? (
              <div className="hint required-hint">
                ستبقى البطاقة في البرامج المباشرة، ثم تنتقل تلقائياً إلى تهيئة
                العميل في تاريخ الإسناد. يجب ألا يتجاوز تاريخ الإسناد تاريخ بدء
                البرنامج.
              </div>
            ) : null}
          </>
        )}
        {step === 3 && (
          <>
            <FormHead
              n="03"
              title="الدفع"
              text={
                form.journey === "تجربة"
                  ? "راجع بيانات التجربة قبل المتابعة."
                  : "أدخل المبلغ وحدد طريقة السداد."
              }
            />
            <div className="source-grid">
              {["عصارة", "سلة", "دفع مباشر"].map((x) => (
                <button
                  key={x}
                  className={form.source === x ? "selected" : ""}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      source: x,
                      method:
                        x === "دفع مباشر" ? "تحويل بنكي" : x,
                      reference: "",
                    }))
                  }
                >
                  <i>{x === "عصارة" ? "ع" : x === "سلة" ? "س" : "◈"}</i>
                  <b>{x}</b>
                  <small>
                    {x === "عصارة"
                      ? "تفعيل تلقائي"
                      : x === "سلة"
                        ? "مكتمل مالياً"
                        : "اختيار وسيلة الدفع"}
                  </small>
                </button>
              ))}
            </div>
            {form.journey !== "تجربة" && (
              <div className="field-grid">
                {directPayment && (
                  <Field label="وسيلة الدفع المباشر">
                    <select
                      value={form.method}
                      onChange={(e) => {
                        set("method", e.target.value);
                        set("reference", "");
                        setProof({ name: "", data: "" });
                      }}
                    >
                      <option>تحويل بنكي</option>
                      <option>تمارا</option>
                      <option>Paytabs</option>
                    </select>
                  </Field>
                )}
                <Field label="المبلغ الأساسي *">
                  <input
                    inputMode="decimal"
                    dir="ltr"
                    value={form.contractTotal}
                    onChange={(e) => set("contractTotal", e.target.value)}
                    placeholder="0.00 ر.س"
                  />
                </Field>
                <Field label="قيمة الخصم">
                  <select
                    value={form.discount}
                    onChange={(e) => set("discount", e.target.value)}
                  >
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((value) => (
                      <option value={String(value)} key={value}>
                        {value}%
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="خطة السداد">
                  <select
                    value={form.payment}
                    onChange={(e) => set("payment", e.target.value)}
                  >
                    <option>دفع كامل</option>
                    <option>أقساط</option>
                    <option>تمارا</option>
                  </select>
                </Field>
                {form.payment === "أقساط" && (
                  <Field label="الدفعة الأولى *">
                    <input
                      inputMode="decimal"
                      dir="ltr"
                      value={form.amount}
                      onChange={(e) => set("amount", e.target.value)}
                      placeholder="0.00 ر.س"
                    />
                  </Field>
                )}
                {directPayment && form.method === "Paytabs" && (
                  <Field label="رابط مرجع السداد *">
                    <input
                      type="url"
                      dir="ltr"
                      value={form.reference}
                      onChange={(e) => set("reference", e.target.value)}
                      placeholder="https://..."
                    />
                    <small className="field-help">
                      رابط عملية السداد من لوحة Paytabs
                    </small>
                  </Field>
                )}
                <div className="discount-summary">
                  <p>
                    <span>المبلغ الأساسي</span>
                    <b>{baseTotal.toLocaleString("en-US")} ر.س</b>
                  </p>
                  <p>
                    <span>الخصم</span>
                    <b>{discountPercent}%</b>
                  </p>
                  <p className="net">
                    <span>سعر البرنامج بعد الخصم</span>
                    <b>{discountedTotal.toLocaleString("en-US")} ر.س</b>
                  </p>
                  {hasSeatReservation && (
                    <p>
                      <span>مبلغ حجز المقعد</span>
                      <b>{seatFee.toLocaleString("en-US")} ر.س</b>
                    </p>
                  )}
                  <p className="net">
                    <span>إجمالي البرنامج</span>
                    <b>{finalTotal.toLocaleString("en-US")} ر.س</b>
                  </p>
                  {form.payment === "دفع كامل" && (
                    <small>سيُسجل هذا المبلغ كاملاً كدفعة المبيعات.</small>
                  )}
                </div>
                {directPayment && form.method === "تحويل بنكي" && (
                  <label className={`bank-proof ${proof.data ? "ready" : ""}`}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => readProof(e.target.files?.[0])}
                    />
                    <i>{proof.data ? "✓" : "＋"}</i>
                    <span>
                      <b>
                        {proof.data
                          ? "تم إرفاق صورة التحويل"
                          : "رفع صورة التحويل البنكي *"}
                      </b>
                      <small>
                        {proof.name || "JPG أو PNG أو WEBP · بحد أقصى 1 MB"}
                      </small>
                    </span>
                    {proof.data && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setProof({ name: "", data: "" });
                        }}
                      >
                        حذف
                      </button>
                    )}
                  </label>
                )}
              </div>
            )}
            <div
              className={`finance-route-status payment-route-summary ${
                form.journey === "تجربة" ||
                (!isSupervision &&
                  form.payment !== "أقساط" &&
                  (!directPayment || form.method === "تمارا"))
                  ? "complete"
                  : "review"
              }`}
            >
              <i>
                {form.journey === "تجربة" ||
                (!isSupervision &&
                  form.payment !== "أقساط" &&
                  (!directPayment || form.method === "تمارا"))
                  ? "✓"
                  : "!"}
              </i>
              <b>
                {form.journey === "تجربة"
                  ? "تبدأ التجربة مباشرة دون إجراء مالي."
                  : isSupervision
                    ? "تُسجّل العملية مباشرة وتنتقل إلى المالية لاعتمادها ضمن التحصيل."
                    : form.payment === "أقساط"
                      ? "تُسجّل العملية مباشرة وتنتقل إلى المالية لتنظيم الأقساط."
                      : directPayment && form.method === "تحويل بنكي"
                        ? "تُسجّل العملية مباشرة وتنتقل إلى المالية لمراجعة التحويل البنكي."
                        : directPayment && form.method === "Paytabs"
                          ? "تُسجّل العملية مباشرة وتنتقل إلى المالية لمراجعة مرجع السداد."
                          : `تُسجّل العملية مباشرة وتُعد مكتملة مالياً عبر ${form.source}.`}
              </b>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <FormHead
              n="04"
              title="مراجعة البيانات"
              text="مراجعة نوع الاشتراك والإجراءات التي سيُنشئها النظام قبل الحفظ."
            />
            <div className="review-grid">
              <section>
                <h3>ملخص الطلب</h3>
                <Review label="العميل" value={form.name || "لم يُدخل بعد"} />
                <Review label="نوع الاشتراك" value={form.journey} />
                <Review
                  label="البرنامج"
                  value={form.track ? `${form.program} · ${form.track}` : form.program}
                />
                <Review
                  label="نمط الدراسة"
                  value={isSupervision ? "إشراف" : isObm ? `${isAbat ? "ABAT" : form.delivery} · ${form.language}` : (isAbat ? "ABAT" : form.delivery)}
                />
                {isAbat && <Review label="تقييم الكفاءة" value={form.competencyAssessment} />}
                {form.startDate && (
                  <Review label="تاريخ بدء البرنامج" value={form.startDate} />
                )}{" "}
                {scheduledJourney && (
                  <Review label="تاريخ الإسناد" value={form.assignmentDate} />
                )}
                <Review label="مصدر الشراء" value={form.source} />
                {form.journey !== "تجربة" && (
                  <>
                    <Review label="وسيلة الدفع" value={form.method} />
                    <Review
                      label="السداد"
                      value={`${form.payment} · ${payableAmount.toLocaleString("en-US")} ر.س`}
                    />
                    <Review
                      label="المبلغ الأساسي"
                      value={`${baseTotal.toLocaleString("en-US")} ر.س`}
                    />
                    <Review label="الخصم" value={`${discountPercent}%`} />
                    <Review
                      label="سعر البرنامج بعد الخصم"
                      value={`${discountedTotal.toLocaleString("en-US")} ر.س`}
                    />
                    {hasSeatReservation && (
                      <Review
                        label="مبلغ حجز المقعد"
                        value={`${seatFee.toLocaleString("en-US")} ر.س`}
                      />
                    )}
                    <Review
                      label="إجمالي البرنامج"
                      value={`${finalTotal.toLocaleString("en-US")} ر.س`}
                    />
                  </>
                )}
              </section>
              <section className="workflow-preview">
                <h3>الإجراءات التي ستُنشأ</h3>
                <p className="done">
                  <i>✓</i>
                  <span>
                    <b>
                      {form.journey === "تجربة"
                        ? "إنشاء عميل تجربة"
                        : "إنشاء العميل والطلب فوراً"}
                    </b>
                    <small>المبيعات · فوري</small>
                  </span>
                </p>
                {form.journey === "تجربة" ? (
                  <p className="next">
                    <i>2</i>
                    <span>
                      <b>بدء التجربة وإنشاء المتابعة</b>
                      <small>المبيعات · حسب مدة البرنامج</small>
                    </span>
                  </p>
                ) : scheduledJourney ? (
                  <p className="next">
                    <i>2</i>
                    <span>
                      <b>النقل التلقائي إلى تهيئة العميل</b>
                      <small>
                        {form.assignmentDate || "حسب تاريخ الإسناد المحدد"}
                      </small>
                    </span>
                  </p>
                ) : (
                  <>
                    <p className={asara ? "done" : "next"}>
                      <i>{asara ? "✓" : "2"}</i>
                      <span>
                        <b>
                          {asara
                            ? "تفعيل الدورة تلقائياً عبر عصارة"
                            : "بدء رحلة التسجيل الأكاديمي"}
                        </b>
                        <small>
                          {asara ? "لا يحتاج تدخلاً يدوياً" : "الأكاديمية"}
                        </small>
                      </span>
                    </p>
                    {!asara && (
                      <p className="next">
                        <i>3</i>
                        <span>
                          <b>التواصل ثم إنشاء الحساب والإسناد</b>
                          <small>الأكاديمية</small>
                        </span>
                      </p>
                    )}
                  </>
                )}{" "}
                {form.journey !== "تجربة" && (
                  <p className="finance-step">
                    <i>ر.س</i>
                    <span>
                      <b>مطابقة وتنظيم الدفعة</b>
                      <small>المالية · لا تعطل رحلة العميل</small>
                    </span>
                  </p>
                )}
              </section>
            </div>
          </>
        )}
        {saveError && <div className="save-error">{saveError}</div>}
        <footer className="wizard-actions">
          <button
            className="secondary"
            onClick={() => (step > 1 ? setStep(step - 1) : done())}
          >
            {step > 1 ? "السابق" : "إلغاء"}
          </button>
          <span>الخطوة {step} من 4</span>
          {step < 4 ? (
            <button className="primary" onClick={next}>
              التالي
            </button>
          ) : (
            <button className="primary" disabled={saving} onClick={submit}>
              {saving ? "جارٍ الحفظ..." : "تسجيل العميل"}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
type LiveTask = {
  id: string;
  title: string;
  department: string;
  priority: string;
  status: string;
  due_at?: string;
  completed_at?: string;
  assignee_email?: string;
  customer_name?: string;
  program_name?: string;
};
type LiveTrial = {
  id: string;
  customer_id: string;
  customer_name: string;
  phone: string;
  email: string;
  program_name: string;
  program_track?: string;
  program_delivery?: string;
  program_language?: string;
  competency_assessment?: number;
  program_code: string;
  starts_at: string;
  ends_at: string;
};
type LiveEnrollment = {
  id: string;
  status: string;
  customer_id: string;
  customer_name: string;
  phone: string;
  email: string;
  program_name: string;
  program_track?: string;
  program_delivery?: string;
  competency_assessment?: number;
  order_id: string;
  order_type?: string;
  order_number?: string;
  owner_email?: string;
  purchase_source?: string;
  updated_at?: string;
  payment_id?: string;
  payment_reference?: string;
  needs_attention?: number;
};
type LiveReservation = {
  id: string;
  status: string;
  customer_name: string;
  phone?: string;
  email?: string;
  program_name: string;
  program_id: string;
  fee_amount: number;
  reservation_kind?: string;
  cohort_label?: string;
  start_date?: string;
  assignment_date?: string;
};
type FinancePayment = {
  id: string;
  amount: number;
  paid_at: string;
  method: string;
  reference?: string;
  proof_asset_key?: string;
  status: string;
  payment_intent_id?: string;
  reconciliation_status?: string;
  flow_type?: string;
  classification_status?: string;
  created_at?: string;
};
type FinanceInstallment = {
  id: string;
  sequence: number;
  amount: number;
  due_date: string;
  status: string;
  display_status: string;
  paid_at?: string;
  paid_payment_id?: string;
  reference?: string;
  reminder_count?: number;
  first_reminder_at?: string;
  second_reminder_at?: string;
  last_reminded_by_email?: string;
};
type PaymentBehavior = { label: string; tone: string; summary: string };
type FinanceOrder = {
  order_id: string;
  program_id: string;
  order_type: string;
  purchase_source: string;
  payment_plan: string;
  order_status: string;
  finance_review_status?: string;
  customer_id: string;
  customer_name: string;
  phone: string;
  email: string;
  program_name: string;
  total: number;
  paid: number;
  remaining: number;
  overpayment: number;
  finance_note: string;
  payment_behavior: PaymentBehavior;
  seat_fee: number;
  discount_percent: number;
  payments: FinancePayment[];
  installments: FinanceInstallment[];
  undo_available?: { id: string; action: string; label: string; created_at: string } | null;
};
type ProgramTrack = { id?: string; name: string; active?: number };
type Program = {
  id: string;
  name: string;
  code?: string;
  category?: string;
  programKind?: string;
  trialDays?: number;
  seatFee?: number;
  active?: number;
  tracks?: ProgramTrack[];
};

async function apiJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      data.error || "تعذر تحميل البيانات. تأكد من تسجيل الدخول والصلاحية.",
    );
  const method = String(init?.method || "GET").toUpperCase();
  if (method !== "GET" && typeof window !== "undefined") {
    let action = "";
    try {
      action = typeof init?.body === "string" ? String(JSON.parse(init.body).action || "") : "";
    } catch {}
    const messages: Record<string, string> = {
      schedule: "تم تحديث جدول الأقساط",
      update_first_payment: "تم تحديث الدفعة الأولى",
      separate_legacy_seat_fee: "تم فصل رسوم حجز المقعد",
      set_legacy_seat_fee: "تم تحديث رسوم حجز المقعد",
      pay_installment: "تم تسجيل سداد القسط",
      installment_status: "تم تحديث حالة السداد",
      remind_installment: "تم تسجيل تذكير السداد",
      update_installment_due_date: "تم تحديث تاريخ الاستحقاق",
      update_payment_date: "تم تحديث تاريخ السداد الفعلي",
      update_payment_record_date: "تم تحديث تاريخ السداد",
      approve_finance_review: "تم اعتماد المراجعة المالية",
      review_legacy_installments: "تم اعتماد المراجعة المالية",
      note: "تم حفظ الملاحظة المالية",
      undo_last_finance_action: "تم التراجع عن آخر إجراء مالي",
    };
    const message = messages[action] || (method === "DELETE" ? "تم الحذف بنجاح" : method === "PATCH" ? "تم تحديث البيانات بنجاح" : "تم تنفيذ الإجراء بنجاح");
    window.dispatchEvent(new CustomEvent("sulukera:success", { detail: { message } }));
  }
  return data;
}
function LiveState({
  loading,
  error,
  empty,
}: {
  loading: boolean;
  error: string;
  empty: boolean;
}) {
  if (loading)
    return <div className="ops-empty">جارٍ تحميل البيانات الحية…</div>;
  if (error) return <div className="ops-error">{error}</div>;
  if (empty)
    return (
      <div className="ops-empty">
        لا توجد بيانات بعد. ستظهر السجلات هنا فور إنشائها.
      </div>
    );
  return null;
}

function CustomerSmartFilters({
  programs,
  statuses,
  program,
  status,
  total,
  visible,
  onProgram,
  onStatus,
  title = "تصنيف العملاء",
  description = "عرض القائمة حسب البرنامج أو حالة العميل",
  secondaryLabel = "حالة العميل",
  secondaryAllLabel = "كل الحالات",
}: {
  programs: string[];
  statuses: string[];
  program: string;
  status: string;
  total: number;
  visible: number;
  onProgram: (value: string) => void;
  onStatus: (value: string) => void;
  title?: string;
  description?: string;
  secondaryLabel?: string;
  secondaryAllLabel?: string;
}) {
  const active = program !== "الكل" || status !== "الكل";
  return (
    <section className="smart-customer-filters" aria-label="تصنيف العملاء">
      <header>
        <div>
          <span>{title}</span>
          <b>{description}</b>
        </div>
        <em>
          <strong>{visible}</strong> من {total} عميل
        </em>
      </header>
      <div>
        <label>
          <span>البرنامج</span>
          <select value={program} onChange={(e) => onProgram(e.target.value)}>
            <option value="الكل">كل البرامج</option>
            {programs.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{secondaryLabel}</span>
          <select value={status} onChange={(e) => onStatus(e.target.value)}>
            <option value="الكل">{secondaryAllLabel}</option>
            {statuses.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        {active && (
          <button type="button" onClick={() => { onProgram("الكل"); onStatus("الكل"); }}>
            <X size={14} />
            مسح التصنيف
          </button>
        )}
      </div>
      {active && (
        <p>
          النتائج المعروضة:
          {program !== "الكل" && <mark>{program}</mark>}
          {status !== "الكل" && <mark>{status}</mark>}
        </p>
      )}
    </section>
  );
}

type ReportRow = {
  status?: string;
  department?: string;
  count: number;
  amount?: number;
  total_fees?: number;
};
type OperationsReport = {
  generatedAt: string;
  prospects: ReportRow[];
  trials: ReportRow[];
  reservations: ReportRow[];
  enrollments: ReportRow[];
  tasks: ReportRow[];
  payments: ReportRow[];
  programs: { program_name: string; enrollment_count: number }[];
  customers: { count: number };
  orders: { count: number; total: number; paid: number };
};
const totalCount = (rows: ReportRow[]) =>
  (rows || []).reduce((sum, row) => sum + Number(row.count || 0), 0);
const stateCount = (rows: ReportRow[], state: string) =>
  Number((rows || []).find((row) => row.status === state)?.count || 0);
type HomeData={
 user:{email:string;name:string;roles:string[]};canSeeFinance:boolean;canEditFinanceTarget:boolean;generatedAt:string;
 operations:{pendingCustomers:number;customersToday:number;totalCustomers:number;activeReservations:number};
 tasks:LiveTask[];journey:{status:string;count:number}[];
 trainees:{key:string;label:string;count:number;details:{label:string;count:number}[]}[];
 activity:{id:string;action:string;entity_type:string;entity_id:string;actor_email:string;actor_name?:string;subject_name?:string;created_at:string}[];
 finance?:{month:string;orders:number;contractValue:number;sales:number;collections:number;cash:number;remaining:number;target:number;reviewCount:number;daily:{day:string;sales:number;collections:number}[]}|null;
};
const activityVerbs:Record<string,(actor:string)=>string>={
 RECORD_PAYMENT_AND_ADMIT:actor=>`أضاف ${actor} عميلًا جديدًا`,
 ADD_CUSTOMER_NOTE:actor=>`أضاف ${actor} تحديثًا إلى ملف العميل`,
 UPDATE_FIRST_PAYMENT:actor=>`عدّل ${actor} قيمة الدفعة الأولى`,
 RECORD_INSTALLMENT_REMINDER:actor=>`سجّل ${actor} تذكيرًا بسداد قسط`,
 PAY_INSTALLMENT:actor=>`سجّل ${actor} تحصيل قسط`,
 UPDATE_PAYMENT_REFERENCE:actor=>`حدّث ${actor} مرجع السداد`,
 UPDATE_CUSTOMER_DATA:actor=>`عدّل ${actor} بيانات العميل`,
 ENROLLMENT_TRANSITION:actor=>`نقل ${actor} العميل إلى مرحلة جديدة`,
 SCHEDULE_RESERVATION_START:actor=>`حدّد ${actor} موعد بدء وإسناد العميل`,
 APPROVE_LEGACY_INSTALLMENTS:actor=>`اعتمد ${actor} المراجعة المالية`,
 APPROVE_RESERVATION_TRANSFER:actor=>`اعتمد ${actor} نقل حجز المقعد`,
 REQUEST_RESERVATION_TRANSFER:actor=>`طلب ${actor} نقل حجز المقعد`,
 GRANT_TRIAL:actor=>`منح ${actor} العميل فترة تجربة`,
 TRIAL_SUBSCRIBED:actor=>`حوّل ${actor} عميل التجربة إلى اشتراك`,
 TRIAL_NOT_INTERESTED:actor=>`صنّف ${actor} عميل التجربة كغير مهتم`,
 UPDATE_STAFF_ACCESS:actor=>`حدّث ${actor} بيانات مستخدم وصلاحياته`,
 DELETE_STAFF_ACCOUNT:actor=>`حذف ${actor} حساب مستخدم`,
 DELETE_CUSTOMER:actor=>`حذف ${actor} ملف عميل`,
 UPDATE_TASK:actor=>`حدّث ${actor} إجراءً تشغيليًا`,
 RECONCILE_PAYMENT:actor=>`راجع ${actor} عملية سداد`,
 RECORD_PAYMENT:actor=>`سجّل ${actor} دفعة جديدة`,
 AUTO_ASSIGN_RESERVATION:()=>"نقل النظام العميل تلقائيًا إلى التهيئة",
};
const activitySentence=(item:HomeData["activity"][number])=>{
 const actor=item.actor_name||"أحد الموظفين";
 return (activityVerbs[item.action]||((name:string)=>`نفّذ ${name} تحديثًا في النظام`))(actor);
};
function HomeDashboard({onOpenTasks}:{onOpenTasks:()=>void}){
 const now=new Date(),[month,setMonth]=useState(now.toISOString().slice(0,7)),[mode,setMode]=useState<"daily"|"cumulative">("daily"),[data,setData]=useState<HomeData|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[editingTarget,setEditingTarget]=useState(false),[target,setTarget]=useState(""),[openTraineeGroup,setOpenTraineeGroup]=useState("aba");
 const load=async()=>{setLoading(true);setError("");try{const result=await apiJson(`/api/dashboard/home?month=${month}`);setData(result);setTarget(String(result.finance?.target||""))}catch(e){setError((e as Error).message)}finally{setLoading(false)}};
 useEffect(()=>{void load()},[month]);
 if(loading||error||!data)return <LiveState loading={loading} error={error} empty={!data}/>;
 const f=data.finance,days=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate(),raw=Array.from({length:days},(_,index)=>{const key=`${month}-${String(index+1).padStart(2,"0")}`;return f?.daily.find(row=>row.day===key)||{day:key,sales:0,collections:0}});
 let runningSales=0,runningCollections=0;const chart=raw.map(row=>mode==="daily"?row:{...row,sales:runningSales+=row.sales,collections:runningCollections+=row.collections}),rawMax=Math.max(1,...chart.flatMap(row=>[row.sales,row.collections])),magnitude=10**Math.floor(Math.log10(rawMax)),chartMax=Math.ceil(rawMax/magnitude*2)/2*magnitude,money=(value:number)=>Number(value||0).toLocaleString("en-US",{maximumFractionDigits:2}),compactMoney=(value:number)=>value>=1000?`${Number((value/1000).toFixed(value>=10000?0:1))}K`:money(value),targetRatio=f?.target?Math.min(100,Math.round(f.sales/f.target*100)):0,activeDays=raw.filter(row=>row.sales>0||row.collections>0).length,peak=raw.reduce((best,row)=>row.sales+row.collections>best.sales+best.collections?row:best,raw[0]),chartTicks=[chartMax,chartMax*.75,chartMax*.5,chartMax*.25,0];
 const journeyOrder=["اكتمل التسجيل","تم التواصل","تم الإسناد","مكتمل"],journeyMap=new Map(data.journey.map(row=>[row.status,Number(row.count||0)])),journeyStages=journeyOrder.map(status=>({status,count:journeyMap.get(status)||0})),journeyTotal=journeyStages.reduce((sum,row)=>sum+row.count,0),journeyMax=Math.max(1,...journeyStages.map(row=>row.count));
 const saveTarget=async()=>{try{await apiJson("/api/dashboard/home",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({month,target:Number(target||0)})});setEditingTarget(false);await load()}catch(e){setError((e as Error).message)}};
 return <div className="home-dashboard">
  <section className="home-command"><div><span>مركز حركة النظام</span><h2>أهلاً، {data.user.name}</h2><p>ملخص حي للعمليات والمبيعات والتحصيل حتى {new Date(data.generatedAt).toLocaleTimeString("ar-SA-u-nu-latn",{hour:"2-digit",minute:"2-digit"})}</p></div><label><CalendarDays size={17}/><input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label></section>
  <section className="metric-zone"><header><div><Activity size={19}/><span><b>مؤشرات العملاء</b><small>ملخص حركة العملاء</small></span></div></header><div className="home-metrics">
   <HomeMetric icon={ListChecks} label="عميل معلّق" value={data.operations.pendingCustomers} note="بحاجة إلى متابعة" tone="blue" onClick={onOpenTasks}/>
   <HomeMetric icon={UsersRound} label="عميل جديد" value={data.operations.customersToday} note="تمت إضافته اليوم" tone="violet"/>
   <HomeMetric icon={ClipboardCheck} label="إجمالي العملاء" value={data.operations.totalCustomers} note="ملفات العملاء في النظام" tone="amber"/>
   <HomeMetric icon={Armchair} label="حجز مقعد" value={data.operations.activeReservations} note="حجوزات نشطة ومجدولة" tone="green"/>
  </div></section>
  {f&&<section className="metric-zone finance-zone"><header><div><CircleDollarSign size={19}/><span><b>المؤشرات المالية</b><small>المبيعات والتحصيل لهذا الشهر</small></span></div>{f.reviewCount>0&&<em>{f.reviewCount} طلب أقساط بانتظار المراجعة</em>}</header><div className="home-metrics finance">
   <HomeMetric icon={ReceiptText} label="قيمة عقود الشهر" value={money(f.contractValue)} suffix="ر.س" note={`${f.orders} طلب جديد`} tone="blue"/>
   <HomeMetric icon={BadgeDollarSign} label="مبيعات الشهر" value={money(f.sales)} suffix="ر.س" note="دفعات سجلها فريق المبيعات" tone="violet"/>
   <HomeMetric icon={WalletCards} label="تحصيل الشهر" value={money(f.collections)} suffix="ر.س" note="أقساط سجلتها المالية" tone="green"/>
   <HomeMetric icon={CircleDollarSign} label="إجمالي المقبوض" value={money(f.cash)} suffix="ر.س" note={`المتبقي ${money(f.remaining)} ر.س`} tone="amber"/>
  </div></section>}
  {f&&<section className="sales-performance"><header><div><span>الأداء المالي</span><h3>المبيعات والتحصيل خلال الشهر</h3><p>الأزرق للمبيعات المسجلة عند إنشاء العميل، والأخضر لتحصيل الأقساط.</p></div><div className="chart-controls"><button className={mode==="daily"?"active":""} onClick={()=>setMode("daily")}>يومي</button><button className={mode==="cumulative"?"active":""} onClick={()=>setMode("cumulative")}>تراكمي</button></div></header><div className="performance-body"><div className="sales-chart" role="img" aria-label={`رسم المبيعات والتحصيل لشهر ${month}`}><div className="chart-summary"><div className="chart-legend"><span><i className="sales"/>المبيعات</span><span><i className="collection"/>التحصيل</span></div><div><span><b>{activeDays}</b> أيام فيها حركة</span><span><b>{compactMoney(peak.sales+peak.collections)}</b> أعلى يوم</span></div></div><div className="chart-area"><div className="chart-scale">{chartTicks.map((tick,index)=><span key={index}>{compactMoney(tick)}</span>)}</div><div className="chart-bars">{chart.map((row,index)=><div className="day-bars" key={row.day} title={`${row.day} — المبيعات ${money(row.sales)} ر.س، التحصيل ${money(row.collections)} ر.س`}><div><i className="sales" style={{height:`${row.sales/chartMax*100}%`}}/><i className="collection" style={{height:`${row.collections/chartMax*100}%`}}/></div>{(index===0||(index+1)%5===0||index===chart.length-1)&&<span>{index+1}</span>}</div>)}</div></div></div><aside className="month-target"><Target size={22}/><span>هدف مبيعات الشهر</span><b>{money(f.target)} <small>ر.س</small></b><div><i style={{width:`${targetRatio}%`}}/></div><p>تحقق {targetRatio}% من الهدف</p>{data.canEditFinanceTarget&&(editingTarget?<section><input inputMode="decimal" value={target} onChange={e=>setTarget(e.target.value)}/><button onClick={saveTarget}>حفظ</button><button onClick={()=>setEditingTarget(false)}>إلغاء</button></section>:<button onClick={()=>setEditingTarget(true)}>تعديل الهدف</button>)}</aside></div></section>}
  <div className="home-lower-grid"><section className="home-panel"><header><div><Activity size={18}/><span><b>حركة النظام</b><small>آخر الإجراءات المسجلة</small></span></div></header><div className="activity-feed">{data.activity.length?data.activity.map(item=><article key={item.id}><i/><div><b>{activitySentence(item)}</b><span>{item.subject_name?`العميل: ${item.subject_name}`:"تحديث مسجل في النظام"}</span></div><time>{new Date(item.created_at).toLocaleString("ar-SA-u-nu-latn",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</time></article>):<div className="ops-empty compact">لا توجد حركة مسجلة بعد.</div>}</div></section>
  <section className="home-panel trainee-panel"><header><div><UsersRound size={18}/><span><b>توزيع المتدربين</b><small>حسب البرنامج والمسار</small></span></div></header><div className="trainee-groups">{data.trainees.map(group=><article className={openTraineeGroup===group.key?"active":""} key={group.key}><button onClick={()=>setOpenTraineeGroup(openTraineeGroup===group.key?"":group.key)} aria-expanded={openTraineeGroup===group.key}><span>{group.label}</span><b>{group.count}</b></button>{openTraineeGroup===group.key&&<div>{group.details.length?group.details.map(detail=><span key={detail.label}><i>{detail.label}</i><b>{detail.count}</b></span>):<small>لا يوجد متدربون في هذا التصنيف حالياً.</small>}</div>}</article>)}</div></section></div>
  <section className="journey-overview"><header><div><UserRoundCheck size={18}/><span><b>تقدم رحلة العميل</b><small>توزيع العملاء الموجودين حالياً في كل مرحلة</small></span></div><em>{journeyTotal} عميل ضمن المسار</em></header><div className="journey-visual">{journeyStages.map((row,index)=><article key={row.status}><div className="journey-stage-label"><span><i>{index+1}</i>{row.status}</span><b>{row.count}</b></div><div className="journey-track" role="progressbar" aria-label={`${row.status}: ${row.count} عميل`} aria-valuemin={0} aria-valuemax={journeyMax} aria-valuenow={row.count}><i style={{width:`${row.count?Math.max(6,row.count/journeyMax*100):0}%`}}/></div><small>{journeyTotal?Math.round(row.count/journeyTotal*100):0}% من الحالات الحالية</small></article>)}</div></section>
 </div>
}
function HomeMetric({icon:Icon,label,value,suffix,note,tone,onClick}:{icon:LucideIcon;label:string;value:string|number;suffix?:string;note:string;tone:string;onClick?:()=>void}){return <article className={`home-metric ${tone} ${onClick?"clickable":""}`} onClick={onClick}><div><Icon size={19}/></div><span>{label}</span><b>{value}{suffix&&<small>{suffix}</small>}</b><p>{note}</p></article>}
type TodayData = {
  user: { email: string; name: string; roles: string[] };
  today: string;
  canSeeFinance?: boolean;
  stats: {
    tasks: number;
    customers: number;
    payments: number;
    paymentAmount: number;
    enrollments: number;
  };
  tasks: {
    id: string;
    title: string;
    department: string;
    priority: string;
    due_at?: string;
  }[];
};
function WelcomeToday({ onOpenTasks }: { onOpenTasks: () => void }) {
  const [data, setData] = useState<TodayData | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    apiJson("/api/dashboard/today")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  if (error) return <div className="ops-error compact">{error}</div>;
  if (!data)
    return <div className="welcome-panel loading">جارٍ تجهيز ملخص يومك…</div>;
  const roleLabel = data.user.roles.includes("admin")
    ? "مدير النظام"
    : data.user.roles.map((role) => roleNames[role] || role).join("، ");
  return (
    <section className="welcome-panel">
      <div className="welcome-copy">
        <span>أهلاً، {data.user.name}</span>
        <h2>
          اليوم لديك {data.stats.tasks}{" "}
          {data.stats.tasks === 1 ? "مهمة" : "مهام"} تحتاج متابعتك
        </h2>
        <p>
          {roleLabel} · {data.user.email}
        </p>
        <button onClick={onOpenTasks}>عرض مهامي اليوم ←</button>
      </div>
      <div className="today-stats">
        <article>
          <i>✓</i>
          <span>المهام المفتوحة</span>
          <b>{data.stats.tasks}</b>
        </article>
        <article>
          <i>＋</i>
          <span>عملاء جدد اليوم</span>
          <b>{data.stats.customers}</b>
        </article>
        <article>
          <i>◎</i>
          <span>تسجيلات قيد العمل</span>
          <b>{data.stats.enrollments}</b>
        </article>
        {data.canSeeFinance && (
          <article>
            <i>﷼</i>
            <span>دفعات اليوم</span>
            <b>
              {data.stats.payments}
              <small>
                {data.stats.paymentAmount.toLocaleString("ar-SA-u-nu-latn")} ر.س
              </small>
            </b>
          </article>
        )}
      </div>
      {data.tasks.length > 0 && (
        <div className="today-task-strip">
          <b>الأولوية الآن</b>
          {data.tasks.slice(0, 3).map((task) => (
            <span key={task.id}>
              <i className={task.priority === "عاجلة" ? "urgent" : ""} />
              {task.title}
              <small>{task.department}</small>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
function LiveDashboard() {
  const [data, setData] = useState<OperationsReport | null>(null),
    [tasks, setTasks] = useState<LiveTask[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const [a, b] = await Promise.all([
          apiJson("/api/reports/operations"),
          apiJson("/api/tasks"),
        ]);
        setData(a);
        setTasks((b.tasks || []).slice(0, 5));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  if (loading || error || !data)
    return <LiveState loading={loading} error={error} empty={!data} />;
  const due = totalCount(
    data.enrollments.filter((row) => row.status !== "مكتمل"),
  );
  const paid = Number(data.orders?.paid || 0),
    total = Number(data.orders?.total || 0),
    ratio = total ? Math.round((paid / total) * 100) : 0;
  return (
    <>
      <div className="kpis">
        <Kpi
          title="إجمالي العملاء"
          value={Number(data.customers?.count || 0).toLocaleString(
            "ar-SA-u-nu-latn",
          )}
          tag="عميل"
          note="ملفات فعلية في النظام"
          tone="blue"
        />
        <Kpi
          title="عملاء قيد الإجراء"
          value={due.toLocaleString("ar-SA-u-nu-latn")}
          tag="تسجيل"
          note="تحتاج متابعة حتى الإكمال"
          tone="amber"
        />
        <Kpi
          title="قيمة المبيعات"
          value={total.toLocaleString("ar-SA-u-nu-latn")}
          tag="ر.س"
          note={`${Number(data.orders?.count || 0)} طلب مسجل`}
          tone="green"
        />
        <Kpi
          title="حجوزات المقاعد"
          value={totalCount(data.reservations).toLocaleString(
            "ar-SA-u-nu-latn",
          )}
          tag="حجز"
          note="تشمل المؤكدة والمنقولة"
          tone="violet"
        />
      </div>
      <div className="dashboard-grid">
        <Card title="مهام نشطة" action="بيانات حية">
          <div>
            {tasks.length ? (
              tasks.map((t) => (
                <div className="task" key={t.id}>
                  <i className={t.priority === "عاجلة" ? "red" : "amber"} />
                  <div>
                    <b>{t.title}</b>
                    <span>
                      {t.department} · {t.assignee_email || "غير مسندة"}
                    </span>
                  </div>
                  <em className={t.priority === "عاجلة" ? "red" : "amber"}>
                    {t.priority}
                  </em>
                </div>
              ))
            ) : (
              <div className="ops-empty compact">لا توجد مهام نشطة.</div>
            )}
          </div>
        </Card>
        <Card title="تقدّم رحلة العميل" action="حسب الحالة">
          <div className="flow">
            {data.enrollments.map((row, i) => (
              <div key={row.status}>
                <i
                  className={
                    ["gray", "violet", "amber", "blue", "green"][i % 5]
                  }
                >
                  {row.count}
                </i>
                <span>{row.status}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="مسارات العملاء" action="ملخص مباشر">
          <div className="live-summary">
            <p>
              <span>حالات دخول جديدة</span>
              <b>{totalCount(data.prospects) + totalCount(data.trials)}</b>
            </p>
            <p>
              <span>الطلبات المسجلة</span>
              <b>{Number(data.orders?.count || 0)}</b>
            </p>
            <p>
              <span>العملاء في البرامج</span>
              <b>{totalCount(data.enrollments)}</b>
            </p>
          </div>
        </Card>
        <Card title="ملخص المبيعات" action="من الطلبات المسجلة">
          <div className="sales-summary">
            <p>
              <span>عدد الطلبات</span>
              <b>{Number(data.orders?.count || 0)}</b>
            </p>
            <p>
              <span>إجمالي قيمة المبيعات</span>
              <b>
                {total.toLocaleString("ar-SA-u-nu-latn")} <small>ر.س</small>
              </b>
            </p>
            <p>
              <span>متوسط قيمة الطلب</span>
              <b>
                {Number(data.orders?.count || 0)
                  ? Math.round(
                      total / Number(data.orders.count),
                    ).toLocaleString("ar-SA-u-nu-latn")
                  : 0}{" "}
                <small>ر.س</small>
              </b>
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}

function LiveReports() {
  const [data, setData] = useState<OperationsReport | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    apiJson("/api/reports/operations")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  if (loading || error || !data)
    return <LiveState loading={loading} error={error} empty={!data} />;
  const max = Math.max(
      ...data.programs.map((x) => Number(x.enrollment_count)),
      1,
    ),
    openTasks = data.tasks.filter((x) => x.status !== "مكتملة");
  return (
    <div className="reports">
      <Card title="التسجيلات حسب البرنامج" action="من قاعدة البيانات">
        <div className="bars">
          {data.programs.map((row) => (
            <div key={row.program_name}>
              <span>{row.program_name}</span>
              <i>
                <u
                  style={{
                    width: `${(Number(row.enrollment_count) / max) * 100}%`,
                  }}
                />
              </i>
              <b>{row.enrollment_count}</b>
            </div>
          ))}
        </div>
      </Card>
      <Card title="كفاءة رحلة التسجيل" action="الوضع الحالي">
        <div className="metric">
          <b>{stateCount(data.enrollments, "مكتمل")}</b>
          <span>رحلة مكتملة</span>
          <em>
            {totalCount(data.enrollments) -
              stateCount(data.enrollments, "مكتمل")}{" "}
            رحلة قيد العمل
          </em>
        </div>
        <div className="mini">
          <p>
            <b>{totalCount(data.trials)}</b>تجارب
          </p>
          <p>
            <b>{totalCount(data.reservations)}</b>حجوزات
          </p>
          <p>
            <b>{totalCount(openTasks)}</b>مهام مفتوحة
          </p>
        </div>
      </Card>
      <Card title="عبء العمل حسب القسم" action="المهام غير المكتملة">
        <div className="bars">
          {Array.from(
            new Set(openTasks.map((x) => x.department || "غير محدد")),
          ).map((dept) => {
            const count = openTasks
              .filter((x) => x.department === dept)
              .reduce((s, x) => s + Number(x.count), 0);
            return (
              <div key={dept}>
                <span>{dept}</span>
                <i>
                  <u style={{ width: `${Math.min(count * 12, 100)}%` }} />
                </i>
                <b>{count}</b>
              </div>
            );
          })}
        </div>
      </Card>
      <Card
        title="ملخص العمليات"
        action={new Date(data.generatedAt).toLocaleString("ar-SA-u-nu-latn")}
      >
        <div className="live-summary">
          <p>
            <span>العملاء</span>
            <b>{data.customers.count}</b>
          </p>
          <p>
            <span>الطلبات</span>
            <b>{data.orders.count}</b>
          </p>
          <p>
            <span>إجمالي المدفوع</span>
            <b>
              {Number(data.orders.paid).toLocaleString("ar-SA-u-nu-latn")} ر.س
            </b>
          </p>
        </div>
      </Card>
    </div>
  );
}

function BackupCenter() {
  const [downloading, setDownloading] = useState(""),
    [error, setError] = useState("");
  const categories = [
    ["customers", "العملاء", "ملفات العملاء والطلبات الأولية"],
    ["sales", "المبيعات والمالية", "الطلبات والدفعات والأقساط"],
    ["programs", "البرامج والتسجيلات", "البرامج والتجارب والحجوزات والتسجيلات"],
    ["operations", "العمليات", "المهام وسجل الإجراءات"],
    ["users", "المستخدمون", "الحسابات والصلاحيات دون كلمات المرور"],
  ];
  const download = async (category: string) => {
    setDownloading(category);
    setError("");
    try {
      const response = await fetch(`/api/reports/export?category=${category}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "تعذر إنشاء ملف النسخة الاحتياطية");
      }
      const blob = await response.blob(),
        url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = `sulukera-${category}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDownloading("");
    }
  };
  return (
    <section className="backup-center">
      <header>
        <div className="backup-icon">
          <DatabaseBackup size={22} />
        </div>
        <div>
          <span>النسخ الاحتياطي</span>
          <h2>تصدير بيانات العمليات إلى Excel</h2>
          <p>
            نزّل نسخة كاملة للحفظ الآمن، أو اختر تصنيفاً محدداً للمراجعة
            والمشاركة.
          </p>
        </div>
        <button
          className="primary backup-all"
          disabled={Boolean(downloading)}
          onClick={() => download("all")}
        >
          <Download size={17} />
          {downloading === "all"
            ? "جارٍ تجهيز النسخة…"
            : "تنزيل قاعدة البيانات كاملة"}
        </button>
      </header>
      {error && <div className="ops-error compact">{error}</div>}
      <div className="backup-categories">
        {categories.map(([id, title, description]) => (
          <article key={id}>
            <div>
              <b>{title}</b>
              <span>{description}</span>
            </div>
            <button
              disabled={Boolean(downloading)}
              onClick={() => download(id)}
            >
              <Download size={15} />
              {downloading === id ? "جارٍ التجهيز…" : "تنزيل Excel"}
            </button>
          </article>
        ))}
      </div>
      <footer>
        <ShieldCheck size={15} />
        <span>
          تتضمن النسخة بيانات العمليات وسجل الإجراءات، ولا تتضمن كلمات المرور أو
          جلسات الدخول.
        </span>
      </footer>
    </section>
  );
}

function LiveCustomers({
  query,
  open,
}: {
  query: string;
  open: (p: (typeof initialPeople)[number]) => void;
}) {
  const [rows, setRows] = useState<typeof initialPeople>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [programFilter, setProgramFilter] = useState("الكل"),
    [categoryFilter, setCategoryFilter] = useState("الكل");
  const load = () => {
    apiJson("/api/customers")
      .then((data) =>
        setRows(
          (data.customers || []).map((row: Record<string, unknown>) => {
            const customerType = String(row.customer_type || "عميل"),
              state =
                customerType === "غير مهتم"
                  ? "غير مهتم"
                  : String(row.state || row.order_status || customerType);
            return {
              id: String(row.id),
              email: String(row.email || "محجوب حسب الصلاحية"),
              orderId: String(row.order_id || "—"),
              name: String(row.name || ""),
              phone: String(row.phone || "محجوب حسب الصلاحية"),
              program: String(
                row.program_name ||
                  row.program ||
                  (customerType === "غير مهتم" ? "تجربة منتهية" : "—"),
              ),
              track: String(row.track || "—"),
              cohort: String(row.cohort_label || "—"),
              source:
                customerType === "غير مهتم"
                  ? "عميل تجربة · غير مهتم"
                  : String(row.source || row.admitted_via || "—"),
              owner: String(row.owner || "غير مسند"),
              state,
              tone:
                state === "غير مهتم"
                  ? "gray"
                  : state === "مكتمل" || state === "مدفوع"
                    ? "green"
                    : state.includes("انتظار")
                      ? "amber"
                      : "blue",
              due:
                state === "غير مهتم" || state === "مكتمل"
                  ? "لا إجراء مطلوب"
                  : "متابعة الملف",
              paid: Number(row.paid || 0),
              total: Number(row.total || 0),
              seatFee: Number(row.seat_fee || 0),
            };
          }),
        ),
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    void load();
    const refresh = () => void load();
    window.addEventListener("sulukera:data-changed", refresh);
    return () => window.removeEventListener("sulukera:data-changed", refresh);
  }, []);
  // The database contains every customer whose registration created a live
  // record. Their current operational stage must not remove them from it.
  const directoryRows = rows;
  const programOrder = [
      "تحليل السلوك التطبيقي",
      "إدارة السلوك التنظيمي",
      "تقييم الكفاءة",
      "التعليم المستمر",
      "التجربة",
      "غير مصنف",
    ],
    availablePrograms = new Set(
      directoryRows.map((row) => customerProgramCategory(row)),
    ),
    programs = programOrder.filter(
      (program) =>
        availablePrograms.has(program) || program === "تقييم الكفاءة",
    ),
    classifications = Array.from(
      new Set(
        directoryRows
          .filter(
            (row) =>
              programFilter === "الكل" ||
              customerProgramCategory(row) === programFilter,
          )
          .map((row) => customerProgramLabel(row))
          .filter((classification) => classification && classification !== "—"),
      ),
    );
  const filtered = directoryRows.filter(
    (row) =>
      `${row.name} ${row.id} ${row.phone} ${row.program} ${row.track} ${customerProgramLabel(row)}`.includes(query) &&
      (programFilter === "الكل" || customerProgramCategory(row) === programFilter) &&
      (categoryFilter === "الكل" || customerProgramLabel(row) === categoryFilter),
  );
  if (loading || error)
    return <LiveState loading={loading} error={error} empty={false} />;
  return (
    <>
      <div className="customer-summary">
        <div>
          <span>إجمالي العملاء</span>
          <b>{directoryRows.length}</b>
        </div>
        <div className="highlight">
          <span>النتائج المعروضة</span>
          <b>{filtered.length}</b>
        </div>
        <div>
          <span>البرامج</span>
          <b>
            {
              new Set(
                directoryRows.map((row) => customerProgramCategory(row)),
              ).size
            }
          </b>
        </div>
        <div>
          <span>التصنيفات</span>
          <b>{new Set(directoryRows.map((row) => customerProgramLabel(row))).size}</b>
        </div>
      </div>
      <div className="card full customer-directory">
        <div className="directory-head">
          <div>
            <h2>قاعدة بيانات العملاء</h2>
            <p>جميع العملاء المسجلين في النظام، مع عرض الاسم والبرنامج فقط.</p>
          </div>
        </div>
        <CustomerSmartFilters
          programs={programs}
          statuses={classifications}
          program={programFilter}
          status={categoryFilter}
          total={directoryRows.length}
          visible={filtered.length}
          onProgram={(program) => {
            setProgramFilter(program);
            if (
              categoryFilter !== "الكل" &&
              !directoryRows.some(
                (row) =>
                  customerProgramLabel(row) === categoryFilter &&
                  (program === "الكل" || customerProgramCategory(row) === program),
              )
            )
              setCategoryFilter("الكل");
          }}
          onStatus={setCategoryFilter}
          title="تصنيف قاعدة العملاء"
          description="عرض العملاء حسب البرنامج أو التصنيف"
          secondaryLabel="التصنيف"
          secondaryAllLabel="كل التصنيفات"
        />
        {filtered.length ? (
          <CompletedCustomerTable list={filtered} open={open} />
        ) : (
          <LiveState loading={false} error="" empty />
        )}
      </div>
    </>
  );
}

type OperationsCenterData = {
  generatedAt: string;
  canManageEvents: boolean;
  canTakeAttentionAction: boolean;
  stats: { upcoming: number; overdue: number; attention: number; incomplete: number };
  events: { id: string; title: string; event_date: string; event_time?: string; details?: string; audience: string }[];
  schedule: { id: string; assignment_date?: string; start_date?: string; reservation_kind: string; cohort_label?: string; status: string; customer_name: string; program_name: string }[];
  exceptions: { id: string; order_id?: string; title: string; customer_name?: string; program_name?: string; department: string; due_at?: string; entity_type: string; kind: string; severity: string; attention_state?: "needs_operations" | "waiting_finance" | "finance_resolved" }[];
};

const DAILY_OPERATIONS_MESSAGES = [
  "استعد لما هو قادم… واصنع الفرق اليوم",
  "بداية جديدة… وفرصة جديدة للإنجاز",
  "رتّب أولوياتك… واجعل كل خطوة محسوبة",
  "إنجاز اليوم يصنع نجاح الغد",
  "كل عميل ينتظر تجربة تستحق التميّز",
  "ابدأ بالأهم… ودع النتائج تتحدث",
  "يوم جديد لنحوّل الخطط إلى إنجازات",
  "ركّز على الخطوة التالية… والباقي سيتبع",
  "تقدّم ثابت اليوم يصنع أثرًا كبيرًا غدًا",
  "التفاصيل الصغيرة تصنع تجربة عميل استثنائية",
  "اجعل كل متابعة خطوة نحو الاكتمال",
  "اليوم فرصة جديدة لتقديم الأفضل",
  "التنظيم بداية الإنجاز… فلنبدأ",
  "هدف واضح، متابعة دقيقة، ونتيجة مميزة",
  "كل خطوة مكتملة تقرّبنا من الهدف",
  "لنصنع اليوم تجربة تشغيلية أفضل",
  "الأولويات واضحة… والإنجاز يبدأ الآن",
  "تقدّم بثقة… فكل خطوة تصنع فرقًا",
  "نبدأ بتركيز… وننهي اليوم بإنجاز",
  "معًا نحو يوم أكثر تنظيمًا وإنجازًا",
  "جودة العمل تبدأ من وضوح الخطوة التالية",
  "اصنع أثرًا يظهر في كل تجربة عميل",
  "تابع بذكاء… وأنجز بثقة",
  "اليوم نرتّب، نتابع، وننجز",
  "لأن كل عميل مهم… كل متابعة تصنع فرقًا",
  "الإنجاز ليس صدفة… بل متابعة مستمرة",
  "يوم منظم يعني نتائج أفضل",
  "اجعل إنجازات اليوم تتجاوز التوقعات",
  "خطوة واضحة الآن… نتيجة أقوى لاحقًا",
  "لنحوّل مهام اليوم إلى نتائج نفتخر بها",
] as const;

function dailyOperationsMessage(date = new Date()) {
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return DAILY_OPERATIONS_MESSAGES[dayNumber % DAILY_OPERATIONS_MESSAGES.length];
}

function LiveWork({ onNavigate }: { onNavigate: (view: View) => void }) {
  const [data, setData] = useState<OperationsCenterData | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState(""), [acting, setActing] = useState("");
  const load = async () => { setLoading(true); setError(""); try { setData(await apiJson("/api/operations-center")); } catch (e) { setError((e as Error).message); } finally { setLoading(false); } };
  useEffect(() => { void load(); const refresh = () => void load(); window.addEventListener("sulukera:data-changed", refresh); return () => window.removeEventListener("sulukera:data-changed", refresh); }, []);
  if (loading || error || !data) return <LiveState loading={loading} error={error} empty={!data} />;
  const dateLabel = (value?: string) => value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("ar-SA-u-nu-latn", { weekday: "short", day: "numeric", month: "short" }) : "غير محدد";
  const routeFor = (row: OperationsCenterData["exceptions"][number]): View => row.kind === "policy" || row.department === "المالية" ? "finance" : row.entity_type === "reservation" ? "reservations" : "registration";
  const takeAttentionAction = async (row: OperationsCenterData["exceptions"][number]) => {
    if (!row.order_id) return;
    setActing(row.id); setError("");
    try {
      await apiJson("/api/operations-center", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "take_attention_action", orderId: row.order_id }) });
      await load();
      window.dispatchEvent(new CustomEvent("sulukera:data-changed", { detail: { entity: "attention", id: row.order_id } }));
    } catch (cause) { setError((cause as Error).message); } finally { setActing(""); }
  };
  return <div className="operations-center">
    <section className="operations-command">
      <div><h2>{dailyOperationsMessage()}</h2></div>
      <time>آخر تحديث {new Date(data.generatedAt).toLocaleTimeString("ar-SA-u-nu-latn", { hour: "2-digit", minute: "2-digit" })}</time>
    </section>
    <div className="operations-center-stats">
      <article className="blue"><CalendarDays size={20}/><span>مواعيد قادمة</span><b>{data.stats.upcoming}</b><small>خلال 30 يومًا</small></article>
      <article className="red"><Activity size={20}/><span>إجراءات متأخرة</span><b>{data.stats.overdue}</b><small>تجاوزت تاريخ التنفيذ</small></article>
      <article className="amber"><ShieldCheck size={20}/><span>بحاجة للانتباه</span><b>{data.stats.attention}</b><small>حالات تطبيق السياسة</small></article>
      <article className="violet"><CircleUserRound size={20}/><span>بيانات ناقصة</span><b>{data.stats.incomplete}</b><small>تؤثر على جاهزية العميل</small></article>
    </div>
    <section className="team-events-board">
      <header><div><CalendarDays size={19}/><span><b>مواعيد الفريق القادمة</b><small>المواعيد المهمة التي يجب أن تبقى أمام الفريق</small></span></div></header>
      <div className="team-event-cards">{data.events.length ? data.events.map(item => <article key={item.id}>
        <time><CalendarDays size={18}/><span><b>{dateLabel(item.event_date)}</b><small>{item.event_time || "طوال اليوم"}</small></span></time><div><b>{item.title}</b><span>{item.details || "موعد مجدول"}</span></div>
      </article>) : <div className="team-events-empty">لا توجد مواعيد فريق مضافة حاليًا.</div>}</div>
    </section>
    <div className="operations-center-grid">
      <section className="operations-schedule">
        <header><div><CalendarDays size={19}/><span><b>الجدول التشغيلي</b><small>الإسناد وبداية البرامج القادمة</small></span></div><em>{data.schedule.length}</em></header>
        <div>{data.schedule.length ? data.schedule.map(item => <article key={item.id}>
          <time><b>{dateLabel(item.assignment_date || item.start_date)}</b><span>{item.assignment_date ? "موعد الإسناد" : "بداية البرنامج"}</span></time><i/><div><b>{item.program_name}</b><span>{item.customer_name} · {item.reservation_kind}</span><small>{item.cohort_label || "دون اسم دفعة"} · البداية {dateLabel(item.start_date)}</small></div><em>{item.status}</em>
        </article>) : <div className="guided-empty"><CalendarDays size={26}/><b>لا توجد مواعيد تشغيلية قادمة</b><span>ستظهر هنا مواعيد الإسناد وبداية البرامج عند جدولتها.</span></div>}</div>
      </section>
      <section className="operations-exceptions">
        <header><div><Activity size={19}/><span><b>عملاء بحاجة للانتباه</b><small>متابعة مشتركة بين التشغيل والمالية حتى إغلاق الحالة</small></span></div><em>{data.exceptions.length}</em></header>
        <div>{data.exceptions.length ? data.exceptions.map(item => <article className={item.severity} key={item.id}>
          <i>{item.kind === "policy" ? "!" : item.kind === "overdue" ? "⌛" : "i"}</i>
          <div><b>{item.kind === "policy" ? item.attention_state === "waiting_finance" ? "بانتظار تحديث المالية" : item.attention_state === "finance_resolved" ? "بحاجة لإجراء تشغيلي" : "بحاجة لإجراء من التشغيل" : item.title}</b><span>{item.customer_name || "إجراء داخلي"}{item.program_name ? ` · ${item.program_name}` : ""}</span><small>{item.kind === "policy" ? item.attention_state === "finance_resolved" ? "تم تحديث الحالة المالية" : item.attention_state === "waiting_finance" ? "تم اتخاذ الإجراء التشغيلي الأول" : "حالة مالية تتطلب الانتباه" : `${item.department}${item.due_at ? ` · مستحق ${dateLabel(item.due_at)}` : ""}`}</small></div>
          {item.kind === "policy" ? data.canTakeAttentionAction && item.attention_state !== "waiting_finance" && <button disabled={acting === item.id} onClick={() => void takeAttentionAction(item)}>{acting === item.id ? "..." : "تم اتخاذ إجراء"}</button> : <button onClick={() => onNavigate(routeFor(item))}>معالجة</button>}
        </article>) : <div className="guided-empty"><ShieldCheck size={27}/><b>الوضع التشغيلي مستقر</b><span>لا توجد استثناءات أو حالات متأخرة حاليًا.</span></div>}</div>
      </section>
    </div>
  </div>;
}

function LegacyLiveWork() {
  const [rows, setRows] = useState<LiveTask[]>([]),
    [completed, setCompleted] = useState<LiveTask[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiJson("/api/tasks");
      setRows(data.tasks || []);
      setCompleted(data.completedToday || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
    const refresh = () => void load();
    window.addEventListener("sulukera:data-changed", refresh);
    return () => window.removeEventListener("sulukera:data-changed", refresh);
  }, []);
  const groups = ["عاجلة", "عالية", "عادية"];
  if (loading || error)
    return <LiveState loading={loading} error={error} empty={false} />;
  return (
    <div className="today-work">
      <div className="work-summary">
        <p>
          <span>عملاء يحتاجون متابعة</span>
          <b>{rows.length}</b>
        </p>
        <p>
          <span>خطوات أُنجزت اليوم</span>
          <b>{completed.length}</b>
        </p>
        <p>
          <span>إجمالي عملاء اليوم</span>
          <b>
            {
              new Set(
                [...rows, ...completed]
                  .map((x) => x.customer_name)
                  .filter(Boolean),
              ).size
            }
          </b>
        </p>
      </div>
      <section className="work-section">
        <header>
          <div>
            <h2>المتابعات الحالية</h2>
            <p>تُحدّث هذه القائمة تلقائياً عند تنفيذ الخطوة من مراحل العميل</p>
          </div>
          <span>{rows.length}</span>
        </header>
        {rows.length ? (
          <div className="board">
            {groups.map((priority) => (
              <section key={priority}>
                <header>
                  <b>{priority}</b>
                  <span>
                    {rows.filter((x) => x.priority === priority).length}
                  </span>
                </header>
                {rows
                  .filter((x) => x.priority === priority)
                  .map((t) => (
                    <article className="today-customer-card" key={t.id}>
                      <em
                        className={
                          priority === "عاجلة"
                            ? "red"
                            : priority === "عالية"
                              ? "amber"
                              : "blue"
                        }
                      >
                        {t.department}
                      </em>
                      <h3>{t.title}</h3>
                      <p className="task-customer">
                        <b>{t.customer_name || "متابعة داخلية"}</b>
                        <span>{t.program_name || "راجع المرحلة المرتبطة"}</span>
                      </p>
                      <footer>
                        <span>
                          {t.due_at
                            ? new Date(t.due_at).toLocaleDateString(
                                "ar-SA-u-nu-latn",
                              )
                            : "دون موعد"}
                        </span>
                        <b>يُنفذ الإجراء من مراحل العميل</b>
                      </footer>
                    </article>
                  ))}
              </section>
            ))}
          </div>
        ) : (
          <div className="work-clear">
            <i>✓</i>
            <b>لا توجد متابعات حالية</b>
            <p>لا توجد خطوات مطلوبة من الفريق في الوقت الحالي.</p>
          </div>
        )}
      </section>
      <section className="work-section completed-work">
        <header>
          <div>
            <h2>الخطوات المنجزة اليوم</h2>
            <p>تحديث تلقائي من مراحل العميل</p>
          </div>
          <span>{completed.length}</span>
        </header>
        {completed.length ? (
          <div className="completed-list">
            {completed.map((t) => (
              <article key={t.id}>
                <i>✓</i>
                <div>
                  <b>{t.title}</b>
                  <span>
                    {t.customer_name || "متابعة داخلية"} ·{" "}
                    {t.program_name || t.department}
                  </span>
                </div>
                <em>
                  {t.completed_at
                    ? new Date(t.completed_at).toLocaleTimeString(
                        "ar-SA-u-nu-latn",
                        { hour: "2-digit", minute: "2-digit" },
                      )
                    : "اليوم"}
                </em>
              </article>
            ))}
          </div>
        ) : (
          <div className="ops-empty compact">لا توجد خطوات منجزة اليوم بعد</div>
        )}
      </section>
    </div>
  );
}

function TrialHandoff() {
  const [rows, setRows] = useState<LiveTrial[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [moving, setMoving] = useState(""),
    [programFilter, setProgramFilter] = useState("الكل"),
    [statusFilter, setStatusFilter] = useState("الكل");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRows((await apiJson("/api/trials")).trials || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const decide = async (
    row: LiveTrial,
    action: "subscribe" | "not_interested",
  ) => {
    setMoving(row.id);
    setError("");
    try {
      await apiJson("/api/trials", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ trialId: row.id, action }),
      });
      setRows((current) => current.filter((x) => x.id !== row.id));
      window.dispatchEvent(new CustomEvent("sulukera:data-changed"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setMoving("");
    }
  };
  if (!loading && !error && !rows.length) return null;
  const trialPrograms = Array.from(
    new Set(rows.map((row) => row.program_name).filter(Boolean)),
  );
  const trialStatus = (row: LiveTrial) =>
    new Date(row.ends_at).getTime() < Date.now() ? "انتهت التجربة" : "تجربة نشطة";
  const trialStatuses = Array.from(new Set(rows.map(trialStatus)));
  const filteredTrials = rows.filter(
    (row) =>
      (programFilter === "الكل" || row.program_name === programFilter) &&
      (statusFilter === "الكل" || trialStatus(row) === statusFilter),
  );
  return (
    <section className="trial-handoff">
      <header>
        <div>
          <span>عملاء التجربة</span>
          <h2>متابعة قرار العميل بعد التجربة</h2>
          <p>
            اختر اشتراك لنقل العميل مباشرة إلى التهيئة، أو غير مهتم لإغلاق
            التجربة وتصنيف الملف.
          </p>
        </div>
        <b>{rows.length}</b>
      </header>
      <CustomerSmartFilters
        programs={trialPrograms}
        statuses={trialStatuses}
        program={programFilter}
        status={statusFilter}
        total={rows.length}
        visible={filteredTrials.length}
        onProgram={setProgramFilter}
        onStatus={setStatusFilter}
      />
      {error && <div className="ops-error compact">{error}</div>}
      {loading ? (
        <div className="ops-empty compact">جارٍ تحميل عملاء التجربة…</div>
      ) : (
        <div className="trial-cards">
          {filteredTrials.map((row) => (
            <article key={row.id}>
              <div className="trial-person">
                <i>{row.customer_name.slice(0, 2)}</i>
                <div>
                  <b>{row.customer_name}</b>
                  <span>
                    {row.program_name} · {row.program_code}
                  </span>
                </div>
              </div>
              <div className="trial-contact">
                <p>
                  <span>رقم الجوال</span>
                  <b dir="ltr">{row.phone}</b>
                </p>
                <p>
                  <span>البريد الإلكتروني</span>
                  <b dir="ltr">{row.email}</b>
                </p>
              </div>
              <p className="trial-period">
                تنتهي التجربة:{" "}
                <b>
                  {new Date(row.ends_at).toLocaleDateString("ar-SA-u-nu-latn")}
                </b>
              </p>
              <div className="trial-actions">
                <button
                  className="primary"
                  disabled={moving === row.id}
                  onClick={() => decide(row, "subscribe")}
                >
                  اشتراك ونقل إلى التهيئة
                </button>
                <button
                  className="secondary danger"
                  disabled={moving === row.id}
                  onClick={() => decide(row, "not_interested")}
                >
                  غير مهتم
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const enrollmentSteps: Record<string, [string, string]> = {
  جديد: ["contacted", "تأكيد تسليم العميل"],
  "تم التواصل": ["registered", "إتمام تهيئة العميل"],
  "اكتمل التسجيل": ["assigned", "تفعيل المقررات"],
  "تم إنشاء الحساب": ["assigned", "تفعيل المقررات"],
  "تم الإسناد": ["completed", "إكمال البرنامج"],
  نشط: ["completed", "إكمال البرنامج"],
};
const enrollmentStep = (row: LiveEnrollment): [string, string] | undefined =>
  row.order_type === "إشراف" && row.status === "تم التواصل"
    ? ["registered", "إتمام تهيئة الإشراف"]
    : enrollmentSteps[row.status];
function PaymentReferenceControl({
  paymentId,
  initialReference = "",
  canEdit = false,
  onSaved,
}: {
  paymentId?: string;
  initialReference?: string;
  canEdit?: boolean;
  onSaved?: (reference: string) => void;
}) {
  const [reference, setReferenceValue] = useState(initialReference),
    [draft, setDraft] = useState(initialReference),
    [editing, setEditing] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    setReferenceValue(initialReference);
    setDraft(initialReference);
  }, [initialReference, paymentId]);
  const save = async () => {
    if (!paymentId || !/^https?:\/\/\S+$/i.test(draft.trim())) {
      setError("أدخل رابطاً صحيحاً يبدأ بـ http أو https");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiJson("/api/payments", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentId, reference: draft.trim() }),
      });
      setReferenceValue(draft.trim());
      setEditing(false);
      onSaved?.(draft.trim());
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setSaving(false);
    }
  };
  if (!paymentId) return null;
  if (editing)
    return (
      <div className="payment-reference-editor">
        <input dir="ltr" type="url" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="https://..." />
        <button disabled={saving} onClick={() => void save()}>{saving ? "..." : "حفظ"}</button>
        <button className="cancel" onClick={() => { setEditing(false); setDraft(reference); setError(""); }}>إلغاء</button>
        {error && <small>{error}</small>}
      </div>
    );
  const referenceIsLink = /^https?:\/\/\S+$/i.test(reference);
  if (referenceIsLink)
    return (
      <div className="payment-reference-ready">
        <a href={reference} target="_blank" rel="noopener noreferrer"><ReceiptText size={17} />فتح مرجع السداد</a>
        {canEdit && <button onClick={() => setEditing(true)}>تعديل</button>}
      </div>
    );
  return canEdit ? (
    <button className="payment-reference-empty" onClick={() => setEditing(true)}><ReceiptText size={17} />{reference ? "استبدال المرجع الحالي برابط" : "إضافة مرجع السداد"}</button>
  ) : null;
}
function OperationsCustomerCard({
  row,
  stage,
  nextLabel,
  moving,
  onOpen,
  onWhatsapp,
  onEmail,
  onAdvance,
}: {
  row: LiveEnrollment;
  stage: string;
  nextLabel?: string;
  moving: boolean;
  onOpen: () => void;
  onWhatsapp: () => void;
  onEmail: () => void;
  onAdvance?: () => void;
}) {
  return (
    <article
      className={`ops-customer-row ${row.needs_attention?"needs-attention":""} ${moving ? "card-moving" : "card-enter"}`}
      style={{ gridColumn: "1 / -1" }}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen();
      }}
    >
      <button
        className="ops-row-identity"
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
      >
        <i>{row.customer_name.slice(0, 2)}</i>
        <div>
          <b>{row.customer_name}</b>
          <span className="ops-order-number">{row.order_number || row.order_id}</span>
          {Boolean(row.needs_attention)&&<em className="attention-badge">تطبيق السياسة · بحاجة للانتباه</em>}
        </div>
      </button>
      <div className="ops-row-cell">
        <span>البرنامج</span>
        <b>{row.program_name}</b>
        <div className="ops-program-tags">
          {row.program_track && row.program_track !== "غير محدد" && <small className="ops-program-track">البرنامج الفرعي: {row.program_track}</small>}
          {row.program_delivery && row.program_track?.toUpperCase() !== "ABAT" && <small className={`ops-program-delivery ${row.program_delivery === "مباشر" ? "live" : "recorded"}`}>{row.program_delivery}</small>}
          {Boolean(row.competency_assessment) && <small className="ops-competency-badge">مع تقييم كفاءة</small>}
        </div>
      </div>
      <div className="ops-row-cell contact">
        <span>بيانات التواصل</span>
        <b dir="ltr">{row.phone || "غير مسجل"}</b>
        <small dir="ltr">{row.email || "غير مسجل"}</small>
      </div>
      <div className="ops-row-cell source">
        <span>المصدر</span>
        <b>{row.purchase_source || "غير محدد"}</b>
      </div>
      <div className="ops-row-cell status">
        <span>المرحلة</span>
        <em>{stage}</em>
      </div>
      <div className="ops-row-cell next">
        <span>الإجراء التالي</span>
        <b>{nextLabel || "لا يوجد إجراء مطلوب"}</b>
        <small>
          آخر تحديث{" "}
          {row.updated_at
            ? new Date(row.updated_at).toLocaleDateString("ar-SA-u-nu-latn")
            : "غير محدد"}
        </small>
      </div>
      <div className="ops-row-actions">
        <button
          className="whatsapp"
          aria-label={`واتساب ${row.customer_name}`}
          disabled={!row.phone}
          onClick={(event) => {
            event.stopPropagation();
            onWhatsapp();
          }}
        >
          <FaWhatsapp size={15} />
        </button>
        <button
          aria-label={`إيميل ${row.customer_name}`}
          disabled={!row.email}
          onClick={(event) => {
            event.stopPropagation();
            onEmail();
          }}
        >
          <Mail size={14} />
        </button>
        {nextLabel && onAdvance && (
          <button
            className="advance"
            disabled={moving}
            onClick={(event) => {
              event.stopPropagation();
              onAdvance();
            }}
          >
            {moving ? "..." : "تنفيذ"}
          </button>
        )}
      </div>
    </article>
  );
}
function LiveAcademy({
  focus,
  canManagePaymentReference,
}: {
  focus: "contact" | "registration" | "assignment";
  canManagePaymentReference: boolean;
}) {
  const [rows, setRows] = useState<LiveEnrollment[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [moving, setMoving] = useState(""),
    [copied, setCopied] = useState(""),
    [programFilter, setProgramFilter] = useState("الكل"),
    [statusFilter, setStatusFilter] = useState("الكل"),
    [selectedRow, setSelectedRow] = useState<LiveEnrollment | null>(null);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRows((await apiJson("/api/enrollments")).enrollments || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const advance = async (row: LiveEnrollment) => {
    const step = enrollmentStep(row);
    if (!step) return;
    setMoving(row.id);
    try {
      await apiJson("/api/enrollments/transition", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enrollmentId: row.id, action: step[0] }),
      });
      setRows((current) => current.filter((item) => item.id !== row.id));
      window.dispatchEvent(
        new CustomEvent("sulukera:data-changed", {
          detail: { entity: "customer", id: row.customer_id },
        }),
      );
      setTimeout(() => void load(), 350);
    } catch (e) {
      setError((e as Error).message);
      setMoving("");
    }
  };
  const copy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(""), 1400);
  };
  const whatsapp = (row: LiveEnrollment) => {
    const digits = row.phone
      .replace(/\D/g, "")
      .replace(/^00/, "")
      .replace(/^0/, "966");
    window.open(
      `https://wa.me/${digits}?text=${encodeURIComponent(`مرحباً ${row.customer_name}، معك فريق سلوكيرا بخصوص تهيئة تسجيلك في برنامج ${row.program_name}.`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  const displayState = (status: string) =>
    status === "تم إنشاء الحساب"
      ? "اكتمل التسجيل"
      : status === "نشط"
        ? "تم الإسناد"
        : status;
  const states =
    focus === "contact"
      ? ["جديد"]
      : focus === "registration"
        ? ["تم التواصل"]
        : ["اكتمل التسجيل", "تم الإسناد", "مكتمل"];
  const availablePrograms = Array.from(
    new Set(rows.map((row) => row.program_name).filter(Boolean)),
  );
  const availableStatuses = Array.from(
    new Set(rows.map((row) => displayState(row.status)).filter(Boolean)),
  );
  const filteredRows = rows.filter(
    (row) =>
      (programFilter === "الكل" || row.program_name === programFilter) &&
      (statusFilter === "الكل" || displayState(row.status) === statusFilter),
  );
  const attentionRows=rows.filter(row=>Boolean(row.needs_attention));
  if (loading || error || !rows.length)
    return <LiveState loading={loading} error={error} empty={!rows.length} />;
  const count = (state: string) =>
    filteredRows.filter((x) => displayState(x.status) === state).length;
  const stageLabel = (state: string) =>
    focus === "contact"
      ? "بانتظار تسليم العميل"
      : focus === "registration"
        ? "قيد تهيئة العميل"
        : (
            {
              "اكتمل التسجيل": "بانتظار التفعيل",
              "تم الإسناد": "تم تفعيل المقررات",
              مكتمل: "مكتمل",
            } as Record<string, string>
          )[state] || state;
  const stageIndex = (status: string) =>
    [
      "جديد",
      "تم التواصل",
      "اكتمل التسجيل",
      "تم إنشاء الحساب",
      "تم الإسناد",
      "نشط",
      "مكتمل",
    ].indexOf(status);
  const detailPanel = selectedRow && (
    <>
      <div className="overlay" onClick={() => setSelectedRow(null)} />
      <aside className="drawer operations-drawer">
        <button className="close" onClick={() => setSelectedRow(null)}>
          ×
        </button>
        <div className="person">
          <i>{selectedRow.customer_name.slice(0, 2)}</i>
          <div>
            <h2>{selectedRow.customer_name}</h2>
            <p>{selectedRow.program_name}</p>
          </div>
        </div>
        {Boolean(selectedRow.needs_attention)&&<div className="drawer-attention-note"><ShieldCheck size={18}/><div><b>عميل بحاجة للانتباه</b><span>سلوك السداد الحالي: تطبيق السياسة. مراجعة الملف المالي قبل متابعة الإجراء.</span></div></div>}
        <div className="operations-contact-actions">
          <button className="whatsapp" onClick={() => whatsapp(selectedRow)}>
            <FaWhatsapp size={18} />
            واتساب
          </button>
          <button
            className="email-action"
            disabled={!selectedRow.email}
            onClick={() =>
              (window.location.href = `mailto:${selectedRow.email}`)
            }
          >
            <Mail size={17} />
            إيميل
          </button>
          <PaymentReferenceControl
            paymentId={selectedRow.payment_id}
            initialReference={selectedRow.payment_reference}
            canEdit={canManagePaymentReference}
            onSaved={(paymentReference) => {
              setSelectedRow({
                ...selectedRow,
                payment_reference: paymentReference,
              });
              setRows((current) =>
                current.map((row) =>
                  row.id === selectedRow.id
                    ? { ...row, payment_reference: paymentReference }
                    : row,
                ),
              );
            }}
          />
        </div>
        <Section title="بيانات العميل">
          <div className="detail-contact">
            <div>
              <span>رقم الجوال</span>
              <b dir="ltr">{selectedRow.phone}</b>
              <button onClick={() => copy(selectedRow.phone, "drawer-phone")}>
                <Copy size={14} />
                {copied === "drawer-phone" ? "تم النسخ" : "نسخ"}
              </button>
            </div>
            <div>
              <span>البريد الإلكتروني</span>
              <b dir="ltr">{selectedRow.email}</b>
              <button onClick={() => copy(selectedRow.email, "drawer-email")}>
                <Copy size={14} />
                {copied === "drawer-email" ? "تم النسخ" : "نسخ"}
              </button>
            </div>
          </div>
          <div className="info customer-data">
            <label>
              البرنامج<b>{selectedRow.program_name}{selectedRow.program_track && selectedRow.program_track !== "غير محدد" && <small className="drawer-program-track">البرنامج الفرعي: {selectedRow.program_track}</small>}{selectedRow.program_delivery && selectedRow.program_track?.toUpperCase() !== "ABAT" && <small className="drawer-program-delivery">نمط البرنامج: {selectedRow.program_delivery}</small>}{Boolean(selectedRow.competency_assessment) && <small className="drawer-competency-badge">مع تقييم كفاءة</small>}</b>
            </label>
            <label>
              رقم الطلب<b>{selectedRow.order_number || selectedRow.order_id}</b>
            </label>
          </div>
        </Section>
        <Section title="مراحل العملية">
          <div className="operation-steps">
            {[
              ["تسليم العميل", 0],
              ["تهيئة العميل", 1],
              ["تفعيل المقررات", 3],
            ].map(([label, min], index) => {
              const done = stageIndex(selectedRow.status) > Number(min),
                current =
                  (index === 0 && stageIndex(selectedRow.status) === 0) ||
                  (index === 1 && stageIndex(selectedRow.status) === 1) ||
                  (index === 2 &&
                    stageIndex(selectedRow.status) >= 2 &&
                    stageIndex(selectedRow.status) < 6);
              return (
                <div
                  className={done ? "done" : current ? "current" : "pending"}
                  key={label}
                >
                  <i>{done ? "✓" : index + 1}</i>
                  <span>
                    <b>{label}</b>
                    <small>
                      {done
                        ? "تمت الخطوة"
                        : current
                          ? "الخطوة الحالية"
                          : "بانتظار الخطوة السابقة"}
                    </small>
                  </span>
                </div>
              );
            })}
          </div>
          {enrollmentStep(selectedRow) && (
            <button
              className="primary drawer-next"
              disabled={moving === selectedRow.id}
              onClick={async () => {
                await advance(selectedRow);
                setSelectedRow(null);
              }}
            >
              {moving === selectedRow.id
                ? "جارٍ التحديث..."
                : enrollmentStep(selectedRow)?.[1]}
            </button>
          )}
        </Section>
        <Section title="تحديثات العميل">
          <CustomerNotes customerId={selectedRow.customer_id} />
        </Section>
      </aside>
    </>
  );
  const board = (
    <div className={`kanban live-kanban simplified journey-board ${focus}`}>
      {states.map((state, index) => (
        <section className={`journey-column column-${index}`} key={state}>
          <header>
            <div>
              <i>{index + 1}</i>
              <b>{stageLabel(state)}</b>
            </div>
            <span>{count(state)}</span>
          </header>
          <p className="column-note">
            {focus === "assignment"
              ? [
                  "جاهز لتفعيل البرنامج والمقررات",
                  "تم التفعيل ويجري تنفيذ البرنامج",
                  "أتم البرنامج بنجاح",
                ][index]
              : focus === "contact"
                ? "فتح البطاقة يعرض ملف العميل"
                : "فتح البطاقة يعرض بيانات العميل وخطواته"}
          </p>
          {!!count(state) && (
            <div className="ops-list-head" aria-hidden="true">
              <span>العميل</span>
              <span>البرنامج</span>
              <span>بيانات التواصل</span>
              <span>المصدر</span>
              <span>المرحلة</span>
              <span>الإجراء التالي</span>
              <span>الإجراءات</span>
            </div>
          )}
          <div className="column-cards">
            {filteredRows
              .filter((x) => displayState(x.status) === state)
              .map((row) => (
                <OperationsCustomerCard
                  key={row.id}
                  row={row}
                  stage={stageLabel(state)}
                  nextLabel={enrollmentStep(row)?.[1]}
                  moving={moving === row.id}
                  onOpen={() => setSelectedRow(row)}
                  onWhatsapp={() => whatsapp(row)}
                  onEmail={() => {
                    window.location.href = `mailto:${row.email}`;
                  }}
                  onAdvance={
                    enrollmentStep(row)
                      ? () => void advance(row)
                      : undefined
                  }
                />
              ))}
          </div>
          {!count(state) && (
            <div className="column-empty">
              <i>✓</i>
              <b>لا توجد حالات هنا</b>
              <span>ستظهر تلقائياً عند انتقال العميل</span>
            </div>
          )}
        </section>
      ))}
    </div>
  );
  const attentionPanel=focus!=="contact"&&attentionRows.length>0&&<section className="operations-attention"><header><div><ShieldCheck size={19}/><span><b>عملاء بحاجة للانتباه</b><small>تم تطبيق السياسة المالية على ملفاتهم</small></span></div><em>{attentionRows.length}</em></header><div>{attentionRows.map(row=><button key={row.id} onClick={()=>setSelectedRow(row)}><span><b>{row.customer_name}</b><small>{row.program_name} · {row.order_number||row.order_id}</small></span><em>فتح الملف ←</em></button>)}</div></section>;
  if (focus !== "assignment")
    return (
      <>
        {attentionPanel}
        <CustomerSmartFilters
          programs={availablePrograms}
          statuses={availableStatuses}
          program={programFilter}
          status={statusFilter}
          total={rows.length}
          visible={filteredRows.length}
          onProgram={setProgramFilter}
          onStatus={setStatusFilter}
        />
        {board}
        {detailPanel}
      </>
    );
  return (
    <>
      {attentionPanel}
      <CustomerSmartFilters
        programs={availablePrograms}
        statuses={availableStatuses}
        program={programFilter}
        status={statusFilter}
        total={rows.length}
        visible={filteredRows.length}
        onProgram={setProgramFilter}
        onStatus={setStatusFilter}
      />
      <div className="assignment-workspace">
        <div className="assignment-banner">
          <div>
            <span>متابعة تفعيل المقررات</span>
            <h2>مراجعة العميل وتفعيل البرنامج</h2>
            <p>
              مراجعة بيانات العميل وتفعيل المقررات ومتابعة اكتمال البرنامج من
              مكان واحد.
            </p>
          </div>
          <div className="assignment-stats">
            <p>
              <span>بانتظار التفعيل</span>
              <b>{count("اكتمل التسجيل")}</b>
            </p>
            <p>
              <span>مقررات مفعّلة</span>
              <b>{count("تم الإسناد")}</b>
            </p>
            <p>
              <span>مكتمل</span>
              <b>{count("مكتمل")}</b>
            </p>
          </div>
        </div>
        {board}
      </div>
      {detailPanel}
    </>
  );
}

type StaffRow = {
  email: string;
  display_name?: string;
  role: string;
  active: number;
  created_at: string;
  permissions?: string;
  has_password?: number;
};
function ControlPanel() {
  const [section, setSection] = useState<"users" | "programs" | "dates">("users");
  return (
    <div className="control-panel">
      <nav className="control-panel-tabs" aria-label="أقسام لوحة التحكم">
        <button
          className={section === "users" ? "active" : ""}
          onClick={() => setSection("users")}
        >
          <ShieldCheck size={18} />
          المستخدمون والصلاحيات
        </button>
        <button
          className={section === "programs" ? "active" : ""}
          onClick={() => setSection("programs")}
        >
          <FolderKanban size={18} />
          إدارة البرامج
        </button>
        <button
          className={section === "dates" ? "active" : ""}
          onClick={() => setSection("dates")}
        >
          <CalendarDays size={18} />
          إدارة المواعيد
        </button>
      </nav>
      {section === "users" ? <Users /> : section === "programs" ? <Programs /> : <TeamEventsAdmin />}
    </div>
  );
}

function TeamEventsAdmin() {
  const empty = { id: "", title: "", eventDate: "", eventTime: "", details: "", audience: ["all"] as string[] };
  const [rows, setRows] = useState<OperationsCenterData["events"]>([]), [form, setForm] = useState(empty), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState("");
  const load = async () => { setLoading(true); setError(""); try { const result = await apiJson("/api/operations-center"); setRows(result.events || []); } catch (e) { setError((e as Error).message); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const save = async () => { setSaving(true); setError(""); try { await apiJson("/api/operations-center", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }); setForm(empty); await load(); } catch (e) { setError((e as Error).message); } finally { setSaving(false); } };
  const edit = (item: OperationsCenterData["events"][number]) => setForm({ id: item.id, title: item.title, eventDate: item.event_date, eventTime: item.event_time || "", details: item.details || "", audience: String(item.audience || "all").split(",") });
  const remove = async (eventId: string) => { if (!window.confirm("حذف هذا الموعد من جدول الفريق؟")) return; try { await apiJson(`/api/operations-center?id=${encodeURIComponent(eventId)}`, { method: "DELETE" }); if (form.id === eventId) setForm(empty); await load(); } catch (e) { setError((e as Error).message); } };
  const audienceLabels: Record<string, string> = { all: "جميع الموظفين", sales: "المبيعات", academy: "التشغيلية", finance: "المالية" };
  return <div className="team-events-admin">
    <section className="team-event-form">
      <header><div><CalendarDays size={19}/><span><b>{form.id ? "تعديل الموعد" : "إضافة موعد للفريق"}</b><small>يظهر الموعد تلقائيًا داخل مركز العمليات للأقسام المحددة.</small></span></div>{form.id && <button onClick={() => setForm(empty)}>×</button>}</header>
      <div><label>اسم الموعد<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="مثال: بداية الدفعة الثانية عشرة" /></label><label>التاريخ<input type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })}/></label><label>الوقت — اختياري<input type="time" value={form.eventTime} onChange={e => setForm({ ...form, eventTime: e.target.value })}/></label><label>التفاصيل<input value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} placeholder="تعليمات أو وصف مختصر" /></label></div>
      <fieldset><legend>يظهر إلى</legend>{Object.entries(audienceLabels).map(([value,label]) => <label className={form.audience.includes(value) ? "active" : ""} key={value}><input type="checkbox" checked={form.audience.includes(value)} onChange={() => { const next = value === "all" ? ["all"] : form.audience.filter(x => x !== "all"); setForm({ ...form, audience: next.includes(value) ? next.filter(x => x !== value) : [...next, value] }); }}/>{label}</label>)}</fieldset>
      {error && <div className="ops-error compact">{error}</div>}<button className="primary" disabled={saving || !form.title || !form.eventDate} onClick={save}>{saving ? "جارٍ الحفظ..." : form.id ? "حفظ التعديلات" : "إضافة الموعد"}</button>
    </section>
    <section className="team-events-admin-list"><header><div><CalendarDays size={19}/><span><b>المواعيد الحالية</b><small>إدارة المواعيد الظاهرة في مركز العمليات</small></span></div><em>{rows.length}</em></header>{loading ? <LiveState loading error="" empty={false}/> : <div>{rows.length ? rows.map(item => <article key={item.id}><time><b>{new Date(`${item.event_date}T12:00:00`).toLocaleDateString("ar-SA-u-nu-latn", { day: "numeric", month: "short", year: "numeric" })}</b><small>{item.event_time || "طوال اليوم"}</small></time><div><b>{item.title}</b><span>{item.details || "دون تفاصيل"}</span><small>{String(item.audience || "all").split(",").map(x => audienceLabels[x] || x).join(" · ")}</small></div><footer><button onClick={() => edit(item)}>تعديل</button><button onClick={() => remove(item.id)}>حذف</button></footer></article>) : <div className="guided-empty"><CalendarDays size={25}/><b>لا توجد مواعيد مضافة</b><span>استخدم النموذج لإضافة أول موعد للفريق.</span></div>}</div>}</section>
  </div>;
}
function Programs() {
  const [rows, setRows] = useState<Program[]>([]),
    [name, setName] = useState(""),
    [code, setCode] = useState(""),
    [category, setCategory] = useState("برنامج"),
    [programKind, setProgramKind] = useState("برنامج مباشر"),
    [trialDays, setTrialDays] = useState("0"),
    [seatFee, setSeatFee] = useState(""),
    [tracks, setTracks] = useState(""),
    [editingId, setEditingId] = useState(""),
    [editTracks, setEditTracks] = useState(""),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRows((await apiJson("/api/programs?all=1")).programs || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const parseTracks = (value: string) =>
    value
      .split(/[,،\n]/)
      .map((x) => x.trim())
      .filter(Boolean);
  const add = async () => {
    setSaving(true);
    setError("");
    try {
      await apiJson("/api/programs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          category,
          programKind,
          trialDays,
          seatFee,
          tracks: parseTracks(tracks),
        }),
      });
      setName("");
      setCode("");
      setTrialDays("0");
      setSeatFee("");
      setTracks("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  const toggle = async (row: Program) => {
    setSaving(true);
    setError("");
    try {
      await apiJson("/api/programs", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ programId: row.id, active: !row.active }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  const saveTracks = async (row: Program) => {
    setSaving(true);
    setError("");
    try {
      await apiJson("/api/programs", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          programId: row.id,
          tracks: parseTracks(editTracks),
        }),
      });
      setEditingId("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="programs-layout">
      <section className="card program-form">
        <header>
          <h2>إضافة برنامج جديد</h2>
          <p>
            حدّد نوع الرحلة أولاً؛ البرنامج المباشر يُجدول بتاريخ بداية وإسناد،
            أما برنامج الشهادة فيبدأ رحلة التهيئة المعتادة.
          </p>
        </header>
        <div className="program-kind-choice">
          <button
            className={programKind === "برنامج مباشر" ? "selected" : ""}
            onClick={() => setProgramKind("برنامج مباشر")}
          >
            <b>برنامج مباشر</b>
            <span>دفعة، تاريخ بداية، وتاريخ إسناد</span>
          </button>
          <button
            className={programKind === "شهادة" ? "selected" : ""}
            onClick={() => setProgramKind("شهادة")}
          >
            <b>برنامج بشهادة</b>
            <span>مثل تحليل السلوك التطبيقي ومساراته</span>
          </button>
        </div>
        <div className="program-fields">
          <Field label="اسم البرنامج *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: مهارات تعديل السلوك"
            />
          </Field>
          <Field label="رمز البرنامج *">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="مثال: BMOD"
            />
          </Field>
          <Field label="التصنيف">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>برنامج</option>
              <option>شهادة</option>
              <option>تقييم</option>
            </select>
          </Field>
          <Field label="مدة التجربة بالأيام">
            <input
              type="number"
              min="0"
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
            />
          </Field>
          <Field label="رسوم حجز المقعد">
            <input
              type="number"
              min="0"
              value={seatFee}
              onChange={(e) => setSeatFee(e.target.value)}
              placeholder="اختياري"
            />
          </Field>
          <Field label="المسارات">
            <input
              value={tracks}
              onChange={(e) => setTracks(e.target.value)}
              placeholder="مثال: P، E، C"
            />
          </Field>
        </div>
        {error && <div className="ops-error compact">{error}</div>}
        <button
          className="primary"
          disabled={saving || !name || !code}
          onClick={add}
        >
          {saving ? "جارٍ الحفظ..." : "إضافة البرنامج"}
        </button>
      </section>
      <Card
        title="البرامج الحالية"
        action={`${rows.filter((x) => x.active).length} مفعّل`}
      >
        <LiveState loading={loading} error="" empty={!rows.length} />
        {!loading && rows.length > 0 && (
          <div className="program-list">
            {rows.map((row) => (
              <article className="program-row" key={row.id}>
                <div className="program-mark">
                  <BookOpenCheck size={19} />
                </div>
                <div className="program-identity">
                  <b>{row.name}</b>
                  <span>
                    {row.code} · {row.category || "برنامج"}
                  </span>
                  <em>
                    {row.tracks?.length
                      ? row.tracks.map((x) => x.name).join(" · ")
                      : "دون مسارات"}
                  </em>
                  {editingId === row.id && (
                    <div className="track-editor">
                      <input
                        value={editTracks}
                        onChange={(e) => setEditTracks(e.target.value)}
                        placeholder="افصلي المسارات بفاصلة"
                      />
                      <button
                        className="primary"
                        onClick={() => saveTracks(row)}
                      >
                        حفظ
                      </button>
                      <button
                        className="secondary"
                        onClick={() => setEditingId("")}
                      >
                        إلغاء
                      </button>
                    </div>
                  )}
                </div>
                <p>
                  <span>نوع الرحلة</span>
                  <b>{row.programKind || "شهادة"}</b>
                </p>
                <p>
                  <span>التجربة</span>
                  <b>{row.trialDays || 0} يوم</b>
                </p>
                <i className={`pill ${row.active ? "green" : "red"}`}>
                  {row.active ? "مفعّل" : "موقوف"}
                </i>
                <div className="program-actions">
                  <button
                    className="link"
                    onClick={() => {
                      setEditingId(row.id);
                      setEditTracks(
                        row.tracks?.map((x) => x.name).join("، ") || "",
                      );
                    }}
                  >
                    تعديل المسارات
                  </button>
                  <button
                    className={`permission-toggle ${row.active ? "stop" : "start"}`}
                    disabled={saving}
                    onClick={() => toggle(row)}
                  >
                    {row.active ? "إيقاف" : "تفعيل"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
const roleNames: Record<string, string> = {
  admin: "الإدارة",
  sales: "المبيعات",
  finance: "المالية",
  academy: "التشغيلية",
  viewer: "مشاهدة فقط",
};
function Users() {
  const permissionLabels: Record<string, string> = {
    "customers.view": "عرض العملاء",
    "customers.manage": "تعديل رحلة العملاء",
    "reservations.manage": "إدارة حجوزات المقاعد",
    "programs.activate": "تفعيل المقررات",
    "finance.view": "عرض المالية",
    "finance.total.edit": "تعديل المبلغ الإجمالي",
    "finance.installments.manage": "إضافة ومتابعة الأقساط",
    "finance.payments.record": "تسجيل الدفعات ومراجعها",
    "reports.view": "عرض التقارير",
    "users.manage": "إدارة المستخدمين",
  };
  const [staff, setStaff] = useState<StaffRow[]>([]),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [role, setRole] = useState("sales"),
    [permissions, setPermissions] = useState<string[]>([
      "customers.view",
      "customers.manage",
    ]),
    [active, setActive] = useState(true),
    [editingEmail, setEditingEmail] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setStaff((await apiJson("/api/staff")).staff || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const togglePermission = (permission: string) =>
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((x) => x !== permission)
        : [...current, permission],
    );
  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("sales");
    setPermissions(["customers.view", "customers.manage"]);
    setActive(true);
    setEditingEmail("");
  };
  const edit = (row: StaffRow) => {
    let rowPermissions: string[] = [];
    try {
      rowPermissions = JSON.parse(row.permissions || "[]");
    } catch {}
    setName(row.display_name || row.email);
    setEmail(row.email);
    setPassword("");
    setRole(row.role);
    setPermissions(rowPermissions);
    setActive(Boolean(row.active));
    setEditingEmail(row.email);
  };
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await apiJson("/api/staff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          originalEmail: editingEmail || undefined,
          password: password || undefined,
          roles: [role],
          permissions,
          active,
        }),
      });
      reset();
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  const updateStatus = async (row: StaffRow) => {
    let rowPermissions: string[] = [];
    try {
      rowPermissions = JSON.parse(row.permissions || "[]");
    } catch {}
    setSaving(true);
    setError("");
    try {
      await apiJson("/api/staff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: row.display_name || row.email,
          email: row.email,
          roles: [row.role],
          permissions: rowPermissions,
          active: !row.active,
        }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  const remove = async (row: StaffRow) => {
    if (
      !window.confirm(
        `حذف حساب ${row.display_name || row.email} نهائياً؟ لن يتمكن المستخدم من تسجيل الدخول بعد الحذف.`,
      )
    )
      return;
    setSaving(true);
    setError("");
    try {
      await apiJson("/api/staff", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: row.email }),
      });
      if (editingEmail === row.email) reset();
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  const unique = Array.from(
    new Map(staff.map((row) => [row.email, row])).values(),
  );
  return (
    <div className="access-layout">
      <section className="card access-form">
        <header>
          <h2>
            {editingEmail
              ? "تعديل المستخدم وصلاحياته"
              : "إضافة مستخدم وصلاحياته"}
          </h2>
          <p>أدخل بيانات الدخول، ثم حدّد القسم والصلاحيات الفردية المناسبة.</p>
        </header>
        <div className="access-fields">
          <Field label="اسم الموظف *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم الذي سيظهر داخل النظام"
            />
          </Field>
          <Field label="البريد الإلكتروني *">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@sulukera.com"
                  />
          </Field>
          <Field
            label={editingEmail ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور *"}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                editingEmail
                  ? "اتركها فارغة للإبقاء على الحالية"
                  : "8 أحرف على الأقل"
              }
            />
          </Field>
          <Field label="القسم الأساسي">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {Object.entries(roleNames).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="individual-permissions">
          <h3>الصلاحيات الفردية</h3>
          <p>يمكن جمع أكثر من صلاحية للمستخدم نفسه.</p>
          <div>
            {Object.entries(permissionLabels).map(([key, label]) => (
              <label
                className={permissions.includes(key) ? "checked" : ""}
                key={key}
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(key)}
                  onChange={() => togglePermission(key)}
                />
                <i>{permissions.includes(key) ? "✓" : ""}</i>
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
        {editingEmail && (
          <label className="staff-active-choice">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <span>السماح للمستخدم بالدخول</span>
          </label>
        )}
        {error && <div className="ops-error compact">{error}</div>}
        <div className="staff-form-actions">
          <button
            className="primary"
            disabled={
              saving ||
              !name ||
              !email ||
              (!editingEmail && password.length < 8) ||
              (Boolean(password) && password.length < 8)
            }
            onClick={save}
          >
            {saving
              ? "جارٍ الحفظ..."
              : editingEmail
                ? "حفظ التعديلات"
                : "إنشاء المستخدم"}
          </button>
          {editingEmail && (
            <button className="secondary" disabled={saving} onClick={reset}>
              إلغاء التعديل
            </button>
          )}
        </div>
      </section>
      <Card title="المستخدمون الحاليون" action={`${unique.length} مستخدم`}>
        <LiveState loading={loading} error="" empty={!unique.length} />
        {!loading && unique.length > 0 && (
          <div className="access-users">
            {unique.map((row) => {
              let perms: string[] = [];
              try {
                perms = JSON.parse(row.permissions || "[]");
              } catch {}
              return (
                <article key={row.email}>
                  <div className="user-avatar">
                    {(row.display_name || row.email).slice(0, 2)}
                  </div>
                  <div>
                    <b>{row.display_name || row.email}</b>
                    <span>
                      {row.email} · {roleNames[row.role] || row.role} ·{" "}
                      {row.has_password ? "دخول مفعّل" : "بحاجة كلمة مرور"}
                    </span>
                  </div>
                  <em className={`pill ${row.active ? "green" : "red"}`}>
                    {row.active ? "مفعّل" : "موقوف"}
                  </em>
                  <p>
                    {perms
                      .map((x) => permissionLabels[x])
                      .filter(Boolean)
                      .join(" · ") || "دون صلاحيات فردية"}
                  </p>
                  <div className="staff-card-actions">
                    <button
                      className="link"
                      disabled={saving}
                      onClick={() => edit(row)}
                    >
                      تعديل البيانات والصلاحيات
                    </button>
                    <button
                      className={`permission-toggle ${row.active ? "stop" : "start"}`}
                      disabled={saving}
                      onClick={() => updateStatus(row)}
                    >
                      {row.active ? "إيقاف الدخول" : "تفعيل الدخول"}
                    </button>
                    <button
                      className="staff-delete"
                      disabled={saving}
                      onClick={() => remove(row)}
                    >
                      حذف الحساب
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Reservations({ kind = "حجز مقعد" }: { kind?: string }) {
  const [rows, setRows] = useState<LiveReservation[]>([]),
    [programs, setPrograms] = useState<Program[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [editing, setEditing] = useState(""),
    [programFilter, setProgramFilter] = useState("الكل"),
    [statusFilter, setStatusFilter] = useState("الكل"),
    [cohort, setCohort] = useState(""),
    [startDate, setStartDate] = useState(""),
    [assignmentDate, setAssignmentDate] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [a, b] = await Promise.all([
        apiJson(`/api/reservations?kind=${encodeURIComponent(kind)}`),
        apiJson("/api/programs"),
      ]);
      setRows(a.reservations || []);
      setPrograms(b.programs || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [kind]);
  const post = async (body: Record<string, string>) => {
    try {
      await apiJson("/api/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const transfer = (row: LiveReservation) => {
    const target = programs.find((p) => p.id !== row.program_id);
    if (!target) {
      setError("لا يوجد برنامج آخر متاح للنقل.");
      return;
    }
    void post({
      action: "request_transfer",
      reservationId: row.id,
      targetProgramId: target.id,
      targetCohortLabel: "الدفعة القادمة",
    });
  };
  if (loading || error)
    return <LiveState loading={loading} error={error} empty={false} />;
  if (!rows.length)
    return (
      <div className="ops-empty guided-empty">
        <b>
          {kind === "برنامج مباشر"
            ? "لا توجد برامج مباشرة مجدولة"
            : "لا توجد حجوزات مقاعد حالية"}
        </b>
        <span>
          {kind === "برنامج مباشر"
            ? "تظهر هنا التسجيلات المصنفة كبرنامج مباشر بعد تحديد الدفعة وتاريخ البداية وتاريخ الإسناد."
            : "تظهر هنا الحجوزات فور تسجيل رسوم حجز المقعد."}
        </span>
      </div>
    );
  const schedule = async (row: LiveReservation) => {
    await post({
      action: "schedule_start",
      reservationId: row.id,
      cohortLabel: cohort,
      startDate,
      assignmentDate,
    });
    setEditing("");
  };
  const reservationPrograms = Array.from(
    new Set(rows.map((row) => row.program_name).filter(Boolean)),
  );
  const reservationStatuses = Array.from(
    new Set(rows.map((row) => row.status).filter(Boolean)),
  );
  const filteredReservations = rows.filter(
    (row) =>
      (programFilter === "الكل" || row.program_name === programFilter) &&
      (statusFilter === "الكل" || row.status === statusFilter),
  );
  return (
    <div className="reservation-workspace">
      <CustomerSmartFilters
        programs={reservationPrograms}
        statuses={reservationStatuses}
        program={programFilter}
        status={statusFilter}
        total={rows.length}
        visible={filteredReservations.length}
        onProgram={setProgramFilter}
        onStatus={setStatusFilter}
      />
      <div className="reservation-flow">
        <div>
          <i>1</i>
          <b>{kind === "برنامج مباشر" ? "تسجيل البرنامج" : "حجز مؤكد"}</b>
          <span>
            {kind === "برنامج مباشر"
              ? "تم تسجيل العميل والدفعة"
              : "تم تسجيل الرسوم"}
          </span>
        </div>
        <div>
          <i>2</i>
          <b>تحديد المواعيد</b>
          <span>بدء البرنامج والإسناد</span>
        </div>
        <div>
          <i>3</i>
          <b>بانتظار الإسناد</b>
          <span>
            يبقى ضمن {kind === "برنامج مباشر" ? "البرامج المباشرة" : "الحجوزات"}
          </span>
        </div>
        <div>
          <i>4</i>
          <b>تهيئة العميل</b>
          <span>انتقال تلقائي في الموعد</span>
        </div>
      </div>
      <Card
        title={
          kind === "برنامج مباشر"
            ? "البرامج المباشرة المجدولة"
            : "حجوزات المقاعد"
        }
        action={`${rows.filter((x) => x.status !== "تم التحويل").length} بطاقة نشطة`}
      >
        <div className="reservation-list">
          {filteredReservations.map((row) => (
            <article
              className={row.status === "تم التحويل" ? "converted" : ""}
              key={row.id}
            >
              <div className="reservation-person">
                <i>{row.customer_name.slice(0, 2)}</i>
                <div>
                  <b>{row.customer_name}</b>
                  <span>{row.id}</span>
                </div>
              </div>
              <div>
                <span>البرنامج</span>
                <b>{row.program_name}</b>
              </div>
              <div>
                <span>الدفعة</span>
                <b>{row.cohort_label || "لم تحدد"}</b>
              </div>
              <div>
                <span>تاريخ بدء البرنامج</span>
                <b>{row.start_date || "لم يحدد"}</b>
              </div>
              <div>
                <span>تاريخ الإسناد</span>
                <b>{row.assignment_date || "لم يحدد"}</b>
              </div>
              <div>
                <span>
                  {kind === "برنامج مباشر" ? "المبلغ المسجل" : "رسوم الحجز"}
                </span>
                <b>
                  {Number(row.fee_amount).toLocaleString("ar-SA-u-nu-latn")} ر.س
                </b>
              </div>
              <em
                className={`pill ${row.status === "تم التحويل" ? "green" : row.status === "بانتظار الإسناد" ? "amber" : "blue"}`}
              >
                {row.status}
              </em>
              <div className="reservation-actions">
                {["مؤكد", "بانتظار البدء", "بانتظار الإسناد"].includes(
                  row.status,
                ) && (
                  <button
                    className="link"
                    onClick={() => {
                      setEditing(row.id);
                      setCohort(row.cohort_label || "");
                      setStartDate(row.start_date || "");
                      setAssignmentDate(row.assignment_date || "");
                    }}
                  >
                    تعديل الدفعة والمواعيد
                  </button>
                )}
                {row.status === "بانتظار الإسناد" && (
                  <span className="pill amber">
                    سينتقل تلقائياً إلى تهيئة العميل
                  </span>
                )}
                {kind === "حجز مقعد" && row.status === "مؤكد" && (
                  <button className="secondary" onClick={() => transfer(row)}>
                    طلب نقل
                  </button>
                )}
              </div>
              {editing === row.id && (
                <div className="reservation-schedule">
                  <label>
                    اسم الدفعة
                    <input
                      value={cohort}
                      onChange={(e) => setCohort(e.target.value)}
                      placeholder="مثال: دفعة سبتمبر 2026"
                    />
                  </label>
                  <label>
                    تاريخ بدء البرنامج
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </label>
                  <label>
                    تاريخ الإسناد
                    <input
                      type="date"
                      max={startDate || undefined}
                      value={assignmentDate}
                      onChange={(e) => setAssignmentDate(e.target.value)}
                    />
                  </label>
                  <button
                    className="primary"
                    disabled={
                      !cohort ||
                      !startDate ||
                      !assignmentDate ||
                      assignmentDate > startDate
                    }
                    onClick={() => schedule(row)}
                  >
                    حفظ المواعيد
                  </button>
                  <button className="secondary" onClick={() => setEditing("")}>
                    إلغاء
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}

type ReservationTransferReview = {
  id: string;
  status: string;
  customer_name: string;
  source_program_name: string;
  target_program_name: string;
  target_cohort_label?: string;
  requested_by_email?: string;
  requested_at?: string;
  financial_decision?: string;
  fee_amount: number;
};

function TransferReviews() {
  const [rows, setRows] = useState<ReservationTransferReview[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(""),
    [decision, setDecision] = useState<Record<string, string>>({});
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRows((await apiJson("/api/reservation-transfers")).transfers || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const review = async (
    row: ReservationTransferReview,
    result: "approve" | "reject",
  ) => {
    setSaving(row.id);
    setError("");
    try {
      await apiJson("/api/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "review_transfer",
          transferId: row.id,
          decision: result,
          financialDecision: decision[row.id] || "",
        }),
      });
      window.dispatchEvent(new Event("sulukera:data-changed"));
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving("");
    }
  };
  const pending = rows.filter((row) => row.status === "بانتظار المالية");
  if (loading)
    return (
      <div className="transfer-review-panel">
        <div className="ops-empty compact">جارٍ تحميل طلبات نقل المقاعد…</div>
      </div>
    );
  return (
    <section className="transfer-review-panel">
      <header>
        <div>
          <span>مراجعة المالية</span>
          <h2>طلبات نقل المقاعد</h2>
          <p>
            اعتماد النقل ينشئ حجزًا جديدًا في البرنامج المستهدف ويحفظ الحجز
            السابق في السجل.
          </p>
        </div>
        <b>{pending.length}</b>
      </header>
      {error && <div className="ops-error compact">{error}</div>}
      {pending.length ? (
        <div className="transfer-review-list">
          {pending.map((row) => (
            <article key={row.id}>
              <div className="transfer-review-person">
                <i>{row.customer_name.slice(0, 2)}</i>
                <div>
                  <b>{row.customer_name}</b>
                  <span>{row.id}</span>
                </div>
                <em className="pill amber">{row.status}</em>
              </div>
              <div className="transfer-route">
                <p>
                  <span>من البرنامج</span>
                  <b>{row.source_program_name}</b>
                </p>
                <i>←</i>
                <p>
                  <span>إلى البرنامج</span>
                  <b>{row.target_program_name}</b>
                  <small>{row.target_cohort_label || "دون دفعة محددة"}</small>
                </p>
              </div>
              <div className="transfer-review-meta">
                <span>
                  رسوم المقعد:{" "}
                  <b>
                    {Number(row.fee_amount || 0).toLocaleString("en-US")} ر.س
                  </b>
                </span>
                <span>
                  طُلب بواسطة: <b>{row.requested_by_email || "—"}</b>
                </span>
              </div>
              <textarea
                value={decision[row.id] || ""}
                onChange={(e) =>
                  setDecision((current) => ({
                    ...current,
                    [row.id]: e.target.value,
                  }))
                }
                placeholder="قرار أو ملاحظة المالية (اختياري)"
              />
              <div className="transfer-review-actions">
                <button
                  className="primary"
                  disabled={saving === row.id}
                  onClick={() => review(row, "approve")}
                >
                  {saving === row.id ? "جارٍ التنفيذ…" : "اعتماد النقل"}
                </button>
                <button
                  className="secondary danger"
                  disabled={saving === row.id}
                  onClick={() => review(row, "reject")}
                >
                  رفض الطلب
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="ops-empty compact">
          لا توجد طلبات نقل بانتظار مراجعة المالية.
        </div>
      )}
    </section>
  );
}

function LiveFinance() {
  const [rows, setRows] = useState<FinanceOrder[]>([]),
    [financeTab, setFinanceTab] = useState<"sales" | "collections">("sales"),
    [summary, setSummary] = useState({
      total: 0,
      paid: 0,
      remaining: 0,
      overdue: 0,
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<FinanceOrder | null>(null),
    [total, setTotal] = useState(""),
    [count, setCount] = useState("4"),
    [regularAmountInput, setRegularAmountInput] = useState(""),
    [firstPaymentAmount, setFirstPaymentAmount] = useState(""),
    [legacySeatFee, setLegacySeatFee] = useState(""),
    [finalAmount, setFinalAmount] = useState(""),
    [scheduleEdit, setScheduleEdit] = useState<"auto"|"regular"|"final"|"existing">("auto"),
    [start, setStart] = useState(new Date().toISOString().slice(0, 10)),
    [installmentRefs,setInstallmentRefs]=useState<Record<string,string>>({}),
    [installmentMethods,setInstallmentMethods]=useState<Record<string,string>>({}),
    [installmentDueDates,setInstallmentDueDates]=useState<Record<string,string>>({}),
    [installmentPaymentDates,setInstallmentPaymentDates]=useState<Record<string,string>>({}),
    [paymentRecordDate,setPaymentRecordDate]=useState(""),
    [selectedPaymentRecordId,setSelectedPaymentRecordId]=useState(""),
    [programFilter, setProgramFilter] = useState("الكل"),
    [statusFilter, setStatusFilter] = useState("الكل"),
    [saving, setSaving] = useState(false);
  const syncScheduleFromSavedTable = (row: FinanceOrder) => {
    const openInstallments = [...row.installments]
      .filter((item) => item.status !== "مدفوع")
      .sort((a, b) => Number(a.sequence) - Number(b.sequence));
    if (!openInstallments.length) {
      setCount("4");
      setStart(new Date().toISOString().slice(0, 10));
      setRegularAmountInput("");
      setFinalAmount("");
      setScheduleEdit("auto");
      return;
    }
    setCount(String(openInstallments.length));
    setStart(String(openInstallments[0].due_date || "").slice(0, 10));
    setRegularAmountInput(openInstallments.length > 1 ? Number(openInstallments[0].amount).toFixed(2) : "0.00");
    setFinalAmount(Number(openInstallments[openInstallments.length - 1].amount).toFixed(2));
    setScheduleEdit("existing");
  };
  const load = async (keepId?: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiJson("/api/finance");
      const list = data.orders || [];
      setRows(list);
      setSummary(data.summary || summary);
      if (keepId) {
        const updated =
          list.find((x: FinanceOrder) => x.order_id === keepId) || null;
        setSelected(updated);
        if (updated) {
          setTotal(String(updated.total));
          setFirstPaymentAmount(String(firstPayment(updated)?.amount||0));
          setLegacySeatFee(String(updated.seat_fee || ""));
          syncScheduleFromSavedTable(updated);
          setInstallmentDueDates(Object.fromEntries(updated.installments.map((item: FinanceInstallment) => [item.id, String(item.due_date).slice(0,10)])));
          setInstallmentPaymentDates(Object.fromEntries(updated.installments.filter((item: FinanceInstallment) => item.paid_at).map((item: FinanceInstallment) => [item.id, String(item.paid_at).slice(0,10)])));
        }
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const open = (row: FinanceOrder) => {
    setSelected(row);
    setTotal(String(row.total));
    setFirstPaymentAmount(String(firstPayment(row)?.amount||0));
    setLegacySeatFee(String(row.seat_fee || ""));
    const defaultPayment = financeTab === "sales"
      ? row.payments.find((payment) => payment.flow_type === "sale") || firstPayment(row)
      : [...row.payments].filter((payment) => payment.flow_type === "collection").sort((a,b) => String(b.paid_at || b.created_at || "").localeCompare(String(a.paid_at || a.created_at || "")))[0] || firstPayment(row);
    setSelectedPaymentRecordId(defaultPayment?.id || "");
    syncScheduleFromSavedTable(row);
    setInstallmentDueDates(Object.fromEntries(row.installments.map((item) => [item.id, String(item.due_date).slice(0,10)])));
    setInstallmentPaymentDates(Object.fromEntries(row.installments.filter((item) => item.paid_at).map((item) => [item.id, String(item.paid_at).slice(0,10)])));
  };
  const post = async (body: Record<string, unknown>) => {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      await apiJson("/api/finance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: selected.order_id, ...body }),
      });
      await load(selected.order_id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  const sar = (n: number) =>
    `${Number(n || 0).toLocaleString("ar-SA-u-nu-latn", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;
  const financeStatus = (row: FinanceOrder) => {
    const today = new Date().toISOString().slice(0, 10);
    if (row.finance_review_status === "pending") return "بانتظار المراجعة";
    if (row.remaining === 0) return "مدفوع";
    const openInstallments = row.installments.filter(
      (item) => item.status !== "مدفوع",
    );
    if (
      openInstallments.some(
        (item) =>
          item.display_status === "متأخر" ||
          ["تذكير ثالث", "إنذار", "تطبيق السياسة"].includes(item.status),
      )
    )
      return "متأخر";
    if (openInstallments.some((item) => item.due_date === today))
      return "مستحق اليوم";
    if (openInstallments.length) return "أقساط نشطة";
    if (row.paid > 0) return "دفعة جزئية";
    return "غير مدفوع";
  };
  const subscriptionMeta = (row: FinanceOrder) => {
    const items: string[] = [];
    if (row.program_track && !["غير محدد", "—"].includes(row.program_track)) items.push(`المسار: ${row.program_track}`);
    if (row.program_delivery) items.push(`النمط: ${row.program_delivery}`);
    if (row.order_type === "إشراف") items.push("إشراف");
    if (Number(row.competency_assessment || 0) > 0) items.push("مع تقييم كفاءة");
    return items;
  };
  const firstPayment = (row: FinanceOrder) =>
    [...row.payments].sort((a, b) =>
      String(a.paid_at || a.created_at || "").localeCompare(
        String(b.paid_at || b.created_at || ""),
      ),
    )[0];
  const salesEntries = rows
    .map((row) => {
      const payment =
        row.payments.find((item) => item.flow_type === "sale") ||
        firstPayment(row);
      return payment ? { row, payment } : null;
    })
    .filter(
      (entry): entry is { row: FinanceOrder; payment: FinancePayment } =>
        Boolean(entry),
    );
  const saleStatus = ({ row, payment }: (typeof salesEntries)[number]) => {
    if (
      row.finance_review_status === "pending" ||
      payment.classification_status === "pending"
    )
      return "بانتظار المراجعة";
    if (String(payment.reconciliation_status || "").includes("مرفوض"))
      return "مرفوض";
    return "مكتملة";
  };
  const todayKey = new Date().toISOString().slice(0, 10);
  const monthKey = todayKey.slice(0, 7);
  const saleDate = (payment: FinancePayment) =>
    String(payment.paid_at || payment.created_at || "").slice(0, 10);
  const salesTotal = salesEntries.reduce(
    (sum, entry) => sum + Number(entry.payment.amount || 0),
    0,
  );
  const salesToday = salesEntries
    .filter((entry) => saleDate(entry.payment) === todayKey)
    .reduce((sum, entry) => sum + Number(entry.payment.amount || 0), 0);
  const salesMonth = salesEntries
    .filter((entry) => saleDate(entry.payment).startsWith(monthKey))
    .reduce((sum, entry) => sum + Number(entry.payment.amount || 0), 0);
  const salesPending = salesEntries.filter(
    (entry) => saleStatus(entry) === "بانتظار المراجعة",
  ).length;
  const collectionPayments = rows.flatMap((row) =>
    row.payments.filter((payment) => payment.flow_type === "collection"),
  );
  const collectionsToday = collectionPayments
    .filter((payment) => saleDate(payment) === todayKey)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const collectionsMonth = collectionPayments
    .filter((payment) => saleDate(payment).startsWith(monthKey))
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const collectionsTotal = collectionPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );
  const financePrograms = Array.from(
    new Set(rows.map((row) => row.program_name).filter(Boolean)),
  );
  const collectionRows=rows.filter(row=>(row.payment_plan==="أقساط"||row.order_type==="إشراف")&&row.finance_review_status==="approved");
  const collectionStatuses = [
    "بانتظار المراجعة",
    "متأخر",
    "مستحق اليوم",
    "أقساط نشطة",
    "دفعة جزئية",
    "غير مدفوع",
    "مدفوع",
  ].filter((status) => collectionRows.some((row) => financeStatus(row) === status));
  const salesStatuses = ["بانتظار المراجعة", "مكتملة", "مرفوض"].filter(
    (status) => salesEntries.some((entry) => saleStatus(entry) === status),
  );
  const activeStatuses =
    financeTab === "sales" ? salesStatuses : collectionStatuses;
  const filteredFinance = collectionRows.filter(
    (row) =>
      (programFilter === "الكل" || row.program_name === programFilter) &&
      (statusFilter === "الكل" || financeStatus(row) === statusFilter),
  );
  const filteredSales = salesEntries.filter(
    ({ row, payment }) =>
      (programFilter === "الكل" || row.program_name === programFilter) &&
      (statusFilter === "الكل" ||
        saleStatus({ row, payment }) === statusFilter),
  );
  const scheduleCount = Math.max(1, Math.floor(Number(count || 0)));
  const scheduleRemaining = selected
    ? Math.max(Number(total || 0) - selected.paid, 0)
    : 0;
  const scheduleRemainingCents = Math.round(scheduleRemaining * 100);
  const automaticRegularCents = Math.floor(
    scheduleRemainingCents / scheduleCount,
  );
  const automaticFinalCents =
    scheduleRemainingCents - automaticRegularCents * (scheduleCount - 1);
  const requestedFinalCents = (scheduleEdit==="final"||scheduleEdit==="existing")&&finalAmount
    ? Math.round(Number(finalAmount) * 100)
    : automaticFinalCents;
  const regularAmountCents = scheduleCount<=1?0:(scheduleEdit==="regular"||scheduleEdit==="existing")&&regularAmountInput
    ? Math.round(Number(regularAmountInput)*100)
    : scheduleEdit==="final"
      ? Math.round((scheduleRemainingCents-requestedFinalCents)/(scheduleCount-1))
      : automaticRegularCents;
  const normalizedFinalCents =
    scheduleRemainingCents - regularAmountCents * (scheduleCount - 1);
  const regularAmount = Math.max(regularAmountCents, 0) / 100;
  const normalizedFinalAmount = Math.max(normalizedFinalCents, 0) / 100;
  const scheduleTotal =
    regularAmount * Math.max(scheduleCount - 1, 0) + normalizedFinalAmount;
  const defaultReferencePayment = selected
    ? financeTab === "sales"
      ? selected.payments.find((payment) => payment.flow_type === "sale") ||
        firstPayment(selected)
      : [...selected.payments]
          .filter((payment) => payment.flow_type === "collection")
          .sort((a, b) =>
            String(b.paid_at || b.created_at || "").localeCompare(
              String(a.paid_at || a.created_at || ""),
            ),
          )[0] || firstPayment(selected)
    : undefined;
  const selectedReferencePayment = selected?.payments.find((payment) => payment.id === selectedPaymentRecordId) || defaultReferencePayment;
  const selectedFirstProgramPayment=selected?firstPayment(selected):undefined;
  useEffect(() => {
    setPaymentRecordDate(String(selectedReferencePayment?.paid_at || selectedReferencePayment?.created_at || "").slice(0,10));
  }, [selectedReferencePayment?.id, selectedReferencePayment?.paid_at, selectedReferencePayment?.created_at]);
  const updatePaymentReference = (paymentId: string, paymentReference: string) => {
    const updateOrder = (row: FinanceOrder) => ({
      ...row,
      payments: row.payments.map((payment) =>
        payment.id === paymentId
          ? { ...payment, reference: paymentReference }
          : payment,
      ),
    });
    setRows((current) => current.map((row) => updateOrder(row)));
    setSelected((current) => (current ? updateOrder(current) : current));
  };
  return (
    <>
      <div className="finance-tabs" role="tablist" aria-label="أقسام المالية">
        <button
          role="tab"
          aria-selected={financeTab === "sales"}
          className={financeTab === "sales" ? "active" : ""}
          onClick={() => {
            setFinanceTab("sales");
            setStatusFilter("الكل");
          }}
        >
          <BadgeDollarSign size={20} />
          <span><b>المبيعات</b><small>الدفعة الأولى والدفع الكامل</small></span>
          <em>{salesEntries.length}</em>
        </button>
        <button
          role="tab"
          aria-selected={financeTab === "collections"}
          className={financeTab === "collections" ? "active" : ""}
          onClick={() => {
            setFinanceTab("collections");
            setStatusFilter("الكل");
          }}
        >
          <HandCoins size={20} />
          <span><b>التحصيل</b><small>الأقساط والدفعات اللاحقة</small></span>
          <em>{rows.filter((row) => row.remaining > 0).length}</em>
        </button>
      </div>
      <div className="kpis finance-kpis">
        {financeTab === "sales" ? (
          <>
            <Kpi title="مبيعات اليوم" value={salesToday.toLocaleString("ar-SA-u-nu-latn")} tag="ر.س" note="دفعات أولى ودفع كامل" tone="blue" />
            <Kpi title="مبيعات الشهر" value={salesMonth.toLocaleString("ar-SA-u-nu-latn")} tag="ر.س" note="من بداية الشهر الحالي" tone="green" />
            <Kpi title="إجمالي المبيعات" value={salesTotal.toLocaleString("ar-SA-u-nu-latn")} tag="ر.س" note="الحركات المسجلة" tone="blue" />
            <Kpi title="بانتظار المراجعة" value={String(salesPending)} tag="عملية" note="تحتاج إجراء مالي" tone="amber" />
          </>
        ) : (
          <>
            <Kpi title="تحصيل اليوم" value={collectionsToday.toLocaleString("ar-SA-u-nu-latn")} tag="ر.س" note="أقساط مسجلة اليوم" tone="green" />
            <Kpi title="تحصيل الشهر" value={collectionsMonth.toLocaleString("ar-SA-u-nu-latn")} tag="ر.س" note="الأقساط منذ بداية الشهر" tone="blue" />
            <Kpi title="المتبقي" value={Number(summary.remaining).toLocaleString("ar-SA-u-nu-latn")} tag="ر.س" note="بعد خصم جميع الدفعات" tone="amber" />
            <Kpi title="إجمالي التحصيل" value={collectionsTotal.toLocaleString("ar-SA-u-nu-latn")} tag="ر.س" note={`${summary.overdue} قسط متأخر`} tone="red" />
          </>
        )}
      </div>
      <LiveState loading={loading} error={error} empty={!rows.length} />
      {!loading && !error && rows.length > 0 && (
        <>
          <CustomerSmartFilters
            programs={financePrograms}
            statuses={activeStatuses}
            program={programFilter}
            status={statusFilter}
            total={financeTab === "sales" ? salesEntries.length : rows.length}
            visible={financeTab === "sales" ? filteredSales.length : filteredFinance.length}
            onProgram={setProgramFilter}
            onStatus={setStatusFilter}
          />
          <div className={`finance-order-list ${financeTab}`}>
          {financeTab === "sales" ? filteredSales.map(({row,payment}) => (
            <article className={`finance-order-card sale-card ${saleStatus({row,payment}) === "مكتملة" ? "settled" : ""}`} onClick={() => open(row)} key={payment.id}>
              <div className="finance-order-head"><i><ReceiptText size={18}/></i><div><b>{row.customer_name}</b><span>{row.program_name}</span><small className="finance-order-number">{row.order_id}</small></div><em className={`pill ${saleStatus({row,payment}) === "بانتظار المراجعة" ? "amber" : "green"}`}>{saleStatus({row,payment})}</em></div>
              {subscriptionMeta(row).length>0&&<div className="finance-subscription-meta">{subscriptionMeta(row).map(item=><span key={item}>{item}</span>)}</div>}
              <div className="finance-order-money sale-money"><p className="paid"><span>المدفوع من البرنامج</span><b>{sar(payment.amount)}</b></p>{row.seat_fee>0&&<p className="seat-fee-paid"><span>رسوم المقعد</span><b>{sar(row.seat_fee)}</b></p>}<p><span>نوع العملية</span><b>{row.payment_plan === "أقساط" ? "دفعة أولى" : "دفع كامل"}</b></p><p><span>وسيلة الدفع</span><b>{payment.method || row.purchase_source}</b></p></div>
              <footer><span>{saleDate(payment) || "دون تاريخ"}</span><span>{payment.reference || "دون مرجع"}</span><b>فتح الملف المالي ←</b></footer>
            </article>
          )) : filteredFinance.map((row) => (
            <article
              className={`finance-order-card ${financeStatus(row) === "مدفوع" ? "settled" : financeStatus(row) === "متأخر" ? "late" : ""}`}
              onClick={() => open(row)}
              key={row.order_id}
            >
              <div className="finance-order-head">
                <i>﷼</i>
                <div>
                  <b>{row.customer_name}</b>
                  <span>
                    {row.program_name}
                  </span>
                  <small className="finance-order-number">{row.order_id}</small>
                </div>
                <em
                  className={`pill ${row.finance_review_status === "pending" ? "amber" : row.remaining === 0 ? "green" : "blue"}`}
                >
                  {financeStatus(row)}
                </em>
              </div>
              {subscriptionMeta(row).length>0&&<div className="finance-subscription-meta">{subscriptionMeta(row).map(item=><span key={item}>{item}</span>)}</div>}
              <div className="finance-order-money">
                <p>
                  <span>الإجمالي</span>
                  <b>{sar(row.total)}</b>
                </p>
                <p className="paid">
                  <span>المدفوع من البرنامج</span>
                  <b>{sar(row.paid)}</b>
                </p>
                {row.seat_fee>0&&<p className="seat-fee-paid"><span>رسوم المقعد</span><b>{sar(row.seat_fee)}</b></p>}
                <p className="remaining">
                  <span>المتبقي</span>
                  <b>{sar(row.remaining)}</b>
                </p>
              </div>
              <footer>
                <span>{row.payments.length} دفعة مسجلة</span>
                <span>
                  {row.installments.filter((x) => x.status !== "مدفوع").length}{" "}
                  قسط متبقٍ
                </span>
                <em className={`payment-behavior-badge ${row.payment_behavior?.tone || "neutral"}`}>سلوك السداد: {row.payment_behavior?.label || "جديد"}</em>
                <b>فتح الملف المالي ←</b>
              </footer>
            </article>
          ))}
          </div>
        </>
      )}
      {selected && (
        <>
          <div className="overlay" onClick={() => setSelected(null)} />
          <aside className="drawer finance-center-drawer">
            <button className="close" onClick={() => setSelected(null)}>
              ×
            </button>
            <div className="person">
              <i>﷼</i>
              <div>
                <h2>{selected.customer_name}</h2>
                <p>
                  {selected.customer_id} · {selected.program_name}
                </p>
                {subscriptionMeta(selected).length>0&&<div className="drawer-subscription-meta">{subscriptionMeta(selected).map(item=><span key={item}>{item}</span>)}</div>}
              </div>
            </div>
            <div className="finance-reference-strip">
              <PaymentReferenceControl
                paymentId={selectedReferencePayment?.id}
                initialReference={selectedReferencePayment?.reference}
                canEdit
                onSaved={(paymentReference) =>
                  selectedReferencePayment &&
                  updatePaymentReference(
                    selectedReferencePayment.id,
                    paymentReference,
                  )
                }
              />
              {selectedReferencePayment && <label className="finance-payment-date"><span>تاريخ السداد</span><span><input type="date" value={paymentRecordDate} onChange={(e)=>setPaymentRecordDate(e.target.value)}/><button type="button" disabled={saving || !paymentRecordDate || paymentRecordDate === String(selectedReferencePayment.paid_at || selectedReferencePayment.created_at || "").slice(0,10)} onClick={()=>post({action:"update_payment_record_date",paymentId:selectedReferencePayment.id,paymentDate:paymentRecordDate})}>حفظ</button></span></label>}
            </div>
            {error && <div className="ops-error compact">{error}</div>}
            {selected.undo_available && (
              <div className="finance-undo-bar">
                <div><b>آخر إجراء قابل للتراجع</b><span>{selected.undo_available.label}</span></div>
                <button type="button" disabled={saving} onClick={() => window.confirm(`سيتم عكس إجراء: ${selected.undo_available?.label}. سيُحفظ التراجع في سجل النظام. هل تريد المتابعة؟`) && post({action:"undo_last_finance_action"})}>تراجع عن آخر إجراء</button>
              </div>
            )}
            <div className="finance-hero">
              <p>
                <span>إجمالي البرنامج بعد الخصم</span>
                <b>{sar(selected.total)}</b>
              </p>
              <p>
                <span>المدفوع من قيمة البرنامج</span>
                <b>{sar(selected.paid)}</b>
              </p>
              <p>
                <span>المتبقي</span>
                <b>{sar(selected.remaining)}</b>
              </p>
              <p className="discount-rate">
                <span>نسبة الخصم</span>
                <b>{Number(selected.discount_percent || 0).toLocaleString("en-US")}%</b>
              </p>
              {Number(selected.seat_fee||0)>0&&<p className="seat-fee-paid"><span>رسوم المقعد المدفوعة</span><b>{sar(selected.seat_fee)}</b></p>}
              {Number(selected.seat_fee||0)>0&&<p className="actual-paid-total"><span>إجمالي المدفوع فعلياً</span><b>{sar(selected.paid+selected.seat_fee)}</b></p>}
            </div>
            <div className={`payment-behavior-panel ${selected.payment_behavior?.tone || "neutral"}`}>
              <div><span>سلوك السداد · محسوب تلقائياً</span><b>{selected.payment_behavior?.label || "جديد"}</b></div>
              <p>{selected.payment_behavior?.summary || "لا يوجد سجل أقساط كافٍ للتقييم"}</p>
            </div>
            {selected.finance_review_status === "pending" && (
              <div className="legacy-finance-review">
                <div>
                  <b>هذا الطلب يحتاج مراجعة مالية</b>
                  <span>
                    {selected.payment_plan === "أقساط"
                      ? "اعتماد الدفعة الأولى كمبيعات، ثم تنظيم الأقساط اللاحقة كتحصيل."
                      : selected.purchase_source === "دفع مباشر"
                        ? "مراجعة مستند أو مرجع السداد ثم اعتماد العملية المالية."
                        : "مراجعة واعتماد العملية المالية."}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void post({ action: "approve_finance_review" })}
                >
                  {saving ? "جارٍ الاعتماد..." : "اعتماد المراجعة المالية"}
                </button>
              </div>
            )}
            <Section title="بيانات العميل والطلب">
              <div className="info customer-data finance-customer-profile">
                <label className="finance-profile-phone">
                  رقم الجوال<b dir="ltr">{selected.phone}</b>
                </label>
                <label>
                  البريد الإلكتروني<b dir="ltr">{selected.email}</b>
                </label>
                <label>
                  رقم الطلب<b dir="ltr">{selected.order_id}</b>
                </label>
                <label>
                  مصدر الشراء<b>{selected.purchase_source}</b>
                </label>
                <label>
                  المسار<b>{selected.program_track && !["غير محدد","—"].includes(selected.program_track) ? selected.program_track : "دون مسار"}</b>
                </label>
                <label>
                  نمط البرنامج<b>{selected.program_delivery || "غير محدد"}</b>
                </label>
              </div>
            </Section>
            <Section title="حالة السداد">
              <div className="legacy-seat-fee-tool">
                <div>
                  <b>رسوم حجز المقعد</b>
                  <span>يمكن إضافة الرسوم أو تعديلها. يُطبّق الفرق على إجمالي البرنامج وأول دفعة، بينما يبقى المتبقي وجدول الأقساط ثابتين.</span>
                </div>
                <label>
                  قيمة حجز المقعد
                  <input type="number" min="0.01" step="0.01" value={legacySeatFee} onChange={(e) => setLegacySeatFee(e.target.value)} placeholder="مثال: 200" />
                </label>
                <button type="button" className="secondary" disabled={saving || !(Number(legacySeatFee) > 0) || Math.abs(Number(legacySeatFee) - Number(selected.seat_fee || 0)) < 0.005} onClick={() => window.confirm(`سيتم تحديث رسوم المقعد إلى ${sar(Number(legacySeatFee))} مع بقاء المتبقي والأقساط كما هي. هل تريد المتابعة؟`) && post({action:"set_legacy_seat_fee",seatFee:Number(legacySeatFee)})}>{Number(selected.seat_fee || 0) > 0 ? "حفظ تعديل الرسوم" : "إضافة وفصل الرسوم"}</button>
              </div>
              <div className="schedule-form">
                <label>
                  إجمالي عقد البرنامج · دون رسوم المقعد
                  <input
                    type="number"
                    min={selected.paid}
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                  />
                </label>
                <label>
                  عدد الأقساط
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={count}
                    onChange={(e) => {setCount(e.target.value);setRegularAmountInput("");setFinalAmount("");setScheduleEdit("auto")}}
                  />
                </label>
                <label>
                  الدفعة الأولى من البرنامج · دون رسوم المقعد
                  <span className="editable-money-field"><input type="number" min="0" max={selected.total} step="0.01" value={firstPaymentAmount} onChange={e=>setFirstPaymentAmount(e.target.value)}/><button type="button" disabled={saving||Number(firstPaymentAmount)===Number(selectedFirstProgramPayment?.amount||0)} onClick={()=>post({action:"update_first_payment",amount:Number(firstPaymentAmount||0)})}>حفظ الدفعة</button></span>
                </label>
                <label>
                  المتبقي من عقد البرنامج · دون رسوم المقعد
                  <input type="text" readOnly value={sar(scheduleRemaining)} />
                </label>
                <label>
                  قيمة القسط الشهري · تلقائية وقابلة للتعديل
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    readOnly={scheduleCount===1}
                    value={scheduleCount===1?"0.00":(scheduleEdit==="regular"||scheduleEdit==="existing")?regularAmountInput:regularAmount.toFixed(2)}
                    onChange={(e)=>{setRegularAmountInput(e.target.value);setFinalAmount("");setScheduleEdit("regular")}}
                  />
                </label>
                <label>
                  قيمة الدفعة الأخيرة · اختيارية
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    readOnly={scheduleCount === 1}
                    value={(scheduleEdit==="final"||scheduleEdit==="existing")?finalAmount:""}
                    placeholder={scheduleCount===1?normalizedFinalAmount.toFixed(2):"تُحسب تلقائياً عند تركها فارغة"}
                    onChange={(e) => {setFinalAmount(e.target.value);setRegularAmountInput("");setScheduleEdit("final")}}
                  />
                </label>
                <label>
                  أول استحقاق
                  <input
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </label>
                <button
                  className="primary"
                  disabled={
                    saving || normalizedFinalAmount<=0 || (scheduleCount>1&&regularAmount<=0) || Math.abs(scheduleTotal - scheduleRemaining) >= 0.005
                  }
                  onClick={() =>
                    post({
                      action: "schedule",
                      total,
                      count,
                      regularAmount,
                      finalAmount: normalizedFinalAmount,
                      start,
                    })
                  }
                >
                  {selected.installments.length
                    ? "إعادة جدولة المتبقي"
                    : "إنشاء جدول الأقساط"}
                </button>
              </div>
              <div className={`schedule-check ${Math.abs(scheduleTotal - scheduleRemaining) < 0.005 ? "valid" : ""}`}>
                <span>مجموع الجدول: <b>{sar(scheduleTotal)}</b></span>
                <span>المتبقي المطلوب: <b>{sar(scheduleRemaining)}</b></span>
                <span>الدفعة الأخيرة المحسوبة: <b>{sar(normalizedFinalAmount)}</b></span>
              </div>
              <p className="finance-safety">
                يخصم النظام الدفعة الأولى وجميع الدفعات المسجلة، ثم يقسم المتبقي تلقائياً. عند ترك الدفعة الأخيرة فارغة تُحسب تلقائياً، ويمكن تحديدها فقط إذا كانت الحالة تحتاج مبلغاً مختلفاً. تعديل القسط الشهري يعيد حساب الدفعة الأخيرة، وتعديل الأخيرة يعيد حساب الأقساط الشهرية. إعادة الجدولة تعتمد المتبقي الحالي ولا تحذف أي
                دفعات أو أقساط مسددة.
              </p>
              {selected.installments.length ? (
                <div className="installment-list">
                  {selected.installments.map((inst) => (
                    <article
                      className={
                        inst.display_status === "متأخر"
                          ? "late"
                          : inst.status === "مدفوع"
                            ? "paid"
                            : ""
                      }
                      key={inst.id}
                    >
                      <i>{inst.sequence}</i>
                      <div>
                        <small>القسط {inst.sequence}</small>
                        <b>{sar(inst.amount)}</b>
                        <label className="installment-date-editor due-date-editor"><span>تاريخ الاستحقاق</span><span><input type="date" value={installmentDueDates[inst.id] || String(inst.due_date).slice(0,10)} onChange={(e) => setInstallmentDueDates((current) => ({...current,[inst.id]:e.target.value}))}/><button type="button" disabled={saving || !installmentDueDates[inst.id] || installmentDueDates[inst.id] === String(inst.due_date).slice(0,10)} onClick={() => post({action:"update_installment_due_date",installmentId:inst.id,dueDate:installmentDueDates[inst.id]})}>حفظ</button></span></label>
                        {Boolean(inst.reminder_count) && <small className="installment-reminder-meta">{inst.reminder_count} تذكير · آخر تسجيل بواسطة {inst.last_reminded_by_email}</small>}
                      </div>
                      <label className="installment-behavior"><span>حالة السداد</span><select
                        disabled={inst.status === "مدفوع" || saving}
                        value={inst.status==="مدفوع"?"تم السداد":inst.status}
                        onChange={(e) =>
                          post({
                            action: "installment_status",
                            installmentId: inst.id,
                            status: e.target.value,
                          })
                        }
                      >
                        <option>ملتزم</option>
                        <option>تذكير أول</option>
                        <option>تذكير ثاني</option>
                        <option>تذكير ثالث</option>
                        <option>تذكير نهائي</option>
                        <option>موافقة تمديد</option>
                        <option>تطبيق السياسة</option>
                        <option>متأخر</option>
                        {inst.status === "مدفوع" && <option>تم السداد</option>}
                      </select></label>
                      {inst.status === "مدفوع" ? (
                        <div className="paid-ref">
                          <b>تم السداد</b>
                          <span>{inst.reference}</span>
                          <label className="installment-date-editor installment-payment-date"><span>تاريخ السداد الفعلي</span><span><input type="date" value={installmentPaymentDates[inst.id] || String(inst.paid_at || "").slice(0,10)} onChange={(e) => setInstallmentPaymentDates((current) => ({...current,[inst.id]:e.target.value}))}/><button type="button" disabled={saving || !installmentPaymentDates[inst.id] || installmentPaymentDates[inst.id] === String(inst.paid_at || "").slice(0,10)} onClick={() => post({action:"update_payment_date",installmentId:inst.id,paymentDate:installmentPaymentDates[inst.id]})}>حفظ</button></span></label>
                        </div>
                      ) : (
                        <div className="installment-quick-pay">
                          <select value={installmentMethods[inst.id]||"تحويل بنكي"} onChange={e=>setInstallmentMethods(current=>({...current,[inst.id]:e.target.value}))}><option>تحويل بنكي</option><option>دفع إلكتروني</option><option>PayTabs</option><option>تمارا</option><option>نقدي</option></select>
                          <input value={installmentRefs[inst.id]||""} onChange={e=>setInstallmentRefs(current=>({...current,[inst.id]:e.target.value}))} placeholder="مرجع السداد" />
                          <button className="installment-paid-check" title="تحديد القسط كمدفوع" disabled={saving||!String(installmentRefs[inst.id]||"").trim()} onClick={()=>post({action:"pay_installment",installmentId:inst.id,method:installmentMethods[inst.id]||"تحويل بنكي",reference:String(installmentRefs[inst.id]||"").trim()})}>✓</button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="ops-empty compact">لم يُنشأ جدول أقساط بعد</div>
              )}
            </Section>
            <Section title="سجل الدفعات">
              <div className="payment-history">
                {selected.payments.map((payment) => (
                  <article key={payment.id}>
                    <div>
                      <b>{sar(payment.amount)}</b>
                      <span>
                        {new Date(payment.paid_at || "").toLocaleDateString(
                          "ar-SA-u-nu-latn",
                        )}
                      </span>
                    </div>
                    <p>
                      {payment.method}
                      {payment.reference ? (
                        /^https?:\/\//i.test(payment.reference) ? (
                          <a className="payment-reference-inline" href={payment.reference} target="_blank" rel="noopener noreferrer">فتح مرجع السداد</a>
                        ) : (
                          <small>{payment.reference}</small>
                        )
                      ) : (
                        <small>دون مرجع</small>
                      )}
                      {payment.proof_asset_key && (
                        <a
                          className="receipt-link"
                          href={payment.proof_asset_key}
                          download={`transfer-${payment.id}.jpg`}
                        >
                          تنزيل صورة التحويل
                        </a>
                      )}
                    </p>
                    <i className="pill green">
                      {payment.reconciliation_status || payment.status}
                    </i>
                  </article>
                ))}
              </div>
            </Section>
            <Section title="تحديثات العميل">
              <CustomerNotes customerId={selected.customer_id} />
            </Section>
          </aside>
        </>
      )}
    </>
  );
}

function FormHead({
  n,
  title,
  text,
}: {
  n: string;
  title: string;
  text: string;
}) {
  return (
    <header className="form-head">
      <i>{n}</i>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </header>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Review({ label, value }: { label: string; value: string }) {
  return (
    <p className="review-row">
      <span>{label}</span>
      <b>{value}</b>
    </p>
  );
}

function Kpi({
  title,
  value,
  tag,
  note,
  tone,
}: {
  title: string;
  value: string;
  tag: string;
  note: string;
  tone: string;
}) {
  return (
    <article className={`kpi ${tone}`}>
      <span>{title}</span>
      <div>
        <b>{value}</b>
        <em>{tag}</em>
      </div>
      <p>{note}</p>
    </article>
  );
}
function Card({
  title,
  action,
  children,
  onAction,
}: {
  title: string;
  action: string;
  children: React.ReactNode;
  onAction?: () => void;
}) {
  return (
    <section className="card">
      <header className="card-head">
        <h2>{title}</h2>
        {onAction ? (
          <button onClick={onAction}>{action} ←</button>
        ) : (
          <span>{action}</span>
        )}
      </header>
      {children}
    </section>
  );
}
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="drawer-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
function TaskList() {
  return (
    <div>
      {tasks.map((t) => (
        <div className="task" key={t[1]}>
          <time>{t[0]}</time>
          <i className={t[4]} />
          <div>
            <b>{t[1]}</b>
            <span>{t[2]}</span>
          </div>
          <em className={t[4]}>{t[3]}</em>
          <button>⋯</button>
        </div>
      ))}
    </div>
  );
}
function CustomerTable({
  list,
  open,
}: {
  list: typeof people;
  open: (p: (typeof people)[number]) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>العميل</th>
            <th>البرنامج والدفعة</th>
            <th>قناة الشراء</th>
            <th>حالة العميل</th>
            <th>الخطوة التالية</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id} onClick={() => open(p)}>
              <td>
                <b>{p.name}</b>
                <small>
                  {p.id} · {p.phone}
                </small>
              </td>
              <td>
                <b>{p.program}</b>
                <small>
                  {p.track}
                  {p.cohort !== "—" ? ` · ${p.cohort}` : ""}
                </small>
              </td>
              <td>{p.source}</td>
              <td>
                <span className={`pill ${p.tone}`}>{p.state}</span>
              </td>
              <td>{p.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function customerProgramCategory(customer: (typeof initialPeople)[number]) {
  const program = String(customer.program || "").trim(),
    value = program.toLowerCase();
  if (
    customer.state === "غير مهتم" ||
    value.includes("تجربة") ||
    String(customer.source).includes("تجربة")
  )
    return "التجربة";
  if (!program || program === "—" || value.includes("لا يوجد طلب"))
    return "غير مصنف";
  if (value.includes("تقييم الكفاءة") || value.includes("competency"))
    return "تقييم الكفاءة";
  if (
    value.includes("إدارة السلوك التنظيمي") ||
    value.includes("ادارة السلوك التنظيمي") ||
    value.includes("obm")
  )
    return "إدارة السلوك التنظيمي";
  if (
    value.includes("تحليل السلوك التطبيقي") ||
    value.includes("aba")
  )
    return "تحليل السلوك التطبيقي";
  return "التعليم المستمر";
}

function customerProgramLabel(customer: (typeof initialPeople)[number]) {
  const category = customerProgramCategory(customer);
  const track = String(customer.track || "").trim();
  const hasTrack = track && track !== "—" && track !== "غير محدد";
  if (category === "تحليل السلوك التطبيقي") return hasTrack ? track : "غير محدد";
  if (category === "إدارة السلوك التنظيمي") return hasTrack ? track : "غير محدد";
  if (category === "التعليم المستمر") {
    if (customer.program === "التعليم المستمر" && hasTrack) return track;
    return customer.program || "غير مصنف";
  }
  if (category === "التجربة") return customer.program !== "—" ? customer.program : "تجربة";
  if (category === "غير مصنف") return "غير مصنف";
  return customer.program || category;
}

function CompletedCustomerTable({
  list,
  open,
}: {
  list: typeof initialPeople;
  open: (p: (typeof initialPeople)[number]) => void;
}) {
  return (
    <div className="table-wrap completed-customer-table">
      <table>
        <thead>
          <tr>
            <th>اسم العميل</th>
            <th>البرنامج</th>
            <th>التصنيف</th>
          </tr>
        </thead>
        <tbody>
          {list.map((customer) => (
            <tr key={customer.id} onClick={() => open(customer)}>
              <td>
                <b>{customer.name}</b>
                <small>فتح ملف العميل</small>
              </td>
              <td>
                <b>{customerProgramCategory(customer)}</b>
                <small>
                  {customer.cohort !== "—" ? ` · ${customer.cohort}` : ""}
                </small>
              </td>
              <td>
                <b>{customerProgramLabel(customer)}</b>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
