"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Armchair,
  BadgeDollarSign,
  BriefcaseBusiness,
  Bell,
  BookOpenCheck,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Copy,
  DatabaseBackup,
  Download,
  Eye,
  ExternalLink,
  FileText,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CircleUserRound,
  Database,
  FileChartColumn,
  FolderKanban,
  HandCoins,
  Info,
  Handshake,
  Plus,
  House,
  LayoutDashboard,
  Landmark,
  Layers3,
  ListChecks,
  LogOut,
  Mail,
  Menu,
  MessageSquareText,
  PanelRightClose,
  PanelRightOpen,
  PhoneCall,
  ReceiptText,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  UserPlus,
  UsersRound,
  WalletCards,
  X,
  Check,
  Clock3,
  type LucideIcon,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

type View =
  | "dashboard"
  | "work"
  | "customers"
  | "reservations"
  | "program-activation"
  | "trainee-progress"
  | "contact"
  | "registration"
  | "assignment"
  | "finance"
  | "reports"
  | "users"
  | "programs"
  | "control"
  | "b2b-business"
  | "b2b-partnerships"
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
  | "progress"
  | "b2b"
  | "partnerships"
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
  progress: ChartNoAxesCombined,
  b2b: BriefcaseBusiness,
  partnerships: Handshake,
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
// Enrollment statuses in transition order (app/api/enrollments/transition): [steps done, what happens next].
const customerJourneySteps = ["الشراء", "التواصل", "إنشاء الحساب", "إسناد المقررات", "التحقق من الوصول"];
const customerJourneyStages: Record<string, [number, string]> = {
  "جديد": [1, "بانتظار تسليم العميل والتواصل معه"],
  "تم التواصل": [2, "بانتظار استكمال التسجيل"],
  "بانتظار إنشاء الحساب": [2, "بانتظار إنشاء حساب العميل على المنصة"],
  "اكتمل التسجيل": [2, "بانتظار إنشاء الحساب أو إسناد المقررات"],
  "تم إنشاء الحساب": [3, "بانتظار إسناد المقررات أو تفعيل البرنامج"],
  "تم الإسناد": [4, "بانتظار التحقق من وصول العميل للمقررات"],
  "نشط": [5, "العميل يدرس حاليًا"],
  "مكتمل": [5, "اكتملت رحلة العميل"],
};
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
      ["trainee-progress", "تقدم المتدربين", "progress"],
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
      ["program-activation", "تفعيل البرامج", "programs"],
    ],
  },
  {
    id: "program-management",
    label: "إدارة البرامج",
    icon: FolderKanban,
    collapsible: true,
    items: [
      ["customers", "قاعدة بيانات العملاء", "customers"],
    ],
  },
  {
    id: "b2b",
    label: "قطاع الأعمال B2B",
    icon: BriefcaseBusiness,
    collapsible: true,
    items: [
      ["b2b-partnerships", "الشراكات", "partnerships"],
      ["b2b-business", "مبيعات الأعمال", "b2b"],
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
  customers: ["قاعدة بيانات العملاء", "كل ملفات العملاء مع برنامجهم وحالتهم ومدفوعاتهم"],
  reservations: [
    "حجوزات المقاعد",
    "الحجوزات المؤكدة وطلبات النقل والتحويل إلى تسجيل",
  ],
  "program-activation": ["تفعيل البرامج", "برامج التعليم المستمر المباشرة الجاهزة للتفعيل"],
  "trainee-progress": ["تقدم المتدربين", "متابعة مراحل متدربي شهادة إدارة السلوك التنظيمي بعد التفعيل"],
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
  "b2b-business": ["مبيعات الأعمال", "مؤشرات الجهات ومسار التواصل حتى توقيع الشراكة"],
  "b2b-partnerships": ["الشراكات", "متابعة الاتفاقيات والشركاء بعد التوقيع"],
  new: [
    "تسجيل عميل جديد",
    "تسجيل الطلب مرة واحدة يُنشئ إجراءات الأقسام تلقائياً",
  ],
};

export default function Home() {
  return <AuthGate />;
}
function AuthGate() {
  const [b2bPortal,setB2bPortal]=useState(false),
    [checking, setChecking] = useState(true),
    [authenticated, setAuthenticated] = useState(false),
    [setup, setSetup] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    setB2bPortal(window.location.pathname.toLowerCase().replace(/\/$/, "") === "/b2b");
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
  if (authenticated) return <OperationsApp b2bPortal={b2bPortal} />;
  return (
    <main className="login-page" dir="rtl">
      <section className="login-visual">
        <div className="login-brand">
          <BrandMark />
        </div>
        <div>
          <em>{b2bPortal ? "بوابة فريق الشراكات" : "مساحة عمل واحدة"}</em>
          <h1>
            {b2bPortal ? "كل شراكة." : "كل رحلة عميل."}
            <br />
            واضحة وتحت السيطرة.
          </h1>
          <p>
            {b2bPortal ? "تابع الجهات، حالات التواصل، الاتفاقيات ومراحل التفعيل ضمن نطاق عملك." : "تابع العملاء والبرامج والدفعات ومهام الفريق من نظام عمليات متكامل وآمن."}
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
            className="primary login-submit"
            disabled={saving || !email.trim() || !password}
            onClick={login}
          >
            {saving
              ? "جارٍ الدخول..."
              : setup
                ? "إنشاء الحساب والدخول"
                : "دخول إلى النظام"}
          </button>
        </div>
      </section>
    </main>
  );
}

function OperationsApp({b2bPortal=false}:{b2bPortal?:boolean}) {
  const [view, setView] = useState<View>(b2bPortal ? "b2b-partnerships" : "dashboard"),
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
    [customerNotifications, setCustomerNotifications] = useState<Array<{id:string;created_at:string;actor_name:string;customer_id:string;customer_name:string;program_name?:string;order_number?:string;read_at?:string}>>([]),
    [notificationsReadAt, setNotificationsReadAt] = useState(""),
    [notificationQueueSignature, setNotificationQueueSignature] = useState(""),
    [successNotice, setSuccessNotice] = useState<{ id: number; message: string } | null>(null),
    [financeReviewFilter, setFinanceReviewFilter] = useState("الكل"),
    [currentUser, setCurrentUser] = useState({
      name: "الإدارة",
      email: "",
      roles: ["admin"] as string[],
      permissions: ["*"] as string[],
    });
  useEffect(() => {
    const stored = window.localStorage.getItem("sulukera_notifications_read_at") || "";
    setNotificationsReadAt(stored);
    setNotificationQueueSignature(window.localStorage.getItem("sulukera_notification_queue_signature") || "");
    const loadNotifications = async () => {
      try {
        const data = await apiJson("/api/notifications");
        setCustomerNotifications(data.notifications || []);
      } catch {}
    };
    void loadNotifications();
    // لا نطلب الإشعارات كل دقيقة ونصف من كل حساب مفتوح. الحفظ الفعلي
    // ينعكس فوراً، وهذه فقط مزامنة احتياطية للخلفية.
    const interval = window.setInterval(loadNotifications, 300000);
    const refresh = () => void loadNotifications();
    window.addEventListener("sulukera:data-changed", refresh);
    return () => { window.clearInterval(interval); window.removeEventListener("sulukera:data-changed", refresh); };
  }, []);
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
      const [tasksResult, enrollmentsResult, financeResult] =
        await Promise.allSettled([
          apiJson("/api/tasks"),
          apiJson("/api/enrollments"),
          apiJson("/api/finance"),
        ]);
      if (tasksResult.status === "fulfilled") {
        setTaskCount((tasksResult.value.tasks || []).length);
      }
      const enrollments =
        enrollmentsResult.status === "fulfilled"
          ? enrollmentsResult.value.enrollments || []
          : [];
      const finance =
        financeResult.status === "fulfilled"
          ? financeResult.value.orders || []
          : [];
      const isDirectActivation = (row: LiveEnrollment) =>
        (row.order_type === "تقييم كفاءة" || row.program_name.includes("تقييم الكفاءة") || row.program_delivery === "مباشر" || ["الاقتصاد السلوكي", "انتقائية الطعام"].includes(row.program_name)) &&
        row.order_type !== "إشراف" &&
        !row.program_name.includes("الإشراف");
      setNavCounts({
        contact: enrollments.filter((row: LiveEnrollment) => row.status === "جديد").length,
        registration: enrollments.filter(
          (row: LiveEnrollment) => ["تم التواصل", "بانتظار إنشاء الحساب"].includes(row.status),
        ).length,
        assignment: enrollments.filter((row: LiveEnrollment) =>
          ["اكتمل التسجيل", "تم إنشاء الحساب"].includes(row.status) && !isDirectActivation(row),
        ).length,
        "program-activation": enrollments.filter((row: LiveEnrollment) =>
          isDirectActivation(row) && ["اكتمل التسجيل", "تم إنشاء الحساب"].includes(row.status),
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
    delivery?: string;
    createdAt?: string;
    journeyStatus?: string;
  };
  const selectedJourney = customerJourneyStages[String(selectedDetails.journeyStatus || "")];
  const sar = (value: number) => `${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;
  const has = (permission: string) =>
    currentUser.roles.includes("admin") ||
    currentUser.permissions.includes("*") ||
    currentUser.permissions.includes(permission);
  // POST /api/enrollments/transition accepts academy (and admin) only; other roles get a read-only queue.
  const canAdvanceEnrollments = currentUser.roles.includes("admin") || currentUser.roles.includes("academy");
  // /api/trials: GET allows sales, academy and viewer; POST allows sales only (admin always passes).
  const canViewTrials = ["admin", "sales", "academy", "viewer"].some((role) => currentUser.roles.includes(role));
  const canDecideTrials = currentUser.roles.includes("admin") || currentUser.roles.includes("sales");
  const canOpen = (id: View) =>
    ["dashboard", "work"].includes(id) ||
    (id === "trainee-progress" && (has("customers.view") || has("programs.activate"))) ||
    (id === "customers" && has("customers.view")) ||
    (["contact", "registration"].includes(id) && has("customers.manage")) ||
    (["assignment", "program-activation"].includes(id) && has("programs.activate")) ||
    (id === "finance" && has("finance.view")) ||
    (["b2b-business", "b2b-partnerships"].includes(id) && has("b2b.view")) ||
    (id === "reports" && has("reports.view")) ||
    (id === "users" && has("users.manage")) ||
    (id === "programs" && currentUser.roles.includes("admin")) ||
    (id === "control" && currentUser.roles.includes("admin"));
  const visibleNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(([id]) => canOpen(id) && (!b2bPortal || ["b2b-business","b2b-partnerships"].includes(id))),
    }))
    .filter((group) => group.items.length);
  const go = (id: View) => {
    if (id === "finance") setFinanceReviewFilter("الكل");
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
  const todayISO = new Date().toLocaleDateString("en-CA");
  const currentNavGroup = navGroups.find((group) =>
    group.items.some(([id]) => id === view),
  );
  const headerNotifications = [
    { view: "work" as View, label: "عملاء بحاجة إلى متابعة اليوم", count: taskCount },
    { view: "contact" as View, label: "بانتظار تسليم العميل", count: navCounts.contact || 0 },
    { view: "registration" as View, label: "بانتظار تهيئة العميل", count: navCounts.registration || 0 },
    { view: "assignment" as View, label: "بانتظار تفعيل المقررات", count: navCounts.assignment || 0 },
    { view: "finance" as View, label: "بانتظار الإجراء المالي", count: navCounts.finance || 0 },
  ].filter((item) => item.count > 0 && canOpen(item.view));
  const unreadCustomerNotifications = customerNotifications.filter((item) => !item.read_at && (!notificationsReadAt || item.created_at > notificationsReadAt));
  const currentQueueSignature = headerNotifications.map(item=>`${item.view}:${item.count}`).join("|");
  const notificationBadgeCount = unreadCustomerNotifications.length + (currentQueueSignature && currentQueueSignature !== notificationQueueSignature ? headerNotifications.reduce((sum,item)=>sum+item.count,0) : 0);
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
        <nav aria-label="القائمة الرئيسية">
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
                    aria-label={sidebarCollapsed ? group.label : undefined}
                    title={sidebarCollapsed ? group.label : undefined}
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
                          ? undefined
                          : navCounts[id] ?? badge;
                    return (
                      <button
                        key={id}
                        className={view === id ? "active" : ""}
                        aria-current={view === id ? "page" : undefined}
                        aria-label={sidebarCollapsed ? label : undefined}
                        title={sidebarCollapsed ? label : undefined}
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
            <nav className="sk-crumbs" aria-label="مسار الصفحة">
              <ol>
                <li>
                  {view === "dashboard" ? (
                    <span>سلوكيرا</span>
                  ) : (
                    <button type="button" onClick={() => go("dashboard")}>سلوكيرا</button>
                  )}
                </li>
                {currentNavGroup && currentNavGroup.id !== "start" && <li><span>{currentNavGroup.label}</span></li>}
              </ol>
            </nav>
            <h1>{titles[view][0]}</h1>
          </div>
          <label className="global-search">
            <Search size={18} />
            <input
              aria-label="البحث في العملاء والطلبات والبرامج"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim() && view !== "finance") go("customers");
              }}
              placeholder={view === "finance" ? "ابحث بالاسم أو رقم العميل أو الطلب أو البرنامج..." : "ابحث عن عميل، رقم طلب أو برنامج..."}
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
                const now = new Date().toISOString();
                setNotificationsReadAt(now);
                window.localStorage.setItem("sulukera_notifications_read_at", now);
                setNotificationQueueSignature(currentQueueSignature);
                window.localStorage.setItem("sulukera_notification_queue_signature", currentQueueSignature);
                const unreadIds=unreadCustomerNotifications.map(item=>item.id);
                if(unreadIds.length){setCustomerNotifications(items=>items.map(item=>unreadIds.includes(item.id)?{...item,read_at:now}:item));void fetch("/api/notifications",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({ids:unreadIds})});}
              }}
            >
              <Bell size={18} />
              {notificationBadgeCount > 0 && <i>{notificationBadgeCount}</i>}
            </button>
            {notificationsOpen && (
              <><button className="notifications-backdrop" aria-label="إغلاق الإشعارات" onClick={()=>setNotificationsOpen(false)}/><div className="notifications-menu">
                <header><div><b>الإشعارات</b><span>تم الاطلاع على آخر التحديثات</span></div><button type="button" aria-label="إغلاق الإشعارات" onClick={()=>setNotificationsOpen(false)}>×</button></header>
                {customerNotifications.map((item) => (
                  <button className="customer-created-notification" key={item.id} onClick={() => { setQuery(item.customer_name); go("customers"); setNotificationsOpen(false); }}>
                    <span><b>أضاف {item.actor_name} عميلًا جديدًا</b><small>{item.customer_name} · {item.program_name || "دون برنامج"} · {new Date(item.created_at).toLocaleString("ar-SA-u-nu-latn",{dateStyle:"short",timeStyle:"short"})}</small></span>
                    <em>{item.read_at?"تم الاطلاع":"جديد"}</em>
                  </button>
                ))}
                {headerNotifications.map((item) => (
                  <button key={item.view} onClick={() => { go(item.view); setNotificationsOpen(false); }}>
                    <span><b>{item.label}</b><small>انقر لفتح القائمة ومتابعتها</small></span>
                    <em>{item.count}</em>
                  </button>
                ))}
                {!customerNotifications.length && !headerNotifications.length && <p>لا توجد إشعارات جديدة حاليًا</p>}
              </div></>
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
              aria-label={`حساب ${currentUser.name}`}
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
          <header className="sk-page-head">
            <p>{titles[view][1]}</p>
            <time dateTime={todayISO}>اليوم · {todayLabel}</time>
          </header>
          {view === "dashboard" && (
            <>
              <HomeDashboard onOpenTasks={() => setView("work")} onOpenCustomers={()=>setView("customers")} onOpenFinance={()=>{setFinanceReviewFilter("الكل");setView("finance")}} onOpenFinanceReview={(kind) => { setFinanceReviewFilter(kind); setView("finance"); }} />
            </>
          )}
          {view === "work" && <LiveWork onNavigate={go} onOpenCustomer={open} currentEmail={currentUser.email} />}
          {view === "trainee-progress" && <TraineeProgress canManage={currentUser.roles.includes("admin") || currentUser.roles.includes("academy")} />}
          {view === "customers" && <LiveCustomers query={query} open={open} />}
          {view === "program-activation" && <LiveAcademy focus="program-activation" canManagePaymentReference={currentUser.roles.some((role) => ["admin", "sales", "finance"].includes(role))} canAdvance={canAdvanceEnrollments} />}
          {view === "contact" && (
            <>
              {canViewTrials && <TrialHandoff canDecide={canDecideTrials} />}
              <LiveAcademy focus="contact" canManagePaymentReference={currentUser.roles.some((role) => ["admin", "sales", "finance"].includes(role))} canAdvance={canAdvanceEnrollments} />
              <Registration done={() => setView("customers")} />
            </>
          )}
          {view === "registration" && <LiveAcademy focus="registration" canManagePaymentReference={currentUser.roles.some((role) => ["admin", "sales", "finance"].includes(role))} canAdvance={canAdvanceEnrollments} />}
          {view === "assignment" && <LiveAcademy focus="assignment" canManagePaymentReference={currentUser.roles.some((role) => ["admin", "sales", "finance"].includes(role))} canAdvance={canAdvanceEnrollments} />}
          {view === "finance" && (
            <>
              <TransferReviews />
              <LiveFinance initialReviewFilter={financeReviewFilter} searchQuery={query} />
            </>
          )}
          {view === "b2b-business" && <B2BWorkspace section="business" canManage={has("b2b.manage")} canConvert={has("b2b.partnerships.manage")} />}
          {view === "b2b-partnerships" && <B2BWorkspace section="partnerships" canManage={has("b2b.manage")} canConvert={has("b2b.partnerships.manage")||has("b2b.manage")} />}
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
            className="cp-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-drawer-title"
          >
            <header className="cp-head">
              <button type="button" className="cp-close" aria-label="إغلاق ملف العميل" onClick={() => setPanel(false)}>
                <X size={18} />
              </button>
              <div className="cp-identity">
                <span className="cp-avatar" aria-hidden="true">{selected.name.trim().slice(0, 2)}</span>
                <div>
                  <h2 id="customer-drawer-title">{selected.name}</h2>
                  <p className="cp-meta"><span dir="ltr">{selected.phone}</span><span>{selected.id}</span>{selectedDetails.orderId && selectedDetails.orderId !== "—" && <span>طلب {selectedDetails.orderId}</span>}</p>
                </div>
              </div>
              <div className="cp-tags">
                <em className={`cu-status ${customerStateTone(selected.state)}`}>{selected.state}</em>
                {selectedDetails.delivery && <em className="cp-tag">{selectedDetails.delivery === "مباشر" ? "برنامج مباشر" : selectedDetails.delivery === "مسجل" ? "برنامج مسجل" : selectedDetails.delivery}</em>}
                {selectedDetails.createdAt && <small>أضيف في {new Date(selectedDetails.createdAt).toLocaleString("ar-SA-u-nu-latn",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Riyadh"})}</small>}
              </div>
              <div className="cp-contact">
                <button type="button" className="oh-btn" onClick={openWhatsApp}><FaWhatsapp size={16} aria-hidden="true" />واتساب</button>
                <button type="button" className="oh-btn" disabled={!selectedDetails.email || selectedDetails.email.includes("محجوب")} onClick={() => (window.location.href = `mailto:${selectedDetails.email}`)}><Mail size={16} aria-hidden="true" />إيميل</button>
              </div>
            </header>
            <div className="cp-body">
              {selectedJourney ? (
                <section className="cp-section" aria-labelledby="cp-journey-title">
                  <h3 id="cp-journey-title">رحلة العميل</h3>
                  <ol className="cp-steps">
                    {customerJourneySteps.map((step, index) => {
                      const state = index < selectedJourney[0] ? "done" : index === selectedJourney[0] ? "current" : "todo";
                      return <li key={step} className={state} aria-current={state === "current" ? "step" : undefined}><i aria-hidden="true">{state === "done" ? <Check size={13} /> : index + 1}</i><span>{step}</span></li>;
                    })}
                  </ol>
                  <p className="cp-next">{selectedJourney[1]}</p>
                </section>
              ) : (
                <section className="cp-section" aria-labelledby="cp-state-title">
                  <h3 id="cp-state-title">حالة العميل</h3>
                  <p className="cp-next"><b>{selected.state}</b> · {selected.due}</p>
                </section>
              )}
              <section className="cp-section" aria-labelledby="cp-notes-title">
                <h3 id="cp-notes-title">ملاحظات العميل</h3>
                <CustomerNotes customerId={selected.id} />
              </section>
              <section className="cp-section" aria-labelledby="cp-data-title">
                <h3 id="cp-data-title">بيانات العميل والتسجيل</h3>
                <dl className="cp-ledger">
                  <div><dt>البريد الإلكتروني</dt><dd dir="ltr">{selectedDetails.email || "—"}</dd></div>
                  <div><dt>رقم الجوال</dt><dd dir="ltr">{selected.phone}</dd></div>
                  <div><dt>البرنامج</dt><dd>{selected.program}</dd></div>
                  <div><dt>المسار</dt><dd>{selected.track}</dd></div>
                  <div><dt>قناة الشراء</dt><dd>{selected.source}</dd></div>
                  <div><dt>سجّل الطلب</dt><dd>{!selected.owner || selected.owner === "غير مسند" ? "غير مسجَّل" : selected.owner}</dd></div>
                  <div><dt>رقم الطلب</dt><dd>{selectedDetails.orderId || "—"}</dd></div>
                  {selectedDetails.delivery !== "مسجل" && !selected.program.includes("الإشراف") && <div className="customer-cohort-field"><dt>رقم الدفعة</dt><dd>{selected.cohort && selected.cohort !== "—" ? selected.cohort : "غير متاح"}{has("customers.manage") && <CustomerCohortEditor customer={selectedDetails} onSaved={(cohort) => { setSelected({...selected,cohort} as typeof selected); setPeople((current) => current.map((item) => item.id === selected.id ? {...item,cohort} : item)); window.dispatchEvent(new CustomEvent("sulukera:data-changed")); }} />}</dd></div>}
                </dl>
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
              </section>
              <section className="cp-section" aria-labelledby="cp-money-title">
                <h3 id="cp-money-title">الملخص المالي</h3>
                {selected.total > 0 ? <>
                  <dl className="cp-ledger cp-money">
                    <div><dt>قيمة الطلب (شامل الضريبة)</dt><dd>{sar(selected.total)}<small className="cp-vat">بدون ضريبة {sar(withoutVat(selected.total))}</small></dd></div>
                    <div><dt>المدفوع من قيمة البرنامج</dt><dd>{sar(selected.paid)}<small className="cp-vat">بدون ضريبة {sar(withoutVat(selected.paid))}</small></dd></div>
                    <div><dt>المتبقي من قيمة البرنامج</dt><dd>{sar(Math.max(selected.total - selected.paid, 0))}<small className="cp-vat">بدون ضريبة {sar(withoutVat(Math.max(selected.total - selected.paid, 0)))}</small></dd></div>
                    {Number(selectedDetails.seatFee || 0)>0&&<div className="seat-fee-paid"><dt>رسوم المقعد المدفوعة</dt><dd>{sar(Number(selectedDetails.seatFee))}</dd></div>}
                    {Number(selectedDetails.seatFee || 0)>0&&<div className="actual-paid-total"><dt>إجمالي المدفوع فعلياً</dt><dd>{sar(selected.paid+Number(selectedDetails.seatFee))}</dd></div>}
                  </dl>
                  <div className="cp-progress"><span className="cu-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, selected.paid / selected.total * 100)}%` }} /></span><small>{Math.min(100, Math.round(selected.paid / selected.total * 100))}% من قيمة البرنامج مدفوع</small></div>
                </> : <p className="cp-next">لا يوجد طلب مالي مرتبط بهذا الملف.</p>}
              </section>
              <section className="cp-section" aria-labelledby="cp-history-title">
                <h3 id="cp-history-title">سجل تعديل البيانات</h3>
                <CustomerEditHistory customerId={selected.id} />
              </section>
              {currentUser.roles.includes("admin") && (
                <section className="cp-section cp-danger" aria-labelledby="cp-admin-title">
                  <h3 id="cp-admin-title">إدارة الملف</h3>
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
                </section>
              )}
            </div>
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
      {notes.length > 0 && (
        <div className="customer-note-latest">
          <i><MessageSquareText size={17} /></i>
          <div>
            <span>آخر ملاحظة</span>
            <p>{notes[0].note}</p>
            <small>{notes[0].created_by_email} · {new Date(notes[0].created_at).toLocaleString("ar-SA-u-nu-latn")}</small>
          </div>
        </div>
      )}
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
      {notes.length > 1 && <details className="customer-note-archive">
        <summary>عرض سجل الملاحظات ({notes.length})</summary>
        <div className="customer-note-lines">
        {notes.slice(1).map((row) => (
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
        </div>
      </details>}
      {!notes.length && (
        <div className="customer-note-lines">
          <div className="customer-history-empty">
            لا توجد تحديثات مسجلة على العميل.
          </div>
        </div>
      )}
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
  const [submissionKey, setSubmissionKey] = useState("");
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
    purchaseDate: new Date().toLocaleDateString("en-CA"),
    amount: "",
    contractTotal: "",
    discount: "0",
    seatReserved: "لا",
    seatBookingType: "حجز مع تسجيل",
    seatFee: "",
    competencyAssessment: "لا",
    priceEdited: false,
  });
  const [proof, setProof] = useState({ name: "", data: "" });
  const blankForm = useRef(form);
  const todayISO = new Date().toLocaleDateString("en-CA");
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
    if (program) {
      const supervisionService = program.name.includes("الإشراف");
      const competencyService = program.name.includes("تقييم الكفاءة");
      setForm((f) => ({
        ...f,
        programId,
        program: program.name,
        track:
          program.name.includes("التعليم المستمر") && f.delivery === "مسجل"
            ? ""
            : program.tracks?.[0]?.name || "",
        journey: "اشتراك",
        delivery: supervisionService ? "مباشر" : competencyService ? "" : "مسجل",
        language: program.name.includes("إدارة السلوك التنظيمي") ? f.language : "",
        seatReserved: "لا",
        seatBookingType: "حجز مع تسجيل",
        seatFee: "",
        competencyAssessment: "لا",
        contractTotal: "",
        priceEdited: false,
      }));
    }
  };
  const selectedProgram = programs.find((p) => p.id === form.programId);
  const isAbat = selectedProgram?.name.includes("تحليل السلوك التطبيقي") && form.track.toUpperCase() === "ABAT";
  const isObm = Boolean(selectedProgram?.name.includes("إدارة السلوك التنظيمي"));
  const isContinuingEducation = Boolean(selectedProgram?.name.includes("التعليم المستمر"));
  const isSupervision = Boolean(selectedProgram?.name.includes("الإشراف"));
  const isCompetencyService = Boolean(selectedProgram?.name.includes("تقييم الكفاءة"));
  const isStandaloneService = isSupervision || isCompetencyService;
  const directProgram = !isStandaloneService && form.delivery === "مباشر";
  const seatReservationEligible =
    isSupervision ||
    (form.delivery === "مباشر" &&
      ["تحليل السلوك التطبيقي", "إدارة السلوك التنظيمي"].some((name) =>
        selectedProgram?.name.includes(name),
      ));
  const hasSeatReservation =
    seatReservationEligible && form.seatReserved === "نعم";
  const seatOnly = hasSeatReservation && !isSupervision && form.seatBookingType === "حجز مقعد فقط";
  const programSeatFee = Number(selectedProgram?.seatFee || 0);
  const asara = form.source === "عصارة";
  const directPayment = form.source === "دفع مباشر";
  // Supervision has no cohort or schedule; it only asks for the fixed 50 SAR seat.
  const scheduledJourney = (hasSeatReservation && !isSupervision) || (!asara && directProgram);
  const reservationDatesInvalid =
    scheduledJourney &&
    (!form.cohort ||
      !form.startDate ||
      !form.assignmentDate ||
      form.assignmentDate > form.startDate);
  // Base amount follows the approved list price until the employee types their own.
  const priceDelivery = isSupervision ? "مباشر" : isCompetencyService ? "خدمة" : isAbat ? "مسجل" : form.delivery;
  const programPrices = selectedProgram?.prices || [];
  const listPrice = Number((programPrices.find((p) => p.track === form.track.trim() && p.delivery === priceDelivery) || programPrices.find((p) => p.track === "" && p.delivery === priceDelivery))?.price || 0);
  const baseInput = form.priceEdited || !listPrice ? form.contractTotal : String(listPrice);
  const baseTotal = Number(baseInput || 0);
  const discountPercent = Number(form.discount || 0);
  const discountedTotal = Math.round(
    baseTotal * (1 - discountPercent / 100) * 100,
  ) / 100;
  const seatFee = hasSeatReservation ? (isSupervision ? 50 : Number(form.seatFee || 0)) : 0;
  const finalTotal = discountedTotal;
  const payableAmount = seatOnly ? seatFee : form.payment === "أقساط" ? Number(form.amount || 0) : finalTotal;
  const phoneInvalid = !internationalPhonePattern.test(form.phone);
  const emailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const lookupKey = phoneInvalid && emailInvalid ? "" : `${phoneInvalid ? "" : form.phone}|${emailInvalid ? "" : form.email.trim().toLowerCase()}`;
  const [lookup, setLookup] = useState<{ key: string; matches: ExistingCustomer[] }>({ key: "", matches: [] });
  useEffect(() => {
    if (!lookupKey) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      fetch("/api/intake/lookup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phone: form.phone, email: form.email }) })
        .then((r) => (r.ok ? r.json() : { matches: [] }))
        .then((data) => { if (!cancelled) setLookup({ key: lookupKey, matches: data.matches || [] }); })
        .catch(() => {});
    }, 400);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [lookupKey, form.phone, form.email]);
  const existingMatches = lookupKey && lookup.key === lookupKey ? lookup.matches : [];
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
    if (step === 1 && (!form.name || !form.phone || !form.email || phoneInvalid || emailInvalid)) {
      setSaveError(
        phoneInvalid
          ? "رقم الجوال يجب أن يبدأ بمفتاح الدولة، مثال: +9665xxxxxxxx"
          : emailInvalid
            ? "صيغة البريد الإلكتروني غير صحيحة"
          : "الاسم والجوال والبريد الإلكتروني حقول إلزامية",
      );
      return;
    }
    if (
      step === 2 &&
      (!form.programId ||
        (!isStandaloneService && !form.delivery) ||
        (isObm && !isSupervision && !form.language) ||
        (Boolean(selectedProgram?.tracks?.length) && !isContinuingEducation && !isStandaloneService && !form.track) ||
        (isContinuingEducation && !form.track.trim()) ||
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
            : isContinuingEducation
              ? "يرجى إضافة اسم الدورة"
              : `يلزم تحديد البرنامج والمسار ونمط البرنامج${isObm ? " واللغة" : ""}`,
      );
      return;
    }
    if (step === 3 && form.journey !== "تجربة") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(form.purchaseDate)) {
        setSaveError("يلزم تحديد تاريخ شراء العميل");
        return;
      }
      if (form.purchaseDate > todayISO) {
        setSaveError("تاريخ الشراء هو تاريخ دفع العميل الفعلي، ولا يمكن أن يكون في المستقبل");
        return;
      }
      if (!seatOnly && (!(baseTotal > 0) || !(discountedTotal > 0))) {
        setSaveError("يلزم إدخال المبلغ الأساسي قبل المتابعة");
        return;
      }
      if (
        !seatOnly && form.payment === "أقساط" &&
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
    if (!form.name || !form.phone || !form.email || phoneInvalid || emailInvalid) {
      setSaveError(emailInvalid?"صيغة البريد الإلكتروني غير صحيحة":"يلزم استكمال الاسم والجوال والبريد قبل الحفظ");
      setStep(1);
      return;
    }
    if (
      !form.programId ||
      (!isStandaloneService && !form.delivery) ||
      (isObm && !isSupervision && !form.language) ||
      (Boolean(selectedProgram?.tracks?.length) && !isContinuingEducation && !isStandaloneService && !form.track) ||
      (isContinuingEducation && !form.track.trim()) ||
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
      (!seatOnly && (!(baseTotal > 0) ||
        !(finalTotal > 0) ||
        (form.payment === "أقساط" &&
          (!(payableAmount > 0) || payableAmount >= finalTotal))))
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
    if (form.journey !== "تجربة" && (!/^\d{4}-\d{2}-\d{2}$/.test(form.purchaseDate) || form.purchaseDate > todayISO)) {
      setSaveError(form.purchaseDate > todayISO ? "تاريخ الشراء لا يمكن أن يكون في المستقبل" : "يلزم تحديد تاريخ شراء العميل");
      setStep(3);
      return;
    }
    setSaving(true);
    try {
      const currentSubmissionKey = submissionKey || crypto.randomUUID();
      if (!submissionKey) setSubmissionKey(currentSubmissionKey);
      const payload = {
        ...form,
        submissionKey: currentSubmissionKey,
        amount: payableAmount,
        contractTotal: finalTotal,
        baseTotal,
        discountPercent,
        competencyAssessment: Boolean(isAbat && form.competencyAssessment === "نعم"),
        seatReserved: hasSeatReservation,
        seatBookingType: hasSeatReservation ? form.seatBookingType : "",
        seatFee,
        // Hidden fields keep what was typed before a programme change; only send them when they apply.
        cohort: scheduledJourney ? form.cohort : "",
        startDate: scheduledJourney ? form.startDate : "",
        assignmentDate: scheduledJourney ? form.assignmentDate : "",
        proofAssetKey: proof.data,
        proofFileName: proof.name,
        mode: !isStandaloneService && form.journey === "تجربة" ? "trial" : "payment",
        purchaseType: isSupervision ? "إشراف" : isCompetencyService ? "تقييم كفاءة" : "برنامج",
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
  const startOver = () => {
    const first = programs.find((p) => p.id === blankForm.current.programId) || programs[0];
    setForm({ ...blankForm.current, purchaseDate: new Date().toLocaleDateString("en-CA"), ...(first ? { programId: first.id, program: first.name, track: first.tracks?.[0]?.name || "" } : {}) });
    setProof({ name: "", data: "" });
    setSaveError("");
    setStep(1);
    setSaved(false);
    setSubmissionKey(crypto.randomUUID());
  };
  const money = (value: number) => `${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} ر.س`;
  const deliveryLabel = isSupervision ? "إشراف" : isCompetencyService ? "خدمة تقييم" : isAbat ? "ABAT" : form.delivery || "—";
  // Same rule as the intake API: عصارة completes on its own only for a plain programme without a seat.
  const autoAsara = asara && !isStandaloneService && !hasSeatReservation;
  const routeComplete = form.journey === "تجربة" || (!isSupervision && form.payment !== "أقساط" && (!directPayment || form.method === "تمارا"));
  const steps = [
    "بيانات العميل",
    "تفاصيل البرنامج",
    "الدفع وطريقة السداد",
    "مراجعة البيانات",
  ];
  if (saved)
    return (
      <div className="ops-home rg-done">
        <div className="rg-done-card">
        <span className="rg-done-mark" aria-hidden="true"><Check size={30} /></span>
        <h2>تم تسجيل العميل</h2>
        <p>
          {form.journey === "تجربة"
            ? "تم تسجيل العميل وبدء فترة التجربة."
            : isSupervision
                ? "تم تسجيل عميل الإشراف وإضافته إلى التهيئة."
              : "تم تسجيل العميل بنجاح وإضافته إلى النظام."}
        </p>
        <dl className="cp-ledger">
          <div><dt>العميل</dt><dd>{form.name}</dd></div>
          <div><dt>البرنامج</dt><dd>{form.track ? `${form.program} · ${form.track}` : form.program}</dd></div>
          {form.journey !== "تجربة" && <div><dt>المسجَّل الآن</dt><dd>{money(payableAmount)}{seatFee > 0 ? ` + رسوم مقعد ${money(seatFee)}` : ""}</dd></div>}
        </dl>
        <div className="rg-done-actions">
          <button type="button" className="oh-btn" onClick={startOver}>
            تسجيل عميل آخر
          </button>
          <button type="button" className="oh-btn primary" onClick={done}>
            فتح قائمة العملاء
          </button>
        </div>
        </div>
      </div>
    );
  return (
    <div className="ops-home rg-shell">
      <nav className="rg-progress" aria-label="خطوات التسجيل">
        <ol>
          {steps.map((s, i) => (
            <li key={s} className={step === i + 1 ? "current" : step > i + 1 ? "complete" : ""}>
              <button type="button" aria-current={step === i + 1 ? "step" : undefined} onClick={() => setStep(i + 1)}>
                <i aria-hidden="true">{step > i + 1 ? <Check size={14} /> : i + 1}</i>
                <span>{s}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="rg-progress-bar" aria-hidden="true"><i style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} /></div>
      </nav>
      <div className="rg-body">
      <section className="form-card rg-card">
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
            <ExistingCustomerAlert matches={existingMatches} name={form.name} phone={form.phone} email={form.email} />
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
              {Boolean(selectedProgram?.tracks?.length) && !isContinuingEducation && !isStandaloneService && (
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
              {!isStandaloneService && <Field label="نوع الاشتراك *">
                <select
                  required
                  value={form.journey}
                  onChange={(e) => setForm((current) => ({...current, journey:e.target.value, seatReserved:e.target.value === "تجربة" ? "لا" : current.seatReserved, seatFee:e.target.value === "تجربة" ? "" : current.seatFee}))}
                >
                  <option>اشتراك</option>
                  <option>تجربة</option>
                </select>
              </Field>}
              {!isAbat && !isStandaloneService && <Field label="نمط البرنامج *">
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
                <Field label="اسم الدورة *">
                  <input required value={form.track} onChange={(e) => set("track", e.target.value)} placeholder="يرجى إضافة اسم الدورة" />
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
                      else if (!isSupervision && !form.seatFee && programSeatFee > 0) set("seatFee", String(programSeatFee));
                    }}
                  >
                    <option>لا</option>
                    <option>نعم</option>
                  </select>
                </Field>
              )}
              {hasSeatReservation && !isSupervision && (
                <Field label="نوع حجز المقعد *">
                  <select required value={form.seatBookingType} onChange={(e) => set("seatBookingType", e.target.value)}>
                    <option>حجز مع تسجيل</option>
                    <option>حجز مقعد فقط</option>
                  </select>
                  <small className="field-help">حجز المقعد فقط يبقى في قائمة الحجوزات حتى استكمال البرنامج أو الانسحاب.</small>
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
                      : `مبلغ ثابت يُضاف بعد الخصم ولا تُطبق عليه نسبة الخصم.${programSeatFee > 0 ? ` المقترح من إعدادات البرنامج: ${programSeatFee.toLocaleString("en-US")} ر.س، ويمكن تعديله.` : ""}`}
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
                يبقى العميل «بانتظار الإسناد» ويظهر في «القادم» بمركز العمليات،
                ثم ينتقل تلقائياً إلى تهيئة العميل في تاريخ الإسناد. إذا كان
                تاريخ الإسناد اليوم أو قبله ينتقل فوراً. يجب ألا يتجاوز تاريخ
                الإسناد تاريخ بدء البرنامج.
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
                  type="button"
                  aria-pressed={form.source === x}
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
                <Field label="تاريخ الشراء *">
                  <input
                    required
                    type="date"
                    max={todayISO}
                    value={form.purchaseDate}
                    onChange={(e) => set("purchaseDate", e.target.value)}
                  />
                  <small className="field-help">
                    تاريخ دفع العميل الفعلي، ويُحتسب بناءً عليه ضمن مبيعات اليوم.
                  </small>
                </Field>
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
                {!seatOnly && <Field label="المبلغ الأساسي (شامل الضريبة) *">
                  <input
                    inputMode="decimal"
                    dir="ltr"
                    value={baseInput}
                    onChange={(e) => setForm((f) => ({ ...f, contractTotal: e.target.value, priceEdited: true }))}
                    placeholder="0.00 ر.س"
                  />
                  <small className="field-help">
                    {listPrice
                      ? `السعر المعتمد: ${money(listPrice)} شامل الضريبة · ${money(withoutVat(listPrice))} بدون ضريبة.${baseTotal !== listPrice ? " المبلغ المكتوب مختلف عن السعر المعتمد." : ""}`
                      : "لا يوجد سعر معتمد لهذا الاختيار في إدارة البرامج؛ اكتب المبلغ شامل الضريبة."}
                  </small>
                </Field>}
                {!seatOnly && <Field label="قيمة الخصم">
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
                </Field>}
                {!seatOnly && <Field label="خطة السداد">
                  <select
                    value={form.payment}
                    onChange={(e) => set("payment", e.target.value)}
                  >
                    <option>دفع كامل</option>
                    <option>أقساط</option>
                    <option>تمارا</option>
                  </select>
                </Field>}
                {!seatOnly && form.payment === "أقساط" && (
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
                {!directPayment && (
                  <Field label="رقم الطلب في المتجر">
                    <input
                      dir="ltr"
                      maxLength={100}
                      value={form.reference}
                      onChange={(e) => set("reference", e.target.value)}
                      placeholder={`رقم الطلب في ${form.source}`}
                    />
                    <small className="field-help">
                      اختياري. يُحفظ مرجعاً للدفعة لتسهيل مطابقتها مع كشف المتجر.
                    </small>
                  </Field>
                )}
                <div className="discount-summary">
                  {seatOnly ? <p className="net"><span>المبلغ المدفوع</span><b>{seatFee.toLocaleString("en-US")} ر.س رسوم مقعد فقط</b></p> : <>
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
                    <span>{form.payment === "أقساط" ? "الدفعة الأولى المسجَّلة الآن" : "المبلغ المسجَّل الآن"}</span>
                    <b>{payableAmount.toLocaleString("en-US")} ر.س</b>
                  </p>
                  {form.payment === "دفع كامل" && (
                    <small>سيُسجل هذا المبلغ كاملاً كدفعة المبيعات.</small>
                  )}
                  </>}
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
            <ExistingCustomerAlert matches={existingMatches} name={form.name} phone={form.phone} email={form.email} />
            <div className="review-grid">
              <section>
                <h3>ملخص الطلب</h3>
                <Review label="العميل" value={form.name || "لم يُدخل بعد"} />
                {!isStandaloneService && <Review label="نوع الاشتراك" value={form.journey} />}
                <Review
                  label="البرنامج"
                  value={form.track ? `${form.program} · ${form.track}` : form.program}
                />
                {!isStandaloneService && <Review
                  label="نمط الدراسة"
                  value={isSupervision ? "إشراف" : isObm ? `${isAbat ? "ABAT" : form.delivery} · ${form.language}` : (isAbat ? "ABAT" : form.delivery)}
                />}
                {isAbat && <Review label="تقييم الكفاءة" value={form.competencyAssessment} />}
                {scheduledJourney && form.startDate && (
                  <Review label="تاريخ بدء البرنامج" value={form.startDate} />
                )}{" "}
                {scheduledJourney && (
                  <Review label="تاريخ الإسناد" value={form.assignmentDate} />
                )}
                <Review label="مصدر الشراء" value={form.source} />
                {form.journey !== "تجربة" && (
                  <>
                    <Review label="وسيلة الدفع" value={form.method} />
                    {!directPayment && form.reference.trim() && <Review label="رقم الطلب في المتجر" value={form.reference.trim()} />}
                    <Review label="تاريخ الشراء" value={form.purchaseDate} />
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
                      value={`${discountedTotal.toLocaleString("en-US")} ر.س شامل الضريبة · ${withoutVat(discountedTotal).toLocaleString("en-US")} بدون ضريبة`}
                    />
                    {hasSeatReservation && (
                      <Review
                        label="مبلغ حجز المقعد"
                        value={`${seatFee.toLocaleString("en-US")} ر.س`}
                      />
                    )}
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
                        {!form.assignmentDate
                          ? "حسب تاريخ الإسناد المحدد"
                          : form.assignmentDate > todayISO
                            ? `في ${form.assignmentDate} · بانتظار الإسناد حتى ذلك اليوم`
                            : "فوراً · تاريخ الإسناد اليوم أو قبله"}
                      </small>
                    </span>
                  </p>
                ) : (
                  <>
                    <p className={autoAsara ? "done" : "next"}>
                      <i>{autoAsara ? "✓" : "2"}</i>
                      <span>
                        <b>
                          {autoAsara
                            ? "تفعيل الدورة تلقائياً عبر عصارة"
                            : "بدء رحلة التسجيل الأكاديمي"}
                        </b>
                        <small>
                          {autoAsara ? "لا يحتاج تدخلاً يدوياً" : "الأكاديمية"}
                        </small>
                      </span>
                    </p>
                    {!autoAsara && (
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
        {saveError && <div className="oh-alert rg-error" role="alert">{saveError}</div>}
        <footer className="wizard-actions">
          <button
            type="button"
            className="oh-btn"
            onClick={() => (step > 1 ? setStep(step - 1) : done())}
          >
            {step > 1 ? "السابق" : "إلغاء"}
          </button>
          <span>الخطوة {step} من 4</span>
          {step < 4 ? (
            <button type="button" className="oh-btn primary" onClick={next}>
              التالي
            </button>
          ) : (
            <button type="button" className="oh-btn primary" disabled={saving} onClick={submit}>
              {saving ? "جارٍ الحفظ..." : "تسجيل العميل"}
            </button>
          )}
        </footer>
      </section>
      <aside className="rg-summary" aria-label="ملخص التسجيل">
        <header>
          <span className="cp-avatar" aria-hidden="true">{form.name.trim() ? form.name.trim().slice(0, 2) : "؟"}</span>
          <div><b>{form.name.trim() || "عميل جديد"}</b><small dir="ltr">{form.phone.length > 4 ? form.phone : "—"}</small></div>
        </header>
        <dl className="cp-ledger">
          <div><dt>البرنامج</dt><dd>{form.track ? `${form.program} · ${form.track}` : form.program || "—"}</dd></div>
          {!isStandaloneService && <div><dt>الاشتراك</dt><dd>{form.journey}</dd></div>}
          <div><dt>النمط</dt><dd>{deliveryLabel}{isObm && !isSupervision && form.language ? ` · ${form.language}` : ""}</dd></div>
          {scheduledJourney && <div><dt>الدفعة</dt><dd>{form.cohort || "—"}</dd></div>}
          <div><dt>مصدر الشراء</dt><dd>{form.source}{directPayment ? ` · ${form.method}` : ""}</dd></div>
        </dl>
        {form.journey !== "تجربة" && (
          <div className="rg-receipt" aria-label="الملخص المالي">
            {!seatOnly && <p><span>المبلغ الأساسي</span><b>{money(baseTotal)}</b></p>}
            {!seatOnly && discountPercent > 0 && <p><span>الخصم {discountPercent}%</span><b>− {money(baseTotal - discountedTotal)}</b></p>}
            {!seatOnly && <p><span>سعر البرنامج</span><b>{money(discountedTotal)}</b></p>}
            {!seatOnly && <small>بدون ضريبة: {money(withoutVat(discountedTotal))}</small>}
            {seatFee > 0 && <p><span>رسوم المقعد</span><b>{money(seatFee)}</b></p>}
            <p className="total"><span>{seatOnly ? "رسوم المقعد المسجَّلة" : form.payment === "أقساط" ? "الدفعة الأولى" : "يُسجَّل الآن"}</span><b>{money(payableAmount)}</b></p>
            <small>شامل ضريبة 15% · بدون ضريبة: {money(withoutVat(payableAmount))}</small>
            {!seatOnly && form.payment === "أقساط" && finalTotal > payableAmount && <small>المتبقي على الأقساط: {money(finalTotal - payableAmount)}</small>}
          </div>
        )}
        <p className={`rg-route ${routeComplete ? "complete" : "review"}`}>{routeComplete ? <Check size={15} aria-hidden="true" /> : <Info size={15} aria-hidden="true" />}{form.journey === "تجربة" ? "تبدأ التجربة دون إجراء مالي" : routeComplete ? `مكتمل مالياً عبر ${form.source}` : "تنتقل للمالية للمراجعة"}</p>
      </aside>
      </div>
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
  created_at?: string;
  updated_at?: string;
  payment_id?: string;
  payment_reference?: string;
  needs_attention?: number;
};
type LiveReservation = {
  id: string;
  customer_id: string;
  order_id: string;
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
  converted_enrollment_id?: string;
  program_track?: string;
  program_delivery?: string;
  purchase_source?: string;
  order_number?: string;
  created_at?: string;
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
  gross_paid?: number;
  refunded?: number;
  remaining: number;
  overpayment: number;
  finance_note: string;
  payment_behavior: PaymentBehavior;
  seat_fee: number;
  // True when the seat fee came from the registration form (kept apart from the contract), so the legacy seat-fee tool doesn't apply.
  registration_seat_fee?: boolean;
  discount_percent: number;
  payments: FinancePayment[];
  order_payment_reference?: string;
  installments: FinanceInstallment[];
  withdrawal?: { id:string;reason:string;withdrawn_at:string;gross_paid:number;non_refundable_amount:number;refund_amount:number;refund_source:string;refund_method:string;reference:string;status:string;created_by_email:string;created_at:string } | null;
  undo_available?: { id: string; action: string; label: string; created_at: string } | null;
};
type CollectionForecast = { month:string; due:number; expected:number; follow_up:number; risk:number; installments:number; items:{customer_name:string;program_name:string;order_id:string;installment_id:string;amount:number;due_date:string;status:string;reminder_count:number;category:"expected"|"follow_up"|"risk"}[] };
type FinanceSummary = { total:number; paid:number; remaining:number; overdue:number; forecast:CollectionForecast };
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
  prices?: ProgramPrice[];
};
// List price for a track ("" = any track) and delivery; VAT included.
type ProgramPrice = { track: string; delivery: string; price: number };
// Every amount in the system includes 15% VAT; this gives the amount before VAT for display.
const withoutVat = (amount: number) => Math.round((Number(amount || 0) / 1.15) * 100) / 100;
// Business days are Riyadh days, whatever time zone the device is in.
const riyadhToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });

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
      update_discount_percent: "تم تحديث نسبة الخصم وإعادة موازنة العقد",
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
  subcategories,
  subcategory = "الكل",
  onSubcategory,
  tertiaryLabel = "البرنامج الفرعي",
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
  subcategories?: string[];
  subcategory?: string;
  onSubcategory?: (value: string) => void;
  tertiaryLabel?: string;
}) {
  const active = program !== "الكل" || status !== "الكل" || subcategory !== "الكل";
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
      <div className={subcategories?.length ? "has-tertiary" : ""}>
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
        {!!subcategories?.length && <label>
          <span>{tertiaryLabel}</span>
          <select value={subcategory} onChange={(e) => onSubcategory?.(e.target.value)}>
            <option value="الكل">كل {tertiaryLabel === "المسار" ? "المسارات" : "البرامج الفرعية"}</option>
            {subcategories.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>}
        {active && (
          <button type="button" onClick={() => { onProgram("الكل"); onStatus("الكل"); onSubcategory?.("الكل"); }}>
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
          {subcategory !== "الكل" && <mark>{subcategory}</mark>}
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
 operations:{pendingCustomers:number;customersToday:number;totalCustomers:number};
 tasks:LiveTask[];journey:{status:string;count:number}[];
 trainees:{key:string;label:string;count:number;details:{label:string;count:number}[]}[];
 activity:{id:string;action:string;entity_type:string;entity_id:string;actor_email:string;actor_name?:string;subject_name?:string;created_at:string}[];
 finance?:{month:string;orders:number;contractValue:number;sales:number;collections:number;grossSales:number;grossCollections:number;salesRefunds:number;collectionRefunds:number;cash:number;remaining:number;target:number;weeklyTargets:Record<string,number>;reviewCount:number;reviewBreakdown:Record<string,number>;daily:{day:string;sales:number;collections:number}[]}|null;
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
function HomeDashboard({onOpenTasks,onOpenCustomers,onOpenFinance,onOpenFinanceReview}:{onOpenTasks:()=>void;onOpenCustomers:()=>void;onOpenFinance:()=>void;onOpenFinanceReview:(kind:string)=>void}){
 const now=new Date(),[month,setMonth]=useState(now.toLocaleDateString("en-CA").slice(0,7)),[mode,setMode]=useState<"daily"|"cumulative">("daily"),[data,setData]=useState<HomeData|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[editingTarget,setEditingTarget]=useState(false),[target,setTarget]=useState(""),[weeklyDrafts,setWeeklyDrafts]=useState<Record<string,string>>({}),[savingWeek,setSavingWeek]=useState<number|null>(null),[selectedWeek,setSelectedWeek]=useState(1),[editingWeeklyTarget,setEditingWeeklyTarget]=useState(false),[activityPage,setActivityPage]=useState(0),[openTraineeGroup,setOpenTraineeGroup]=useState("aba");
 const load=async()=>{setLoading(true);setError("");try{const result=await apiJson(`/api/dashboard/home?month=${month}`);setData(result);setTarget(String(result.finance?.target||""));setWeeklyDrafts(Object.fromEntries(Object.entries(result.finance?.weeklyTargets||{}).map(([key,value])=>[key,String(value||"")])))}catch(e){setError((e as Error).message)}finally{setLoading(false)}};
 useEffect(()=>{void load()},[month]);
 if(!data)return loading?<HomeDashboardSkeleton/>:<LiveState loading={false} error={error} empty/>;
 const f=data.finance,days=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate(),raw=Array.from({length:days},(_,index)=>{const key=`${month}-${String(index+1).padStart(2,"0")}`;return f?.daily.find(row=>row.day===key)||{day:key,sales:0,collections:0}});
 let runningSales=0,runningCollections=0;const chart=raw.map(row=>mode==="daily"?row:{...row,sales:runningSales+=row.sales,collections:runningCollections+=row.collections}),rawMax=Math.max(1,...chart.flatMap(row=>[row.sales,row.collections])),magnitude=10**Math.floor(Math.log10(rawMax)),chartMax=Math.ceil(rawMax/magnitude*2)/2*magnitude,money=(value:number)=>Number(value||0).toLocaleString("en-US",{maximumFractionDigits:2}),compactMoney=(value:number)=>value>=1000?`${Number((value/1000).toFixed(value>=10000?0:1))}K`:money(value),targetRatio=f?.target?Math.min(100,Math.round(f.sales/f.target*100)):0,activeDays=raw.filter(row=>row.sales>0||row.collections>0).length,peak=raw.reduce((best,row)=>row.sales+row.collections>best.sales+best.collections?row:best,raw[0]),chartTicks=[chartMax,chartMax*.75,chartMax*.5,chartMax*.25,0];
 const monthStart=new Date(`${month}-01T12:00:00`),firstSaturdayDay=1+(6-monthStart.getDay()+7)%7,monthEndDay=days,weekRanges:Array<{start:number;end:number}>=[];
 for(let startDay=firstSaturdayDay;startDay<=monthEndDay;startDay+=7)weekRanges.push({start:startDay,end:Math.min(startDay+5,monthEndDay)});
 const todayKey=now.toLocaleDateString("en-CA");
 const weeklyProgress=weekRanges.map((range,index)=>{const rows=raw.filter(row=>{const day=Number(row.day.slice(-2));return day>=range.start&&day<=range.end}),actual=rows.reduce((sum,row)=>sum+row.sales,0),weekIndex=index+1,weekTarget=Number(f?.weeklyTargets?.[String(weekIndex)]||0),ratio=weekTarget?Math.round(actual/weekTarget*100):0,startKey=`${month}-${String(range.start).padStart(2,"0")}`,endKey=`${month}-${String(range.end).padStart(2,"0")}`;return {index:weekIndex,...range,actual,target:weekTarget,ratio,isCurrent:todayKey>=startKey&&todayKey<=endKey}});
 const displayedSales=mode==="daily"?(raw.find(row=>row.day===todayKey)||raw.filter(row=>row.sales||row.collections).at(-1)||raw[0]).sales:(chart.at(-1)?.sales||0),displayedCollections=mode==="daily"?(raw.find(row=>row.day===todayKey)||raw.filter(row=>row.sales||row.collections).at(-1)||raw[0]).collections:(chart.at(-1)?.collections||0),displayedTotal=displayedSales+displayedCollections;
 const selectedWeeklyProgress=weeklyProgress.find(week=>week.index===selectedWeek)||weeklyProgress[0];
 const activityPageSize=8,activityPages=Math.max(1,Math.ceil(data.activity.length/activityPageSize)),visibleActivity=data.activity.slice(activityPage*activityPageSize,(activityPage+1)*activityPageSize),weekLabels=["الأول","الثاني","الثالث","الرابع","الخامس"];
 const saveTarget=async()=>{try{await apiJson("/api/dashboard/home",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({month,target:Number(target||0)})});setEditingTarget(false);await load()}catch(e){setError((e as Error).message)}};
 const saveWeeklyTarget=async(weekIndex:number)=>{setSavingWeek(weekIndex);setError("");try{await apiJson("/api/dashboard/home",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({month,weekIndex,target:Number(weeklyDrafts[String(weekIndex)]||0)})});setEditingWeeklyTarget(false);await load()}catch(e){setError((e as Error).message)}finally{setSavingWeek(null)}};
 const dateLocale="ar-SA-u-ca-gregory-nu-latn",localDay=(value:string|Date)=>new Date(value).toLocaleDateString("en-CA"),localToday=localDay(now),localYesterday=localDay(new Date(now.getTime()-864e5)),localTomorrow=localDay(new Date(now.getTime()+864e5));
 const monthLabel=new Date(`${month}-01T12:00:00`).toLocaleDateString(dateLocale,{month:"long",year:"numeric"});
 const dueLabel=(due?:string)=>{if(!due)return "دون موعد";const day=due.slice(0,10);return day<localToday?"متأخرة":day===localToday?"اليوم":day===localTomorrow?"غدًا":new Date(`${day}T12:00:00`).toLocaleDateString(dateLocale,{day:"numeric",month:"short"})};
 const priorityTone=(priority:string)=>priority==="عاجلة"?"urgent":priority==="عالية"?"high":"normal";
 const dayLabel=(day:string)=>day===localToday?"اليوم":day===localYesterday?"أمس":new Date(`${day}T12:00:00`).toLocaleDateString(dateLocale,{weekday:"long",day:"numeric",month:"long"});
 const reviewKinds=[["installments","أقساط"],["bank","تحويل بنكي"],["paytabs","PayTabs"],["tamara","تمارا"],["supervision","إشراف"],["other","أخرى"]],reviewItems=f?reviewKinds.filter(([key])=>Number(f.reviewBreakdown?.[key]||0)>0):[];
 const cashSales=Math.max(0,f?.sales||0),cashCollections=Math.max(0,f?.collections||0),salesShare=cashSales+cashCollections?cashSales/(cashSales+cashCollections)*100:0;
 const traineeMax=Math.max(1,...data.trainees.map(group=>group.count)),ringLength=2*Math.PI*32;
 return <div className="ops-home" aria-busy={loading}>
  {error&&<div className="oh-alert" role="alert">{error}</div>}
  <header className="oh-masthead">
   <div><span className="oh-eyebrow">نظرة عامة · {monthLabel}</span><h2>مرحبًا {data.user.name}</h2><p><i className="oh-live" aria-hidden="true"/>آخر تحديث للبيانات {new Date(data.generatedAt).toLocaleTimeString("ar-SA-u-nu-latn",{hour:"2-digit",minute:"2-digit"})}</p></div>
   <label className="oh-month"><CalendarDays size={16} aria-hidden="true"/><span className="sr-only">شهر العرض</span><input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label>
  </header>
  <section className="oh-pulse" aria-labelledby="oh-pulse-title">
   <header><h3 id="oh-pulse-title">مؤشرات العملاء</h3><p>اضغط على أي مؤشر لفتح السجل الذي تكوّن منه الرقم. لا تشمل الأرقام الملفات المحذوفة.</p></header>
   <div>
    <HomeMetric icon={ListChecks} label="عملاء يحتاجون متابعة" value={data.operations.pendingCustomers} note="عدد العملاء المرتبطين بمهمة مفتوحة واحدة على الأقل" tone={data.operations.pendingCustomers>0?"attention":"brand"} onClick={onOpenTasks}/>
    <HomeMetric icon={UserPlus} label="عملاء أضيفوا اليوم" value={data.operations.customersToday} note="ملفات عملاء أُنشئت بتاريخ اليوم" tone="brand" onClick={onOpenCustomers}/>
    <HomeMetric icon={UsersRound} label="إجمالي ملفات العملاء" value={data.operations.totalCustomers} note="جميع ملفات العملاء الفعلية غير المحذوفة" tone="neutral" onClick={onOpenCustomers}/>
   </div>
  </section>
  <div className="oh-body">
   <div className="oh-main">
    {f&&<section className="oh-panel oh-finance" aria-labelledby="oh-finance-title">
     <header className="oh-panel-head"><span className="oh-icon"><CircleDollarSign size={18}/></span><div><h3 id="oh-finance-title">المؤشرات المالية</h3><p>حركات مالية مؤكدة لشهر {monthLabel} فقط</p></div></header>
     <div className="oh-finance-grid">
      <button type="button" className="oh-cash" onClick={onOpenFinance} aria-label={`إجمالي المقبوض الفعلي: ${money(f.cash)} ر.س. عرض التفاصيل`}>
       <span>إجمالي المقبوض الفعلي</span>
       <b>{money(f.cash)}<small>ر.س</small></b>
       <span className="oh-split" aria-hidden="true">{salesShare>0&&<i className="sales" style={{width:`${salesShare}%`}}/>}{salesShare<100&&cashCollections>0&&<i className="collection" style={{width:`${100-salesShare}%`}}/>}</span>
       <span className="oh-split-legend"><span><i className="sales"/>مبيعات {money(f.sales)}</span><span><i className="collection"/>تحصيل {money(f.collections)}</span></span>
       <em>المبيعات + التحصيل لهذا الشهر · عرض التفاصيل</em>
      </button>
      <div className="oh-ledger">
       <HomeMetric icon={BadgeDollarSign} label="صافي المبيعات المدفوعة" value={money(f.sales)} suffix="ر.س" note={f.salesRefunds?`دفعات أولى وكاملة بعد خصم ${money(f.salesRefunds)} ر.س استردادات`:"دفعات أولى وكاملة مؤكدة حسب تاريخ الدفع"} tone="brand" onClick={onOpenFinance}/>
       <HomeMetric icon={WalletCards} label="صافي تحصيل الأقساط" value={money(f.collections)} suffix="ر.س" note={f.collectionRefunds?`أقساط مسددة بعد خصم ${money(f.collectionRefunds)} ر.س استردادات`:"دفعات الأقساط المؤكدة حسب تاريخ السداد"} tone="success" onClick={onOpenFinance}/>
       <HomeMetric icon={ReceiptText} label="قيمة العقود المنشأة" value={money(f.contractValue)} suffix="ر.س" note={`قيمة ${f.orders} طلب أُنشئ خلال الشهر، وليست مبلغًا مقبوضًا`} tone="neutral" onClick={onOpenFinance}/>
       <HomeMetric icon={HandCoins} label="المتبقي من عقود الشهر" value={money(f.remaining)} suffix="ر.س" note="قيمة العقود المنشأة بعد خصم دفعاتها المؤكدة" tone="neutral" onClick={onOpenFinance}/>
      </div>
     </div>
     <p className="oh-footnote"><Info size={14} aria-hidden="true"/>المبيعات تعتمد تاريخ دفع العميل، والتحصيل يعتمد تاريخ سداد الأقساط. لا تدخل العمليات المعلّقة حتى اعتمادها.</p>
    </section>}
    {f&&<section className="oh-panel sales-performance" aria-labelledby="oh-performance-title">
     <header className="oh-panel-head"><span className="oh-icon"><ChartNoAxesCombined size={18}/></span><div><h3 id="oh-performance-title">المبيعات والتحصيل خلال الشهر</h3><p>الأهداف أولًا، ثم حركة كل يوم أو الإجمالي المتراكم حتى ذلك اليوم.</p></div></header>
     <div className="performance-body">
      <figure className="oh-chart">
       <div className="oh-chart-toolbar">
        <div className="oh-segment" role="tablist" aria-label="طريقة عرض الرسم"><button type="button" role="tab" aria-selected={mode==="daily"} onClick={()=>setMode("daily")}>يومي</button><button type="button" role="tab" aria-selected={mode==="cumulative"} onClick={()=>setMode("cumulative")}>تراكمي</button></div>
        <figcaption className="oh-chart-meta"><span className="oh-legend"><span><i className="sales"/>المبيعات</span><span><i className="collection"/>التحصيل</span></span><span><b>{activeDays}</b> أيام فيها حركة</span><span>أعلى يوم <b>{compactMoney(peak.sales+peak.collections)}</b></span></figcaption>
       </div>
       <div className="chart-total-cards">
        <p><span><i className="sales"/>{mode==="daily"?"مبيعات اليوم":"إجمالي المبيعات"}</span><b>{money(displayedSales)}<small>ر.س</small></b></p>
        <p><span><i className="collection"/>{mode==="daily"?"تحصيل اليوم":"إجمالي التحصيل"}</span><b>{money(displayedCollections)}<small>ر.س</small></b></p>
        <p><span><i/>{mode==="daily"?"إجمالي اليوم":"الإجمالي التراكمي"}</span><b>{money(displayedTotal)}<small>ر.س</small></b></p>
       </div>
       <div className="oh-chart-plot">
        <div className="oh-chart-scale" aria-hidden="true">{chartTicks.map((tick,index)=><span key={index} style={{bottom:`${100-index*25}%`}}>{compactMoney(tick)}</span>)}</div>
        <div className="oh-chart-bars" role="img" aria-label={`رسم المبيعات والتحصيل لشهر ${monthLabel}`}>{chart.map((row,index)=><div className={`oh-chart-day${row.day===todayKey?" today":""}`} key={row.day} title={`${row.day} — المبيعات ${money(row.sales)} ر.س، التحصيل ${money(row.collections)} ر.س`}><div><i className="sales" style={{height:`${Math.max(0,row.sales)/chartMax*100}%`}}/><i className="collection" style={{height:`${Math.max(0,row.collections)/chartMax*100}%`}}/></div><span>{(index===0||((index+1)%5===0&&index<chart.length-3)||index===chart.length-1)?index+1:""}</span></div>)}</div>
       </div>
      </figure>
      <aside className="goals-rail" aria-label="أهداف المبيعات">
       <section className={`month-target ${f.target>0&&targetRatio>=100?"achieved":""}`}>
        <span className="oh-ring" aria-hidden="true"><svg viewBox="0 0 76 76" width="76" height="76"><circle className="track" cx="38" cy="38" r="32"/><circle className="value" cx="38" cy="38" r="32" strokeDasharray={ringLength} strokeDashoffset={ringLength*(1-targetRatio/100)}/></svg><b>{targetRatio}%</b></span>
        <div><span><Target size={14} aria-hidden="true"/> هدف مبيعات الشهر</span><b>{money(f.target)} <small>ر.س</small></b><p>{!f.target?"لم يُحدَّد هدف لهذا الشهر":targetRatio>=100?"تم تحقيق الهدف — أداء رائع!":`تحقق ${targetRatio}% من الهدف`}</p></div>
        {data.canEditFinanceTarget&&(editingTarget?<form className="oh-inline-edit" onSubmit={e=>{e.preventDefault();void saveTarget()}}><label className="sr-only" htmlFor="oh-month-target">هدف مبيعات الشهر</label><input id="oh-month-target" inputMode="decimal" value={target} onChange={e=>setTarget(e.target.value)}/><button type="submit" className="oh-btn primary">حفظ</button><button type="button" className="oh-btn" onClick={()=>setEditingTarget(false)}>إلغاء</button></form>:<button type="button" className="oh-btn ghost oh-target-trigger" onClick={()=>setEditingTarget(true)}>تعديل الهدف</button>)}
       </section>
       {selectedWeeklyProgress&&<section className={`weekly-challenge-compact ${selectedWeeklyProgress.target>0&&selectedWeeklyProgress.ratio>=100?"achieved":""}`}>
        <header><div><span>تحدي الأسبوع</span><b>الأسبوع {weekLabels[selectedWeeklyProgress.index-1]}</b></div>{data.canEditFinanceTarget&&<button type="button" className="weekly-edit-trigger" aria-label={selectedWeeklyProgress.target?"تعديل هدف الأسبوع":"إضافة هدف الأسبوع"} aria-expanded={editingWeeklyTarget} onClick={()=>setEditingWeeklyTarget(value=>!value)}><Plus size={15}/></button>}</header>
        <nav aria-label="اختيار الأسبوع">{weeklyProgress.map(week=><button type="button" key={week.index} className={selectedWeeklyProgress.index===week.index?"active":""} aria-pressed={selectedWeeklyProgress.index===week.index} aria-label={`الأسبوع ${weekLabels[week.index-1]}`} onClick={()=>{setSelectedWeek(week.index);setEditingWeeklyTarget(false)}}>{weekLabels[week.index-1]}{week.isCurrent&&<i aria-hidden="true"/>}</button>)}</nav>
        <small>{selectedWeeklyProgress.start}–{selectedWeeklyProgress.end} من الشهر · السبت–الخميس</small>
        {editingWeeklyTarget&&data.canEditFinanceTarget&&<label className="weekly-target-popover"><span className="sr-only">مبلغ هدف الأسبوع</span><input autoFocus type="number" min="0" inputMode="decimal" value={weeklyDrafts[String(selectedWeeklyProgress.index)]||""} onChange={e=>setWeeklyDrafts({...weeklyDrafts,[String(selectedWeeklyProgress.index)]:e.target.value})} placeholder="مبلغ الهدف"/><button type="button" className="oh-btn primary" disabled={savingWeek===selectedWeeklyProgress.index||Number(weeklyDrafts[String(selectedWeeklyProgress.index)]||0)===selectedWeeklyProgress.target} onClick={()=>void saveWeeklyTarget(selectedWeeklyProgress.index)}>{savingWeek===selectedWeeklyProgress.index?"...":"حفظ"}</button></label>}
        <div className="weekly-challenge-values"><p><span>المنجز</span><b>{money(selectedWeeklyProgress.actual)} ر.س</b></p><p><span>الهدف</span><b>{selectedWeeklyProgress.target?`${money(selectedWeeklyProgress.target)} ر.س`:"غير محدد"}</b></p></div>
        <div className="weekly-progress-track"><i style={{width:`${Math.min(100,selectedWeeklyProgress.ratio)}%`}}/></div>
        <footer><span>{!selectedWeeklyProgress.target?"أضف هدف الأسبوع":selectedWeeklyProgress.ratio>=100?"تم تحقيق التحدي!":`${selectedWeeklyProgress.ratio}% من الهدف`}</span>{selectedWeeklyProgress.target>0&&<b>{selectedWeeklyProgress.ratio>=100?`+${money(selectedWeeklyProgress.actual-selectedWeeklyProgress.target)}`:`متبقي ${money(Math.max(selectedWeeklyProgress.target-selectedWeeklyProgress.actual,0))}`} ر.س</b>}</footer>
       </section>}
      </aside>
     </div>
    </section>}
    <section className="oh-panel oh-activity" aria-labelledby="oh-activity-title">
     <header className="oh-panel-head"><span className="oh-icon"><Activity size={18}/></span><div><h3 id="oh-activity-title">حركة النظام</h3><p>آخر الإجراءات — للمتابعة السريعة دون تفاصيل زائدة</p></div>{data.activity.length>activityPageSize&&<nav className="activity-nav" aria-label="التنقل بين أحداث النظام"><button type="button" aria-label="الأحداث الأحدث" disabled={activityPage===0} onClick={()=>setActivityPage(page=>Math.max(0,page-1))}><ChevronRight size={15}/></button><span>{activityPage+1} / {activityPages}</span><button type="button" aria-label="الأحداث الأقدم" disabled={activityPage>=activityPages-1} onClick={()=>setActivityPage(page=>Math.min(activityPages-1,page+1))}><ChevronLeft size={15}/></button></nav>}</header>
     {visibleActivity.length?<ol className="oh-timeline">{visibleActivity.map((item,index)=>{const day=localDay(item.created_at),newDay=index===0||localDay(visibleActivity[index-1].created_at)!==day;return <li key={item.id}>{newDay&&<div className="oh-timeline-day">{dayLabel(day)}</div>}<article><span className="oh-avatar" aria-hidden="true">{(item.actor_name||"·").trim().charAt(0)}</span><div><b>{activitySentence(item)}</b><span>{item.subject_name?`العميل: ${item.subject_name}`:"تحديث مسجل في النظام"}</span></div><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleTimeString("ar-SA-u-nu-latn",{hour:"2-digit",minute:"2-digit"})}</time></article></li>})}</ol>:<div className="oh-empty">لا توجد حركة مسجلة بعد.</div>}
    </section>
   </div>
   <div className="oh-aside">
    <section className="oh-panel oh-priority" aria-labelledby="oh-priority-title">
     <header className="oh-panel-head"><span className="oh-icon warm"><ListChecks size={18}/></span><div><h3 id="oh-priority-title">الأولوية الآن</h3><p>{data.user.roles.includes("admin")?"أعلى المهام المفتوحة في النظام حسب الأولوية والموعد":"أعلى مهامك المفتوحة حسب الأولوية والموعد"}</p></div></header>
     {data.tasks.length?<ul className="oh-queue">{data.tasks.map(task=>{const due=dueLabel(task.due_at);return <li key={task.id}><button type="button" className={`oh-task ${priorityTone(task.priority)}`} onClick={onOpenTasks}><i aria-hidden="true"/><span><b>{task.title}</b><small>{task.department} · أولوية {task.priority}</small></span><em className={due==="متأخرة"?"late":due==="اليوم"?"today":""}>{due}</em></button></li>})}</ul>:<div className="oh-empty">لا توجد مهام مفتوحة حاليًا.</div>}
     <button type="button" className="oh-link" onClick={onOpenTasks}>فتح مركز العمليات<ChevronLeft size={15} aria-hidden="true"/></button>
    </section>
    {f&&f.reviewCount>0&&<section className="oh-panel oh-review" aria-labelledby="oh-review-title">
     <header className="oh-panel-head"><span className="oh-icon warm"><ReceiptText size={18}/></span><div><h3 id="oh-review-title">بانتظار المراجعة المالية</h3><p>عمليات لا تدخل الأرقام المالية حتى اعتمادها</p></div><span className="oh-count">{f.reviewCount}</span></header>
     <ul className="finance-review-breakdown">{reviewItems.map(([key,label])=><li key={key}><button type="button" onClick={()=>onOpenFinanceReview(key)}><span>{label}</span><b>{f.reviewBreakdown[key]}</b><ChevronLeft size={15} aria-hidden="true"/></button></li>)}</ul>
    </section>}
    <section className="oh-panel oh-trainees" aria-labelledby="oh-trainees-title">
     <header className="oh-panel-head"><span className="oh-icon"><UsersRound size={18}/></span><div><h3 id="oh-trainees-title">توزيع المتدربين</h3><p>حسب البرنامج والمسار</p></div></header>
     <div className="oh-trainee-list">{data.trainees.map(group=>{const open=openTraineeGroup===group.key;return <article className={open?"open":""} key={group.key}><button type="button" onClick={()=>setOpenTraineeGroup(open?"":group.key)} aria-expanded={open}><span>{group.label}</span><b>{group.count}</b><ChevronDown className="oh-chevron" size={16} aria-hidden="true"/><span className="oh-share" aria-hidden="true"><i style={{width:`${group.count/traineeMax*100}%`}}/></span></button>{open&&<div>{group.details.length?group.details.map(detail=><p key={detail.label}><span>{detail.label}</span><b>{detail.count}</b></p>):<small>لا يوجد متدربون في هذا التصنيف حالياً.</small>}</div>}</article>})}</div>
    </section>
   </div>
  </div>
 </div>
}
function HomeMetric({icon:Icon,label,value,suffix,note,tone,onClick}:{icon:LucideIcon;label:string;value:string|number;suffix?:string;note:string;tone:string;onClick?:()=>void}){const content=<><span className="oh-metric-icon"><Icon size={17}/></span><span className="oh-metric-label">{label}</span><b className="oh-metric-value">{value}{suffix&&<small>{suffix}</small>}</b><p>{note}</p>{onClick&&<ChevronLeft className="oh-metric-go" size={16} aria-hidden="true"/>}</>;return onClick?<button type="button" className={`oh-metric ${tone}`} onClick={onClick} aria-label={`${label}: ${value}${suffix?` ${suffix}`:""}. عرض التفاصيل`}>{content}</button>:<article className={`oh-metric ${tone}`}>{content}</article>}
function HomeDashboardSkeleton(){return <div className="ops-home oh-skeleton" aria-busy="true" aria-label="جارٍ تحميل البيانات الحية…"><i className="oh-sk-masthead"/><i className="oh-sk-pulse"/><div className="oh-body"><div className="oh-main"><i className="oh-sk-panel tall"/><i className="oh-sk-panel"/></div><div className="oh-aside"><i className="oh-sk-panel"/><i className="oh-sk-panel short"/></div></div></div>}
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
    ["b2b", "الشراكات وقطاع الأعمال", "الجهات والممثلون والمراحل والمحاضر والمستندات والاعتمادات"],
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
      link.download = `sulukera-${category}-${new Date().toLocaleDateString("en-CA")}.xlsx`;
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
    [categoryFilter, setCategoryFilter] = useState("الكل"),
    [statusFilter, setStatusFilter] = useState("الكل");
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
              orderId: String(row.order_number || row.order_id || "—"),
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
                  : row.assignment_date
                    ? `ينتقل إلى التهيئة تلقائياً في ${row.assignment_date}`
                    : "متابعة الملف",
              paid: Number(row.paid || 0),
              total: Number(row.total || 0),
              seatFee: Number(row.seat_fee || 0),
              delivery: String(row.delivery || ""),
              createdAt: String(row.created_at || ""),
              // The order's academy_status moves with every enrollment transition, so it drives the journey.
              journeyStatus: String(row.state || ""),
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
          .filter(label=>label!=="—")
          .filter(Boolean),
      ),
    ),
    statuses = Array.from(new Set(directoryRows.map((row) => row.state).filter((state) => state && state !== "—")));
  const matchesQuery = (row: (typeof initialPeople)[number]) =>
    `${row.name} ${row.id} ${row.phone} ${(row as typeof row & { orderId?: string }).orderId || ""} ${customerProgramCategory(row) === "التعليم المستمر" ? customerProgramLabel(row) : `${row.program} ${row.track}`} ${customerProgramLabel(row)}`.includes(query);
  const filtered = directoryRows
    .filter(
      (row) =>
        matchesQuery(row) &&
        (programFilter === "الكل" || customerProgramCategory(row) === programFilter) &&
        (categoryFilter === "الكل" || customerProgramLabel(row) === categoryFilter) &&
        (statusFilter === "الكل" || row.state === statusFilter),
    )
    .sort((a, b) =>
      String((b as typeof b & { createdAt?: string }).createdAt || "").localeCompare(
        String((a as typeof a & { createdAt?: string }).createdAt || ""),
      ),
    );
  const programCount = (program: string) => directoryRows.filter((row) => matchesQuery(row) && (program === "الكل" || customerProgramCategory(row) === program)).length;
  const filtersActive = programFilter !== "الكل" || categoryFilter !== "الكل" || statusFilter !== "الكل";
  const clearFilters = () => { setProgramFilter("الكل"); setCategoryFilter("الكل"); setStatusFilter("الكل"); };
  const selectProgram = (program: string) => {
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
  };
  const exportCustomers=()=>{
    const headers=["الرقم","اسم العميل","رقم العميل","رقم الطلب","رقم الجوال","البرنامج","التصنيف","الحالة","الملاحظة العملياتية","تاريخ الإضافة"],escape=(value:unknown)=>`"${String(value??"").replaceAll('"','""')}"`,lines=filtered.map((row,index)=>[index+1,row.name,row.id,row.orderId,row.phone,customerProgramCategory(row),customerProgramLabel(row),row.state,customerOperationalNote(row),(row as typeof row&{createdAt?:string}).createdAt||""]);
    const blob=new Blob(["﻿"+[headers,...lines].map(line=>line.map(escape).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download=`عملاء-سلوكيرا-${new Date().toLocaleDateString("en-CA")}.csv`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
  };
  if (!rows.length && (loading || error))
    return <LiveState loading={loading} error={error} empty={false} />;
  return (
    <div className="ops-home ops-customers">
      <section className="oh-panel cu-directory" aria-labelledby="cu-title">
        <header className="oh-panel-head">
          <span className="oh-icon"><Database size={18} /></span>
          <div><h3 id="cu-title">قاعدة بيانات العملاء</h3><p>ملف واحد لكل عميل مع آخر طلب له. التصدير يلتزم بالبحث والتصفية الحالية.</p></div>
          <button type="button" className="oh-btn customer-export" disabled={!filtered.length} onClick={exportCustomers}><Download size={15} aria-hidden="true" />تصدير النتائج <em>{filtered.length}</em></button>
        </header>
        <div className="cu-filters">
          <div className="oh-segment" role="tablist" aria-label="البرنامج">{["الكل", ...programs].map((program) => <button key={program} type="button" role="tab" aria-selected={programFilter === program} onClick={() => selectProgram(program)}>{program === "الكل" ? "كل البرامج" : program}<span className="oc-seg-count">{programCount(program)}</span></button>)}</div>
          <div className="cu-selects">
            <label className="cu-select"><span>التصنيف</span><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="الكل">كل التصنيفات</option>{classifications.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label className="cu-select"><span>الحالة</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="الكل">كل الحالات</option>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          </div>
        </div>
        <p className="oc-result-line cu-result" aria-live="polite">{filtered.length} من {directoryRows.length} عميل{query && <> · نتائج البحث عن «{query}»</>}{filtersActive && <button type="button" onClick={clearFilters}>مسح التصفية</button>}</p>
        {filtered.length ? <CompletedCustomerTable list={filtered} open={open} /> : <div className="oh-empty">لا يوجد عملاء يطابقون البحث والتصفية الحالية.</div>}
      </section>
    </div>
  );
}

type TraineeProgressRow = { enrollment_id:string;customer_id:string;customer_name:string;phone?:string;email?:string;program_name:string;order_number?:string;track?:string;cohort_label?:string;owner_email?:string;activated_at?:string;stage:string;stage_status:string;note?:string;due_at?:string;evidence_url?:string;updated_by_email?:string;updated_at?:string };
type TraineeProgressEvent = {id:string;enrollment_id:string;from_stage?:string;from_status?:string;to_stage:string;to_status:string;note?:string;due_at?:string;evidence_url?:string;actor_email:string;created_at:string};

function TraineeProgress({canManage}:{canManage:boolean}) {
  const [rows,setRows]=useState<TraineeProgressRow[]>([]),[history,setHistory]=useState<TraineeProgressEvent[]>([]),[stages,setStages]=useState<string[]>([]),[statuses,setStatuses]=useState<string[]>([]),[stageFilter,setStageFilter]=useState("الكل"),[search,setSearch]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState(""),[saving,setSaving]=useState("");
  const load=async(showLoading=true)=>{if(showLoading)setLoading(true);setError("");try{const data=await apiJson("/api/trainee-progress");setRows(data.trainees||[]);setHistory(data.history||[]);setStages(data.stages||[]);setStatuses(data.statuses||[]);}catch(cause){setError((cause as Error).message);}finally{if(showLoading)setLoading(false)}};
  useEffect(()=>{void load();},[]);
  const update=async(row:TraineeProgressRow,patch:Partial<TraineeProgressRow>)=>{const next={...row,...patch};setSaving(row.enrollment_id);setError("");try{await apiJson("/api/trainee-progress",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({enrollmentId:row.enrollment_id,stage:next.stage,status:next.stage_status,note:next.note||"",dueAt:next.due_at||"",evidenceUrl:next.evidence_url||""})});await load(false);window.dispatchEvent(new CustomEvent("sulukera:success",{detail:{message:"تم تحديث تقدم المتدرب"}}));}catch(cause){setError((cause as Error).message);}finally{setSaving("")}};
  if(loading||error&&!rows.length)return <LiveState loading={loading} error={error} empty={false}/>;
  const statusRank:Record<string,number>={"بانتظار المتدرب":0,"قيد التقدم":1,"لم يبدأ":2,"مكتمل":3};
  const filtered=rows.filter(row=>(stageFilter==="الكل"||row.stage===stageFilter)&&`${row.customer_name} ${row.order_number||""} ${row.email||""}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>(statusRank[a.stage_status]??2)-(statusRank[b.stage_status]??2)||a.customer_name.localeCompare(b.customer_name,"ar"));
  const completed=rows.filter(row=>row.stage==="المشروع"&&row.stage_status==="مكتمل").length,waiting=rows.filter(row=>row.stage_status==="بانتظار المتدرب").length,activeRows=filtered.filter(row=>row.stage_status!=="مكتمل"),completedRows=filtered.filter(row=>row.stage_status==="مكتمل");
  const renderCard=(row:TraineeProgressRow)=><article key={row.enrollment_id}>
    <header><i>{row.customer_name.slice(0,2)}</i><div><b>{row.customer_name}</b><span>{row.order_number||row.enrollment_id} · {row.track||"المسار غير محدد"}</span></div><em className={`status-${row.stage_status.replaceAll(" ","-")}`}>{row.stage_status}</em></header>
    <div className="trainee-stage-rail" aria-label={`تقدم ${row.customer_name}`}>{stages.map((stage,index)=>{const current=stages.indexOf(row.stage),done=index<current||(index===current&&row.stage_status==="مكتمل");return <span className={done?"done":index===current?"current":""} key={stage}><i>{done?<Check size={14}/>:index+1}</i><b>{stage}</b></span>})}</div>
    <div className="trainee-progress-details"><span><small>الدفعة</small><b>{row.cohort_label||"غير محددة"}</b></span><span><small>مسؤول المتابعة</small><b>{row.owner_email?.split("@")[0]||"غير مسند"}</b></span><span><small>آخر تحديث</small><b>{row.updated_at?new Date(row.updated_at).toLocaleDateString("ar-SA-u-nu-latn"):"لم يبدأ بعد"}</b></span></div>
    <div className="trainee-progress-controls"><label><span>المرحلة الحالية</span><select disabled={!canManage||saving===row.enrollment_id} value={row.stage} onChange={event=>void update(row,{stage:event.target.value,stage_status:"لم يبدأ"})}>{stages.map(stage=><option key={stage}>{stage}</option>)}</select></label><label><span>حالة المرحلة</span><select disabled={!canManage||saving===row.enrollment_id} value={row.stage_status} onChange={event=>void update(row,{stage_status:event.target.value})}>{statuses.map(status=><option key={status}>{status}</option>)}</select></label><label><span>الموعد المستهدف</span><input type="date" disabled={!canManage||saving===row.enrollment_id} value={row.due_at||""} onChange={event=>void update(row,{due_at:event.target.value})}/></label><label><span>رابط الإثبات</span><input type="url" disabled={!canManage||saving===row.enrollment_id} defaultValue={row.evidence_url||""} placeholder="https://" onBlur={event=>{if(event.target.value!==String(row.evidence_url||""))void update(row,{evidence_url:event.target.value})}}/></label><label className="progress-note"><span>ملاحظة المتابعة</span><input disabled={!canManage||saving===row.enrollment_id} defaultValue={row.note||""} placeholder="مثال: سلّم التطبيق وبانتظار المراجعة" onBlur={event=>{if(event.target.value!==String(row.note||""))void update(row,{note:event.target.value})}}/></label></div>
    {row.due_at&&row.stage_status!=="مكتمل"&&new Date(`${row.due_at}T23:59:59`).getTime()<Date.now()&&<div className="trainee-overdue"><Clock3 size={14}/> تجاوز الموعد المستهدف</div>}
    {history.some(event=>event.enrollment_id===row.enrollment_id)&&<details className="trainee-history"><summary>سجل التقدم ({history.filter(event=>event.enrollment_id===row.enrollment_id).length})</summary>{history.filter(event=>event.enrollment_id===row.enrollment_id).map(event=><p key={event.id}><b>{event.to_stage} · {event.to_status}</b><span>{event.actor_email.split("@")[0]} · {new Date(event.created_at).toLocaleString("ar-SA-u-nu-latn")}</span></p>)}</details>}
  </article>;
  return <div className="trainee-progress-page">
    <section className="trainee-progress-summary"><div><ChartNoAxesCombined size={22}/><span><b>مسار مستقل بعد التفعيل</b><small>تُسحب هوية المتدرب من سجل العميل، ويُحفظ التقدم منفصلًا استعدادًا لنقله إلى نظام الطلاب.</small></span></div><dl><div><dt>إجمالي المتدربين</dt><dd>{rows.length}</dd></div><div><dt>بانتظار المتدرب</dt><dd>{waiting}</dd></div><div><dt>أكملوا المشروع</dt><dd>{completed}</dd></div></dl></section>
    <section className="trainee-progress-toolbar"><label><Search size={17}/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="ابحث باسم المتدرب أو رقم الطلب"/></label><div role="tablist" aria-label="تصفية حسب المرحلة"><button className={stageFilter==="الكل"?"active":""} onClick={()=>setStageFilter("الكل")}>الكل <em>{rows.length}</em></button>{stages.map(stage=><button key={stage} className={stageFilter===stage?"active":""} onClick={()=>setStageFilter(stage)}>{stage}<em>{rows.filter(row=>row.stage===stage).length}</em></button>)}</div><a className="trainee-export" href="/api/trainee-progress?format=portable" target="_blank" rel="noreferrer"><Download size={15}/> تصدير للنقل</a></section>
    {error&&<div className="inline-error" role="alert">{error}</div>}
    {activeRows.length?<section className="trainee-progress-list">{activeRows.map(renderCard)}</section>:!completedRows.length&&<div className="guided-empty"><ChartNoAxesCombined size={28}/><b>لا يوجد متدربون ضمن هذا العرض</b><span>يظهر متدرب إدارة السلوك التنظيمي هنا تلقائيًا بعد اكتمال تهيئته وتفعيله.</span></div>}
    {completedRows.length>0&&<details className="completed-trainees"><summary><span><Check size={16}/> المكتملون</span><em>{completedRows.length}</em></summary><section className="trainee-progress-list">{completedRows.map(renderCard)}</section></details>}
  </div>;
}

type OperationsCenterData = {
  generatedAt: string;
  canManageEvents: boolean;
  canTakeAttentionAction: boolean;
  stats: { upcoming: number; overdue: number; dueToday?: number; attention: number; incomplete: number };
  events: { id: string; title: string; event_date: string; event_time?: string; details?: string; audience: string }[];
  schedule: { id: string; assignment_date?: string; start_date?: string; reservation_kind: string; cohort_label?: string; status: string; customer_name: string; program_name: string }[];
  exceptions: { id: string; order_id?: string; order_number?: string; customer_id?: string; customer_name?: string; phone?: string; email?: string; program_name?: string; purchase_source?: string; track?: string; delivery?: string; total?: number; paid?: number; title: string; department: string; due_at?: string; entity_type: string; kind: string; severity: string; priority?: string; responsible_email?: string; responsible_name?: string | null; last_action_by_email?: string; last_action_by_name?: string | null; last_action_at?: string; attention_state?: "needs_operations" | "waiting_finance" | "finance_resolved" }[];
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

const operationsCaseKinds = [["all", "الكل"], ["overdue", "متأخرة"], ["due_today", "مستحقة اليوم"], ["policy", "السياسة والانسحاب"], ["data", "بيانات ناقصة"]] as const;
type OperationsCaseKind = (typeof operationsCaseKinds)[number][0];
type OperationsCase = OperationsCenterData["exceptions"][number];
function LiveWork({ onNavigate,onOpenCustomer,currentEmail = "" }: { onNavigate: (view: View) => void;onOpenCustomer:(customer:(typeof initialPeople)[number])=>void;currentEmail?:string }) {
  const [data, setData] = useState<OperationsCenterData | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState(""), [acting, setActing] = useState("");
  const [kind, setKind] = useState<OperationsCaseKind>("all"), [waiting, setWaiting] = useState<"" | "التشغيل" | "المالية">(""), [mine, setMine] = useState(false), [caseQuery, setCaseQuery] = useState(""), [agendaExpanded, setAgendaExpanded] = useState(false);
  const load = async () => { setLoading(true); setError(""); try { setData(await apiJson("/api/operations-center")); } catch (e) { setError((e as Error).message); } finally { setLoading(false); } };
  useEffect(() => { void load(); const refresh = () => void load(); window.addEventListener("sulukera:data-changed", refresh); return () => window.removeEventListener("sulukera:data-changed", refresh); }, []);
  // First load shows a skeleton; refreshes and action errors keep the queue on screen.
  if (!data) return loading ? <HomeDashboardSkeleton /> : <LiveState loading={false} error={error} empty />;
  const dateLabel = (value?: string) => value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("ar-SA-u-nu-latn", { weekday: "short", day: "numeric", month: "short" }) : "غير محدد";
  const timeAgo = (value?: string) => { if (!value) return "غير مسجل"; const diff = Math.max(0, Date.now() - new Date(value).getTime()), hours = Math.floor(diff / 3_600_000); return hours < 1 ? "منذ أقل من ساعة" : hours < 24 ? `منذ ${hours} ساعة` : `منذ ${Math.floor(hours / 24)} يوم`; };
  const shortEmail = (value?: string) => value ? value.split("@")[0] : "غير مسند";
  const staffLabel = (name?: string | null, email?: string) => name || shortEmail(email);
  const waitingFor = (row: OperationsCenterData["exceptions"][number]) => row.attention_state === "waiting_finance" || row.department === "المالية" ? "المالية" : row.kind === "data" ? "التشغيل" : "التشغيل";
  const nextAction = (row: OperationsCenterData["exceptions"][number]) => row.kind === "withdrawal" ? "إكمال إجراء الانسحاب وإغلاق المتابعة" : row.kind === "policy" ? row.attention_state === "waiting_finance" ? "تحديث الحالة من المالية" : "تنفيذ الإجراء التشغيلي وتوثيقه" : row.kind === "data" ? "استكمال وسيلة التواصل الناقصة" : row.title;
  const whatsappHref = (row: OperationsCenterData["exceptions"][number]) => { const digits = String(row.phone || "").replace(/\D/g, "").replace(/^00/, ""); if (!digits) return ""; const phone = digits.startsWith("966") ? digits : digits.startsWith("0") ? `966${digits.slice(1)}` : digits; return `https://wa.me/${phone}?text=${encodeURIComponent(`مرحبًا ${row.customer_name || ""}، نتابع معك بخصوص ${row.program_name || "طلبك"}.`)}`; };
  const routeFor = (row: OperationsCenterData["exceptions"][number]): View => row.kind === "policy" || row.department === "المالية" ? "finance" : "registration";
  const openCustomer=(row:OperationsCenterData["exceptions"][number])=>{if(!row.customer_id)return;onOpenCustomer({id:row.customer_id,name:row.customer_name||"عميل",phone:row.phone||"—",program:row.program_name||"—",track:row.track||"—",cohort:"—",source:row.purchase_source||"—",owner:"غير مسند",state:row.title,tone:row.severity,due:row.due_at?`مستحق ${dateLabel(row.due_at)}`:"بحاجة إلى إجراء",paid:Number(row.paid||0),total:Number(row.total||0),email:row.email||"",orderId:row.order_number||row.order_id||"—",delivery:row.delivery||""} as (typeof initialPeople)[number])};
  const takeAttentionAction = async (row: OperationsCenterData["exceptions"][number]) => {
    if (!row.order_id) return;
    setActing(row.id); setError("");
    try {
      await apiJson("/api/operations-center", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "take_attention_action", orderId: row.order_id }) });
      await load();
      window.dispatchEvent(new CustomEvent("sulukera:data-changed", { detail: { entity: "attention", id: row.order_id } }));
    } catch (cause) { setError((cause as Error).message); } finally { setActing(""); }
  };
  const dateLocale = "ar-SA-u-ca-gregory-nu-latn", dayKey = (value?: string) => String(value || "").slice(0, 10), now = new Date(), localToday = now.toLocaleDateString("en-CA"), localTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toLocaleDateString("en-CA");
  const dayHeading = (day: string) => day === localToday ? "اليوم" : day === localTomorrow ? "غدًا" : new Date(`${day}T12:00:00`).toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" });
  const caseLabel = (row: OperationsCase) => row.kind === "withdrawal" ? "إجراء انسحاب" : row.kind === "policy" ? row.attention_state === "waiting_finance" ? "بانتظار تحديث المالية" : "إجراء تشغيلي مطلوب" : row.title;
  const kindLabel = (row: OperationsCase) => row.kind === "overdue" ? "مهمة متأخرة" : row.kind === "due_today" ? "مستحقة اليوم" : row.kind === "withdrawal" ? "انسحاب" : row.kind === "policy" ? "تطبيق السياسة" : "بيانات ناقصة";
  const kindGroup = (row: OperationsCase): OperationsCaseKind => row.kind === "withdrawal" ? "policy" : row.kind as OperationsCaseKind;
  const priorityTone = (row: OperationsCase) => row.priority === "عاجلة" ? "urgent" : row.priority === "عالية" || !row.priority ? "high" : "normal";
  const dueChip = (row: OperationsCase) => {
    if (!row.due_at) return { label: "دون موعد", tone: "" };
    const late = Math.round((Date.parse(`${localToday}T12:00:00`) - Date.parse(`${dayKey(row.due_at)}T12:00:00`)) / 864e5);
    if (late > 0) return { label: late === 1 ? "متأخرة يومًا" : late === 2 ? "متأخرة يومين" : `متأخرة ${late} ${late <= 10 ? "أيام" : "يومًا"}`, tone: "late" };
    return late === 0 ? { label: "اليوم", tone: "today" } : { label: dateLabel(row.due_at), tone: "" };
  };
  const priorityOrder: Record<string, number> = { "عاجلة": 0, "عالية": 1 }, kindOrder: Record<string, number> = { overdue: 0, due_today: 1, withdrawal: 2, policy: 3 };
  const rank = (row: OperationsCase) => [priorityOrder[row.priority || "عالية"] ?? 2, kindOrder[row.kind] ?? 3];
  const sortedCases = [...data.exceptions].sort((a, b) => { const [pa, ka] = rank(a), [pb, kb] = rank(b); return pa - pb || ka - kb || (a.due_at || "9").localeCompare(b.due_at || "9"); });
  const needle = caseQuery.trim().toLowerCase();
  const filteredCases = sortedCases.filter((row) => (!waiting || waitingFor(row) === waiting) && (!mine || row.responsible_email === currentEmail) && (!needle || [row.customer_name, row.order_number, row.program_name, row.phone].some((value) => String(value || "").toLowerCase().includes(needle))));
  const kindCounts = Object.fromEntries(operationsCaseKinds.map(([key]) => [key, key === "all" ? filteredCases.length : filteredCases.filter((row) => kindGroup(row) === key).length])) as Record<OperationsCaseKind, number>;
  const visibleCases = kind === "all" ? filteredCases : filteredCases.filter((row) => kindGroup(row) === kind);
  const mineCount = currentEmail ? data.exceptions.filter((row) => row.responsible_email === currentEmail).length : 0;
  const filtersActive = kind !== "all" || Boolean(waiting) || mine || Boolean(needle);
  const clearFilters = () => { setKind("all"); setWaiting(""); setMine(false); setCaseQuery(""); };
  const scrollToPanel = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  const focusQueue = (next: OperationsCaseKind) => { clearFilters(); setKind(next); scrollToPanel("oc-queue"); };
  // The API caps each case query at 50 rows; say so instead of implying the list is complete.
  const capped = [data.stats.overdue + (data.stats.dueToday || 0), data.stats.attention, data.stats.incomplete].some((count) => count >= 50);
  const agenda = [
    ...data.events.map((item) => ({ id: `event-${item.id}`, day: dayKey(item.event_date), type: "event" as const, title: item.title, detail: item.details || "موعد للفريق", extra: "", time: item.event_time || "طوال اليوم", tag: "موعد فريق" })),
    ...data.schedule.map((item) => ({ id: `schedule-${item.id}`, day: dayKey(item.assignment_date || item.start_date), type: "schedule" as const, title: item.program_name, detail: `${item.customer_name} · ${item.reservation_kind}${item.cohort_label ? ` · ${item.cohort_label}` : ""}`, extra: item.assignment_date && item.start_date ? `بداية البرنامج ${dateLabel(item.start_date)}` : "", time: item.assignment_date ? "موعد الإسناد" : "بداية البرنامج", tag: item.status })),
  ].filter((item) => item.day).sort((a, b) => a.day.localeCompare(b.day) || (a.type === b.type ? 0 : a.type === "event" ? -1 : 1));
  const agendaLimit = 8, shownAgenda = agendaExpanded ? agenda : agenda.slice(0, agendaLimit);
  return <div className="ops-home ops-work" aria-busy={loading}>
    {error && <div className="oh-alert" role="alert">{error}</div>}
    <header className="oh-masthead">
      <div><span className="oh-eyebrow">نظرة اليوم</span><h2>{dailyOperationsMessage()}</h2><p><i className="oh-live" aria-hidden="true" />آخر تحديث {new Date(data.generatedAt).toLocaleTimeString("ar-SA-u-nu-latn", { hour: "2-digit", minute: "2-digit" })}</p></div>
      <button type="button" className="oh-btn" onClick={() => void load()} disabled={loading}><RefreshCw size={15} aria-hidden="true" className={loading ? "oc-spin" : ""} />{loading ? "جارٍ التحديث…" : "تحديث"}</button>
    </header>
    <section className="oh-pulse oc-pulse" aria-labelledby="oc-pulse-title">
      <header><h3 id="oc-pulse-title">نبض التشغيل</h3><p>اضغط على أي مؤشر لعرض الحالات التي تكوّن منها الرقم.</p></header>
      <div>
        <HomeMetric icon={Clock3} label="مهام متأخرة" value={data.stats.overdue} note={data.stats.dueToday ? `مهام تجاوزت تاريخ تنفيذها، و${data.stats.dueToday} مستحقة اليوم` : "مهام مفتوحة تجاوزت تاريخ تنفيذها"} tone={data.stats.overdue ? "danger" : "neutral"} onClick={() => focusQueue("overdue")} />
        <HomeMetric icon={ShieldCheck} label="السياسة والانسحاب" value={data.stats.attention} note="حالات تطبيق السياسة والانسحاب المفتوحة" tone={data.stats.attention ? "attention" : "neutral"} onClick={() => focusQueue("policy")} />
        <HomeMetric icon={CircleUserRound} label="بيانات ناقصة" value={data.stats.incomplete} note="عملاء دون جوال أو بريد، تؤثر على جاهزيتهم" tone={data.stats.incomplete ? "attention" : "neutral"} onClick={() => focusQueue("data")} />
        <HomeMetric icon={CalendarDays} label="مواعيد قادمة" value={data.stats.upcoming} note="الجدول التشغيلي لـ30 يومًا ومواعيد الفريق لـ90 يومًا" tone="brand" onClick={() => scrollToPanel("oc-agenda")} />
      </div>
    </section>
    <div className="oh-body">
      <div className="oh-main">
        <section id="oc-queue" className="oh-panel operations-exceptions oc-queue" aria-labelledby="oc-queue-title">
          <header className="oh-panel-head"><span className="oh-icon warm"><ListChecks size={18} /></span><div><h3 id="oc-queue-title">حالات بحاجة لتدخل</h3><p>مرتبة حسب الأولوية ثم الموعد · متابعة مشتركة بين التشغيل والمالية حتى إغلاق الحالة</p></div><span className="oh-count">{data.exceptions.length}</span></header>
          {data.exceptions.length > 0 && <div className="oc-filters">
            <div className="oh-segment" role="tablist" aria-label="نوع الحالة">{operationsCaseKinds.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={kind === key} onClick={() => setKind(key)}>{label}<span className="oc-seg-count">{kindCounts[key]}</span></button>)}</div>
            <div className="oc-chips" role="group" aria-label="تصفية إضافية">
              {currentEmail && <button type="button" className="oc-chip" aria-pressed={mine} onClick={() => setMine((value) => !value)}>حالاتي<b>{mineCount}</b></button>}
              {(["التشغيل", "المالية"] as const).map((team) => <button key={team} type="button" className="oc-chip" aria-pressed={waiting === team} onClick={() => setWaiting(waiting === team ? "" : team)}>بانتظار {team}</button>)}
              <label className="oc-search"><Search size={15} aria-hidden="true" /><span className="sr-only">ابحث في الحالات</span><input type="search" value={caseQuery} onChange={(event) => setCaseQuery(event.target.value)} placeholder="اسم العميل أو رقم الطلب" /></label>
            </div>
          </div>}
          {visibleCases.length ? <ul className="oc-cases">{visibleCases.map((item) => {
            const whatsapp = whatsappHref(item), due = dueChip(item), canAct = ["policy", "withdrawal"].includes(item.kind) && data.canTakeAttentionAction && item.attention_state !== "waiting_finance";
            return <li key={item.id} className={`oc-case ${priorityTone(item)}`}><article className={`${item.severity} ${item.customer_id?"customer-actionable":""}`} onClick={() => item.customer_id && openCustomer(item)}>
              <i className="oc-mark" aria-hidden="true" />
              <div className="oc-case-main">
                <p className="oc-case-head"><span className="oc-kind">{kindLabel(item)}</span><b>{caseLabel(item)}</b></p>
                <p className="oc-case-who">{item.customer_id ? <button type="button" className="exception-customer" onClick={(event) => { event.stopPropagation(); openCustomer(item); }}>{item.customer_name || "عميل"}</button> : <span>{item.customer_name || "إجراء داخلي"}</span>}<span>{[item.program_name, item.order_number].filter(Boolean).join(" · ") || "ملف العميل"}</span></p>
                {nextAction(item) !== caseLabel(item) && <p className="oc-next"><small>الإجراء التالي</small>{nextAction(item)}</p>}
                <dl className="oc-meta"><div><dt>بانتظار</dt><dd>{waitingFor(item)}</dd></div><div><dt>المسؤول</dt><dd>{staffLabel(item.responsible_name, item.responsible_email)}</dd></div><div><dt>عمر الحالة</dt><dd>{timeAgo(item.last_action_at)}</dd></div><div><dt>آخر إجراء</dt><dd>{item.last_action_by_email ? staffLabel(item.last_action_by_name, item.last_action_by_email) : "لم يسجل"}</dd></div></dl>
              </div>
              <div className="oc-case-side"><em className={`oc-due ${due.tone}`}>{due.label}</em><span className="oc-priority">أولوية {item.priority || "عالية"}</span></div>
              <div className="oc-actions">
                {whatsapp && <a className="oh-btn" href={whatsapp} target="_blank" rel="noreferrer" aria-label={`فتح واتساب مع ${item.customer_name || "العميل"}`} onClick={(event) => event.stopPropagation()}><FaWhatsapp size={15} aria-hidden="true" />واتساب</a>}
                <button type="button" className="oh-btn" onClick={(event) => { event.stopPropagation(); if (item.customer_id) openCustomer(item); else onNavigate(routeFor(item)); }}><Eye size={15} aria-hidden="true" />فتح ملف العميل</button>
                {canAct && <button type="button" className="oh-btn primary" disabled={acting === item.id} onClick={(event) => { event.stopPropagation(); void takeAttentionAction(item); }}>{acting === item.id ? "جارٍ الحفظ…" : <><Check size={15} aria-hidden="true" />تم اتخاذ الإجراء</>}</button>}
              </div>
            </article></li>;
          })}</ul> : data.exceptions.length ? <div className="oh-empty oc-filter-empty"><span>لا توجد حالات تطابق التصفية الحالية.</span><button type="button" className="oh-btn" onClick={clearFilters}>مسح التصفية</button></div>
            : <div className="oc-calm"><ShieldCheck size={26} aria-hidden="true" /><b>الوضع التشغيلي مستقر</b><span>لا توجد استثناءات أو مهام متأخرة حاليًا.</span></div>}
          {filtersActive && visibleCases.length > 0 && <p className="oc-result-line">{visibleCases.length} من {data.exceptions.length} حالة<button type="button" onClick={clearFilters}>مسح التصفية</button></p>}
          {capped && <p className="oh-footnote"><Info size={14} aria-hidden="true" />تعرض القائمة أول 50 حالة من كل نوع، لذلك قد توجد حالات أخرى غير ظاهرة.</p>}
        </section>
      </div>
      <div className="oh-aside">
        <section id="oc-agenda" className="oh-panel oc-agenda" aria-labelledby="oc-agenda-title">
          <header className="oh-panel-head"><span className="oh-icon"><CalendarDays size={18} /></span><div><h3 id="oc-agenda-title">الأيام القادمة</h3><p>مواعيد الفريق ومواعيد الإسناد وبداية البرامج في مكان واحد</p></div><span className="oh-count">{agenda.length}</span></header>
          {agenda.length ? <ol className="oh-timeline oc-timeline">{shownAgenda.map((item, index) => <li key={item.id}>
            {(index === 0 || shownAgenda[index - 1].day !== item.day) && <div className="oh-timeline-day">{dayHeading(item.day)}</div>}
            <article className={item.type}><span className="oc-agenda-icon" aria-hidden="true">{item.type === "event" ? <CalendarDays size={15} /> : <BookOpenCheck size={15} />}</span><div><b>{item.title}</b><span>{item.detail}</span>{item.extra && <span>{item.extra}</span>}</div><div className="oc-agenda-side"><time>{item.time}</time><em>{item.tag}</em></div></article>
          </li>)}</ol> : <div className="oh-empty">لا توجد مواعيد قادمة. ستظهر هنا مواعيد الفريق ومواعيد الإسناد وبداية البرامج عند جدولتها.</div>}
          {agenda.length > agendaLimit && <button type="button" className="oh-link" aria-expanded={agendaExpanded} onClick={() => setAgendaExpanded((value) => !value)}>{agendaExpanded ? "عرض أقل" : `عرض كل المواعيد (${agenda.length})`}<ChevronDown size={15} aria-hidden="true" className={agendaExpanded ? "oc-flip" : ""} /></button>}
        </section>
      </div>
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

type PendingTrialDecision = { row: LiveTrial; action: "subscribe" | "not_interested"; label: string };
function TrialHandoff({ canDecide }: { canDecide: boolean }) {
  const [rows, setRows] = useState<LiveTrial[]>([]),
    [loaded, setLoaded] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [pendingDecision, setPendingDecision] = useState<PendingTrialDecision | null>(null),
    [programFilter, setProgramFilter] = useState("الكل"),
    [statusFilter, setStatusFilter] = useState("الكل");
  const decisionTimer = useRef<ReturnType<typeof setTimeout> | null>(null), pendingRef = useRef<PendingTrialDecision | null>(null);
  // Refreshes keep the list on screen; only the first load shows a loading line.
  const load = async () => {
    setLoading(true);
    try {
      setRows((await apiJson("/api/trials")).trials || []);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };
  // A decision waits a few seconds so it can be undone, then it is sent. Leaving the page sends it at once.
  const commitDecision = async (decision: PendingTrialDecision, keepalive = false) => {
    pendingRef.current = null;
    if (decisionTimer.current) clearTimeout(decisionTimer.current);
    decisionTimer.current = null;
    setPendingDecision(null);
    try {
      await apiJson("/api/trials", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ trialId: decision.row.id, action: decision.action }),
        keepalive,
      });
      window.dispatchEvent(new CustomEvent("sulukera:data-changed"));
    } catch (e) {
      setError(`تعذر تنفيذ «${decision.label}» لـ ${decision.row.customer_name}: ${(e as Error).message}`);
    }
    void load();
  };
  const commitRef = useRef(commitDecision);
  useEffect(() => { commitRef.current = commitDecision; });
  useEffect(() => {
    void load();
    const refresh = () => { if (!pendingRef.current) void load(); };
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    const flush = () => { if (pendingRef.current) void commitRef.current(pendingRef.current, true); };
    window.addEventListener("sulukera:data-changed", refresh);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("sulukera:data-changed", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, []);
  const decide = (row: LiveTrial, action: "subscribe" | "not_interested") => {
    if (!canDecide) return;
    if (pendingRef.current) void commitDecision(pendingRef.current);
    const decision = { row, action, label: action === "subscribe" ? "اشتراك ونقل إلى التهيئة" : "غير مهتم" };
    pendingRef.current = decision;
    setPendingDecision(decision);
    decisionTimer.current = setTimeout(() => { if (pendingRef.current === decision) void commitDecision(decision); }, 6000);
  };
  const undoDecision = () => {
    if (decisionTimer.current) clearTimeout(decisionTimer.current);
    decisionTimer.current = null;
    pendingRef.current = null;
    setPendingDecision(null);
  };
  const visibleRows = rows.filter((row) => row.id !== pendingDecision?.row.id);
  if (loaded && !error && !visibleRows.length && !pendingDecision) return null;
  const now = new Date(), todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const daysLeft = (row: LiveTrial) => { const end = new Date(row.ends_at); return Math.round((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - todayUtc) / 864e5); };
  const trialStatus = (row: LiveTrial) => (daysLeft(row) < 0 ? "انتهت التجربة" : "تجربة نشطة");
  const trialChip = (row: LiveTrial) => {
    const left = daysLeft(row), days = Math.abs(left), unit = days === 1 ? "يوم" : days === 2 ? "يومين" : days <= 10 ? `${days} أيام` : `${days} يومًا`;
    return left < 0 ? { label: `انتهت منذ ${unit}`, tone: "late" } : left === 0 ? { label: "تنتهي اليوم", tone: "today" } : { label: `باقٍ ${unit}`, tone: left <= 2 ? "today" : "" };
  };
  const trialPrograms = Array.from(new Set(visibleRows.map((row) => row.program_name).filter(Boolean)));
  const trialStatuses = Array.from(new Set(visibleRows.map(trialStatus)));
  // Expired trials first (they need a decision now), then the ones ending soonest.
  const filteredTrials = visibleRows
    .filter((row) => (programFilter === "الكل" || row.program_name === programFilter) && (statusFilter === "الكل" || trialStatus(row) === statusFilter))
    .sort((a, b) => daysLeft(a) - daysLeft(b));
  return (
    <div className="ops-home ops-contact">
    <section className="oh-panel tr-panel" aria-labelledby="tr-title" aria-busy={loading}>
      <header className="oh-panel-head">
        <span className="oh-icon"><UsersRound size={18} /></span>
        <div><h3 id="tr-title">عملاء التجربة: متابعة القرار</h3><p>اشتراك ينقل العميل مباشرة إلى التهيئة، وغير مهتم يغلق التجربة ويصنّف الملف.</p></div>
        <span className="oh-count">{visibleRows.length}</span>
      </header>
      {error && <div className="oh-alert tr-alert" role="alert">{error}</div>}
      {visibleRows.length > 1 && <div className="tr-filters">
        <div className="oh-segment" role="tablist" aria-label="حالة التجربة">{["الكل", ...trialStatuses].map((status) => <button key={status} type="button" role="tab" aria-selected={statusFilter === status} onClick={() => setStatusFilter(status)}>{status}<span className="oc-seg-count">{status === "الكل" ? visibleRows.length : visibleRows.filter((row) => trialStatus(row) === status).length}</span></button>)}</div>
        {trialPrograms.length > 1 && <label className="cu-select"><span>البرنامج</span><select value={programFilter} onChange={(event) => setProgramFilter(event.target.value)}><option value="الكل">كل البرامج</option>{trialPrograms.map((program) => <option key={program} value={program}>{program}</option>)}</select></label>}
      </div>}
      {!canDecide && <p className="oh-footnote tr-readonly"><Info size={14} aria-hidden="true" />قرار الاشتراك أو عدم الاهتمام متاح لفريق المبيعات. يمكنك متابعة عملاء التجربة.</p>}
      {!loaded ? <div className="oh-empty">جارٍ تحميل عملاء التجربة…</div> : filteredTrials.length ? <ul className="tr-list">{filteredTrials.map((row) => {
        const chip = trialChip(row);
        return <li key={row.id} className={`tr-row ${chip.tone}`}>
          <i className="oc-mark" aria-hidden="true" />
          <div className="tr-who"><b>{row.customer_name}</b><span>{row.program_name} · {row.program_code}</span></div>
          <div className="tr-contact"><span dir="ltr">{row.phone || "غير مسجل"}</span><small dir="ltr">{row.email || "دون بريد"}</small></div>
          <div className="tr-period"><em className={`oc-due ${chip.tone}`}>{chip.label}</em><small>تنتهي {new Date(row.ends_at).toLocaleDateString("en-GB", { timeZone: "Asia/Riyadh" })}</small></div>
          {canDecide && <div className="tr-actions">
            <button type="button" className="oh-btn primary" onClick={() => decide(row, "subscribe")}>اشتراك ونقل إلى التهيئة</button>
            <button type="button" className="oh-btn danger" onClick={() => decide(row, "not_interested")}>غير مهتم</button>
          </div>}
        </li>;
      })}</ul> : <div className="oh-empty">لا توجد تجارب تطابق التصفية الحالية.</div>}
      {pendingDecision && <div className="ac-undo" role="status"><Check size={16} aria-hidden="true" /><span>«{pendingDecision.label}» لـ <b>{pendingDecision.row.customer_name}</b></span><button type="button" onClick={undoDecision}>تراجع</button></div>}
    </section>
    </div>
  );
}

const enrollmentSteps: Record<string, [string, string]> = {
  جديد: ["contacted", "تأكيد تسليم العميل"],
  "تم التواصل": ["registered", "تهيئة العميل"],
  "بانتظار إنشاء الحساب": ["account_created", "تأكيد إنشاء الحساب"],
  "اكتمل التسجيل": ["activated", "تم تفعيل المقررات"],
  "تم إنشاء الحساب": ["activated", "تم تفعيل المقررات"],
};
const enrollmentStep = (row: LiveEnrollment): [string, string] | undefined =>
  row.order_type === "تقييم كفاءة" && row.status === "تم التواصل"
    ? ["registered", "إضافة خدمة التقييم"]
    : row.order_type === "إشراف" && row.status === "تم التواصل"
    ? ["registered", "تهيئة العميل"]
    : enrollmentSteps[row.status];
function PaymentReferenceControl({
  paymentId,
  orderId,
  initialReference = "",
  canEdit = false,
  onSaved,
}: {
  paymentId?: string;
  orderId?: string;
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
  }, [initialReference, paymentId, orderId]);
  const save = async () => {
    if ((!paymentId && !orderId) || !/^https?:\/\/\S+$/i.test(draft.trim())) {
      setError("أدخل رابطاً صحيحاً يبدأ بـ http أو https");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiJson(paymentId ? "/api/payments" : "/api/finance", {
        method: paymentId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(paymentId
          ? { paymentId, reference: draft.trim() }
          : { action: "update_order_payment_reference", orderId, reference: draft.trim() }),
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
  if (!paymentId && !orderId) return null;
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
// Days since the enrollment last changed: how long a case has been sitting in its current column.
function academyAge(updatedAt?: string) {
  if (!updatedAt) return { label: "دون تاريخ", tone: "", days: -1 };
  const started = new Date(updatedAt), today = new Date();
  const days = Math.max(0, Math.round((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(started.getFullYear(), started.getMonth(), started.getDate())) / 864e5));
  const label = days === 0 ? "اليوم" : days === 1 ? "منذ يوم" : days === 2 ? "منذ يومين" : `منذ ${days} ${days <= 10 ? "أيام" : "يومًا"}`;
  return { label, tone: days >= 7 ? "late" : days >= 3 ? "today" : "", days };
}
function OperationsCustomerCard({
  row,
  nextLabel,
  canAdvance,
  onOpen,
  onWhatsapp,
  onEmail,
  onAdvance,
}: {
  row: LiveEnrollment;
  nextLabel?: string;
  canAdvance: boolean;
  onOpen: () => void;
  onWhatsapp: () => void;
  onEmail: () => void;
  onAdvance?: () => void;
}) {
  const age = academyAge(row.updated_at);
  return (
    <article className={`ac-case ${age.tone}`} onClick={onOpen}>
      <i className="oc-mark" aria-hidden="true" />
      <div className="ac-who">
        <button type="button" className="ac-name" onClick={(event) => { event.stopPropagation(); onOpen(); }}>{row.customer_name}</button>
        <span>{row.order_number || row.order_id}</span>
        {Boolean(row.needs_attention) && <em className="cu-status danger">تطبيق السياسة</em>}
      </div>
      <div className="ac-program">
        <b>{programFamily(row.program_name)}</b>
        <span className="ac-tags">
          {liveProgramClassification(row) && <small>التصنيف: {liveProgramClassification(row)}</small>}
          {liveProgramOperationalNote(row) && <small className="note">ملاحظة تشغيلية: {liveProgramOperationalNote(row)}</small>}
          {row.program_delivery && row.program_track?.toUpperCase() !== "ABAT" && <small className="ops-program-delivery">{row.program_delivery}</small>}
          {Boolean(row.competency_assessment) && <small>مع تقييم كفاءة</small>}
        </span>
      </div>
      <div className="ac-contact">
        <span dir="ltr">{row.phone || "غير مسجل"}</span>
        <small dir="ltr">{row.email || "دون بريد"}</small>
        <small>{row.purchase_source || "مصدر غير محدد"}</small>
      </div>
      <div className="ac-age">
        <em className={`oc-due ${age.tone}`}>{age.label}</em>
        <small>آخر تغيير {row.updated_at ? new Date(row.updated_at).toLocaleDateString("en-GB", { timeZone: "Asia/Riyadh" }) : "غير محدد"}</small>
      </div>
      <div className="ac-actions">
        <button type="button" className="oh-btn icon" aria-label={`واتساب ${row.customer_name}`} disabled={!row.phone} onClick={(event) => { event.stopPropagation(); onWhatsapp(); }}><FaWhatsapp size={15} aria-hidden="true" /></button>
        <button type="button" className="oh-btn icon" aria-label={`إيميل ${row.customer_name}`} disabled={!row.email} onClick={(event) => { event.stopPropagation(); onEmail(); }}><Mail size={15} aria-hidden="true" /></button>
        {canAdvance && nextLabel && onAdvance && <button type="button" className="oh-btn primary" onClick={(event) => { event.stopPropagation(); onAdvance(); }}>{nextLabel}</button>}
      </div>
    </article>
  );
}
type PendingAcademyMove = { row: LiveEnrollment; action: string; label: string };
function LiveAcademy({
  focus,
  canManagePaymentReference,
  canAdvance,
}: {
  focus: "contact" | "registration" | "assignment" | "program-activation";
  canManagePaymentReference: boolean;
  canAdvance: boolean;
}) {
  const [rows, setRows] = useState<LiveEnrollment[]>([]),
    [loaded, setLoaded] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [pendingMove, setPendingMove] = useState<PendingAcademyMove | null>(null),
    [programFilter, setProgramFilter] = useState(focus === "registration" ? "تحليل السلوك التطبيقي" : "الكل"),
    [subprogramFilter, setSubprogramFilter] = useState("الكل"),
    [statusFilter, setStatusFilter] = useState("الكل"),
    [selectedRow, setSelectedRow] = useState<LiveEnrollment | null>(null);
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null), pendingRef = useRef<PendingAcademyMove | null>(null);
  // Refreshes keep the current list on screen; only the first load shows a skeleton.
  const load = async () => {
    setLoading(true);
    try {
      setRows((await apiJson("/api/enrollments")).enrollments || []);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };
  // A move waits a few seconds so it can be undone, then it is sent. Leaving the page sends it at once.
  const commitMove = async (move: PendingAcademyMove, keepalive = false) => {
    pendingRef.current = null;
    if (moveTimer.current) clearTimeout(moveTimer.current);
    moveTimer.current = null;
    setPendingMove(null);
    try {
      await apiJson("/api/enrollments/transition", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enrollmentId: move.row.id, action: move.action }),
        keepalive,
      });
      window.dispatchEvent(new CustomEvent("sulukera:data-changed", { detail: { entity: "customer", id: move.row.customer_id } }));
    } catch (e) {
      setError(`تعذر تنفيذ «${move.label}» لـ ${move.row.customer_name}: ${(e as Error).message}`);
    }
    void load();
  };
  const commitRef = useRef(commitMove);
  useEffect(() => { commitRef.current = commitMove; });
  useEffect(() => {
    void load();
    const refresh = () => { if (!pendingRef.current) void load(); };
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    const flush = () => { if (pendingRef.current) void commitRef.current(pendingRef.current, true); };
    const timer = setInterval(() => { if (document.visibilityState === "visible") refresh(); }, 60_000);
    window.addEventListener("sulukera:data-changed", refresh);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("beforeunload", flush);
    return () => {
      clearInterval(timer);
      window.removeEventListener("sulukera:data-changed", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, []);
  useEffect(() => {
    if (!selectedRow) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedRow(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedRow]);
  const isCompetency = (row: LiveEnrollment) => row.order_type === "تقييم كفاءة" || row.program_name.includes("تقييم الكفاءة");
  const stepFor = (row: LiveEnrollment) =>
    focus === "program-activation" && ["اكتمل التسجيل", "تم إنشاء الحساب"].includes(row.status)
      ? ["activated", "تفعيل البرنامج"] as [string, string]
      : enrollmentStep(row);
  const advance = (row: LiveEnrollment) => {
    const step = stepFor(row);
    if (!step || !canAdvance) return;
    if (pendingRef.current) void commitMove(pendingRef.current);
    const move = { row, action: step[0], label: actionLabel(row) || step[1] };
    pendingRef.current = move;
    setPendingMove(move);
    setSelectedRow(null);
    moveTimer.current = setTimeout(() => { if (pendingRef.current === move) void commitMove(move); }, 6000);
  };
  const undoMove = () => {
    if (moveTimer.current) clearTimeout(moveTimer.current);
    moveTimer.current = null;
    pendingRef.current = null;
    setPendingMove(null);
  };
  const whatsapp = (row: LiveEnrollment) => {
    const digits = String(row.phone || "")
      .replace(/\D/g, "")
      .replace(/^00/, "")
      .replace(/^0/, "966");
    if (!digits) return;
    window.open(
      `https://wa.me/${digits}?text=${encodeURIComponent(`مرحباً ${row.customer_name}، معك فريق سلوكيرا بخصوص تهيئة تسجيلك في برنامج ${row.program_name}.`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  const displayState = (status: string) =>
    focus !== "registration" && status === "تم إنشاء الحساب"
      ? "اكتمل التسجيل"
      : status === "نشط"
        ? "تم الإسناد"
        : status;
  const states =
    focus === "contact"
      ? ["جديد"]
      : focus === "registration"
        ? ["تم التواصل", "بانتظار إنشاء الحساب"]
        : ["اكتمل التسجيل"];
  const visibleRows = rows.filter((row) => row.id !== pendingMove?.row.id);
  const availablePrograms = Array.from(
    new Set(visibleRows.map((row) => programFamily(row.program_name)).filter(Boolean)),
  );
  const availableStatuses = Array.from(
    new Set(visibleRows.map((row) => displayState(row.status)).filter(Boolean)),
  );
  const programPathLabel = (row: LiveEnrollment) => liveProgramClassification(row);
  const pathFilterPrograms = ["تحليل السلوك التطبيقي", "إدارة السلوك التنظيمي", "التعليم المستمر"];
  const availableSubprograms = pathFilterPrograms.includes(programFilter)
    ? Array.from(new Set(visibleRows.filter((row) => (focus === "registration" ? onboardingCategory(row) : programFamily(row.program_name)) === programFilter).map(programPathLabel).filter(Boolean)))
    : [];
  const isDirectProgram = (row: LiveEnrollment) =>
    (row.order_type === "تقييم كفاءة" || row.program_name.includes("تقييم الكفاءة") || row.program_delivery === "مباشر" || ["الاقتصاد السلوكي", "انتقائية الطعام"].includes(row.program_name)) &&
    row.order_type !== "إشراف" &&
    !row.program_name.includes("الإشراف");
  function onboardingCategory(row: LiveEnrollment) {
    const family=programFamily(row.program_name);
    return family === "تقييم الكفاءة" ? "تحليل السلوك التطبيقي" : family;
  }
  function actionLabel(row: LiveEnrollment) {
    return focus === "program-activation" && isCompetency(row)
      ? "ربط المقيم وإكمال التقييم"
      : focus === "program-activation"
        ? "تم تفعيل البرنامج"
        : focus === "registration" && row.status === "تم التواصل"
          // The API sends competency assessments to "ربط المقيم", not to account creation.
          ? isCompetency(row) ? "إضافة خدمة التقييم" : "تمت إضافته للمنصة"
          : focus === "registration" && row.status === "بانتظار إنشاء الحساب"
            ? "أكد العميل إنشاء الحساب"
        : enrollmentStep(row)?.[1];
  }
  const inPageScope = (row: LiveEnrollment) =>
    (focus === "program-activation" ? isDirectProgram(row) : focus === "assignment" ? !isDirectProgram(row) : true) &&
    states.includes(displayState(row.status));
  const filteredRows = visibleRows.filter(
    (row) =>
      (focus === "program-activation" ? isDirectProgram(row) : focus === "assignment" ? !isDirectProgram(row) : true) &&
      (programFilter === "الكل" || (focus === "registration" ? onboardingCategory(row) : programFamily(row.program_name)) === programFilter) &&
      (subprogramFilter === "الكل" || programPathLabel(row) === subprogramFilter) &&
      (statusFilter === "الكل" || displayState(row.status) === statusFilter),
  );
  // Only customers who are actually waiting in this page's columns; finished files belong elsewhere.
  const attentionRows = visibleRows.filter((row) => Boolean(row.needs_attention) && inPageScope(row));
  // On "تسليم العميل" the board only appears when enrollments are still in "جديد" (no API creates that status now).
  if (focus === "contact" && !pendingMove && (!loaded || !visibleRows.some((row) => row.status === "جديد"))) return null;
  if (!loaded) return <HomeDashboardSkeleton />;
  if (!rows.length)
    return <LiveState loading={false} error={error} empty />;
  const count = (state: string) =>
    filteredRows.filter((x) => displayState(x.status) === state).length;
  const stageLabel = (state: string) =>
    focus === "contact"
      ? "بانتظار تسليم العميل"
      : focus === "registration"
        ? state === "تم التواصل" ? "بانتظار إجراء الموظف" : "بانتظار العميل"
        : (
            {
              "اكتمل التسجيل": "بانتظار التفعيل",
              "تم الإسناد": "تم تفعيل المقررات",
              مكتمل: "مكتمل",
            } as Record<string, string>
          )[state] || state;
  const columnNote = (state: string) =>
    focus === "assignment"
      ? "جاهز لتفعيل البرنامج والمقررات"
      : focus === "program-activation"
        ? "برامج مباشرة جاهزة للتفعيل"
        : focus === "contact"
          ? "ملفات سُجّلت قبل تحديث المسار ولم يُسجَّل التواصل معها بعد"
          : state === "تم التواصل"
            ? "أضف العميل للمنصة ثم سجّل تنفيذ الإجراء"
            : "الموظف أنهى الإضافة؛ ننتظر تأكيد العميل إنشاء حسابه";
  const selectedJourneyStage = selectedRow ? customerJourneyStages[selectedRow.status] : undefined;
  const selectedLabel = selectedRow ? actionLabel(selectedRow) : undefined;
  const detailPanel = selectedRow && (
    <>
      <div className="overlay" onClick={() => setSelectedRow(null)} />
      <aside className="cp-sheet" role="dialog" aria-modal="true" aria-labelledby="ac-sheet-title">
        <header className="cp-head">
          <button type="button" className="cp-close" aria-label="إغلاق ملف العميل" onClick={() => setSelectedRow(null)}><X size={18} /></button>
          <div className="cp-identity">
            <span className="cp-avatar" aria-hidden="true">{selectedRow.customer_name.trim().slice(0, 2)}</span>
            <div>
              <h2 id="ac-sheet-title">{selectedRow.customer_name}</h2>
              <p className="cp-meta"><span dir="ltr">{selectedRow.phone || "دون جوال"}</span><span>طلب {selectedRow.order_number || selectedRow.order_id}</span></p>
            </div>
          </div>
          <div className="cp-tags">
            <em className={`cu-status ${customerStateTone(selectedRow.status)}`}>{stageLabel(displayState(selectedRow.status))}</em>
            {selectedRow.program_delivery&&<em className={`cp-tag profile-delivery ${selectedRow.program_delivery === "مباشر" ? "live" : "recorded"}`}>{selectedRow.program_delivery}</em>}
            {selectedRow.created_at&&<small>أضيف في {new Date(selectedRow.created_at).toLocaleString("ar-SA-u-nu-latn",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Riyadh"})}</small>}
          </div>
          <div className="cp-contact">
            <button type="button" className="oh-btn" disabled={!selectedRow.phone} onClick={() => whatsapp(selectedRow)}><FaWhatsapp size={16} aria-hidden="true" />واتساب</button>
            <button type="button" className="oh-btn" disabled={!selectedRow.email} onClick={() => (window.location.href = `mailto:${selectedRow.email}`)}><Mail size={16} aria-hidden="true" />إيميل</button>
          </div>
        </header>
        <div className="cp-body">
          {Boolean(selectedRow.needs_attention) && <section className="cp-section cp-danger" aria-labelledby="ac-attention-title"><h3 id="ac-attention-title">عميل بحاجة للانتباه</h3><p className="cp-next">سلوك السداد الحالي: تطبيق السياسة. راجع الملف المالي قبل متابعة الإجراء.</p></section>}
          <section className="cp-section" aria-labelledby="ac-journey-title">
            <h3 id="ac-journey-title">رحلة العميل</h3>
            {selectedJourneyStage ? <>
              <ol className="cp-steps">
                {customerJourneySteps.map((step, index) => {
                  const state = index < selectedJourneyStage[0] ? "done" : index === selectedJourneyStage[0] ? "current" : "todo";
                  return <li key={step} className={state} aria-current={state === "current" ? "step" : undefined}><i aria-hidden="true">{state === "done" ? <Check size={13} /> : index + 1}</i><span>{step}</span></li>;
                })}
              </ol>
              <p className="cp-next">{selectedJourneyStage[1]}</p>
            </> : <p className="cp-next">الحالة الحالية: <b>{selectedRow.status}</b></p>}
            {selectedLabel && stepFor(selectedRow) && (canAdvance
              ? <button type="button" className="oh-btn primary cp-advance" onClick={() => advance(selectedRow)}>{selectedLabel}</button>
              : <p className="cp-next ac-readonly-note">تنفيذ «{selectedLabel}» متاح لفريق التشغيل (الأكاديمية).</p>)}
          </section>
          <section className="cp-section" aria-labelledby="ac-notes-title">
            <h3 id="ac-notes-title">ملاحظات العميل</h3>
            <CustomerNotes customerId={selectedRow.customer_id} />
          </section>
          <section className="cp-section" aria-labelledby="ac-data-title">
            <h3 id="ac-data-title">بيانات العميل</h3>
            <dl className="cp-ledger">
              <div><dt>رقم الجوال</dt><dd dir="ltr">{selectedRow.phone || "—"}</dd></div>
              <div><dt>البريد الإلكتروني</dt><dd dir="ltr">{selectedRow.email || "—"}</dd></div>
              <div><dt>البرنامج</dt><dd>{programFamily(selectedRow.program_name)}{liveProgramClassification(selectedRow) && <small className="ac-dd-note">التصنيف: {liveProgramClassification(selectedRow)}</small>}{liveProgramOperationalNote(selectedRow) && <small className="ac-dd-note">ملاحظة تشغيلية: {liveProgramOperationalNote(selectedRow)}</small>}{selectedRow.program_delivery && selectedRow.program_track?.toUpperCase() !== "ABAT" && <small className="ac-dd-note">نمط البرنامج: {selectedRow.program_delivery}</small>}{Boolean(selectedRow.competency_assessment) && <small className="ac-dd-note">مع تقييم كفاءة</small>}</dd></div>
              <div><dt>رقم الطلب</dt><dd>{selectedRow.order_number || selectedRow.order_id}</dd></div>
              <div><dt>المصدر</dt><dd>{selectedRow.purchase_source || "غير محدد"}</dd></div>
            </dl>
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
          </section>
        </div>
      </aside>
    </>
  );
  const board = (
    <div className={`ac-board ${focus}`}>
      {states.map((state, index) => {
        // Oldest first: the case that has waited longest is the one to pick up next.
        const columnRows = filteredRows.filter((x) => displayState(x.status) === state).sort((a, b) => String(a.updated_at || "").localeCompare(String(b.updated_at || "")));
        return (
          <section className="oh-panel ac-column" key={state} aria-labelledby={`ac-column-${index}`}>
            <header className="oh-panel-head">
              <span className="ac-step" aria-hidden="true">{index + 1}</span>
              <div><h3 id={`ac-column-${index}`}>{stageLabel(state)}</h3><p>{columnNote(state)}</p></div>
              <span className="oh-count">{columnRows.length}</span>
            </header>
            {columnRows.length ? <ul className="ac-list">{columnRows.map((row) => (
              <li key={row.id}>
                <OperationsCustomerCard
                  row={row}
                  nextLabel={actionLabel(row)}
                  canAdvance={canAdvance}
                  onOpen={() => setSelectedRow(row)}
                  onWhatsapp={() => whatsapp(row)}
                  onEmail={() => {
                    window.location.href = `mailto:${row.email}`;
                  }}
                  onAdvance={stepFor(row) ? () => advance(row) : undefined}
                />
              </li>
            ))}</ul> : <div className="oh-empty">لا توجد حالات هنا. ستظهر تلقائيًا عند انتقال العميل.</div>}
          </section>
        );
      })}
    </div>
  );
  const attentionPanel=focus!=="contact"&&attentionRows.length>0&&<section className="oh-panel ac-attention" aria-labelledby="ac-attention-list"><header className="oh-panel-head"><span className="oh-icon warm"><ShieldCheck size={18}/></span><div><h3 id="ac-attention-list">عملاء بحاجة للانتباه</h3><p>طُبّقت السياسة المالية على ملفاتهم؛ راجع الملف المالي قبل متابعة الإجراء</p></div><span className="oh-count">{attentionRows.length}</span></header><ul>{attentionRows.map(row=><li key={row.id}><button type="button" onClick={()=>setSelectedRow(row)}><span><b>{row.customer_name}</b><small>{row.program_name} · {row.order_number||row.order_id}</small></span><ChevronLeft size={15} aria-hidden="true"/></button></li>)}</ul></section>;
  const onboardingTabs=focus==="registration"&&<div className="ac-filters"><div className="oh-segment"><div className="onboarding-tabs" role="tablist" aria-label="برامج تهيئة العملاء">{[
    ["تحليل السلوك التطبيقي","شهادة تحليل السلوك التطبيقي"],
    ["إدارة السلوك التنظيمي","شهادة إدارة السلوك التنظيمي"],
    ["التعليم المستمر","التعليم المستمر"],
  ].map(([value,label])=><button type="button" role="tab" aria-selected={programFilter===value} className={programFilter===value?"active":""} key={value} onClick={()=>{setProgramFilter(value);setStatusFilter("الكل");setSubprogramFilter("الكل")}}><span>{label}</span><span className="oc-seg-count">{visibleRows.filter(row=>["تم التواصل","بانتظار إنشاء الحساب"].includes(row.status)&&onboardingCategory(row)===value).length}</span></button>)}</div></div>{availableSubprograms.length>0&&<label className="cu-select"><span>{programFilter === "التعليم المستمر" ? "التصنيف المعتمد" : "المسار"}</span><select value={subprogramFilter} onChange={(event)=>setSubprogramFilter(event.target.value)}><option value="الكل">الكل</option>{availableSubprograms.map((value)=><option key={value} value={value}>{value}</option>)}</select></label>}</div>;
  const assignmentStats = focus === "assignment" && <div className="chart-total-cards ac-stats">
    <p><span>بانتظار التفعيل</span><b>{count("اكتمل التسجيل")}</b></p>
    <p><span>مقررات مفعّلة</span><b>{count("تم الإسناد")}</b></p>
    <p><span>مكتمل</span><b>{count("مكتمل")}</b></p>
  </div>;
  return (
    <div className="ops-home ops-academy" aria-busy={loading}>
      {error && <div className="oh-alert" role="alert">{error}</div>}
      {attentionPanel}
      {onboardingTabs}
      {focus!=="registration"&&focus!=="contact"&&<CustomerSmartFilters
        programs={availablePrograms}
        statuses={availableStatuses}
        program={programFilter}
        status={statusFilter}
        total={visibleRows.length}
        visible={filteredRows.length}
        onProgram={(value) => { setProgramFilter(value); setSubprogramFilter("الكل"); }}
        onStatus={setStatusFilter}
        subcategories={availableSubprograms}
        subcategory={subprogramFilter}
        onSubcategory={setSubprogramFilter}
        tertiaryLabel={programFilter === "التعليم المستمر" ? "التصنيف المعتمد" : "المسار"}
      />}
      {assignmentStats}
      {!canAdvance && <p className="oh-footnote ac-readonly"><Info size={14} aria-hidden="true" />تنفيذ إجراءات هذه الصفحة متاح لفريق التشغيل (الأكاديمية). يمكنك متابعة الحالات وفتح ملفاتها.</p>}
      {board}
      {pendingMove && <div className="ac-undo" role="status"><Check size={16} aria-hidden="true" /><span>«{pendingMove.label}» لـ <b>{pendingMove.row.customer_name}</b></span><button type="button" onClick={undoMove}>تراجع</button></div>}
      {detailPanel}
    </div>
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
  const [section, setSection] = useState<"users" | "programs" | "dates" | "reminders" | "quality">("users");
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
        <button
          className={section === "reminders" ? "active" : ""}
          onClick={() => setSection("reminders")}
        >
          <MessageSquareText size={18} />
          قوالب التذكير
        </button>
        <button className={section === "quality" ? "active" : ""} onClick={() => setSection("quality")}>
          <DatabaseBackup size={18} />
          جودة البيانات
        </button>
      </nav>
      {section === "users" ? <Users /> : section === "programs" ? <Programs /> : section === "dates" ? <TeamEventsAdmin /> : section === "quality" ? <DataQualityAdmin /> : <ReminderTemplatesAdmin />}
    </div>
  );
}

type DataQualityIssue={id:string;name:string;phone:string;email:string;source?:string;cohort?:string;order_number?:string;issue:"email"|"phone"|"order"};
function DataQualityAdmin(){
  const [issues,setIssues]=useState<DataQualityIssue[]>([]),[historical,setHistorical]=useState<{id:string;name:string;open_enrollments:number}[]>([]),[editing,setEditing]=useState<DataQualityIssue|null>(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState("");
  const load=async()=>{setLoading(true);setError("");try{const data=await apiJson("/api/data-quality");setIssues(data.issues||[]);setHistorical(data.historical||[]);}catch(cause){setError((cause as Error).message);}finally{setLoading(false)}};
  useEffect(()=>{void load()},[]);
  const save=async()=>{if(!editing)return;setSaving(true);setError("");try{await apiJson("/api/customers",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({customerId:editing.id,name:editing.name,phone:editing.phone,email:editing.email,source:editing.source||"",cohort:editing.cohort||""})});setEditing(null);await load();window.dispatchEvent(new CustomEvent("sulukera:success",{detail:{message:"تم تصحيح بيانات العميل مع حفظ سجل التغيير"}}));}catch(cause){setError((cause as Error).message);}finally{setSaving(false)}};
  if(loading)return <LiveState loading error="" empty={false}/>;
  const labels={email:"بريد غير صالح",phone:"جوال ناقص",order:"دون طلب مرتبط"};
  return <section className="data-quality-admin"><header><div><DatabaseBackup size={22}/><span><h2>مركز جودة البيانات</h2><p>يعرض المشكلات فقط ولا يغيّر أي سجل تلقائيًا. كل تصحيح يدوي يُحفظ في سجل التدقيق.</p></span></div><em>{issues.length} حالة للمراجعة</em></header>{error&&<div className="inline-error" role="alert">{error}</div>}<div className="data-quality-summary"><span><b>{issues.filter(item=>item.issue==="email").length}</b> بريد يحتاج تصحيحًا</span><span><b>{issues.filter(item=>item.issue==="phone").length}</b> جوال ناقص</span><span><b>{issues.filter(item=>item.issue==="order").length}</b> ملف بلا طلب</span><span><b>{historical.length}</b> علاقة تاريخية مستبعدة</span></div><div className="data-quality-list">{issues.map(item=><article key={item.id}><div><b>{item.name}</b><span>{item.order_number||item.id}</span></div><em className={`issue-${item.issue}`}>{labels[item.issue]}</em><small dir="ltr">{item.phone} · {item.email}</small>{item.issue!=="order"&&<button onClick={()=>setEditing({...item})}>مراجعة وتصحيح</button>}</article>)}</div>{historical.length>0&&<details className="historical-relations"><summary>العلاقات التاريخية المستبعدة من التشغيل ({historical.length})</summary><p>هذه السجلات محفوظة للتدقيق ولا تظهر في القوائم التشغيلية، ولم يتم تعديلها أو حذفها.</p></details>}{editing&&<div className="quality-editor-backdrop"><section className="quality-editor" role="dialog" aria-modal="true" aria-labelledby="quality-editor-title"><header><div><h3 id="quality-editor-title">تصحيح بيانات العميل</h3><p>لن تتأثر الطلبات أو الدفعات أو رحلة العميل.</p></div><button aria-label="إغلاق" onClick={()=>setEditing(null)}><X size={18}/></button></header><label>اسم العميل<input value={editing.name} onChange={event=>setEditing({...editing,name:event.target.value})}/></label><label>رقم الجوال<input dir="ltr" value={editing.phone} onChange={event=>setEditing({...editing,phone:event.target.value})}/></label><label>البريد الإلكتروني<input type="email" dir="ltr" value={editing.email} onChange={event=>setEditing({...editing,email:event.target.value})}/></label><footer><button onClick={()=>setEditing(null)}>إلغاء</button><button className="primary" disabled={saving||!editing.name.trim()||!editing.phone.trim()||!editing.email.includes("@")} onClick={()=>void save()}>{saving?"جارٍ الحفظ…":"حفظ التصحيح"}</button></footer></section></div>}</section>;
}

const reminderTemplateLabels: Record<string,string> = { first:"التذكير الأول", second:"التذكير الثاني", third:"التذكير الثالث", final:"التذكير النهائي" };
function ReminderTemplatesAdmin(){
  const [templates,setTemplates]=useState<Record<string,string>>({first:"",second:"",third:"",final:""}),[variables,setVariables]=useState<string[]>([]),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState("");
  useEffect(()=>{void apiJson("/api/reminder-templates").then(data=>{setTemplates(data.templates);setVariables(data.variables||[])}).catch(e=>setMessage((e as Error).message)).finally(()=>setLoading(false))},[]);
  const save=async()=>{setSaving(true);setMessage("");try{await apiJson("/api/reminder-templates",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({templates})});setMessage("تم حفظ قوالب التذكير") }catch(e){setMessage((e as Error).message)}finally{setSaving(false)}};
  const insertVariable=(key:string,variable:string)=>setTemplates(current=>({...current,[key]:`${current[key]}{{${variable}}}`}));
  if(loading)return <div className="ops-empty compact">جارٍ تحميل القوالب...</div>;
  return <section className="reminder-templates-admin card"><header><div><MessageSquareText size={22}/><span><h2>قوالب رسائل التذكير</h2><p>يختار النظام القالب تلقائيًا حسب عدد التذكيرات، ثم يستبدل المتغيرات ببيانات العميل والقسط.</p></span></div><button className="primary" disabled={saving||Object.values(templates).some(value=>!value.trim())} onClick={()=>void save()}>{saving?"جارٍ الحفظ...":"حفظ جميع القوالب"}</button></header>{message&&<div className={message.startsWith("تم")?"template-message success":"ops-error compact"}>{message}</div>}<div className="template-variables"><b>المتغيرات المتاحة</b>{variables.map(variable=><code key={variable}>{`{{${variable}}}`}</code>)}</div><div className="reminder-template-grid">{Object.entries(reminderTemplateLabels).map(([key,label])=><article key={key}><header><b>{label}</b><small>يُستخدم عند إرسال {label}</small></header><textarea value={templates[key]||""} onChange={e=>setTemplates({...templates,[key]:e.target.value})} aria-label={`قالب ${label}`}/><footer><span>إدراج متغير:</span>{variables.map(variable=><button type="button" key={variable} onClick={()=>insertVariable(key,variable)}>{variable}</button>)}</footer></article>)}</div></section>;
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
    [priceEditingId, setPriceEditingId] = useState(""),
    [priceRows, setPriceRows] = useState<{ track: string; delivery: string; price: string }[]>([]),
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
  const savePrices = async (row: Program) => {
    setSaving(true);
    setError("");
    try {
      await apiJson("/api/programs", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ programId: row.id, prices: priceRows.map((p) => ({ ...p, price: Number(p.price) })) }),
      });
      setPriceEditingId("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  const setPriceRow = (index: number, patch: Partial<{ track: string; delivery: string; price: string }>) =>
    setPriceRows((list) => list.map((p, i) => (i === index ? { ...p, ...patch } : p)));
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
                  {priceEditingId !== row.id && (
                    <small className="program-price-count">
                      {!row.prices?.length ? "لا توجد أسعار معتمدة" : row.prices.length === 1 ? "سعر معتمد واحد" : `${row.prices.length} أسعار معتمدة`}
                    </small>
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
                    className="link"
                    onClick={() => {
                      setPriceEditingId(row.id);
                      setPriceRows((row.prices || []).map((p) => ({ track: p.track, delivery: p.delivery, price: String(p.price) })));
                    }}
                  >
                    تعديل الأسعار
                  </button>
                  <button
                    className={`permission-toggle ${row.active ? "stop" : "start"}`}
                    disabled={saving}
                    onClick={() => toggle(row)}
                  >
                    {row.active ? "إيقاف" : "تفعيل"}
                  </button>
                </div>
                {priceEditingId === row.id && (
                  <div className="price-editor">
                    <p>الأسعار شاملة ضريبة القيمة المضافة 15%. «كل المسارات» يُستخدم حين لا يوجد سعر للمسار نفسه.</p>
                    {priceRows.map((p, index) => (
                      <div className="price-row" key={index}>
                        <select aria-label="المسار" value={p.track} onChange={(e) => setPriceRow(index, { track: e.target.value })}>
                          <option value="">كل المسارات</option>
                          {row.tracks?.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                          {p.track && !row.tracks?.some((t) => t.name === p.track) && <option value={p.track}>{p.track}</option>}
                        </select>
                        <select aria-label="النمط" value={p.delivery} onChange={(e) => setPriceRow(index, { delivery: e.target.value })}>
                          <option>مسجل</option>
                          <option>مباشر</option>
                          <option>خدمة</option>
                        </select>
                        <input aria-label="السعر شامل الضريبة" inputMode="decimal" dir="ltr" value={p.price} onChange={(e) => setPriceRow(index, { price: e.target.value })} placeholder="شامل الضريبة" />
                        <span>بدون ضريبة {withoutVat(Number(p.price)).toLocaleString("en-US", { maximumFractionDigits: 2 })} ر.س</span>
                        <button type="button" className="link" aria-label={`حذف سعر ${p.track || "كل المسارات"} ${p.delivery}`} onClick={() => setPriceRows((list) => list.filter((_, i) => i !== index))}>حذف</button>
                      </div>
                    ))}
                    <div className="price-editor-actions">
                      <button type="button" className="secondary" onClick={() => setPriceRows((list) => [...list, { track: "", delivery: "مسجل", price: "" }])}>إضافة سعر</button>
                      <button type="button" className="primary" disabled={saving} onClick={() => savePrices(row)}>حفظ الأسعار</button>
                      <button type="button" className="secondary" onClick={() => setPriceEditingId("")}>إلغاء</button>
                    </div>
                  </div>
                )}
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
  b2b: "قطاع الأعمال B2B",
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
    "b2b.view": "عرض الأعمال والشراكات",
    "b2b.manage": "إدارة الجهات وفرص الأعمال",
    "b2b.review": "اعتماد الجهات الجديدة في مبيعات الأعمال",
    "b2b.partnerships.create": "إضافة جهة مباشرة إلى الشراكات",
    "b2b.partnerships.manage": "اعتماد ومتابعة الشراكات",
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
    [assignmentDate, setAssignmentDate] = useState(""),
    [selectedReservation,setSelectedReservation]=useState<LiveReservation|null>(null);
  const [completing,setCompleting]=useState(""),[completion,setCompletion]=useState({baseTotal:"",discount:"0",paymentPlan:"دفع كامل",firstPayment:"",reference:""}),[kindFilter,setKindFilter]=useState("الكل");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [a, b] = await Promise.all([
        apiJson(kind === "حجز مقعد" ? "/api/reservations?kind=seat" : `/api/reservations?kind=${encodeURIComponent(kind)}`),
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
      (kindFilter === "الكل" || row.reservation_kind === kindFilter) &&
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
      <div className="reservation-kind-filter" role="group" aria-label="تصنيف الحجوزات">
        {["الكل","حجز مع تسجيل","حجز مقعد فقط","منسحب"].map(value=><button key={value} className={kindFilter===value?"active":""} onClick={()=>setKindFilter(value)}>{value}</button>)}
      </div>
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
                  <button type="button" className="reservation-customer-link" onClick={()=>setSelectedReservation(row)}>{row.customer_name}</button>
                  <span>{row.id}</span>
                </div>
              </div>
              <div>
                <span>البرنامج</span>
                <b>{row.program_name}</b>
                <small className="reservation-type">{row.reservation_kind || "حجز مقعد"}</small>
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
                <button type="button" className="reservation-open-profile" onClick={()=>setSelectedReservation(row)}><CircleUserRound size={16}/>فتح ملف الطالب</button>
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
                {row.reservation_kind === "حجز مقعد فقط" && row.status !== "منسحب" && !row.converted_enrollment_id && <>
                  <button className="primary" onClick={()=>setCompleting(row.id)}>استكمال البرنامج</button>
                  <button className="secondary danger" onClick={()=>{if(confirm(`تأكيد انسحاب ${row.customer_name}؟ سيبقى العميل محفوظاً في قاعدة البيانات.`))void post({action:"withdraw_seat_only",reservationId:row.id})}}>انسحاب</button>
                </>}
              </div>
              {completing===row.id&&<div className="reservation-completion">
                <header><b>استكمال تسجيل البرنامج</b><span>رسوم المقعد تبقى منفصلة عن عقد البرنامج.</span></header>
                <label>قيمة البرنامج<input dir="ltr" inputMode="decimal" value={completion.baseTotal} onChange={e=>setCompletion({...completion,baseTotal:e.target.value})}/></label>
                <label>الخصم<select value={completion.discount} onChange={e=>setCompletion({...completion,discount:e.target.value})}>{[0,5,10,15,20,25,30,35,40,45,50].map(x=><option key={x} value={x}>{x}%</option>)}</select></label>
                <label>خطة السداد<select value={completion.paymentPlan} onChange={e=>setCompletion({...completion,paymentPlan:e.target.value})}><option>دفع كامل</option><option>أقساط</option></select></label>
                {completion.paymentPlan==="أقساط"&&<label>الدفعة الأولى<input dir="ltr" inputMode="decimal" value={completion.firstPayment} onChange={e=>setCompletion({...completion,firstPayment:e.target.value})}/></label>}
                <label>مرجع السداد<input dir="ltr" value={completion.reference} onChange={e=>setCompletion({...completion,reference:e.target.value})}/></label>
                <div><button className="primary" onClick={async()=>{await post({action:"complete_seat_only",reservationId:row.id,baseTotal:completion.baseTotal,discountPercent:completion.discount,paymentPlan:completion.paymentPlan,firstPayment:completion.firstPayment,reference:completion.reference,method:"دفع مباشر"});setCompleting("")}}>تأكيد الاستكمال</button><button className="secondary" onClick={()=>setCompleting("")}>إلغاء</button></div>
              </div>}
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
      {selectedReservation&&<>
        <div className="overlay" onClick={()=>setSelectedReservation(null)}/>
        <aside className="drawer operations-drawer reservation-customer-drawer" role="dialog" aria-modal="true" aria-labelledby="reservation-customer-title">
          <button className="close" aria-label="إغلاق ملف الطالب" onClick={()=>setSelectedReservation(null)}>×</button>
          <div className="person"><i>{selectedReservation.customer_name.slice(0,2)}</i><div><h2 id="reservation-customer-title">{selectedReservation.customer_name}</h2><div className="profile-meta-line"><em className="profile-delivery live">{selectedReservation.reservation_kind||"حجز مقعد"}</em></div><p>{selectedReservation.order_number||selectedReservation.order_id} · {selectedReservation.program_name}</p></div></div>
          <div className="operations-contact-actions">
            <button className="whatsapp" onClick={()=>window.open(`https://wa.me/${String(selectedReservation.phone||"").replace(/\D/g,"").replace(/^00/,"").replace(/^0/,"966")}`,'_blank','noopener,noreferrer')}><FaWhatsapp size={18}/>واتساب</button>
            <button className="email-action" disabled={!selectedReservation.email} onClick={()=>window.location.href=`mailto:${selectedReservation.email||""}`}><Mail size={17}/>إيميل</button>
          </div>
          <Section title="ملاحظات العميل"><CustomerNotes customerId={selectedReservation.customer_id}/></Section>
          <Section title="بيانات الطالب والحجز">
            <div className="info customer-data">
              <label>رقم الجوال<b dir="ltr">{selectedReservation.phone||"—"}</b></label><label>البريد الإلكتروني<b dir="ltr">{selectedReservation.email||"—"}</b></label>
              <label>البرنامج<b>{selectedReservation.program_name}</b></label><label>المسار<b>{selectedReservation.program_track||"غير محدد"}</b></label>
              <label>نمط البرنامج<b>{selectedReservation.program_delivery||"غير محدد"}</b></label><label>مصدر التسجيل<b>{selectedReservation.purchase_source||"—"}</b></label>
              <label>الدفعة<b>{selectedReservation.cohort_label||"لم تحدد"}</b></label><label>رسوم المقعد<b>{Number(selectedReservation.fee_amount).toLocaleString("en-US")} ر.س</b></label>
              <label>تاريخ بدء البرنامج<b>{selectedReservation.start_date||"لم يحدد"}</b></label><label>تاريخ الإسناد<b>{selectedReservation.assignment_date||"لم يحدد"}</b></label>
            </div>
          </Section>
          <button type="button" className="drawer-next" onClick={()=>setSelectedReservation(null)}>العودة إلى حجوزات المقاعد</button>
        </aside>
      </>}
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
      <details>
        <summary><span><i>مراجعة مالية</i><b>طلبات نقل المقاعد</b><small>{pending.length?"توجد طلبات تحتاج قرارًا":"لا توجد طلبات بانتظار المراجعة"}</small></span><em className={pending.length?"pending":""}>{pending.length}</em><strong>عرض الطلبات</strong></summary>
        <div className="transfer-review-body">{error && <div className="ops-error compact">{error}</div>}
        {pending.length ? <div className="transfer-review-list">
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
        </div> : <div className="ops-empty compact">لا توجد طلبات نقل بانتظار مراجعة المالية.</div>}
        </div>
      </details>
    </section>
  );
}

function LiveFinance({ initialReviewFilter = "الكل", searchQuery = "" }: { initialReviewFilter?: string; searchQuery?: string }) {
  const [rows, setRows] = useState<FinanceOrder[]>([]),
    [financeTab, setFinanceTab] = useState<"sales" | "collections">("sales"),
    [collectionMonth,setCollectionMonth]=useState(riyadhToday().slice(0,7)),
    [summary, setSummary] = useState<FinanceSummary>({
      total: 0,
      paid: 0,
      remaining: 0,
      overdue: 0,
      forecast:{month:"",due:0,expected:0,follow_up:0,risk:0,installments:0,items:[]},
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<FinanceOrder | null>(null),
    [total, setTotal] = useState(""),
    [count, setCount] = useState("4"),
    [regularAmountInput, setRegularAmountInput] = useState(""),
    [firstPaymentAmount, setFirstPaymentAmount] = useState(""),
    [legacySeatFee, setLegacySeatFee] = useState(""),
    [customDiscount, setCustomDiscount] = useState("0"),
    [finalAmount, setFinalAmount] = useState(""),
    [scheduleEdit, setScheduleEdit] = useState<"auto"|"regular"|"final"|"existing">("auto"),
    [start, setStart] = useState(new Date().toLocaleDateString("en-CA")),
    [installmentRefs,setInstallmentRefs]=useState<Record<string,string>>({}),
    [installmentMethods,setInstallmentMethods]=useState<Record<string,string>>({}),
    [installmentDueDates,setInstallmentDueDates]=useState<Record<string,string>>({}),
    [installmentPaymentDates,setInstallmentPaymentDates]=useState<Record<string,string>>({}),
    [paymentRecordDate,setPaymentRecordDate]=useState(""),
    [selectedPaymentRecordId,setSelectedPaymentRecordId]=useState(""),
    [withdrawalReason,setWithdrawalReason]=useState(""),
    [withdrawalDate,setWithdrawalDate]=useState(new Date().toLocaleDateString("en-CA")),
    [withdrawalRefund,setWithdrawalRefund]=useState(""),
    [withdrawalNonRefundable,setWithdrawalNonRefundable]=useState("0"),
    [withdrawalSource,setWithdrawalSource]=useState("sale"),
    [withdrawalMethod,setWithdrawalMethod]=useState("تحويل بنكي"),
    [withdrawalReference,setWithdrawalReference]=useState(""),
    [activeFinanceTool,setActiveFinanceTool]=useState<"seat"|"discount"|"withdrawal"|"undo"|null>(null),
    [programFilter, setProgramFilter] = useState("الكل"),
    [statusFilter, setStatusFilter] = useState("الكل"),
    [reviewTypeFilter, setReviewTypeFilter] = useState(initialReviewFilter),
    [reminderTemplates,setReminderTemplates]=useState<Record<string,string>>({}),
    [saving, setSaving] = useState(false);
  useEffect(() => { setReviewTypeFilter(initialReviewFilter); if (initialReviewFilter !== "الكل") { setFinanceTab("sales"); setStatusFilter("بانتظار المراجعة"); } }, [initialReviewFilter]);
  useEffect(()=>{void apiJson("/api/reminder-templates").then(data=>setReminderTemplates(data.templates||{})).catch(()=>setReminderTemplates({}))},[]);
  const syncScheduleFromSavedTable = (row: FinanceOrder) => {
    const openInstallments = [...row.installments]
      .filter((item) => item.status !== "مدفوع")
      .sort((a, b) => Number(a.sequence) - Number(b.sequence));
    if (!openInstallments.length) {
      setCount("4");
      setStart(new Date().toLocaleDateString("en-CA"));
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
      const data = await apiJson(`/api/finance?forecastMonth=${encodeURIComponent(collectionMonth)}`);
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
          setCustomDiscount(String(updated.discount_percent || 0));
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
  }, [collectionMonth]);
  const open = (row: FinanceOrder) => {
    setSelected(row);
    setTotal(String(row.total));
    setFirstPaymentAmount(String(firstPayment(row)?.amount||0));
    setLegacySeatFee(String(row.seat_fee || ""));
    setCustomDiscount(String(row.discount_percent || 0));
    const defaultPayment = financeTab === "sales"
      ? row.payments.find((payment) => payment.flow_type === "sale") || firstPayment(row)
      : [...row.payments].filter((payment) => payment.flow_type === "collection").sort((a,b) => String(b.paid_at || b.created_at || "").localeCompare(String(a.paid_at || a.created_at || "")))[0] || firstPayment(row);
    setSelectedPaymentRecordId(defaultPayment?.id || "");
    syncScheduleFromSavedTable(row);
    setInstallmentDueDates(Object.fromEntries(row.installments.map((item) => [item.id, String(item.due_date).slice(0,10)])));
    setInstallmentPaymentDates(Object.fromEntries(row.installments.filter((item) => item.paid_at).map((item) => [item.id, String(item.paid_at).slice(0,10)])));
    setWithdrawalReason("");setWithdrawalDate(new Date().toLocaleDateString("en-CA"));setWithdrawalRefund("");setWithdrawalNonRefundable("0");setWithdrawalSource("sale");setWithdrawalMethod("تحويل بنكي");setWithdrawalReference("");
    setActiveFinanceTool(null);
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
    const today = riyadhToday();
    if (row.order_status === "منسحب" || row.withdrawal) return "منسحب";
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
  const currentInstallmentStatus = (row: FinanceOrder) => {
    const open = row.installments.filter((item) => item.status !== "مدفوع");
    if (!open.length) return row.installments.length ? "تم السداد" : "لم يُنشأ جدول";
    const priority = ["تطبيق السياسة", "متأخر", "تذكير نهائي", "تذكير ثالث", "تذكير ثاني", "تذكير ثانٍ", "تذكير أول", "موافقة تمديد"];
    for (const status of priority) {
      if (open.some((item) => item.status === status)) return status;
    }
    if (open.some((item) => item.display_status === "متأخر")) return "متأخر";
    return [...open].sort((a,b) => String(a.due_date).localeCompare(String(b.due_date)))[0]?.status || "ملتزم";
  };
  const installmentStatusTone = (status: string) =>
    status === "تم السداد" || status === "ملتزم" ? "green" :
    ["تطبيق السياسة", "متأخر", "تذكير نهائي", "تذكير ثالث"].includes(status) ? "red" :
    status.startsWith("تذكير") || status === "موافقة تمديد" ? "amber" : "neutral";
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
        firstPayment(row) ||
        (row.finance_review_status === "pending" && row.payment_plan === "أقساط"
          ? {
              id: `pending-${row.order_id}`,
              amount: 0,
              paid_at: "",
              method: row.purchase_source || "أقساط",
              status: "بانتظار المراجعة",
              classification_status: "pending",
            }
          : undefined);
      return payment ? { row, payment } : null;
    })
    .filter(
      (entry): entry is { row: FinanceOrder; payment: FinancePayment } =>
        Boolean(entry),
    );
  const saleStatus = ({ row, payment }: (typeof salesEntries)[number]) => {
    if (row.order_status === "منسحب" || row.withdrawal) return "منسحب";
    if (
      row.finance_review_status === "pending" ||
      payment.classification_status === "pending"
    )
      return "بانتظار المراجعة";
    if (String(payment.reconciliation_status || "").includes("مرفوض"))
      return "مرفوض";
    return "مكتملة";
  };
  const reviewType = ({ row, payment }: (typeof salesEntries)[number]) => {
    const method = String(payment.method || "").toLowerCase();
    if (method.includes("paytabs") || method.includes("paytaps")) return "paytabs";
    if (method.includes("تمارا")) return "tamara";
    if (method.includes("تحويل بنكي")) return "bank";
    if (row.order_type === "إشراف") return "supervision";
    if (row.payment_plan === "أقساط") return "installments";
    return "other";
  };
  const matchesReviewType = (entry: (typeof salesEntries)[number], type: string) => {
    if (type === "الكل") return true;
    if (type === "installments") return entry.row.payment_plan === "أقساط";
    if (type === "supervision") return entry.row.order_type === "إشراف";
    return reviewType(entry) === type;
  };
  const reviewTypeCount = (type: string) =>
    salesEntries.filter((entry) => matchesReviewType(entry, type)).length;
  const todayKey = riyadhToday();
  const monthKey = todayKey.slice(0, 7);
  const saleDate = (payment: FinancePayment) =>
    String(payment.paid_at || payment.created_at || "").slice(0, 10);
  // Same rule as the home dashboard: confirmed payments of the flow, by payment day, minus completed refunds
  // charged to that flow, by withdrawal day. Summed in halalas to avoid floating-point drift.
  const confirmedNet = (flow: "sale" | "collection", inPeriod: (day: string) => boolean) => {
    const gross = rows.flatMap((row) => row.payments).filter((payment) => payment.flow_type === flow && payment.classification_status === "confirmed" && inPeriod(saleDate(payment))).reduce((sum, payment) => sum + Math.round(Number(payment.amount || 0) * 100), 0);
    const refunds = rows.filter((row) => row.withdrawal?.status === "مكتمل" && row.withdrawal.refund_source === flow && inPeriod(String(row.withdrawal.withdrawn_at || "").slice(0, 10))).reduce((sum, row) => sum + Math.round(Number(row.withdrawal?.refund_amount || 0) * 100), 0);
    return (gross - refunds) / 100;
  };
  const salesTotal = confirmedNet("sale", () => true);
  const salesToday = confirmedNet("sale", (day) => day === todayKey);
  const salesMonth = confirmedNet("sale", (day) => day.startsWith(monthKey));
  const salesPending = salesEntries.filter(
    (entry) => saleStatus(entry) === "بانتظار المراجعة",
  ).length;
  // Money still waiting for finance review is shown on its own, never inside sales or collections.
  const pendingReviewAmount = rows.flatMap((row) => row.payments).filter((payment) => payment.classification_status === "pending").reduce((sum, payment) => sum + Math.round(Number(payment.amount || 0) * 100), 0) / 100;
  const collectionsToday = confirmedNet("collection", (day) => day === todayKey);
  const collectionsMonth = confirmedNet("collection", (day) => day.startsWith(collectionMonth));
  const collectionsTotal = confirmedNet("collection", () => true);
  const forecast=summary.forecast;
  const forecastMonthLabel=forecast.month?new Date(`${forecast.month}-01T12:00:00`).toLocaleDateString("ar-SA-u-nu-latn",{month:"long",year:"numeric"}):"الشهر القادم";
  const collectionMonthLabel=new Date(`${collectionMonth}-01T12:00:00`).toLocaleDateString("ar-SA-u-nu-latn",{month:"long",year:"numeric"});
  const monthInstallments=rows.flatMap(row=>row.withdrawal?[]:row.installments.filter(item=>String(item.due_date||"").startsWith(collectionMonth)&&item.status!=="ملغي").map(item=>({row,item})));
  const scheduledMonth=monthInstallments.reduce((sum,{item})=>sum+Number(item.amount||0),0);
  const remainingScheduledMonth=monthInstallments.filter(({item})=>item.status!=="مدفوع").reduce((sum,{item})=>sum+Number(item.amount||0),0);
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
  const salesStatuses = ["بانتظار المراجعة", "مكتملة", "مرفوض", "منسحب"].filter(
    (status) => salesEntries.some((entry) => saleStatus(entry) === status),
  );
  const activeStatuses =
    financeTab === "sales" ? salesStatuses : collectionStatuses;
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase("ar");
  const matchesFinanceSearch = (row: FinanceOrder) =>
    !normalizedSearchQuery ||
    [row.customer_name,row.customer_id,row.order_id,row.program_name,row.phone,row.email]
      .join(" ")
      .toLocaleLowerCase("ar")
      .includes(normalizedSearchQuery);
  const filteredFinance = collectionRows.filter(
    (row) =>
      matchesFinanceSearch(row) &&
      (programFilter === "الكل" || row.program_name === programFilter) &&
      (statusFilter === "الكل" || financeStatus(row) === statusFilter),
  );
  const filteredSales = salesEntries.filter(
    ({ row, payment }) =>
      matchesFinanceSearch(row) &&
      (programFilter === "الكل" || row.program_name === programFilter) &&
      matchesReviewType({ row, payment }, reviewTypeFilter) &&
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
  const selectedPaidPct = selected && selected.total > 0 ? Math.min(100, Math.round((selected.paid / selected.total) * 100)) : 0;
  useEffect(() => {
    setPaymentRecordDate(String(selectedReferencePayment?.paid_at || selectedReferencePayment?.created_at || "").slice(0,10));
  }, [selectedReferencePayment?.id, selectedReferencePayment?.paid_at, selectedReferencePayment?.created_at]);
  const updatePaymentReference = (paymentId: string, paymentReference: string) => {
    const updateOrder = (row: FinanceOrder) => ({
      ...row,
      order_payment_reference: paymentReference,
      payments: row.payments.map((payment) =>
        payment.id === paymentId
          ? { ...payment, reference: paymentReference }
          : payment,
      ),
    });
    setRows((current) => current.map((row) => updateOrder(row)));
    setSelected((current) => (current ? updateOrder(current) : current));
  };
  const reminderStatus = (installment: FinanceInstallment) =>
    ["تذكير أول", "تذكير ثاني", "تذكير ثالث", "تذكير نهائي"][
      Math.min(Number(installment.reminder_count || 0), 3)
    ];
  const sendInstallmentReminder = (installment: FinanceInstallment) => {
    if (!selected) return;
    const digits = String(selected.phone || "")
      .replace(/\D/g, "")
      .replace(/^00/, "")
      .replace(/^0/, "966");
    if (!digits) {
      setError("لا يوجد رقم جوال صالح لهذا العميل");
      return;
    }
    const status = reminderStatus(installment);
    const dueDate = new Date(`${String(installment.due_date).slice(0, 10)}T12:00:00`)
      .toLocaleDateString("ar-SA-u-nu-latn", { day: "numeric", month: "long", year: "numeric" });
    const templateKey=["first","second","third","final"][Math.min(Number(installment.reminder_count||0),3)];
    const fallback="مرحباً {{اسم_العميل}}،\n\nنود تذكيركم بـ {{نوع_التذكير}} للقسط رقم {{رقم_القسط}} من برنامج {{اسم_البرنامج}}، بقيمة {{المبلغ}}، والمستحق بتاريخ {{تاريخ_الاستحقاق}}.\n\nنأمل التكرم بإتمام السداد وإرسال مرجع العملية.\n\nفريق سلوكيرا";
    const values:Record<string,string>={اسم_العميل:selected.customer_name,المبلغ:sar(installment.amount),نوع_التذكير:status,رقم_القسط:String(installment.sequence),اسم_البرنامج:selected.program_name,تاريخ_الاستحقاق:dueDate,المتبقي:sar(selected.remaining)};
    const message=Object.entries(values).reduce((text,[key,value])=>text.replaceAll(`{{${key}}}`,value),reminderTemplates[templateKey]||fallback);
    const whatsapp = window.open(
      `https://wa.me/${digits}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    if (!whatsapp) {
      setError("تعذر فتح واتساب. اسمح بالنوافذ المنبثقة ثم أعد المحاولة");
      return;
    }
    void post({ action: "installment_status", installmentId: installment.id, status });
  };
  const money0 = (n: number) => Number(n || 0).toLocaleString("ar-SA-u-nu-latn");
  const beforeVat = (n: number) => `بدون ضريبة ${sar(withoutVat(n))}`;
  const chipTone: Record<string, string> = { green: "success", red: "danger", amber: "warning", purple: "neutral", neutral: "neutral" };
  const saleTone = (status: string) => (status === "مكتملة" ? "success" : status === "بانتظار المراجعة" ? "warning" : "danger");
  const collectionTone = (status: string) =>
    status === "مدفوع" ? "success" : ["متأخر", "منسحب"].includes(status) ? "danger" : ["بانتظار المراجعة", "مستحق اليوم"].includes(status) ? "warning" : ["دفعة جزئية", "غير مدفوع"].includes(status) ? "neutral" : "";
  const listTotal = financeTab === "sales" ? salesEntries.length : collectionRows.length;
  const listVisible = financeTab === "sales" ? filteredSales.length : filteredFinance.length;
  const filtersActive = programFilter !== "الكل" || statusFilter !== "الكل" || (financeTab === "sales" && reviewTypeFilter !== "الكل");
  const clearFilters = () => { setProgramFilter("الكل"); setStatusFilter("الكل"); setReviewTypeFilter("الكل"); };
  const selectTab = (tab: "sales" | "collections") => { setFinanceTab(tab); setStatusFilter("الكل"); };
  return (
    <>
    <div className="ops-home ops-finance" aria-busy={loading}>
      <div className="oh-segment fin-tabs" role="tablist" aria-label="أقسام المالية">
        <button type="button" role="tab" aria-selected={financeTab === "sales"} onClick={() => selectTab("sales")}><BadgeDollarSign size={16} aria-hidden="true" />المبيعات<span className="oc-seg-count">{salesEntries.length}</span></button>
        <button type="button" role="tab" aria-selected={financeTab === "collections"} onClick={() => selectTab("collections")}><HandCoins size={16} aria-hidden="true" />التحصيل<span className="oc-seg-count">{collectionRows.length}</span></button>
      </div>
      <section className="oh-pulse oc-pulse fin-pulse" aria-labelledby="fin-pulse-title">
        <header><h3 id="fin-pulse-title">{financeTab === "sales" ? "المبيعات" : "التحصيل"}</h3><p>{financeTab === "sales" ? "الدفعة الأولى والدفع الكامل." : "الأقساط والدفعات اللاحقة."} المؤكد فقط بعد خصم المسترد، كما في الرئيسية. المبالغ شاملة ضريبة القيمة المضافة 15%، والمبلغ بدون ضريبة تحت كل رقم.</p></header>
        <div>
          {financeTab === "sales" ? (
            <>
              <HomeMetric icon={BadgeDollarSign} label="مبيعات اليوم" value={money0(salesToday)} suffix="ر.س" note={`مؤكدة بعد خصم المسترد · ${beforeVat(salesToday)}`} tone="brand" />
              <HomeMetric icon={CalendarDays} label="مبيعات الشهر" value={money0(salesMonth)} suffix="ر.س" note={`من بداية الشهر الحالي · ${beforeVat(salesMonth)}`} tone="success" />
              <HomeMetric icon={ReceiptText} label="إجمالي المبيعات" value={money0(salesTotal)} suffix="ر.س" note={`كل المبيعات المؤكدة · ${beforeVat(salesTotal)}`} tone="neutral" />
              <HomeMetric icon={ShieldCheck} label="بانتظار المراجعة" value={salesPending} suffix="عملية" note={`بقيمة ${sar(pendingReviewAmount)} خارج المجاميع حتى اعتمادها · ${beforeVat(pendingReviewAmount)}`} tone={salesPending ? "attention" : "neutral"} onClick={() => { setReviewTypeFilter("الكل"); setStatusFilter("بانتظار المراجعة"); }} />
            </>
          ) : (
            <>
              <HomeMetric icon={HandCoins} label="تحصيل اليوم" value={money0(collectionsToday)} suffix="ر.س" note={`مؤكد بعد خصم المسترد · ${beforeVat(collectionsToday)}`} tone="success" />
              <HomeMetric icon={CalendarDays} label="تحصيل الشهر المحدد" value={money0(collectionsMonth)} suffix="ر.س" note={`${collectionMonthLabel} · ${beforeVat(collectionsMonth)}`} tone="brand" />
              <HomeMetric icon={WalletCards} label="المتبقي" value={money0(Number(summary.remaining))} suffix="ر.س" note={`بعد خصم جميع الدفعات · ${beforeVat(Number(summary.remaining))}`} tone="attention" />
              <HomeMetric icon={Clock3} label="إجمالي التحصيل" value={money0(collectionsTotal)} suffix="ر.س" note={`${summary.overdue} قسط متأخر · ${beforeVat(collectionsTotal)}`} tone={summary.overdue ? "danger" : "neutral"} />
            </>
          )}
        </div>
      </section>
      {financeTab === "collections" && (
        <section className="oh-panel collection-dashboard" aria-labelledby="fin-month-title">
          <header className="oh-panel-head">
            <span className="oh-icon"><CalendarDays size={18} /></span>
            <div><h3 id="fin-month-title">لوحة التحصيل الفعلية · {collectionMonthLabel}</h3><p>التحصيل الفعلي حسب تاريخ سداد الدفعة، والمتبقي من أقساط الشهر غير المسددة.</p></div>
            <label className="cu-select"><span>الشهر</span><input type="month" value={collectionMonth} onChange={(event) => setCollectionMonth(event.target.value)} /></label>
          </header>
          <dl className="fin-month">
            <div><dt>التحصيل الفعلي</dt><dd>{sar(collectionsMonth)}<small>{beforeVat(collectionsMonth)}</small></dd><p>دفعات التحصيل المؤكدة خلال الشهر بعد خصم المسترد</p></div>
            <div><dt>الأقساط المجدولة</dt><dd>{sar(scheduledMonth)}<small>{beforeVat(scheduledMonth)}</small></dd><p>{monthInstallments.length} قسط بتاريخ استحقاق في الشهر</p></div>
            <div className={remainingScheduledMonth > 0 ? "outstanding" : "settled"}><dt>المتبقي من أقساط الشهر</dt><dd>{sar(remainingScheduledMonth)}<small>{beforeVat(remainingScheduledMonth)}</small></dd><p>{remainingScheduledMonth > 0 ? "يحتاج متابعة أو سداد" : "تم سداد أقساط الشهر"}</p></div>
            <div><dt>المتبقي الكلي</dt><dd>{sar(Number(summary.remaining))}<small>{beforeVat(Number(summary.remaining))}</small></dd><p>جميع الأشهر والملفات النشطة</p></div>
          </dl>
          <details className="collection-forecast">
            <summary>
              <span><i>توقع تحصيل</i><b>{forecastMonthLabel}</b><small>من الأقساط المجدولة غير المسددة في الشهر المحدد</small></span>
              <em className="oc-seg-count">{forecast.installments}</em>
              <strong>{sar(forecast.due)}<small>{beforeVat(forecast.due)}</small></strong>
              <ChevronDown size={16} aria-hidden="true" />
            </summary>
            <div className="collection-forecast-body">
              <div className="collection-forecast-month"><label className="cu-select">شهر التوقع<input type="month" value={collectionMonth} onChange={(event) => setCollectionMonth(event.target.value)} /></label><span>إجمالي الأقساط المستحقة: <b>{sar(forecast.due)}</b></span></div>
              <div className="collection-forecast-metrics">
                <article className="expected"><span>متوقع التحصيل</span><b>{sar(forecast.expected)}</b><small>أقساط ملتزمة بلا تنبيه</small></article>
                <article className="followup"><span>بحاجة متابعة</span><b>{sar(forecast.follow_up)}</b><small>تذكير أو تمديد مسجل</small></article>
                <article className="risk"><span>عالي المخاطر</span><b>{sar(forecast.risk)}</b><small>تذكيران أو تصعيد مالي</small></article>
              </div>
              {forecast.items.length > 0 && <div className="collection-forecast-list">{forecast.items.map((item) => <button type="button" key={item.installment_id} className={item.category} onClick={() => { const row = rows.find((current) => current.order_id === item.order_id); if (row) open(row); }}><time dir="ltr">{item.due_date}</time><span><b>{item.customer_name}</b><small>{item.program_name} · {item.status}</small></span><strong>{sar(item.amount)}</strong></button>)}</div>}
            </div>
          </details>
        </section>
      )}
      {!rows.length && (loading || error) ? (
        <LiveState loading={loading} error={error} empty={false} />
      ) : (
        <section className="oh-panel fin-directory" aria-labelledby="fin-list-title">
          {error && !selected && <div className="oh-alert" role="alert">{error}</div>}
          <header className="oh-panel-head">
            <span className="oh-icon">{financeTab === "sales" ? <ReceiptText size={18} /> : <HandCoins size={18} />}</span>
            <div><h3 id="fin-list-title">{financeTab === "sales" ? "عمليات البيع" : "ملفات التحصيل"}</h3><p>{financeTab === "sales" ? "كل دفعة أولى أو دفع كامل مع وسيلتها ومرجعها. اضغط على العملية لفتح الملف المالي." : "الطلبات المعتمدة بالأقساط والإشراف، مع المدفوع والمتبقي وحالة السداد."}</p></div>
          </header>
          <div className="cu-filters">
            {financeTab === "sales" && <div className="oh-segment finance-review-filter" role="tablist" aria-label="نوع العملية">{[["الكل","الكل"],["installments","الأقساط"],["bank","التحويل البنكي"],["paytabs","PayTabs"],["tamara","تمارا"],["supervision","الإشراف"],["other","دفع مكتمل"]].map(([key,label])=><button type="button" role="tab" aria-selected={reviewTypeFilter===key} key={key} onClick={()=>{setReviewTypeFilter(key);setStatusFilter("الكل")}}>{key === "الكل" ? "كل العمليات" : label}<span className="oc-seg-count">{reviewTypeCount(key)}</span></button>)}</div>}
            <div className="cu-selects">
              <label className="cu-select"><span>البرنامج</span><select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}><option value="الكل">كل البرامج</option>{financePrograms.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label className="cu-select"><span>الحالة</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="الكل">كل الحالات</option>{activeStatuses.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            </div>
          </div>
          <p className="oc-result-line cu-result" aria-live="polite">{listVisible} من {listTotal} {financeTab === "sales" ? "عملية" : "ملف"}{normalizedSearchQuery && <> · نتائج البحث عن «{searchQuery.trim()}»</>}{filtersActive && <button type="button" onClick={clearFilters}>مسح التصفية</button>}</p>
          {!listVisible ? (
            <div className="oh-empty">{loading ? "جارٍ تحميل البيانات…" : "لا توجد عمليات تطابق البحث والتصفية الحالية."}</div>
          ) : financeTab === "sales" ? (
            <div className="table-wrap cu-table fin-table">
              <table>
                <thead><tr><th>العميل</th><th>البرنامج</th><th>العملية</th><th>المبلغ</th><th>التاريخ</th><th>المرجع</th><th>الحالة</th></tr></thead>
                <tbody>
                  {filteredSales.map(({ row, payment }) => {
                    const status = saleStatus({ row, payment });
                    return (
                      <tr key={payment.id} onClick={() => open(row)}>
                        <td className="customer-name-cell"><i aria-hidden="true">{row.customer_name.trim().slice(0, 2)}</i><span><button type="button" onClick={(event) => { event.stopPropagation(); open(row); }}>{row.customer_name}</button>{row.phone && <small dir="ltr" className="fin-phone">{row.phone}</small>}<small dir="ltr">{row.order_id}</small></span></td>
                        <td data-label="البرنامج"><b>{row.program_name}</b>{subscriptionMeta(row).length > 0 && <small>{subscriptionMeta(row).join(" · ")}</small>}</td>
                        <td data-label="العملية"><b>{payment.flow_type === "seat_fee" ? "رسوم مقعد" : payment.flow_type === "collection" ? (row.order_type === "إشراف" ? "تحصيل إشراف" : "تحصيل") : row.payment_plan === "أقساط" ? "دفعة أولى" : "دفع كامل"}</b><small>{payment.method || row.purchase_source}</small></td>
                        <td data-label="المبلغ" className="fin-amount"><b>{sar(payment.amount)}</b><small>{beforeVat(payment.amount)}</small>{row.seat_fee > 0 && payment.flow_type !== "seat_fee" && <small>+ رسوم المقعد {sar(row.seat_fee)}</small>}</td>
                        <td data-label="التاريخ"><b dir="ltr">{saleDate(payment) || "—"}</b></td>
                        <td data-label="المرجع" className="finance-card-reference" onClick={(event) => event.stopPropagation()}><PaymentReferenceControl paymentId={payment.id.startsWith("pending-") ? undefined : payment.id} initialReference={row.order_payment_reference || payment.reference} canEdit onSaved={(reference) => updatePaymentReference(payment.id, reference)} />{!payment.reference && !row.order_payment_reference && payment.id.startsWith("pending-") && <small>لا توجد دفعة مرتبطة لإضافة المرجع</small>}</td>
                        <td data-label="الحالة"><em className={`cu-status ${saleTone(status)}`}>{status}</em></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-wrap cu-table fin-table">
              <table>
                <thead><tr><th>العميل</th><th>البرنامج</th><th>المدفوع</th><th>المتبقي</th><th>الأقساط</th><th>سلوك السداد</th><th>الحالة</th></tr></thead>
                <tbody>
                  {filteredFinance.map((row) => {
                    const status = financeStatus(row), installmentStatus = currentInstallmentStatus(row), paidRatio = row.total ? Math.min(100, Math.round((row.paid / row.total) * 100)) : 0;
                    return (
                      <tr key={row.order_id} onClick={() => open(row)}>
                        <td className="customer-name-cell"><i aria-hidden="true">{row.customer_name.trim().slice(0, 2)}</i><span><button type="button" onClick={(event) => { event.stopPropagation(); open(row); }}>{row.customer_name}</button>{row.phone && <small dir="ltr" className="fin-phone">{row.phone}</small>}<small dir="ltr">{row.order_id}</small></span></td>
                        <td data-label="البرنامج"><b>{row.program_name}</b>{subscriptionMeta(row).length > 0 && <small>{subscriptionMeta(row).join(" · ")}</small>}</td>
                        <td data-label="المدفوع" className="cu-paid fin-amount"><b>{sar(row.paid)} <small>من {sar(row.total)}</small></b><span className="cu-bar" aria-hidden="true"><i style={{ width: `${paidRatio}%` }} /></span><small>{beforeVat(row.paid)}{row.seat_fee > 0 ? ` · + رسوم المقعد ${sar(row.seat_fee)}` : ""}</small></td>
                        <td data-label="المتبقي" className="fin-amount"><b>{sar(row.remaining)}</b><small>{beforeVat(row.remaining)}</small></td>
                        <td data-label="الأقساط"><b>{row.installments.filter((x) => x.status !== "مدفوع").length} قسط متبقٍ</b><small>{row.payments.length} دفعة مسجلة</small><em className={`cu-status ${chipTone[installmentStatusTone(installmentStatus)] || ""}`}>{installmentStatus}</em></td>
                        <td data-label="سلوك السداد"><em className={`cu-status ${chipTone[row.payment_behavior?.tone || "neutral"] || "neutral"}`}>{row.payment_behavior?.label || "جديد"}</em></td>
                        <td data-label="الحالة"><em className={`cu-status ${collectionTone(status)}`}>{status}</em></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
      {selected && (
        <>
          <div className="overlay" onClick={() => setSelected(null)} />
          <aside className="drawer finance-center-drawer" role="dialog" aria-modal="true" aria-label={`الملف المالي: ${selected.customer_name}`}>
            <header className="cp-head fin-head">
              <button type="button" className="cp-close" aria-label="إغلاق الملف المالي" onClick={() => setSelected(null)}><X size={18} /></button>
              <div className="cp-identity">
                <span className="cp-avatar" aria-hidden="true">{selected.customer_name.trim().slice(0, 2)}</span>
                <div>
                  <h2>{selected.customer_name}</h2>
                  <p className="cp-meta"><span dir="ltr">{selected.phone}</span><span>{selected.customer_id}</span><span>{selected.program_name}</span></p>
                </div>
              </div>
              <div className="cp-tags">
                <em className={`cu-status ${collectionTone(financeStatus(selected))}`}>{financeStatus(selected)}</em>
                {subscriptionMeta(selected).map((item) => <em className="cp-tag" key={item}>{item}</em>)}
              </div>
            </header>
            <div className="fin-body">
            {error && <div className="oh-alert" role="alert">{error}</div>}
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
            <section className="cp-section fin-money" aria-labelledby="fin-money-title">
              <h3 id="fin-money-title">الملخص المالي</h3>
              <div className={`fin-balance ${selected.withdrawal ? "withdrawn" : selected.remaining > 0 ? "" : "settled"}`}>
                <span>{selected.withdrawal ? "العميل منسحب · لا متبقٍ عليه" : !(selected.total > 0) ? "لا توجد قيمة برنامج على هذا الطلب" : selected.remaining > 0 ? "المتبقي على العميل" : selected.finance_review_status === "pending" ? "مسجل بالكامل · بانتظار اعتماد المالية" : "مسدد بالكامل"}</span>
                <b>{sar(selected.remaining)}</b>
                <small>{beforeVat(selected.remaining)}</small>
                {selected.total > 0 && <><span className="cu-bar" aria-hidden="true"><i style={{ width: `${selectedPaidPct}%` }} /></span>
                <small>{selectedPaidPct}% من قيمة البرنامج مدفوع</small></>}
              </div>
              <dl className="cp-ledger">
                <div><dt>إجمالي البرنامج بعد الخصم</dt><dd>{sar(selected.total)}<small className="cp-vat">{beforeVat(selected.total)}</small></dd></div>
                <div><dt>المدفوع من قيمة البرنامج</dt><dd>{sar(selected.paid)}<small className="cp-vat">{beforeVat(selected.paid)}</small></dd></div>
                <div><dt>نسبة الخصم</dt><dd>{Number(selected.discount_percent || 0).toLocaleString("en-US")}%</dd></div>
                {Number(selected.seat_fee||0)>0&&<div><dt>رسوم المقعد المدفوعة{selected.registration_seat_fee ? " · من التسجيل" : ""}</dt><dd>{sar(selected.seat_fee)}<small className="cp-vat">{beforeVat(selected.seat_fee)}</small></dd></div>}
                {Number(selected.seat_fee||0)>0&&<div><dt>إجمالي المدفوع فعلياً</dt><dd>{sar(selected.paid+selected.seat_fee)}<small className="cp-vat">{beforeVat(selected.paid+selected.seat_fee)}</small></dd></div>}
                {Number(selected.refunded||0)>0&&<div className="fin-refund"><dt>المبلغ المسترد</dt><dd>- {sar(Number(selected.refunded))}<small className="cp-vat">{beforeVat(Number(selected.refunded))}</small></dd></div>}
              </dl>
            </section>
            <section className="cp-section fin-order" aria-labelledby="fin-order-title">
              <h3 id="fin-order-title">بيانات الطلب والسداد</h3>
              <dl className="cp-ledger finance-person-details">
                <div><dt>البريد</dt><dd dir="ltr">{selected.email || "—"}</dd></div>
                <div><dt>رقم الطلب</dt><dd dir="ltr">{selected.order_id}</dd></div>
                <div><dt>مصدر الشراء</dt><dd>{selected.purchase_source}</dd></div>
                <div><dt>المسار</dt><dd>{selected.program_track && !["غير محدد","—"].includes(selected.program_track) ? selected.program_track : "دون مسار"}</dd></div>
                <div><dt>نمط البرنامج</dt><dd>{selected.program_delivery || "غير محدد"}</dd></div>
              </dl>
            <div className="finance-reference-strip">
              <PaymentReferenceControl
                paymentId={selectedReferencePayment?.id}
                orderId={selected.order_id}
                initialReference={selected.order_payment_reference || selectedReferencePayment?.reference}
                canEdit
                onSaved={(paymentReference) => {
                  if(selectedReferencePayment) updatePaymentReference(selectedReferencePayment.id,paymentReference);
                  else setSelected(current=>current?{...current,order_payment_reference:paymentReference}:current);
                }}
              />
              {selectedReferencePayment && <label className="finance-payment-date"><span>تاريخ السداد</span><span><input type="date" value={paymentRecordDate} onChange={(e)=>setPaymentRecordDate(e.target.value)}/><button type="button" disabled={saving || !paymentRecordDate || paymentRecordDate === String(selectedReferencePayment.paid_at || selectedReferencePayment.created_at || "").slice(0,10)} onClick={()=>post({action:"update_payment_record_date",paymentId:selectedReferencePayment.id,paymentDate:paymentRecordDate})}>حفظ</button></span></label>}
            </div>
            </section>
            <Section title="ملاحظات العميل">
              <CustomerNotes customerId={selected.customer_id} />
            </Section>
            <div className="finance-action-center">
              <div className="finance-action-toolbar" role="toolbar" aria-label="الإجراءات المالية السريعة">
                <button type="button" className={activeFinanceTool==="seat"?"active":""} aria-pressed={activeFinanceTool==="seat"} disabled={Boolean(selected.registration_seat_fee)} title={selected.registration_seat_fee?"رسوم مسجلة من نموذج التسجيل ومنفصلة عن قيمة البرنامج":undefined} onClick={()=>setActiveFinanceTool(current=>current==="seat"?null:"seat")}><Armchair size={17}/><span>رسوم المقعد</span><small>{selected.registration_seat_fee?`${sar(selected.seat_fee)} · من التسجيل`:Number(selected.seat_fee||0)>0?sar(selected.seat_fee):"إضافة أو تعديل"}</small></button>
                <button type="button" className={activeFinanceTool==="discount"?"active":""} aria-pressed={activeFinanceTool==="discount"} onClick={()=>setActiveFinanceTool(current=>current==="discount"?null:"discount")}><BadgeDollarSign size={17}/><span>الخصم</span><small>{Number(selected.discount_percent||0).toLocaleString("en-US")}% حاليًا</small></button>
                <button type="button" className={`withdrawal-action ${activeFinanceTool==="withdrawal"?"active":""}`} aria-pressed={activeFinanceTool==="withdrawal"} onClick={()=>setActiveFinanceTool(current=>current==="withdrawal"?null:"withdrawal")}><CircleUserRound size={17}/><span>{selected.withdrawal?"بيانات الانسحاب":"الانسحاب"}</span><small>{selected.withdrawal?"عرض التفاصيل":"تسجيل واسترداد"}</small></button>
                <button type="button" className={activeFinanceTool==="undo"?"active":""} aria-pressed={activeFinanceTool==="undo"} disabled={!selected.undo_available} onClick={()=>setActiveFinanceTool(current=>current==="undo"?null:"undo")}><Clock3 size={17}/><span>التراجع</span><small>{selected.undo_available?selected.undo_available.label:"لا يوجد إجراء"}</small></button>
              </div>
              {activeFinanceTool && <div className={`finance-action-panel ${activeFinanceTool}`} role="region" aria-live="polite">
                {activeFinanceTool==="seat"&&<div className="legacy-seat-fee-tool"><div><b>رسوم حجز المقعد</b><span>يُطبّق الفرق على إجمالي البرنامج وأول دفعة، ويبقى المتبقي وجدول الأقساط ثابتين.</span></div><label>قيمة حجز المقعد<input type="number" min="0.01" step="0.01" value={legacySeatFee} onChange={(e)=>setLegacySeatFee(e.target.value)} placeholder="مثال: 200" /></label><button type="button" className="secondary" disabled={saving || !(Number(legacySeatFee) > 0) || Math.abs(Number(legacySeatFee) - Number(selected.seat_fee || 0)) < 0.005} onClick={() => window.confirm(`سيتم تحديث رسوم المقعد إلى ${sar(Number(legacySeatFee))} مع بقاء المتبقي والأقساط كما هي. هل تريد المتابعة؟`) && post({action:"set_legacy_seat_fee",seatFee:Number(legacySeatFee)})}>{Number(selected.seat_fee || 0) > 0 ? "حفظ تعديل الرسوم" : "إضافة وفصل الرسوم"}</button></div>}
                {activeFinanceTool==="discount"&&<div className="finance-discount-editor"><div><b>تعديل نسبة الخصم</b><span>يُعاد احتساب العقد والمتبقي والأقساط غير المسددة تلقائيًا.</span></div><label><input type="number" min="0" max="100" step="0.01" value={customDiscount} onChange={e=>setCustomDiscount(e.target.value)}/><span>%</span></label><button type="button" disabled={saving||!Number.isFinite(Number(customDiscount))||Number(customDiscount)<0||Number(customDiscount)>100||Math.abs(Number(customDiscount)-Number(selected.discount_percent||0))<0.0001} onClick={()=>window.confirm(`سيتم تعديل الخصم إلى ${Number(customDiscount).toLocaleString("en-US")}% وإعادة موازنة المتبقي والأقساط غير المسددة. هل تريد المتابعة؟`)&&post({action:"update_discount_percent",discountPercent:Number(customDiscount)})}>حفظ الخصم</button></div>}
                {activeFinanceTool==="withdrawal"&&(selected.withdrawal ? <div className="withdrawal-summary"><header><div><b>العميل منسحب</b><span>{selected.withdrawal.withdrawn_at} · {selected.withdrawal.reason}</span></div><em>{selected.withdrawal.status}</em></header><div><p><span>إجمالي المدفوع قبل الاسترداد</span><b>{sar(selected.withdrawal.gross_paid)}</b></p><p><span>المبلغ المسترد</span><b>{sar(selected.withdrawal.refund_amount)}</b></p><p><span>غير قابل للاسترداد</span><b>{sar(selected.withdrawal.non_refundable_amount)}</b></p><p><span>مصدر الخصم</span><b>{selected.withdrawal.refund_source==="sale"?"المبيعات":"التحصيل"}</b></p></div><footer>{selected.withdrawal.refund_method} · المرجع: {selected.withdrawal.reference} · بواسطة {selected.withdrawal.created_by_email}</footer></div> : <div className="withdrawal-tool"><div className="withdrawal-form"><label>سبب الانسحاب<textarea value={withdrawalReason} onChange={e=>setWithdrawalReason(e.target.value)} placeholder="اكتب سبب الانسحاب"/></label><label>تاريخ الانسحاب<input type="date" value={withdrawalDate} onChange={e=>setWithdrawalDate(e.target.value)}/></label><label>المبلغ المسترد<input type="number" min="0" max={selected.gross_paid||selected.paid} step="0.01" value={withdrawalRefund} onChange={e=>setWithdrawalRefund(e.target.value)}/></label><label>المبلغ غير القابل للاسترداد<input type="number" min="0" step="0.01" value={withdrawalNonRefundable} onChange={e=>setWithdrawalNonRefundable(e.target.value)}/></label><label>يُخصم الاسترداد من<select value={withdrawalSource} onChange={e=>setWithdrawalSource(e.target.value)}><option value="sale">المبيعات</option><option value="collection">التحصيل</option></select></label><label>طريقة الاسترداد<select value={withdrawalMethod} onChange={e=>setWithdrawalMethod(e.target.value)}><option>تحويل بنكي</option><option>PayTabs</option><option>تمارا</option><option>نقدي</option><option>أخرى</option></select></label><label>مرجع الاسترداد<input value={withdrawalReference} onChange={e=>setWithdrawalReference(e.target.value)} placeholder="رقم أو رابط المرجع"/></label><button type="button" className="danger" disabled={saving||!withdrawalReason.trim()||!withdrawalDate||!withdrawalReference.trim()||Number(withdrawalRefund)<0||Number(withdrawalRefund)+Number(withdrawalNonRefundable)>Number(selected.gross_paid||selected.paid)} onClick={()=>window.confirm(`سيتم تسجيل انسحاب العميل واسترداد ${sar(Number(withdrawalRefund||0))} وإيقاف الأقساط المستقبلية. هل تريد المتابعة؟`)&&post({action:"register_withdrawal",reason:withdrawalReason,withdrawnAt:withdrawalDate,refundAmount:Number(withdrawalRefund||0),nonRefundableAmount:Number(withdrawalNonRefundable||0),refundSource:withdrawalSource,refundMethod:withdrawalMethod,reference:withdrawalReference})}>اعتماد الانسحاب والاسترداد</button></div></div>)}
                {activeFinanceTool==="undo"&&selected.undo_available&&<div className="finance-undo-bar"><div><b>التراجع عن آخر إجراء مالي</b><span>{selected.undo_available.label} · سيبقى التراجع محفوظًا في سجل النظام.</span></div><button type="button" disabled={saving} onClick={() => window.confirm(`سيتم عكس إجراء: ${selected.undo_available?.label}. سيُحفظ التراجع في سجل النظام. هل تريد المتابعة؟`) && post({action:"undo_last_finance_action"})}>تنفيذ التراجع</button></div>}
              </div>}
            </div>
            <div className={`payment-behavior-panel ${selected.payment_behavior?.tone || "neutral"}`}>
              <div><span>سلوك السداد · محسوب تلقائياً</span><b>{selected.payment_behavior?.label || "جديد"}</b></div>
              <p>{selected.payment_behavior?.summary || "لا يوجد سجل أقساط كافٍ للتقييم"}</p>
            </div>
            <Section title="حالة السداد">
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
                    <details className={`installment-card ${inst.display_status === "متأخر" ? "late" : inst.status === "مدفوع" ? "paid" : ""}`} key={inst.id}>
                      <summary>
                        <i>{inst.sequence}</i>
                        <span className="installment-card-title"><small>القسط {inst.sequence}</small><b>{sar(inst.amount)}</b><small>{beforeVat(inst.amount)}</small></span>
                        <span className="installment-card-due"><small>تاريخ الاستحقاق</small><b>{String(inst.due_date).slice(0,10)}</b></span>
                        <em className={`installment-status-badge ${installmentStatusTone(inst.display_status || inst.status)}`}>{inst.display_status || inst.status}</em>
                        <ChevronDown size={18} className="installment-chevron"/>
                      </summary>
                      <div className="installment-card-body">
                        <label className="installment-date-editor due-date-editor"><span>تعديل تاريخ الاستحقاق</span><span><input type="date" value={installmentDueDates[inst.id] || String(inst.due_date).slice(0,10)} onChange={(e) => setInstallmentDueDates((current) => ({...current,[inst.id]:e.target.value}))}/><button type="button" disabled={saving || !installmentDueDates[inst.id] || installmentDueDates[inst.id] === String(inst.due_date).slice(0,10)} onClick={() => post({action:"update_installment_due_date",installmentId:inst.id,dueDate:installmentDueDates[inst.id]})}>حفظ</button></span></label>
                        {Boolean(inst.reminder_count) && <small className="installment-reminder-meta">{inst.reminder_count} تذكير · آخر تسجيل بواسطة {inst.last_reminded_by_email}</small>}
                        <label className="installment-behavior"><span>حالة السداد</span><select disabled={inst.status === "مدفوع" || saving} value={inst.status==="مدفوع"?"تم السداد":inst.status} onChange={(e) => post({action:"installment_status",installmentId:inst.id,status:e.target.value})}><option>ملتزم</option><option>تذكير أول</option><option>تذكير ثاني</option><option>تذكير ثالث</option><option>تذكير نهائي</option><option>موافقة تمديد</option><option>تطبيق السياسة</option><option>متأخر</option>{inst.status === "مدفوع" && <option>تم السداد</option>}</select></label>
                        {inst.status !== "مدفوع" && <button type="button" className="installment-whatsapp-reminder" disabled={saving || Number(inst.reminder_count || 0) >= 4} onClick={() => sendInstallmentReminder(inst)}><FaWhatsapp size={17} />{Number(inst.reminder_count || 0) >= 4 ? "تم إرسال التذكير النهائي" : `إرسال ${reminderStatus(inst)} عبر واتساب`}</button>}
                        {inst.status === "مدفوع" ? <div className="paid-ref"><b>تم السداد</b><span>{inst.reference}</span><label className="installment-date-editor installment-payment-date"><span>تاريخ السداد الفعلي</span><span><input type="date" value={installmentPaymentDates[inst.id] || String(inst.paid_at || "").slice(0,10)} onChange={(e) => setInstallmentPaymentDates((current) => ({...current,[inst.id]:e.target.value}))}/><button type="button" disabled={saving || !installmentPaymentDates[inst.id] || installmentPaymentDates[inst.id] === String(inst.paid_at || "").slice(0,10)} onClick={() => post({action:"update_payment_date",installmentId:inst.id,paymentDate:installmentPaymentDates[inst.id]})}>حفظ</button></span></label></div> : <div className="installment-quick-pay"><select aria-label={`وسيلة سداد القسط ${inst.sequence}`} value={installmentMethods[inst.id]||"تحويل بنكي"} onChange={e=>setInstallmentMethods(current=>({...current,[inst.id]:e.target.value}))}><option>تحويل بنكي</option><option>دفع إلكتروني</option><option>PayTabs</option><option>تمارا</option><option>نقدي</option></select><input aria-label={`مرجع سداد القسط ${inst.sequence}`} value={installmentRefs[inst.id]||""} onChange={e=>setInstallmentRefs(current=>({...current,[inst.id]:e.target.value}))} placeholder="مرجع السداد" /><button className="installment-paid-check" aria-label={`تحديد القسط ${inst.sequence} كمدفوع`} disabled={saving||!String(installmentRefs[inst.id]||"").trim()} onClick={()=>post({action:"pay_installment",installmentId:inst.id,method:installmentMethods[inst.id]||"تحويل بنكي",reference:String(installmentRefs[inst.id]||"").trim()})}>✓</button></div>}
                      </div>
                    </details>
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
                      <small>{beforeVat(payment.amount)}</small>
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
            </div>
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
type ExistingCustomer = { id: string; name: string; phone: string; email: string; deleted: boolean };
// Intake attaches the order to the first match and keeps that file's name, phone and email; this says so before saving.
function ExistingCustomerAlert({ matches, name, phone, email }: { matches: ExistingCustomer[]; name: string; phone: string; email: string }) {
  const [file, other] = matches;
  if (!file) return null;
  const typedPhone = phone.replace(/[^\d+]/g, "").replace(/^\+/, "00"), typedEmail = email.trim().toLowerCase();
  const notes = [
    file.deleted && "هذا الملف محذوف، والطلب الجديد لن يظهر في قائمة العملاء. راجع الإدارة قبل التسجيل.",
    name.trim() && name.trim() !== file.name && `الاسم المكتوب لن يُحفظ، ويبقى اسم الملف «${file.name}».`,
    internationalPhonePattern.test(phone) && typedPhone !== file.phone && `الجوال في الملف ${file.phone}، والرقم المكتوب لن يُحفظ. عدّله من ملف العميل إن لزم.`,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typedEmail) && typedEmail !== file.email && `البريد في الملف ${file.email}، والبريد المكتوب لن يُحفظ. عدّله من ملف العميل إن لزم.`,
    other && `يوجد ملف آخر يطابق الجوال أو البريد: «${other.name}». سيُضاف الطلب إلى «${file.name}» فقط.`,
  ].filter((note): note is string => Boolean(note));
  return (
    <div className={`rg-existing ${file.deleted || other ? "danger" : ""}`} role="status">
      <Info size={17} aria-hidden="true" />
      <div>
        <b>عميل موجود: سيُضاف هذا الطلب إلى ملف «{file.name}»</b>
        {notes.length > 0 && <ul>{notes.map((note) => <li key={note}>{note}</li>)}</ul>}
      </div>
    </div>
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
type B2BRow = Record<string, string | number | null>;
const b2bStageColors: Record<string,string> = {
  "جهة جديدة":"blue","تواصل أولي":"blue","تأهيل الاحتياج":"violet","اجتماع أو عرض تعريفي":"violet",
  "إعداد العرض":"amber","عرض مرسل":"amber","تفاوض":"orange","بانتظار التوقيع":"orange","تم التوقيع":"green","مغلقة":"gray",
};
const B2B_LIFECYCLE = ["الاستكشاف والتقييم","التفاوض والاتفاقية","التفعيل والعمليات","قياس الأثر","التجديد أو الخروج","مؤجل","غير مناسب"];
const B2B_CONTACT_STATUSES=["لم يتم التواصل","تم التواصل الأولي","تم تحديد موعد اجتماع","تم الاجتماع","بانتظار رد الجهة"];
const b2bContactTone=(status:unknown)=>status==="تم الاجتماع"?"done":["تم تحديد اجتماع","تم تحديد موعد اجتماع"].includes(String(status))?"meeting":["في انتظار الرد","بانتظار رد الجهة"].includes(String(status))?"waiting":["تم التواصل الأول","تم التواصل الأولي"].includes(String(status))?"contacted":"new";
const b2bPathLabel=(path:unknown)=>path==="BOTH"?"جميع المجالات":String(path||"ABA");
const B2B_LOCATIONS: Record<string,string[]> = {
  "الرياض":["الرياض","الخرج","الدرعية","المجمعة"],"مكة المكرمة":["مكة المكرمة","جدة","الطائف","رابغ"],"المدينة المنورة":["المدينة المنورة","ينبع","العلا"],
  "المنطقة الشرقية":["الدمام","الخبر","الظهران","الأحساء","الجبيل"],"القصيم":["بريدة","عنيزة","الرس"],"عسير":["أبها","خميس مشيط","محايل عسير"],
  "تبوك":["تبوك","ضباء","الوجه"],"حائل":["حائل"],"الحدود الشمالية":["عرعر","رفحاء"],"جازان":["جازان","صبيا"],"نجران":["نجران"],"الباحة":["الباحة","بلجرشي"],"الجوف":["سكاكا","القريات"]
};
function B2BWorkspace({section,canManage,canConvert}:{section:"business"|"partnerships";canManage:boolean;canConvert:boolean}) {
  const [rows,setRows]=useState<B2BRow[]>([]),[recentActivities,setRecentActivities]=useState<B2BRow[]>([]),[options,setOptions]=useState<string[]>([]),[partnershipStages,setPartnershipStages]=useState<string[]>([]),[trainingStages,setTrainingStages]=useState<string[]>([]),[lifecycleStages,setLifecycleStages]=useState<string[]>(B2B_LIFECYCLE),[staff,setStaff]=useState<B2BRow[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[showForm,setShowForm]=useState(false),[formStep,setFormStep]=useState(1),[selected,setSelected]=useState<B2BRow|null>(null),[saving,setSaving]=useState(false),[activities,setActivities]=useState<B2BRow[]>([]),[documents,setDocuments]=useState<B2BRow[]>([]),[approvals,setApprovals]=useState<B2BRow[]>([]),[activityType,setActivityType]=useState("dataFormSentAt"),[activityDate,setActivityDate]=useState(new Date().toLocaleDateString("en-CA")),[activityDetails,setActivityDetails]=useState(""),[scope,setScope]=useState("assigned"),[canReview,setCanReview]=useState(false),[canFitDecision,setCanFitDecision]=useState(false),[canCreatePartnership,setCanCreatePartnership]=useState(false),[canDelete,setCanDelete]=useState(false),[search,setSearch]=useState(""),[stageFilter,setStageFilter]=useState("الكل"),[pathFilter,setPathFilter]=useState("الكل"),[kindFilter,setKindFilter]=useState("الكل"),[dragging,setDragging]=useState<string>("");
  const [form,setForm]=useState<Record<string,string>>({name:"",type:"مركز",contactName:"",jobTitle:"",phone:"",email:"",region:"",regionOther:"",city:"",activity:"",source:"",sourceOther:"",priority:"متوسطة",path:"ABA",ownerEmail:"",partnershipType:"",contactStatus:"لم يتم التواصل",meetingScheduledAt:"",opportunityKind:"partnership",registrationStatus:"فرصة جديدة",traineeCount:"",requestedProgram:"",deliveryDate:"",expectedValue:"",expectedCloseDate:"",nextFollowUp:"",recommendedServices:""});
  const [agreement,setAgreement]=useState<Record<string,string>>({agreementNumber:"",signedAt:"",startDate:"",endDate:"",value:"",paymentTerms:"",scope:"",services:"",renewalTerms:"",documentUrl:""});
  const [pipelineDraft,setPipelineDraft]=useState<Record<string,string>>({});
  const [executionDraft,setExecutionDraft]=useState<Record<string,string>>({});
  const [meetingMinutes,setMeetingMinutes]=useState<B2BRow[]>([]),[contacts,setContacts]=useState<B2BRow[]>([]),[contactDraft,setContactDraft]=useState({name:"",jobTitle:"",phone:"",email:"",isPrimary:false});
  const [editingAccount,setEditingAccount]=useState(false),[accountDraft,setAccountDraft]=useState<Record<string,string>>({});
  const [showContactForm,setShowContactForm]=useState(false);
  const [showAllActivities,setShowAllActivities]=useState(false);
  const [columnPriorities,setColumnPriorities]=useState<Record<string,string>>({});
  const [columnStatuses,setColumnStatuses]=useState<Record<string,string>>({});
  const load=async(silent=false)=>{if(!silent)setLoading(true);setError("");try{const data=await apiJson(`/api/b2b?section=${section}`);setRows(data.opportunities||data.partnerships||[]);setRecentActivities(data.recentActivities||[]);setOptions(data.stages||data.statuses||[]);setPartnershipStages(data.partnershipStages||[]);setTrainingStages(data.trainingStages||[]);setLifecycleStages(data.lifecycleStages||B2B_LIFECYCLE);setStaff(data.staff||[]);setScope(data.scope||"assigned");setCanReview(Boolean(data.canReview||data.canApprove));setCanFitDecision(Boolean(data.canFitDecision));setCanCreatePartnership(Boolean(data.canCreatePartnership));setCanDelete(Boolean(data.canDelete))}catch(e){setError((e as Error).message)}finally{if(!silent)setLoading(false)}};
  useEffect(()=>{
    void load();
    const refresh=()=>void load(true);
    const onVisibility=()=>{if(document.visibilityState==="visible")refresh()};
    // مزامنة احتياطية للشراكات؛ عمليات الحفظ نفسها تحدّث الواجهة فوراً.
    // تقليلها إلى ثلاث دقائق يمنع استنزاف قراءات D1 مع تعدد الموظفين.
    const interval=window.setInterval(refresh,180000);
    window.addEventListener("focus",refresh);
    document.addEventListener("visibilitychange",onVisibility);
    window.addEventListener("sulukera:data-changed",refresh);
    return()=>{window.clearInterval(interval);window.removeEventListener("focus",refresh);document.removeEventListener("visibilitychange",onVisibility);window.removeEventListener("sulukera:data-changed",refresh)};
  },[section]);
  useEffect(()=>{
    if(!selected||saving)return;
    const fresh=rows.find(row=>String(row.opportunity_id||row.id)===String(selected.opportunity_id||selected.id));
    if(fresh&&JSON.stringify(fresh)!==JSON.stringify(selected))setSelected(fresh);
  },[rows,selected,saving]);
  const save=async(body:Record<string,unknown>)=>{setSaving(true);setError("");try{await apiJson("/api/b2b",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});setShowForm(false);setSelected(null);await load()}catch(e){setError((e as Error).message)}finally{setSaving(false)}};
  const execute=async(body:Record<string,unknown>,keepOpen=true)=>{setSaving(true);setError("");const current=selected;if(body.action==="record_approval"){const approvalType=String(body.approvalType),decision=String(body.decision);setApprovals(previous=>[{id:`optimistic-${approvalType}`,approval_type:approvalType,status:decision,decided_by_name:"تم التحديث",decided_at:new Date().toISOString()},...previous.filter(row=>row.approval_type!==approvalType)])}if(body.action==="update_lifecycle"&&current)setSelected({...current,lifecycle_stage:String(body.stage)});if(body.action==="update_partnership_contact"&&current)setSelected({...current,contact_status:String(body.contactStatus||current.contact_status||"")});if(body.action==="add_partnership_meeting"&&current)setSelected({...current,contact_status:"تم الاجتماع"});if(body.action==="update_partnership_pipeline"&&current){const fit=String(body.fitDecision||""),stage=fit==="رفض"?"غير مناسب":fit==="تأجيل"?"مؤجل":String(body.agreementSignedAt||"")?"التفعيل والعمليات":fit==="اعتماد"?"التفاوض والاتفاقية":current.lifecycle_stage;setSelected({...current,contact_status:String(body.contactStatus||current.contact_status||""),fit_decision:fit,fit_reason:String(body.fitReason||""),lifecycle_stage:stage})}if(body.action==="update_partnership_execution"&&current&&body.financialOfferSentAt)setSelected({...current,lifecycle_stage:"قياس الأثر"});try{await apiJson("/api/b2b",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});if(body.action==="add_partnership_meeting")setPipelineDraft(previous=>({...previous,meetingCompletedAt:"",meetingTopic:"",meetingAttendeesInternal:"",meetingAttendeesExternal:"",meetingSummary:"",meetingNeeds:"",meetingOpportunities:"",meetingDecisions:"",meetingNextStep:""}));if(current&&keepOpen){await loadActivities(current.account_id);void load(true)}else await load()}catch(e){setError((e as Error).message);if(current){setSelected(current);await loadActivities(current.account_id)}}finally{setSaving(false)}};
  const loadActivities=async(accountId:unknown)=>{try{const data=await apiJson(`/api/b2b?accountId=${encodeURIComponent(String(accountId||""))}`);setActivities(data.activities||[]);setDocuments(data.documents||[]);setApprovals(data.approvals||[]);setMeetingMinutes(data.meetings||[]);setContacts(data.contacts||[])}catch(e){setError((e as Error).message)}};
  const openRow=(row:B2BRow)=>{setSelected(row);setEditingAccount(false);setShowContactForm(false);setShowAllActivities(false);setAccountDraft({name:String(row.account_name||""),type:String(row.account_type||""),region:String(row.region||""),city:String(row.city||""),source:String(row.source||""),priority:String(row.priority||""),path:String(row.path||""),partnershipType:String(row.partnership_type||""),ownerEmail:String(row.owner_email||""),contactName:String(row.contact_name||""),jobTitle:String(row.contact_title||""),phone:String(row.contact_phone||""),email:String(row.contact_email||""),logoData:String(row.logo_data||"")});setPipelineDraft({contactStatus:String(row.contact_status||""),meetingScheduledAt:String(row.meeting_scheduled_at||"").slice(0,16),meetingMode:String(row.meeting_mode||""),meetingCompletedAt:String(row.meeting_completed_at||"").slice(0,16),meetingAttendeesInternal:String(row.meeting_attendees_internal||""),meetingAttendeesExternal:String(row.meeting_attendees_external||""),meetingTopic:String(row.meeting_topic||""),meetingSummary:String(row.meeting_summary||""),meetingNeeds:String(row.meeting_needs||""),meetingOpportunities:String(row.meeting_opportunities||""),meetingDecisions:String(row.meeting_decisions||""),meetingNextStep:String(row.meeting_next_step||""),nextFollowUp:String(row.next_follow_up||"").slice(0,10),fitDecision:String(row.fit_decision||""),fitReason:String(row.fit_reason||""),dataFormSentAt:String(row.data_form_sent_at||"").slice(0,10),dataFormCompletedAt:String(row.data_form_completed_at||"").slice(0,10),agreementPreparedAt:String(row.agreement_prepared_at||"").slice(0,10),agreementSentAt:String(row.agreement_sent_at||"").slice(0,10),organizationSignedAt:String(row.organization_signed_at||"").slice(0,10),agreementSignedAt:String(row.agreement_signed_at||"").slice(0,10)});setExecutionDraft({whatsappGroupCreatedAt:String(row.whatsapp_group_created_at||"").slice(0,10),partnershipShieldSentAt:String(row.partnership_shield_sent_at||"").slice(0,10),socialAnnouncementAt:String(row.social_announcement_at||"").slice(0,10),totalOfferAmount:String(row.total_offer_amount||""),executionTraineeCount:String(row.execution_trainee_count||""),executionProgram:String(row.execution_program||""),executionProgramOther:String(row.execution_program_other||""),priceOfferPreparedAt:String(row.price_offer_prepared_at||"").slice(0,10),financialOfferSentAt:String(row.financial_offer_sent_at||"").slice(0,10)});void loadActivities(row.account_id)};
  const saveAccount=async()=>{if(!selected)return;setSaving(true);setError("");try{await apiJson("/api/b2b",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"update_account",accountId:selected.account_id,...accountDraft})});setSelected({...selected,account_name:accountDraft.name,account_type:accountDraft.type,region:accountDraft.region,city:accountDraft.city,source:accountDraft.source,priority:accountDraft.priority,path:accountDraft.path,partnership_type:accountDraft.partnershipType,owner_email:accountDraft.ownerEmail,contact_name:accountDraft.contactName,contact_title:accountDraft.jobTitle,contact_phone:accountDraft.phone,contact_email:accountDraft.email,logo_data:accountDraft.logoData});setEditingAccount(false);await load();await loadActivities(selected.account_id)}catch(e){setError((e as Error).message)}finally{setSaving(false)}};
  const addActivity=async()=>{if(!selected)return;if(section==="partnerships"&&String(selected.lifecycle_stage)==="التفاوض والاتفاقية"){await execute({action:"update_agreement_step",opportunityId:selected.opportunity_id,step:activityType,completedAt:activityDate,details:activityDetails});setPipelineDraft(previous=>({...previous,[activityType]:activityDate}));setActivityDetails("");return}setSaving(true);try{await apiJson("/api/b2b",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"log_activity",accountId:selected.account_id,opportunityId:selected.opportunity_id||selected.id,partnershipId:section==="partnerships"?(selected.partnership_id||""):"",activityType,details:activityDetails})});setActivityDetails("");await loadActivities(selected.account_id);await load()}catch(e){setError((e as Error).message)}finally{setSaving(false)}};
  const removeEntity=async()=>{if(!selected||!canDelete)return;const name=String(selected.account_name||"هذه الجهة");if(!window.confirm(`سيتم حذف ${name} وجميع سجلاتها في B2B نهائيًا. هل تريد المتابعة؟`))return;setSaving(true);setError("");try{await apiJson("/api/b2b",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({accountId:selected.account_id})});setSelected(null);await load()}catch(e){setError((e as Error).message)}finally{setSaving(false)}};
  const today=new Date().toLocaleDateString("en-CA"),totalValue=rows.reduce((sum,row)=>sum+Number(row.expected_value||row.value||0),0),followUps=rows.filter(row=>String(row.next_follow_up||"")&&String(row.next_follow_up)<=today).length;
  const contacted=rows.filter(row=>!["جهة مسندة",""].includes(String(row.stage||""))).length,contactedToday=rows.filter(row=>String(row.last_contact_at||"").slice(0,10)===today).length,awaitingSignature=rows.filter(row=>row.stage==="بانتظار التوقيع").length,trainingRequests=rows.filter(row=>row.opportunity_kind==="corporate_training").length;
  const visibleRows=rows.filter(row=>{const q=search.trim().toLowerCase();return(!q||[row.account_name,row.contact_name,row.contact_phone,row.city,row.requested_program].some(value=>String(value||"").toLowerCase().includes(q)))&&(stageFilter==="الكل"||String(row.stage||row.status)===stageFilter)&&(pathFilter==="الكل"||String(row.path)===pathFilter)&&(kindFilter==="الكل"||String(row.opportunity_kind||"partnership")===kindFilter)});
  const funnelStages=["جهة مسندة","تم التواصل","تم الاجتماع","أُرسل العرض","بانتظار التوقيع","تم التوقيع"];
  const days=(value:unknown)=>value?Math.ceil((new Date(String(value)).getTime()-Date.now())/86400000):null;
  const daysSince=(value:unknown)=>value?Math.max(0,Math.floor((Date.now()-new Date(String(value)).getTime())/86400000)):null;
  const overdueFollowUps=rows.filter(row=>String(row.next_follow_up||"")&&String(row.next_follow_up)<today).length;
  const managerApproved=approvals.some(row=>row.approval_type==="مدير الشراكات"&&row.status==="approved");
  const agreementMilestones=[['data_form_sent_at','dataFormSentAt','تم إرسال النموذج'],['agreement_prepared_at','agreementPreparedAt','إعداد الاتفاقية'],['agreement_sent_at','agreementSentAt','تم إرسال الاتفاقية'],['organization_signed_at','organizationSignedAt','تم توقيع الجهة'],['agreement_signed_at','agreementSignedAt','تم توقيع الطرفين']] as const;
  const moveLifecycle=(row:B2BRow,stage:string)=>void execute({action:"update_lifecycle",opportunityId:row.opportunity_id,partnershipId:row.partnership_id||"",stage},false);
  const reorderCard=(row:B2BRow,direction:"up"|"down",priority="الكل",contactStatus="الكل")=>void execute({action:"reorder_partnership_card",opportunityId:row.opportunity_id,direction,priority,contactStatus},false);
  const readLogo=(file:File|undefined,target:"form"|"account")=>{if(!file)return;if(file.size>500000||!/^image\/(png|jpeg|webp)$/.test(file.type)){setError("الشعار يجب أن يكون PNG أو JPG أو WebP وحجمه أقل من 500KB");return}const reader=new FileReader();reader.onload=()=>{const logoData=String(reader.result||"");target==="form"?setForm(current=>({...current,logoData})):setAccountDraft(current=>({...current,logoData}))};reader.readAsDataURL(file)};
  return (
    <div className="ops-home ops-b2b b2b-workspace" aria-busy={loading}>
      <header className="b2b-masthead">
        <div>
          <span>
            {scope === "all"
              ? "نظرة شاملة لجميع الفرق"
              : "مساحة العمل المسندة إليك"}
          </span>
          <h2>{section === "business" ? "مبيعات الأعمال" : "الشراكات"}</h2>
          <p>
            {section === "business"
              ? "كل جهة، تواصل، اجتماع وعرض في مسار واحد واضح."
              : "متابعة الاتفاقيات والتفعيل والتجديد دون خلطها بمالية الأفراد."}
          </p>
        </div>
        {((section === "business" && canManage) ||
          (section === "partnerships" && canCreatePartnership)) && (
          <button
            type="button"
            className="oh-btn primary"
            onClick={() => {
              if (section === "partnerships")
                setForm((current) => ({
                  ...current,
                  name: "",
                  contactName: "",
                  region: "",
                  city: "",
                  email: "",
                  source: "",
                  path: "",
                  partnershipType: "",
                  priority: "",
                  ownerEmail: "",
                  contactStatus: "لم يتم التواصل",
                  regionOther: "",
                  sourceOther: "",
                  meetingScheduledAt: "",
                }));
              setShowForm(true);
            }}
          >
            <UserPlus size={16} aria-hidden="true" /> إضافة جهة
          </button>
        )}
      </header>
      <section className="oh-pulse b2b-pulse" aria-labelledby="b2b-pulse-title">
        <header><h3 id="b2b-pulse-title">{section === "business" ? "نبض مبيعات الأعمال" : "نبض الشراكات"}</h3><p>{scope === "all" ? "ضمن جميع الفرق." : "ضمن نطاق عملك."} {section === "business" ? "طلبات التدريب المؤسسي لا تتحول إلى شراكات." : "مؤشرات B2B مستقلة عن مالية الأفراد."}</p></header>
        <div>
          <HomeMetric icon={section === "business" ? BriefcaseBusiness : Handshake} label={section === "business" ? "الجهات المسندة" : "إجمالي الشراكات"} value={rows.length} note={scope === "all" ? "ضمن جميع الفرق" : "ضمن نطاق عملك"} tone="brand" />
          <HomeMetric icon={PhoneCall} label={section === "business" ? "تم التواصل اليوم" : "شراكات نشطة"} value={section === "business" ? contactedToday : rows.filter((x) => x.status === "نشطة").length} note={section === "business" ? `${contacted} جهة تم التواصل معها إجمالًا` : "قيد التفعيل والمتابعة"} tone="success" />
          <HomeMetric icon={CalendarDays} label={section === "business" ? "متابعات مستحقة" : "تجديد خلال 60 يومًا"} value={section === "business" ? followUps : rows.filter((x) => { const d = days(x.end_date); return d !== null && d >= 0 && d <= 60; }).length} note={section === "business" ? `${awaitingSignature} بانتظار التوقيع` : "تحتاج تخطيطًا مبكرًا"} tone="neutral" />
          <HomeMetric icon={section === "business" ? ClipboardList : CircleDollarSign} label={section === "business" ? "طلبات التدريب المؤسسي" : "قيمة الاتفاقيات"} value={section === "business" ? trainingRequests : totalValue.toLocaleString("en-US")} suffix={section === "business" ? undefined : "ر.س"} note={section === "business" ? "لا تتحول إلى شراكات" : "مؤشر B2B مستقل"} tone="neutral" />
          <HomeMetric icon={Clock3} label="متابعات متأخرة" value={overdueFollowUps} note={overdueFollowUps ? "تجاوزت تاريخ المتابعة القادمة" : "جميع المتابعات ضمن موعدها"} tone={overdueFollowUps ? "danger" : "neutral"} />
        </div>
      </section>
      {section === "partnerships" && recentActivities.length > 0 && (
        <section className="oh-panel b2b-team-activity" aria-labelledby="b2b-team-title">
          <header className="oh-panel-head"><span className="oh-icon"><Activity size={18} /></span><div><h3 id="b2b-team-title">آخر تحديثات الشراكات</h3><p>نبض الفريق · تتحدث تلقائيًا</p></div></header>
          <ol className="b2b-feed">{recentActivities.slice(0,6).map((activity)=><li key={String(activity.id)}><i aria-hidden="true">{String(activity.actor_name||"ف").slice(0,2)}</i><span><b>{activity.actor_name||activity.actor_email}</b><small>{activity.activity_type} · {activity.account_name}</small></span><time>{new Date(String(activity.created_at)).toLocaleString("ar-SA-u-nu-latn",{dateStyle:"short",timeStyle:"short"})}</time></li>)}</ol>
        </section>
      )}
      {section === "business" && (
        <section className="oh-panel b2b-funnel" aria-labelledby="b2b-funnel-title">
          <header className="oh-panel-head"><span className="oh-icon"><ChartNoAxesCombined size={18} /></span><div><h3 id="b2b-funnel-title">تقدم فرص الشراكة</h3><p>طلبات التدريب المؤسسي تظهر في تصنيف مستقل ولا تدخل هذا المسار. اضغط على أي مرحلة لعرض جهاتها.</p></div></header>
          <ol className="b2b-funnel-steps">
            {funnelStages.map((stage, index) => {
              const partnershipRows = rows.filter((row) => row.opportunity_kind !== "corporate_training"),
                count = partnershipRows.filter((row) => funnelStages.indexOf(String(row.stage)) >= index).length,
                percent = partnershipRows.length ? Math.round((count / partnershipRows.length) * 100) : 0;
              return (
                <li key={stage}>
                  <button type="button" aria-pressed={kindFilter === "partnership" && stageFilter === stage} onClick={() => { setKindFilter("partnership"); setStageFilter(stage); }}>
                    <span>{stage}</span>
                    <b>{count}</b>
                    <i aria-hidden="true"><em style={{ width: `${percent}%` }} /></i>
                    <small>{percent}%</small>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}
      {error && <div className="oh-alert" role="alert">{error}</div>}
      {showForm && (
        <section className="b2b-form-card">
          <header>
            <div>
              <b>
                {section === "business"
                  ? "إضافة جهة لمبيعات الأعمال"
                  : "إضافة جهة إلى الشراكات"}
              </b>
              <span>
                {section === "partnerships"
                  ? "المرحلة الأولى · البيانات الأولية"
                  : formStep === 1
                    ? "الخطوة 1 من 2 · بيانات الفرصة الأساسية"
                    : "الخطوة 2 من 2 · تفاصيل العقد والاعتماد"}
              </span>
            </div>
            <button
              aria-label="إغلاق النموذج"
              onClick={() => {
                setShowForm(false);
                setFormStep(1);
              }}
            >
              ×
            </button>
          </header>
          <div className="b2b-form-shell">
            <aside className="b2b-form-sidebar" aria-label="مراحل إضافة الجهة">
              <div className="b2b-form-sidebar-title">
                <span>خطوات الإضافة</span>
                <b>{section === "partnerships" ? "1 من 1" : `${formStep} من 2`}</b>
              </div>
              <button
                type="button"
                className={formStep === 1 ? "current" : "complete"}
                onClick={() => setFormStep(1)}
              >
                <i>{formStep > 1 ? <Check size={15} /> : "01"}</i>
                <span>
                  <b>
                    {section === "partnerships"
                      ? "البيانات الأولية"
                      : "بيانات الجهة"}
                  </b>
                  <small>
                    {section === "partnerships"
                      ? "بيانات تعريفية اختيارية لبدء مرحلة الملاءمة"
                      : "الجهة، مسؤول التواصل، المسار والإسناد"}
                  </small>
                </span>
              </button>
              {section !== "partnerships" && (
              <button
                type="button"
                disabled={
                  section === "partnerships" ||
                  (section === "business" &&
                    form.registrationStatus !== "موقعة")
                }
                className={formStep === 2 ? "current" : ""}
                onClick={() => {
                  if (
                    section === "business" &&
                    form.registrationStatus === "موقعة"
                  )
                    setFormStep(2);
                }}
              >
                <i>02</i>
                <span>
                  <b>
                    الاتفاقية والاعتماد
                  </b>
                  <small>
                    {form.registrationStatus !== "موقعة"
                        ? "تُفتح عند اختيار موقعة"
                        : "التواريخ والقيمة وملف الاتفاقية"}
                  </small>
                </span>
              </button>
              )}
            </aside>
            <div className="b2b-form-main">
              <div className="b2b-form-section-head">
                <i>{formStep === 1 ? "01" : "02"}</i>
                <div>
                  <h3>
                    {formStep === 1
                      ? section === "partnerships"
                        ? "البيانات الأولية"
                        : "بيانات الجهة والفرصة"
                      : "تفاصيل الاتفاقية"}
                  </h3>
                  <p>
                    {formStep === 1
                      ? section === "partnerships"
                        ? "ابدأ بالمعلومات المتاحة حاليًا؛ يمكن استكمال جميع الحقول لاحقًا."
                        : "سجّل البيانات الأساسية وحدد المسؤول والمسار التشغيلي."
                      : "أكمل بيانات التوقيع والاتفاقية قبل إنشاء الشراكة."}
                  </p>
                </div>
              </div>
              {formStep === 1 ? (
                section === "partnerships" ? (
                  <div className="b2b-form-grid partnership-initial-fields">
                    <label>
                      <span>اسم الجهة</span>
                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="اسم الجهة إن كان متاحًا"
                      />
                    </label>
                    <label>
                      <span>اسم ممثل الجهة</span>
                      <input
                        value={form.contactName}
                        onChange={(e) =>
                          setForm({ ...form, contactName: e.target.value })
                        }
                        placeholder="اسم الشخص المسؤول لدى الجهة"
                      />
                    </label>
                    <label>
                      <span>المنطقة</span>
                      <select
                        value={form.region}
                        onChange={(e) =>
                          setForm({ ...form, region: e.target.value, city: "" })
                        }
                      >
                        <option value="">غير محدد</option>
                        {Object.keys(B2B_LOCATIONS).map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                        <option value="أخرى">أخرى</option>
                      </select>
                    </label>
                    {form.region === "أخرى" && (
                      <label>
                        <span>اكتب المنطقة</span>
                        <input
                          value={form.regionOther || ""}
                          onChange={(e) => setForm({ ...form, regionOther: e.target.value })}
                          placeholder="اسم المنطقة"
                        />
                      </label>
                    )}
                    <label>
                      <span>المدينة</span>
                      {form.region === "أخرى" ? (
                        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="اسم المدينة" />
                      ) : (
                        <select disabled={!form.region} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                          <option value="">غير محدد</option>
                          {(B2B_LOCATIONS[form.region] || []).map((x) => <option key={x}>{x}</option>)}
                        </select>
                      )}
                    </label>
                    <label>
                      <span>البريد الإلكتروني</span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="name@example.com"
                      />
                    </label>
                    <label>
                      <span>المصدر</span>
                      <select
                        value={form.source}
                        onChange={(e) =>
                          setForm({ ...form, source: e.target.value })
                        }
                      >
                        <option value="">غير محدد</option>
                        {["عميل سابق", "قاعدة بيانات سلوكيرا", "طلب وارد"].map(
                          (x) => (
                            <option key={x}>{x}</option>
                          ),
                        )}
                        <option value="أخرى">أخرى</option>
                      </select>
                    </label>
                    {form.source === "أخرى" && (
                      <label>
                        <span>اكتب المصدر</span>
                        <input value={form.sourceOther || ""} onChange={(e) => setForm({ ...form, sourceOther: e.target.value })} placeholder="مصدر الجهة" />
                      </label>
                    )}
                    <label>
                      <span>المجال</span>
                      <select
                        value={form.path}
                        onChange={(e) =>
                          setForm({ ...form, path: e.target.value })
                        }
                      >
                        <option value="">غير محدد</option>
                        <option>ABA</option>
                        <option>OBM</option>
                        <option value="BOTH">جميع المجالات</option>
                      </select>
                    </label>
                    <label>
                      <span>نوع الشراكة</span>
                      <select
                        value={form.partnershipType}
                        onChange={(e) =>
                          setForm({ ...form, partnershipType: e.target.value })
                        }
                      >
                        <option value="">غير محدد</option>
                        {["مذكرة تفاهم", "شراكة تدريب", "اتفاقية تسويق"].map(
                          (x) => (
                            <option key={x}>{x}</option>
                          ),
                        )}
                      </select>
                    </label>
                    <label>
                      <span>الأولوية</span>
                      <select
                        value={form.priority}
                        onChange={(e) =>
                          setForm({ ...form, priority: e.target.value })
                        }
                      >
                        <option value="">غير محددة</option>
                        {["عالية", "متوسطة", "منخفضة"].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>الإسناد</span>
                      <select
                        value={form.ownerEmail}
                        onChange={(e) =>
                          setForm({ ...form, ownerEmail: e.target.value })
                        }
                      >
                        <option value="">دون إسناد</option>
                        {staff.map((x) => (
                          <option key={String(x.email)} value={String(x.email)}>
                            {x.display_name || x.email}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>حالة التواصل</span>
                      <select
                        value={form.contactStatus}
                        onChange={(e) =>
                          setForm({ ...form, contactStatus: e.target.value })
                        }
                      >
                        {B2B_CONTACT_STATUSES.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    {form.contactStatus === "تم تحديد موعد اجتماع" && (
                      <label>
                        <span>تاريخ ووقت الاجتماع</span>
                        <input type="datetime-local" value={form.meetingScheduledAt || ""} onChange={(e) => setForm({ ...form, meetingScheduledAt: e.target.value })} />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="b2b-form-grid">
                    {[
                      ["name", "اسم الجهة *"],
                      ["contactName", "الشخص المسؤول *"],
                      ["jobTitle", "المسمى الوظيفي"],
                      ["phone", "رقم الجوال"],
                      ["email", "البريد الإلكتروني"],
                      ["activity", "نشاط الجهة"],
                      ["source", "مصدر الفرصة"],
                      ["expectedValue", "القيمة المتوقعة"],
                      ["expectedCloseDate", "تاريخ الإغلاق المتوقع"],
                      ["nextFollowUp", "المتابعة القادمة"],
                      ["recommendedServices", "الخدمات المقترحة"],
                    ].map(([key, label]) => (
                      <label key={key}>
                        <span>{label}</span>
                        <input
                          type={
                            key.includes("Date") || key === "nextFollowUp"
                              ? "date"
                              : key === "expectedValue"
                                ? "number"
                                : "text"
                          }
                          value={form[key] || ""}
                          onChange={(e) =>
                            setForm({ ...form, [key]: e.target.value })
                          }
                        />
                      </label>
                    ))}
                    <label>
                      <span>المنطقة</span>
                      <select
                        value={form.region}
                        onChange={(e) =>
                          setForm({ ...form, region: e.target.value, city: "" })
                        }
                      >
                        <option value="">اختر المنطقة</option>
                        {Object.keys(B2B_LOCATIONS).map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>المدينة</span>
                      <select
                        disabled={!form.region}
                        value={form.city}
                        onChange={(e) =>
                          setForm({ ...form, city: e.target.value })
                        }
                      >
                        <option value="">اختر المدينة</option>
                        {(B2B_LOCATIONS[form.region] || []).map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>نوع الجهة</span>
                      <select
                        value={form.type}
                        onChange={(e) =>
                          setForm({ ...form, type: e.target.value })
                        }
                      >
                        {[
                          "شركة",
                          "مركز",
                          "جمعية",
                          "جهة حكومية",
                          "جامعة",
                          "أخرى",
                        ].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>الأولوية</span>
                      <select
                        value={form.priority}
                        onChange={(e) =>
                          setForm({ ...form, priority: e.target.value })
                        }
                      >
                        {["عالية", "متوسطة", "منخفضة"].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    {section === "business" && (
                      <>
                        <label>
                          <span>نوع الفرصة</span>
                          <select
                            value={form.opportunityKind}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                opportunityKind: e.target.value,
                              })
                            }
                          >
                            <option value="partnership">فرصة شراكة</option>
                            <option value="corporate_training">
                              طلب تدريب مؤسسي
                            </option>
                          </select>
                        </label>
                        <label>
                          <span>حالة الفرصة</span>
                          <select
                            value={form.registrationStatus}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                registrationStatus: e.target.value,
                              })
                            }
                          >
                            <option>فرصة جديدة</option>
                            <option>موقعة</option>
                          </select>
                        </label>
                      </>
                    )}
                    <label>
                      <span>مسار الجهة</span>
                      <select
                        value={form.path}
                        onChange={(e) =>
                          setForm({ ...form, path: e.target.value })
                        }
                      >
                        <option>ABA</option>
                        <option>OBM</option>
                      </select>
                    </label>
                    <label>
                      <span>إسناد الموظف</span>
                      <select
                        value={form.ownerEmail}
                        onChange={(e) =>
                          setForm({ ...form, ownerEmail: e.target.value })
                        }
                      >
                        <option value="">إسنادها لي</option>
                        {staff.map((x) => (
                          <option key={String(x.email)} value={String(x.email)}>
                            {x.display_name || x.email}
                          </option>
                        ))}
                      </select>
                    </label>
                    {section === "business" &&
                      form.opportunityKind === "corporate_training" && (
                        <>
                          <label>
                            <span>اسم التدريب أو البرنامج *</span>
                            <input
                              value={form.requestedProgram}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  requestedProgram: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label>
                            <span>عدد المتدربين *</span>
                            <input
                              type="number"
                              min="1"
                              value={form.traineeCount}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  traineeCount: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label>
                            <span>التاريخ المتوقع للتنفيذ</span>
                            <input
                              type="date"
                              value={form.deliveryDate}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  deliveryDate: e.target.value,
                                })
                              }
                            />
                          </label>
                        </>
                      )}
                  </div>
                )
              ) : (
                <div className="b2b-form-grid contract-step">
                  {[
                    ["signedAt", "تاريخ التوقيع *"],
                    ["startDate", "بداية الاتفاقية *"],
                    ["endDate", "نهاية الاتفاقية *"],
                    ["agreementNumber", "رقم الاتفاقية"],
                    ["value", "قيمة الاتفاقية"],
                    ["scope", "نطاق الاتفاقية"],
                    ["services", "الخدمات المتفق عليها"],
                    ["documentUrl", "رابط العقد النهائي"],
                  ].map(([key, label]) => (
                    <label key={key}>
                      <span>{label}</span>
                      <input
                        type={
                          key.endsWith("At") || key.endsWith("Date")
                            ? "date"
                            : key === "value"
                              ? "number"
                              : "text"
                        }
                        value={agreement[key] || ""}
                        onChange={(e) =>
                          setAgreement({ ...agreement, [key]: e.target.value })
                        }
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <footer>
            {formStep === 2 && (
              <button className="secondary" onClick={() => setFormStep(1)}>
                السابق
              </button>
            )}
            <button
              disabled={
                saving ||
                (section === "business" && (!form.name || !form.contactName))
              }
              onClick={() => {
                if (section === "partnerships") {
                  void save({
                    action: "create_partnership_initial",
                    ...form,
                    region: form.region === "أخرى" ? form.regionOther : form.region,
                    source: form.source === "أخرى" ? form.sourceOther : form.source,
                  });
                  return;
                }
                const needsContract = form.registrationStatus === "موقعة";
                if (formStep === 1 && needsContract) {
                  setFormStep(2);
                  return;
                }
                void save(
                  formStep === 2
                    ? { action: "create_partnership", ...form, ...agreement }
                    : { action: "create_business", ...form },
                );
              }}
            >
              {section === "partnerships"
                ? "حفظ البيانات الأولية"
                : formStep === 1 && form.registrationStatus !== "موقعة"
                  ? "إرسال الجهة للاعتماد"
                  : formStep === 1
                    ? "التالي"
                    : "حفظ الشراكة"}
            </button>
          </footer>
        </section>
      )}
      <section className="oh-panel b2b-list" aria-labelledby="b2b-list-title">
        <header className="oh-panel-head">
          <span className="oh-icon">{section === "business" ? <BriefcaseBusiness size={18} /> : <Handshake size={18} />}</span>
          <div><h3 id="b2b-list-title">{section === "business" ? "قائمة الجهات" : "سجل الشراكات"}</h3><p>{section === "business" ? "اضغط على أي جهة لفتح ملفها ومتابعة مرحلتها." : "اسحب البطاقة بين مراحل دورة الحياة، أو افتحها لمتابعة الجهة."}</p></div>
        </header>
        <div className="cu-filters b2b-filters">
          <label className="b2b-search">
            <Search size={16} aria-hidden="true" />
            <input type="search" aria-label="بحث في الجهات" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم الجهة أو المسؤول أو التدريب..." />
          </label>
          <div className="cu-selects">
            {section === "business" && (
              <label className="cu-select"><span>النوع</span><select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}>
                <option value="الكل">كل الأنواع</option>
                <option value="partnership">فرص الشراكة</option>
                <option value="corporate_training">طلبات الجهات</option>
              </select></label>
            )}
            <label className="cu-select"><span>المسار</span><select value={pathFilter} onChange={(e) => setPathFilter(e.target.value)}>
              <option value="الكل">كل المسارات</option>
              <option>ABA</option>
              <option>OBM</option>
              <option value="BOTH">جميع المجالات</option>
            </select></label>
            <label className="cu-select"><span>المرحلة</span><select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
              <option value="الكل">كل المراحل</option>
              {options.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select></label>
          </div>
        </div>
        <p className="oc-result-line cu-result" aria-live="polite">
          {visibleRows.length} من {rows.length} جهة
          {(search || stageFilter !== "الكل" || pathFilter !== "الكل" || kindFilter !== "الكل") && (
            <button type="button" onClick={() => { setSearch(""); setStageFilter("الكل"); setPathFilter("الكل"); setKindFilter("الكل"); }}>مسح التصفية</button>
          )}
        </p>
        {loading ? (
          <LiveState loading error="" empty={false} />
        ) : visibleRows.length === 0 ? (
          <LiveState loading={false} error="" empty />
        ) : section === "partnerships" ? (
          <div className="b2b-kanban" aria-label="لوحة دورة حياة الشراكات">
            {lifecycleStages.map((stage, index) => {
              const allStageRows = visibleRows.filter(
                (row) =>
                  String(row.lifecycle_stage || "التفعيل والعمليات") === stage,
              );
              const priorityFilter=columnPriorities[stage]||"الكل";
              const statusFilter=columnStatuses[stage]||"الكل";
              const stageRows=allStageRows.filter(row=>(priorityFilter==="الكل"||String(row.priority||"غير محددة")===priorityFilter)&&(statusFilter==="الكل"||String(row.contact_status||"لم يتم التواصل")===statusFilter));
              return (
                <section
                  className={`b2b-kanban-column stage-${index + 1}`}
                  key={stage}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const row = rows.find((x) => String(x.id) === dragging);
                    if (row && String(row.lifecycle_stage) !== stage)
                      moveLifecycle(row, stage);
                    setDragging("");
                  }}
                >
                  <header>
                    <span>0{index + 1}</span>
                    <div>
                      <b>{stage}</b>
                      <small>{stageRows.length}{priorityFilter!=="الكل"||statusFilter!=="الكل"?` من ${allStageRows.length}`:""} شراكة</small>
                    </div>
                    <label className="kanban-priority-filter">
                      <span>الأولوية</span>
                      <select value={priorityFilter} onChange={(event)=>setColumnPriorities(current=>({...current,[stage]:event.target.value}))}>
                        <option>الكل</option><option>عالية</option><option>متوسطة</option><option>منخفضة</option><option>غير محددة</option>
                      </select>
                    </label>
                    <label className="kanban-priority-filter status-filter">
                      <span>الحالة</span>
                      <select value={statusFilter} onChange={(event)=>setColumnStatuses(current=>({...current,[stage]:event.target.value}))}>
                        <option>الكل</option>{B2B_CONTACT_STATUSES.map(status=><option key={status}>{status}</option>)}
                      </select>
                    </label>
                  </header>
                  <div>
                    {stageRows.length === 0 ? (
                      <p className="b2b-kanban-empty">
                        اسحب بطاقة مكتملة المتطلبات إلى هنا
                      </p>
                    ) : (
                      stageRows.map((row) => {
                        return (
                          <article
                            draggable={canConvert}
                            onDragStart={(e) => {
                              setDragging(String(row.id));
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => setDragging("")}
                            onClick={() => openRow(row)}
                            key={String(row.id)}
                            className={
                              dragging === String(row.id) ? "dragging" : ""
                            }
                          >
                            <div className="kanban-card-top">
                              <i>
                                {row.logo_data ? <img src={String(row.logo_data)} alt="" /> : String(row.account_name || "ج").slice(0, 2)}
                              </i>
                              <div>
                                <b>{row.account_name}</b>
                                <small>
                                  {row.partnership_type || "نوع الشراكة غير محدد"}
                                </small>
                              </div>
                              <button
                                aria-label={`فتح ملف ${row.account_name}`}
                              >
                                <Eye size={15} />
                              </button>
                            </div>
                            <div className="kanban-card-meta organization-summary">
                              <span>
                                المدينة <b>{row.city || "غير محددة"}</b>
                              </span>
                              <span>
                                ممثل الجهة <b>{row.contact_name || "غير محدد"}</b>
                              </span>
                              <span>
                                منسق الشراكة <b>{row.owner_name || "غير مسند"}</b>
                              </span>
                            </div>
                            <div className={`b2b-contact-signal ${b2bContactTone(row.contact_status)}`}><i/><span>حالة الجهة</span><b>{row.contact_status || "لم يتم التواصل"}</b></div>
                            {String(row.lifecycle_stage)==="التفاوض والاتفاقية" && <div className="kanban-agreement-progress">{agreementMilestones.map(([key,,label])=><span key={key} className={row[key]?"done":""} title={label}/>)}</div>}
                            {["تم تحديد اجتماع", "تم تحديد موعد اجتماع"].includes(String(row.contact_status)) && row.meeting_scheduled_at && (
                              <small className="b2b-card-meeting-date">موعد الاجتماع · {new Date(String(row.meeting_scheduled_at)).toLocaleString("ar-SA-u-nu-latn", { dateStyle: "medium", timeStyle: "short" })}</small>
                            )}
                            <div className="b2b-card-dates">
                              <span>تاريخ أول تواصل <b>{row.first_contact_at?new Date(String(row.first_contact_at)).toLocaleDateString("ar-SA-u-nu-latn"):"لم يبدأ"}</b></span>
                              <span>مدة الحالة <b>{row.first_contact_at?`منذ ${daysSince(row.first_contact_at)} يوم`:"بانتظار التواصل"}</b></span>
                            </div>
                            <div className="kanban-card-order" onClick={(event)=>event.stopPropagation()}>
                              <span>ترتيب البطاقة</span>
                              <button disabled={stageRows[0]?.id===row.id} onClick={()=>reorderCard(row,"up",priorityFilter,statusFilter)} aria-label={`رفع ${row.account_name}`}>↑</button>
                              <button disabled={stageRows[stageRows.length-1]?.id===row.id} onClick={()=>reorderCard(row,"down",priorityFilter,statusFilter)} aria-label={`خفض ${row.account_name}`}>↓</button>
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          visibleRows.map((row) => {
            return (
              <article
                className="b2b-row"
                key={String(row.id)}
                onClick={() => openRow(row)}
              >
                <div className="b2b-identity">
                  <i>{row.logo_data ? <img src={String(row.logo_data)} alt="" /> : String(row.account_name || "ج").slice(0, 2)}</i>
                  <div>
                    <b>{row.account_name}</b>
                    <span>
                      {section === "partnerships"
                        ? row.partnership_type || "نوع الشراكة غير محدد"
                        : row.opportunity_kind === "corporate_training"
                        ? `طلب تدريب مؤسسي${row.trainee_count ? ` · ${row.trainee_count} متدرب` : ""}`
                        : `فرصة شراكة · ${row.account_type}`}
                    </span>
                    {row.requested_program && (
                      <small>{row.requested_program}</small>
                    )}
                    <em className={`b2b-contact-state ${b2bContactTone(row.contact_status)}`}>{row.contact_status || "لم يتم التواصل"}</em>
                  </div>
                </div>
                <div>
                  <span>الشخص المسؤول</span>
                  <b>{row.contact_name || "غير محدد"}</b>
                  <small>{row.contact_title || row.contact_phone || "—"}</small>
                </div>
                {section === "business" ? (
                  <>
                    <div>
                      <span>المسار</span>
                      <b>{b2bPathLabel(row.path)}</b>
                    </div>
                    <div>
                      <span>
                        {row.approval_status === "pending"
                          ? "حالة الاعتماد"
                          : "المرحلة"}
                      </span>
                      {row.approval_status === "pending" ? (
                        <em className="b2b-status orange">بانتظار الاعتماد</em>
                      ) : canManage ? (
                        <select
                          className="b2b-inline-stage"
                          value={String(row.stage)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            void save({
                              action: "update_stage",
                              opportunityId: row.id,
                              stage: e.target.value,
                            });
                          }}
                        >
                          {(row.opportunity_kind === "corporate_training"
                            ? trainingStages
                            : partnershipStages
                          ).map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      ) : (
                        <em
                          className={`b2b-status ${b2bStageColors[String(row.stage)] || "gray"}`}
                        >
                          {row.stage}
                        </em>
                      )}
                    </div>
                    <div>
                      {row.approval_status === "pending" && canReview ? (
                        <div className="b2b-review-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void save({
                                action: "review_business",
                                opportunityId: row.id,
                                decision: "approved",
                              });
                            }}
                          >
                            اعتماد
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void save({
                                action: "review_business",
                                opportunityId: row.id,
                                decision: "rejected",
                              });
                            }}
                          >
                            رفض
                          </button>
                        </div>
                      ) : (
                        <>
                          <span>
                            {row.opportunity_kind === "corporate_training"
                              ? "موعد التنفيذ"
                              : "المتابعة القادمة"}
                          </span>
                          <b>
                            {row.opportunity_kind === "corporate_training"
                              ? row.delivery_date || "غير محدد"
                              : row.next_follow_up || "غير محددة"}
                          </b>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span>المدينة</span>
                      <b>{row.city || "غير محددة"}</b>
                    </div>
                    <div>
                      <span>حالة الجهة</span>
                      <div className={`b2b-contact-signal ${b2bContactTone(row.contact_status)}`}><i/><b>{row.contact_status || "لم يتم التواصل"}</b></div>
                      {["تم تحديد اجتماع", "تم تحديد موعد اجتماع"].includes(String(row.contact_status)) && row.meeting_scheduled_at && <small className="b2b-card-meeting-date">{new Date(String(row.meeting_scheduled_at)).toLocaleString("ar-SA-u-nu-latn", { dateStyle: "medium", timeStyle: "short" })}</small>}
                    </div>
                    <div>
                      <span>منسق الشراكة</span>
                      <b>{row.owner_name || "غير مسند"}</b>
                    </div>
                  </>
                )}
                <button className="b2b-details-button" type="button">
                  <Eye size={14} />
                  <span>التفاصيل</span>
                </button>
              </article>
            );
          })
        )}
      </section>
      {selected && (
        <>
          <button
            className="b2b-overlay"
            aria-label="إغلاق"
            onClick={() => setSelected(null)}
          />
          <aside className="b2b-drawer">
            <header>
              <button onClick={() => setSelected(null)}>×</button>
              <span>
                {section === "business" ? "ملف فرصة الأعمال" : "ملف الشراكة"}
              </span>
              <h2>{selected.account_name}</h2>
              <p>
                {section === "business" && selected.account_type
                  ? `${selected.account_type} · `
                  : ""}
                {selected.region || selected.city || "الموقع غير محدد"}
              </p>
              {section === "partnerships" && (
                <div className="drawer-lifecycle">
                  <div className="drawer-lifecycle-title">
                    <span>دورة حياة الشراكة</span>
                    <b>{selected.lifecycle_stage || "الاستكشاف والتقييم"}</b>
                  </div>
                  <div className={`drawer-lifecycle-track ${String(selected.lifecycle_stage)==="غير مناسب" ? "rejected" : ""}`}>
                    {(["غير مناسب","مؤجل"].includes(String(selected.lifecycle_stage))
                      ? ["الاستكشاف والتقييم",String(selected.lifecycle_stage)]
                      : lifecycleStages.filter((stage) => !["غير مناسب","مؤجل"].includes(stage))
                    ).map((stage, index, shownStages) => (
                      <span key={stage} className={shownStages.indexOf(String(selected.lifecycle_stage || "الاستكشاف والتقييم")) >= index || ["غير مناسب","مؤجل"].includes(stage) ? "done" : ""}>
                        <i>{index + 1}</i><b>{stage}</b>
                      </span>
                    ))}
                  </div>
                  {canConvert && !["الاستكشاف والتقييم","غير مناسب","مؤجل"].includes(String(selected.lifecycle_stage)) && (
                    <label className="drawer-lifecycle-select">
                      <span>تحديث المرحلة</span>
                      <select disabled={saving} value={String(selected.lifecycle_stage || "الاستكشاف والتقييم")} onChange={(e)=>void execute({action:"update_lifecycle",opportunityId:selected.opportunity_id,partnershipId:selected.partnership_id||"",stage:e.target.value})}>
                        {lifecycleStages.filter((stage)=>!["غير مناسب","مؤجل"].includes(stage)).map((stage)=><option key={stage}>{stage}</option>)}
                      </select>
                    </label>
                  )}
                </div>
              )}
            </header>
            <div className="b2b-drawer-body">
              {documents.length>0&&<div className="b2b-document-highlights">{documents.slice(0,4).map(doc=><a key={String(doc.id)} href={String(doc.url)} target="_blank" rel="noreferrer"><FileText size={15}/><span><b>{doc.title||doc.document_type}</b><small>{doc.document_type}</small></span><ExternalLink size={13}/></a>)}</div>}
              <section className="b2b-account-profile">
                <div className="b2b-progress-head">
                  <div>
                    <h3>البيانات الأولية</h3>
                    <p>بيانات الجهة وممثلوها ومنسق الشراكة</p>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      className="b2b-edit-account"
                      onClick={() => setEditingAccount(!editingAccount)}
                    >
                      {editingAccount ? "إلغاء" : "تعديل البيانات"}
                    </button>
                  )}
                </div>
                {editingAccount ? (
                  <div className="b2b-account-edit-grid">
                    <label>
                      <span>اسم الجهة *</span>
                      <input
                        value={accountDraft.name || ""}
                        onChange={(e) =>
                          setAccountDraft({
                            ...accountDraft,
                            name: e.target.value,
                          })
                        }
                      />
                    </label>
                    {(selected.partnership_id || selected.agreement_signed_at || selected.signed_at) && <label className="b2b-logo-field">
                      <span>شعار الجهة</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) =>
                          readLogo(e.target.files?.[0], "account")
                        }
                      />
                      {accountDraft.logoData && (
                        <>
                          <img src={accountDraft.logoData} alt="شعار الجهة" />
                          <button
                            type="button"
                            onClick={() =>
                              setAccountDraft({ ...accountDraft, logoData: "" })
                            }
                          >
                            إزالة الشعار
                          </button>
                        </>
                      )}
                    </label>}
                    {section === "business" && (
                      <label>
                        <span>نوع الجهة</span>
                        <input
                          value={accountDraft.type || ""}
                          onChange={(e) =>
                            setAccountDraft({
                              ...accountDraft,
                              type: e.target.value,
                            })
                          }
                        />
                      </label>
                    )}
                    <label>
                      <span>المنطقة</span>
                      <select
                        value={accountDraft.region || ""}
                        onChange={(e) =>
                          setAccountDraft({
                            ...accountDraft,
                            region: e.target.value,
                            city: "",
                          })
                        }
                      >
                        <option value="">غير محددة</option>
                        {Object.keys(B2B_LOCATIONS).map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>المدينة</span>
                      <select
                        value={accountDraft.city || ""}
                        onChange={(e) =>
                          setAccountDraft({
                            ...accountDraft,
                            city: e.target.value,
                          })
                        }
                      >
                        <option value="">غير محددة</option>
                        {(B2B_LOCATIONS[accountDraft.region] || []).map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>المصدر</span>
                      <select
                        value={accountDraft.source || ""}
                        onChange={(e) =>
                          setAccountDraft({
                            ...accountDraft,
                            source: e.target.value,
                          })
                        }
                      >
                        <option value="">غير محدد</option>
                        <option>إحالة من عميل سابق</option>
                        <option>قاعدة بيانات سلوكيرا</option>
                        <option>طلب وارد من الجهة</option>
                      </select>
                    </label>
                    <label>
                      <span>المجال</span>
                      <select
                        value={accountDraft.path || ""}
                        onChange={(e) =>
                          setAccountDraft({
                            ...accountDraft,
                            path: e.target.value,
                          })
                        }
                      >
                        <option value="">غير محدد</option>
                        <option>ABA</option>
                        <option>OBM</option>
                        <option value="BOTH">جميع المجالات</option>
                      </select>
                    </label>
                    <label>
                      <span>نوع الشراكة</span>
                      <select
                        value={accountDraft.partnershipType || ""}
                        onChange={(e) =>
                          setAccountDraft({
                            ...accountDraft,
                            partnershipType: e.target.value,
                          })
                        }
                      >
                        <option value="">غير محدد</option>
                        <option>مذكرة تفاهم</option>
                        <option>شراكة تدريب</option>
                        <option>اتفاقية تسويق</option>
                      </select>
                    </label>
                    <label>
                      <span>الأولوية</span>
                      <select
                        value={accountDraft.priority || ""}
                        onChange={(e) =>
                          setAccountDraft({
                            ...accountDraft,
                            priority: e.target.value,
                          })
                        }
                      >
                        <option value="">غير محددة</option>
                        <option>عالية</option>
                        <option>متوسطة</option>
                        <option>منخفضة</option>
                      </select>
                    </label>
                    <label>
                      <span>الإسناد</span>
                      <select
                        value={accountDraft.ownerEmail || ""}
                        onChange={(e) =>
                          setAccountDraft({
                            ...accountDraft,
                            ownerEmail: e.target.value,
                          })
                        }
                      >
                        <option value="">غير مسندة</option>
                        {staff.map((person) => (
                          <option
                            key={String(person.email)}
                            value={String(person.email)}
                          >
                            {String(person.display_name || "موظف")}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>اسم مسؤول الجهة</span>
                      <input
                        value={accountDraft.contactName || ""}
                        onChange={(e) =>
                          setAccountDraft({
                            ...accountDraft,
                            contactName: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>المسمى الوظيفي</span>
                      <input
                        value={accountDraft.jobTitle || ""}
                        onChange={(e) =>
                          setAccountDraft({
                            ...accountDraft,
                            jobTitle: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>رقم الجوال</span>
                      <input
                        dir="ltr"
                        value={accountDraft.phone || ""}
                        onChange={(e) =>
                          setAccountDraft({
                            ...accountDraft,
                            phone: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>البريد الإلكتروني</span>
                      <input
                        dir="ltr"
                        type="email"
                        value={accountDraft.email || ""}
                        onChange={(e) =>
                          setAccountDraft({
                            ...accountDraft,
                            email: e.target.value,
                          })
                        }
                      />
                    </label>
                    <button
                      className="pipeline-save"
                      disabled={saving || !accountDraft.name?.trim()}
                      onClick={() => void saveAccount()}
                    >
                      <Check size={16} /> حفظ بيانات الجهة
                    </button>
                  </div>
                ) : (
                  <dl>
                    <div>
                      <dt>اسم الجهة</dt>
                      <dd>{selected.account_name || "غير محدد"}</dd>
                    </div>
                    <div>
                      <dt>الموقع</dt>
                      <dd>
                        {[selected.region, selected.city]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>المصدر</dt>
                      <dd>{selected.source || "—"}</dd>
                    </div>
                    <div>
                      <dt>المجال</dt>
                      <dd>
                        {selected.path === "BOTH"
                          ? "جميع المجالات"
                          : selected.path || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>المسؤول</dt>
                      <dd>{selected.contact_name || "غير محدد"}</dd>
                    </div>
                    <div>
                      <dt>المسمى</dt>
                      <dd>{selected.contact_title || "—"}</dd>
                    </div>
                    <div>
                      <dt>الجوال</dt>
                      <dd dir="ltr">{selected.contact_phone || "—"}</dd>
                    </div>
                    <div>
                      <dt>البريد</dt>
                      <dd>{selected.contact_email || "—"}</dd>
                    </div>
                  </dl>
                )}
                <div className="b2b-inline-contacts">
                  <div className="b2b-contact-head-actions">{contacts.filter(contact=>Number(contact.is_primary)!==1).length>0&&<em>{contacts.filter(contact=>Number(contact.is_primary)!==1).length} إضافي</em>}{canManage&&<button type="button" onClick={()=>setShowContactForm(value=>!value)}><Plus size={13}/>{showContactForm?"إغلاق":"إضافة ممثل آخر"}</button>}</div>
                  {contacts.some(contact=>Number(contact.is_primary)!==1)&&<div className="b2b-contact-list">{contacts.filter(contact=>Number(contact.is_primary)!==1).map(contact=><article key={String(contact.id)}><div><b>{contact.name}</b><span>{contact.job_title||"دون مسمى"}</span><small dir="ltr">{[contact.phone,contact.email].filter(Boolean).join(" · ")||"دون بيانات تواصل"}</small></div><button disabled={saving} onClick={()=>void execute({action:"save_contact",accountId:selected.account_id,contactId:contact.id,name:contact.name,jobTitle:contact.job_title||"",phone:contact.phone||"",email:contact.email||"",isPrimary:true})}>تعيين كأساسي</button><button className="remove" disabled={saving} onClick={()=>void execute({action:"delete_contact",accountId:selected.account_id,contactId:contact.id})}>حذف</button></article>)}</div>}
                  {showContactForm&&<div className="b2b-contact-add"><input value={contactDraft.name} onChange={e=>setContactDraft({...contactDraft,name:e.target.value})} placeholder="اسم الممثل"/><input value={contactDraft.jobTitle} onChange={e=>setContactDraft({...contactDraft,jobTitle:e.target.value})} placeholder="المسمى الوظيفي"/><input dir="ltr" value={contactDraft.phone} onChange={e=>setContactDraft({...contactDraft,phone:e.target.value})} placeholder="رقم الجوال"/><input dir="ltr" type="email" value={contactDraft.email} onChange={e=>setContactDraft({...contactDraft,email:e.target.value})} placeholder="البريد الإلكتروني"/><label><input type="checkbox" checked={contactDraft.isPrimary} onChange={e=>setContactDraft({...contactDraft,isPrimary:e.target.checked})}/> ممثل أساسي</label><button disabled={saving||!contactDraft.name.trim()} onClick={async()=>{await execute({action:"save_contact",accountId:selected.account_id,...contactDraft});setContactDraft({name:"",jobTitle:"",phone:"",email:"",isPrimary:false});setShowContactForm(false)}}><Plus size={14}/> حفظ الممثل</button></div>}
                </div>
              </section>
              {section === "partnerships" && String(selected.lifecycle_stage || "الاستكشاف والتقييم") === "الاستكشاف والتقييم" && (
                <B2BIntakeDecisionPanel
                  selected={selected}
                  approvals={approvals}
                  canApprove={canReview || canConvert}
                  saving={saving}
                  execute={execute}
                />
              )}
              {section === "partnerships" && String(selected.lifecycle_stage || "الاستكشاف والتقييم") === "الاستكشاف والتقييم" && (
                <section className="partnership-pipeline-panel">
                  <div className="b2b-progress-head">
                    <div>
                      <h3>مسار الجهة</h3>
                      <p>من التواصل الأول حتى قرار الملاءمة وتوقيع الاتفاقية</p>
                    </div>
                    <em>
                      {pipelineDraft.fitDecision ||
                        pipelineDraft.contactStatus ||
                        "لم يتم التواصل"}
                    </em>
                  </div>
                  <div className="pipeline-status-row">
                    <label>
                      <span>حالة التواصل</span>
                      <select
                        disabled={!managerApproved}
                        value={pipelineDraft.contactStatus || ""}
                        onChange={(e) =>
                          setPipelineDraft({
                            ...pipelineDraft,
                            contactStatus: e.target.value,
                          })
                        }
                      >
                        {B2B_CONTACT_STATUSES.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </label>
                    {canManage && (
                      <button
                        className="pipeline-save secondary"
                        disabled={saving || !managerApproved}
                        onClick={() => void execute({
                          action: "update_partnership_contact",
                          opportunityId: selected.opportunity_id,
                          contactStatus: pipelineDraft.contactStatus,
                          meetingScheduledAt: pipelineDraft.meetingScheduledAt,
                          meetingMode: pipelineDraft.meetingMode,
                          nextFollowUp: pipelineDraft.nextFollowUp,
                        })}
                      >
                        <Check size={14} /> حفظ
                      </button>
                    )}
                  </div>
                  <div className="pipeline-status-grid">
                    {["تم تحديد اجتماع", "تم تحديد موعد اجتماع"].includes(pipelineDraft.contactStatus) && (
                      <>
                        <label>
                          <span>تاريخ ووقت الاجتماع</span>
                          <input
                            type="datetime-local"
                            value={pipelineDraft.meetingScheduledAt || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                meetingScheduledAt: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>طريقة الاجتماع</span>
                          <select
                            value={pipelineDraft.meetingMode || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                meetingMode: e.target.value,
                              })
                            }
                          >
                            <option value="">غير محددة</option>
                            <option>حضوري</option>
                            <option>عن بُعد</option>
                          </select>
                        </label>
                      </>
                    )}
                  </div>
                  {!managerApproved && <p className="pipeline-gate-note">اعتماد مدير الشراكات مطلوب قبل بدء التواصل.</p>}
                  {pipelineDraft.contactStatus === "تم الاجتماع" && (
                    <div className="meeting-minutes-card">
                      <header>
                        <div>
                          <b>محضر الاجتماع</b>
                          <span>سجل تنفيذي ثابت داخل ملف الجهة</span>
                        </div>
                        <ClipboardList size={20} />
                      </header>
                      <div className="meeting-minutes-grid">
                        <label>
                          <span>تاريخ ووقت الاجتماع الفعلي</span>
                          <input
                            type="datetime-local"
                            value={pipelineDraft.meetingCompletedAt || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                meetingCompletedAt: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>موضوع الاجتماع</span>
                          <input
                            value={pipelineDraft.meetingTopic || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                meetingTopic: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>الحضور من سلوكيرا</span>
                          <input
                            value={pipelineDraft.meetingAttendeesInternal || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                meetingAttendeesInternal: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>الحضور من الجهة</span>
                          <input
                            value={pipelineDraft.meetingAttendeesExternal || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                meetingAttendeesExternal: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="wide">
                          <span>ملخص الاجتماع</span>
                          <textarea
                            value={pipelineDraft.meetingSummary || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                meetingSummary: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>احتياج الجهة</span>
                          <textarea
                            value={pipelineDraft.meetingNeeds || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                meetingNeeds: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>الفرص المقترحة</span>
                          <textarea
                            value={pipelineDraft.meetingOpportunities || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                meetingOpportunities: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>القرارات المتفق عليها</span>
                          <textarea
                            value={pipelineDraft.meetingDecisions || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                meetingDecisions: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>الخطوة القادمة</span>
                          <textarea
                            value={pipelineDraft.meetingNextStep || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                meetingNextStep: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>تاريخ المتابعة</span>
                          <input
                            type="date"
                            value={pipelineDraft.nextFollowUp || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                nextFollowUp: e.target.value,
                              })
                            }
                          />
                        </label>
                      </div>
                      {canManage && (
                        <button
                          className="pipeline-save meeting-save"
                          disabled={saving}
                          onClick={() => void execute({
                              action: "add_partnership_meeting",
                              opportunityId: selected.opportunity_id,
                              meetingCompletedAt: pipelineDraft.meetingCompletedAt,
                              meetingMode: pipelineDraft.meetingMode,
                              meetingTopic: pipelineDraft.meetingTopic,
                              meetingAttendeesInternal: pipelineDraft.meetingAttendeesInternal,
                              meetingAttendeesExternal: pipelineDraft.meetingAttendeesExternal,
                              meetingSummary: pipelineDraft.meetingSummary,
                              meetingNeeds: pipelineDraft.meetingNeeds,
                              meetingOpportunities: pipelineDraft.meetingOpportunities,
                              meetingDecisions: pipelineDraft.meetingDecisions,
                              meetingNextStep: pipelineDraft.meetingNextStep,
                              nextFollowUp: pipelineDraft.nextFollowUp,
                            })}
                        >
                          <ClipboardList size={16} /> حفظ محضر الاجتماع
                        </button>
                      )}
                    </div>
                  )}
                  {meetingMinutes.length>0 && canFitDecision && String(selected.lifecycle_stage || "الاستكشاف والتقييم") === "الاستكشاف والتقييم" && (
                    <div className="fit-decision-panel">
                      <header>
                        <b>قرار الملاءمة</b>
                        <span>المرحلة المفصلية قبل بدء إجراءات الاتفاقية</span>
                      </header>
                      <div className="fit-choice">
                        {["اعتماد", "رفض", "تأجيل"].map((x) => (
                          <button
                            type="button"
                            key={x}
                            className={
                              pipelineDraft.fitDecision === x
                                ? `selected ${x === "اعتماد" ? "approve" : x === "رفض" ? "reject" : "defer"}`
                                : ""
                            }
                            onClick={() =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                fitDecision: x,
                              })
                            }
                          >
                            {x}
                          </button>
                        ))}
                      </div>
                      {pipelineDraft.fitDecision && (
                        <label>
                          <span>مبررات القرار *</span>
                          <textarea
                            value={pipelineDraft.fitReason || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                fitReason: e.target.value,
                              })
                            }
                            placeholder={`اكتب سبب ${pipelineDraft.fitDecision} الجهة...`}
                          />
                        </label>
                      )}
                      {pipelineDraft.fitDecision === "تأجيل" && (
                        <label>
                          <span>تاريخ إعادة المتابعة</span>
                          <input
                            type="date"
                            value={pipelineDraft.nextFollowUp || ""}
                            onChange={(e) =>
                              setPipelineDraft({
                                ...pipelineDraft,
                                nextFollowUp: e.target.value,
                              })
                            }
                          />
                        </label>
                      )}
                    </div>
                  )}
                  {pipelineDraft.fitDecision === "اعتماد" && String(selected.lifecycle_stage) === "التفاوض والاتفاقية" && (
                    <div className="agreement-milestones">
                      <header>
                        <b>تقدم الاتفاقية</b>
                        <span>اختر الخطوة وسجّل تاريخ إنجازها</span>
                      </header>
                      <div className="agreement-step-editor"><select value={agreementStep} onChange={e=>setAgreementStep(e.target.value)}>{agreementMilestones.map(([,key,label])=><option key={key} value={key}>{label}</option>)}</select><input type="date" value={pipelineDraft[agreementStep]||""} onChange={e=>setPipelineDraft({...pipelineDraft,[agreementStep]:e.target.value})}/></div>
                      <div className="agreement-date-summary">{agreementMilestones.map(([,key,label],index)=><article key={key} className={pipelineDraft[key]?"complete":""}><i>{pipelineDraft[key]?<Check size={13}/>:index+1}</i><span><b>{label}</b><small>{pipelineDraft[key]||"بانتظار التنفيذ"}</small></span></article>)}</div>
                    </div>
                  )}
                  {meetingMinutes.length > 0 && (
                    <details className="meeting-minutes-history">
                      <summary>
                        محاضر الاجتماعات السابقة <b>{meetingMinutes.length}</b>
                      </summary>
                      <div>
                        {meetingMinutes.map((meeting, index) => (
                          <details className="meeting-minute-item" key={String(meeting.id)}><summary><b>الاجتماع {meetingMinutes.length-index}</b><time>{String(meeting.meeting_at||meeting.created_at||"").replace("T"," ").slice(0,16)}</time><span>{meeting.topic||"عرض التفاصيل"}</span></summary><div>{meeting.summary&&<blockquote>{meeting.summary}</blockquote>}<dl><div><dt>حضور سلوكيرا</dt><dd>{meeting.attendees_internal||"—"}</dd></div><div><dt>حضور الجهة</dt><dd>{meeting.attendees_external||"—"}</dd></div><div><dt>القرارات</dt><dd>{meeting.decisions||"—"}</dd></div><div><dt>الخطوة القادمة</dt><dd>{meeting.next_step||"—"}</dd></div></dl><small>سجله {meeting.created_by_email}</small></div></details>
                        ))}
                      </div>
                    </details>
                  )}
                  {canFitDecision && meetingMinutes.length>0 && String(selected.lifecycle_stage || "الاستكشاف والتقييم") === "الاستكشاف والتقييم" && (
                    <button
                      className="pipeline-save"
                      disabled={saving || !pipelineDraft.fitDecision || !pipelineDraft.fitReason}
                      onClick={() =>
                        void execute({
                          action: "update_partnership_pipeline",
                          opportunityId: selected.opportunity_id,
                          ...pipelineDraft,
                        })
                      }
                    >
                      <Check size={16} /> حفظ قرار الملاءمة
                    </button>
                  )}
                  {canManage && String(selected.lifecycle_stage)==="التفاوض والاتفاقية" && (
                    <button className="pipeline-save" disabled={saving} onClick={()=>void execute({action:"update_partnership_pipeline",opportunityId:selected.opportunity_id,...pipelineDraft})}><Check size={16}/> حفظ تقدم الاتفاقية</button>
                  )}
                </section>
              )}
              {section === "partnerships" && String(selected.lifecycle_stage || "الاستكشاف والتقييم") !== "الاستكشاف والتقييم" && (
                <B2BApprovalsPanel
                  selected={selected}
                  approvals={approvals}
                  canApprove={canReview || canConvert}
                  saving={saving}
                  execute={execute}
                />
              )}
              {section === "partnerships" && ["التفعيل والعمليات","قياس الأثر"].includes(String(selected.lifecycle_stage)) && (
                <section className="partnership-execution-panel">
                  <div className="b2b-progress-head"><div><h3>التفعيل والتنفيذ</h3><p>تفعيل قنوات الشراكة ثم تجهيز العرض المالي ومتابعة التنفيذ</p></div><em>{selected.lifecycle_stage}</em></div>
                  <div className="execution-path">
                    <h4>تفعيل الشراكة</h4>
                    {[["whatsappGroupCreatedAt","إنشاء مجموعة التواصل عبر واتساب"],["partnershipShieldSentAt","إرسال درع الشراكة"],["socialAnnouncementAt","الإعلان عن الشراكة عبر منصات التواصل"]].map(([key,label],index)=><label key={key} className={executionDraft[key]?"complete":""}><i>{executionDraft[key]?<Check size={14}/>:index+1}</i><span>{label}</span><input type="date" value={executionDraft[key]||""} onChange={e=>setExecutionDraft({...executionDraft,[key]:e.target.value})}/></label>)}
                  </div>
                  <div className="execution-offer-grid">
                    <h4>تفاصيل العرض والتنفيذ</h4>
                    <label><span>المبلغ الإجمالي المقدم</span><input type="number" min="0" value={executionDraft.totalOfferAmount||""} onChange={e=>setExecutionDraft({...executionDraft,totalOfferAmount:e.target.value})}/></label>
                    <label><span>عدد المتدربين</span><input type="number" min="0" value={executionDraft.executionTraineeCount||""} onChange={e=>setExecutionDraft({...executionDraft,executionTraineeCount:e.target.value})}/></label>
                    <label><span>نوع البرنامج</span><select value={executionDraft.executionProgram||""} onChange={e=>setExecutionDraft({...executionDraft,executionProgram:e.target.value})}><option value="">غير محدد</option><option>إدارة السلوك التنظيمي</option><option>تحليل السلوك التطبيقي</option><option>أخرى</option></select></label>
                    {executionDraft.executionProgram==="أخرى"&&<label><span>اسم البرنامج</span><input value={executionDraft.executionProgramOther||""} onChange={e=>setExecutionDraft({...executionDraft,executionProgramOther:e.target.value})}/></label>}
                  </div>
                  <div className="execution-path commercial">
                    <h4>مسار العرض المالي</h4>
                    {[["priceOfferPreparedAt","إعداد عرض السعر"],["financialOfferSentAt","إرسال العرض المالي"]].map(([key,label],index)=><label key={key} className={executionDraft[key]?"complete":""}><i>{executionDraft[key]?<Check size={14}/>:index+1}</i><span>{label}</span><input type="date" value={executionDraft[key]||""} onChange={e=>setExecutionDraft({...executionDraft,[key]:e.target.value})}/></label>)}
                  </div>
                  {canManage&&<button className="pipeline-save" disabled={saving} onClick={()=>void execute({action:"update_partnership_execution",opportunityId:selected.opportunity_id,...executionDraft})}><Check size={16}/> حفظ التفعيل والتنفيذ</button>}
                </section>
              )}
              {section === "partnerships" && selected.partnership_id && (
                <B2BFinancePanel
                  selected={selected}
                  canManage={canConvert}
                  saving={saving}
                  execute={execute}
                />
              )}
              {section === "business" &&
                selected.opportunity_kind === "corporate_training" && (
                  <section>
                    <h3>تفاصيل طلب الجهة</h3>
                    <dl>
                      <div>
                        <dt>التدريب المطلوب</dt>
                        <dd>{selected.requested_program || "غير محدد"}</dd>
                      </div>
                      <div>
                        <dt>عدد المتدربين</dt>
                        <dd>{selected.trainee_count || "—"}</dd>
                      </div>
                      <div>
                        <dt>موعد التنفيذ</dt>
                        <dd>{selected.delivery_date || "غير محدد"}</dd>
                      </div>
                      <div>
                        <dt>القيمة المتوقعة</dt>
                        <dd>
                          {Number(selected.expected_value || 0).toLocaleString(
                            "en-US",
                          )}{" "}
                          ر.س
                        </dd>
                      </div>
                    </dl>
                  </section>
                )}
              {section === "business" &&
                canManage &&
                selected.approval_status === "approved" && (
                  <section>
                    <h3>تحديث مسار الفرصة</h3>
                    <label>
                      <span>المرحلة الحالية</span>
                      <select
                        value={String(selected.stage)}
                        onChange={(e) =>
                          void save({
                            action: "update_stage",
                            opportunityId: selected.id,
                            stage: e.target.value,
                          })
                        }
                      >
                        {(selected.opportunity_kind === "corporate_training"
                          ? trainingStages
                          : partnershipStages
                        ).map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                  </section>
                )}
              {section === "partnerships" && String(selected.lifecycle_stage)==="التفاوض والاتفاقية" && <section className="b2b-progress">
                <div className="b2b-progress-head">
                  <div>
                    <h3>سجل تقدم الأعمال</h3>
                    <p>جميع الخطوات التي تمت مع الجهة بالترتيب الزمني</p>
                  </div>
                  <em>{activities.length} تحديث</em>
                </div>
                {canManage && (
                  <div className="b2b-activity-form">
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                    >
                      {agreementMilestones.map(([,key,label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <input type="date" value={activityDate} onChange={(e)=>setActivityDate(e.target.value)}/>
                    <input
                      placeholder="أضف تفاصيل مختصرة..."
                      value={activityDetails}
                      onChange={(e) => setActivityDetails(e.target.value)}
                    />
                    <button
                      disabled={saving}
                      onClick={() => void addActivity()}
                    >
                      <Plus size={14} /> حفظ الخطوة
                    </button>
                  </div>
                )}
                <div className="b2b-timeline">
                  {activities.length === 0 ? (
                    <p className="b2b-no-activity">لا توجد خطوات مسجلة بعد.</p>
                  ) : (
                    (showAllActivities ? activities : activities.slice(0,3)).map((item, index) => (
                      <article key={String(item.id)}>
                        <i>{index === 0 ? "✓" : ""}</i>
                        <div>
                          <b>{item.activity_type}</b>
                          {item.details && <p>{item.details}</p>}
                          <span>
                            {String(item.actor_email || "")} ·{" "}
                            {new Intl.DateTimeFormat("ar-SA-u-nu-latn", {
                              dateStyle: "medium",
                              timeStyle: "short",
                              timeZone: "Asia/Riyadh",
                            }).format(new Date(String(item.created_at)))}
                          </span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
                {activities.length > 3 && (
                  <button
                    type="button"
                    className="b2b-show-more"
                    onClick={() => setShowAllActivities(value => !value)}
                  >
                    {showAllActivities ? "عرض أقل" : `عرض المزيد (${activities.length - 3})`}
                  </button>
                )}
              </section>}
              {section === "business" &&
                canConvert &&
                selected.opportunity_kind !== "corporate_training" && (
                  <details className="b2b-convert">
                    <summary>اعتماد التوقيع وتحويلها إلى شراكة</summary>
                    <div>
                      {[
                        ["agreementNumber", "رقم الاتفاقية"],
                        ["signedAt", "تاريخ التوقيع *"],
                        ["startDate", "بداية الاتفاقية *"],
                        ["endDate", "نهاية الاتفاقية *"],
                        ["value", "قيمة الاتفاقية"],
                        ["paymentTerms", "شروط الدفع"],
                        ["scope", "نطاق الاتفاقية"],
                        ["services", "الخدمات المتفق عليها"],
                        ["renewalTerms", "شروط التجديد"],
                        ["documentUrl", "رابط مستند الاتفاقية"],
                      ].map(([key, label]) => (
                        <label key={key}>
                          <span>{label}</span>
                          <input
                            type={
                              key.endsWith("At") || key.endsWith("Date")
                                ? "date"
                                : key === "value"
                                  ? "number"
                                  : "text"
                            }
                            value={agreement[key] || ""}
                            onChange={(e) =>
                              setAgreement({
                                ...agreement,
                                [key]: e.target.value,
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <button
                      disabled={saving}
                      onClick={() =>
                        void save({
                          action: "convert_to_partnership",
                          opportunityId: selected.id,
                          ...agreement,
                        })
                      }
                    >
                      تأكيد التوقيع وإنشاء الشراكة
                    </button>
                  </details>
                )}
              {section === "partnerships" &&
                canConvert &&
                selected.partnership_id && (
                  <section>
                    <h3>متابعة الشراكة</h3>
                    <label>
                      <span>الحالة</span>
                      <select
                        value={String(selected.status)}
                        onChange={(e) =>
                          void execute({
                            action: "update_partnership",
                            partnershipId: selected.partnership_id,
                            status: e.target.value,
                          })
                        }
                      >
                        {options.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                  </section>
                )}
              <B2BDocumentsPanel selected={selected} documents={documents} canManage={canManage} saving={saving} execute={execute}/>
              {canDelete && (
                <section className="b2b-danger-zone">
                  <div>
                    <h3>حذف الجهة</h3>
                    <p>
                      يحذف بيانات الجهة وجميع الفرص والشراكات والتحديثات التابعة
                      لها من B2B.
                    </p>
                  </div>
                  <button disabled={saving} onClick={() => void removeEntity()}>
                    حذف الجهة نهائيًا
                  </button>
                </section>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

const B2B_DOCUMENT_TYPES=["الملف التعريفي","اتفاقية السرية NDA","مسودة العقد","النموذج المالي","العقد النهائي","خطة العمل","تقرير أداء ربع سنوي","محضر اجتماع","تقرير التقييم النهائي","ملحق التجديد"];
function B2BDocumentsPanel({selected,documents,canManage,saving,execute}:{selected:B2BRow;documents:B2BRow[];canManage:boolean;saving:boolean;execute:(body:Record<string,unknown>)=>Promise<void>}){
  const [documentType,setDocumentType]=useState(B2B_DOCUMENT_TYPES[0]),[title,setTitle]=useState(""),[url,setUrl]=useState("");
  const add=async()=>{if(!url.trim())return;await execute({action:"save_document",accountId:selected.account_id,opportunityId:selected.opportunity_id||selected.id,partnershipId:selected.partnership_id||"",documentType,title:title||documentType,url});setTitle("");setUrl("")};
  return <section className="b2b-documents"><div className="b2b-progress-head"><div><h3>مركز المستندات</h3><p>ملف موحد للعقود والحوكمة ومتطلبات كل مرحلة</p></div><em>{documents.length} مستند</em></div>{canManage&&<div className="b2b-document-form"><select value={documentType} onChange={e=>setDocumentType(e.target.value)}>{B2B_DOCUMENT_TYPES.map(x=><option key={x}>{x}</option>)}</select><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="اسم مختصر للمستند"/><input dir="ltr" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https:// رابط الملف"/><button disabled={saving||!/^https?:\/\//i.test(url)} onClick={()=>void add()}><Plus size={14}/> إرفاق</button></div>}<div className="b2b-document-list">{documents.length===0?<p>لا توجد مستندات مرفقة بعد.</p>:documents.map(doc=><a key={String(doc.id)} href={String(doc.url)} target="_blank" rel="noreferrer"><FileText size={16}/><span><b>{doc.title}</b><small>{doc.document_type} · {doc.uploaded_by_email}</small></span><ExternalLink size={14}/></a>)}</div></section>
}
function B2BApprovalsPanel({selected,approvals,canApprove,saving,execute}:{selected:B2BRow;approvals:B2BRow[];canApprove:boolean;saving:boolean;execute:(body:Record<string,unknown>)=>Promise<void>}){
  const stage=String(selected.lifecycle_stage||"الاستكشاف والتقييم"),types=stage==="الاستكشاف والتقييم"?["مدير الشراكات"]:stage==="التفاوض والاتفاقية"?["الإدارة القانونية"]:["مدير الشراكات","الإدارة القانونية"];
  const latest=(type:string)=>approvals.find(x=>x.approval_type===type);
  return <section className="b2b-approvals compact"><div className="b2b-progress-head"><div><h3>اعتماد المرحلة</h3><p>{stage==="الاستكشاف والتقييم"?"اعتماد مدير الشراكات قبل بدء التفاوض":"اعتماد الإدارة القانونية قبل بدء التفعيل"}</p></div></div><div>{types.map(type=>{const row=latest(type),status=String(row?.status||"pending");return <article key={type}><i className={status}>{status==="approved"?<Check size={15}/>:status==="rejected"?<X size={15}/>:<Clock3 size={15}/>}</i><span><b>{type}</b><small>{status==="approved"?"معتمد":status==="rejected"?"أُعيد للمراجعة":"بانتظار الاعتماد"}</small></span>{canApprove&&<div><button disabled={saving} onClick={()=>void execute({action:"record_approval",accountId:selected.account_id,opportunityId:selected.opportunity_id,partnershipId:selected.partnership_id||"",approvalType:type,decision:"approved"})}>اعتماد</button><button disabled={saving} onClick={()=>void execute({action:"record_approval",accountId:selected.account_id,opportunityId:selected.opportunity_id,partnershipId:selected.partnership_id||"",approvalType:type,decision:"rejected"})}>إرجاع</button></div>}</article>})}</div></section>
}
function B2BIntakeDecisionPanel({selected,approvals,canApprove,saving,execute}:{selected:B2BRow;approvals:B2BRow[];canApprove:boolean;saving:boolean;execute:(body:Record<string,unknown>)=>Promise<void>}){
  const row=approvals.find(x=>x.approval_type==="مدير الشراكات"),status=String(row?.status||"pending");
  const label=status==="approved"?"مناسب":status==="rejected"?"غير مناسب":"بانتظار التصنيف";
  return <section className="b2b-intake-decision"><div><span>تصنيف الجهة</span><h3>{label}</h3><p>المناسبة تستمر في الاستكشاف والتقييم، وغير المناسبة تنتقل إلى سجلها المخصص.</p></div>{canApprove&&<div><button className="accept" disabled={saving} onClick={()=>void execute({action:"record_approval",accountId:selected.account_id,opportunityId:selected.opportunity_id,approvalType:"مدير الشراكات",decision:"approved"})}><Check size={14}/> مناسب</button><button className="idea" disabled={saving} onClick={()=>void execute({action:"record_approval",accountId:selected.account_id,opportunityId:selected.opportunity_id,approvalType:"مدير الشراكات",decision:"rejected"})}><X size={14}/> غير مناسب</button></div>}</section>
}
function B2BFinancePanel({selected,canManage,saving,execute}:{selected:B2BRow;canManage:boolean;saving:boolean;execute:(body:Record<string,unknown>)=>Promise<void>}){
  const [form,setForm]=useState({couponCode:String(selected.coupon_code||""),discountPercent:String(selected.discount_percent||0),commissionPercent:String(selected.commission_percent||0),grossSales:String(selected.gross_sales||0),coordinationCost:String(selected.coordination_cost||0),commissionDue:String(selected.commission_due||0),commissionPaid:String(selected.commission_paid||0),payoutStatus:String(selected.payout_status||"غير مستحق")});
  const gross=Number(form.grossSales||0),cost=Number(form.coordinationCost||0),roi=cost?((gross-cost)/cost)*100:null;
  return <section className="b2b-partner-finance"><div className="b2b-progress-head"><div><h3>المؤشرات المالية للشراكة</h3><p>مستقلة تمامًا عن مبيعات وتحصيل الأفراد</p></div><em>{roi===null?"ROI غير متاح":`ROI ${roi.toFixed(1)}%`}</em></div><div className="finance-mini-grid">{[["grossSales","إجمالي المبيعات"],["coordinationCost","تكلفة التنسيق"],["commissionDue","العمولة المستحقة"],["commissionPaid","العمولة المدفوعة"],["discountPercent","نسبة الخصم %"],["commissionPercent","نسبة العمولة %"]].map(([key,label])=><label key={key}><span>{label}</span><input disabled={!canManage} type="number" min="0" value={form[key as keyof typeof form]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}<label><span>رمز الكوبون</span><input disabled={!canManage} value={form.couponCode} onChange={e=>setForm({...form,couponCode:e.target.value})}/></label><label><span>حالة الصرف</span><select disabled={!canManage} value={form.payoutStatus} onChange={e=>setForm({...form,payoutStatus:e.target.value})}>{["غير مستحق","مستحق","صرف جزئي","تم الصرف"].map(x=><option key={x}>{x}</option>)}</select></label></div>{canManage&&<button className="finance-save" disabled={saving} onClick={()=>void execute({action:"update_partnership_finance",partnershipId:selected.partnership_id||selected.id,...form})}>حفظ المؤشرات المالية</button>}</section>
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
            <tr key={`${p.id}-${p.orderId || "customer"}`} onClick={() => open(p)}>
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

function programFamily(programName: string) {
  const program = String(programName || "").trim(), value = program.toLowerCase();
  if (!program || program === "—" || value.includes("لا يوجد طلب")) return "غير مصنف";
  if (value.includes("تقييم الكفاءة") || value.includes("competency")) return "تقييم الكفاءة";
  if (value.includes("إدارة السلوك التنظيمي") || value.includes("ادارة السلوك التنظيمي") || value.includes("obm")) return "إدارة السلوك التنظيمي";
  if (value.includes("تحليل السلوك التطبيقي") || value.includes("aba")) return "تحليل السلوك التطبيقي";
  return "التعليم المستمر";
}

const continuingEducationClassifications = ["الاقتصاد السلوكي", "انتقائية الطعام"] as const;

function liveProgramClassification(row: LiveEnrollment) {
  const family = programFamily(row.program_name);
  const track = String(row.program_track || "").trim();
  if (family !== "التعليم المستمر")
    return track && !["—", "غير محدد"].includes(track) ? track : "";
  const source = `${row.program_name || ""} ${track}`;
  return continuingEducationClassifications.find((name) => source.includes(name)) || "";
}

function liveProgramOperationalNote(row: LiveEnrollment) {
  if (programFamily(row.program_name) !== "التعليم المستمر") return "";
  const generic = new Set(["", "—", "غير محدد", "التعليم المستمر"]);
  const track = String(row.program_track || "").trim();
  const program = String(row.program_name || "").trim();
  if (!generic.has(track) && !continuingEducationClassifications.some((name) => track.includes(name))) return track;
  if (!generic.has(program) && !continuingEducationClassifications.some((name) => program.includes(name))) return program;
  return "";
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
  return programFamily(program);
}

function customerProgramLabel(customer: (typeof initialPeople)[number]) {
  const category = customerProgramCategory(customer);
  const track = String(customer.track || "").trim();
  const hasTrack = track && track !== "—" && track !== "غير محدد";
  if (category === "تحليل السلوك التطبيقي") return hasTrack ? track : "غير محدد";
  if (category === "إدارة السلوك التنظيمي") return hasTrack ? track : "غير محدد";
  if (category === "التعليم المستمر") {
    const value=`${customer.program || ""} ${track}`;
    if (value.includes("الاقتصاد السلوكي")) return "الاقتصاد السلوكي";
    if (value.includes("انتقائية الطعام")) return "انتقائية الطعام";
    return "—";
  }
  if (category === "التجربة") return customer.program !== "—" ? customer.program : "تجربة";
  if (category === "غير مصنف") return "غير مصنف";
  return customer.program || category;
}

function customerOperationalNote(customer: (typeof initialPeople)[number]) {
  if (customerProgramCategory(customer) !== "التعليم المستمر") return "";
  const generic=new Set(["","—","غير محدد","التعليم المستمر"]),track=String(customer.track||"").trim(),program=String(customer.program||"").trim();
  if (!generic.has(track) && !["الاقتصاد السلوكي","انتقائية الطعام"].some(name=>track.includes(name))) return track;
  if (!generic.has(program) && !["الاقتصاد السلوكي","انتقائية الطعام"].some(name=>program.includes(name))) return program;
  return "";
}

function customerStateTone(state: string) {
  if (["مكتمل", "نشط", "مدفوع"].includes(state)) return "success";
  if (state === "منسحب") return "danger";
  if (state === "جديد" || state.includes("انتظار")) return "warning";
  if (state === "غير مهتم") return "neutral";
  return "brand";
}

function CompletedCustomerTable({
  list,
  open,
}: {
  list: typeof initialPeople;
  open: (p: (typeof initialPeople)[number]) => void;
}) {
  const additionDate = (customer: (typeof initialPeople)[number]) => {
    const value = (customer as typeof customer & { createdAt?: string }).createdAt;
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return {
      // en-GB gives a plain dd/mm/yyyy; the Arabic locale adds direction marks that scramble it inside dir="ltr".
      date: date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Riyadh",
      }),
      time: date.toLocaleTimeString("ar-SA-u-nu-latn", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Riyadh",
      }),
    };
  };
  const money = (value: number) => Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  return (
    <div className="table-wrap completed-customer-table cu-table">
      <table>
        <thead>
          <tr>
            <th className="customer-row-number">#</th>
            <th>اسم العميل</th>
            <th>البرنامج</th>
            <th>التصنيف</th>
            <th>الحالة</th>
            <th>المدفوع</th>
            <th>ملاحظة عملياتية</th>
            <th>تاريخ الإضافة</th>
          </tr>
        </thead>
        <tbody>
          {list.map((customer,index) => {
            const added = additionDate(customer),classification=customerProgramLabel(customer),operationalNote=customerOperationalNote(customer),orderId=(customer as typeof customer & { orderId?: string }).orderId,paidRatio=customer.total?Math.min(100,customer.paid/customer.total*100):0;
            return <tr key={customer.id} onClick={() => open(customer)}>
              <td className="customer-row-number"><b>{index+1}</b></td>
              <td className="customer-name-cell">
                <i aria-hidden="true">{customer.name.trim().slice(0,2)}</i><span><button type="button" onClick={(event) => { event.stopPropagation(); open(customer); }}>{customer.name}</button><small>{orderId && orderId !== "—" ? orderId : customer.id}</small></span>
              </td>
              <td data-label="البرنامج">
                <b>{customerProgramCategory(customer)}</b>
                {customer.cohort !== "—" && <small>{customer.cohort}</small>}
              </td>
              <td data-label="التصنيف">
                <b className={classification==="—"?"empty":""}>{classification}</b>
              </td>
              <td data-label="الحالة"><em className={`cu-status ${customerStateTone(customer.state)}`}>{customer.state || "—"}</em></td>
              <td data-label="المدفوع" className="cu-paid">{customer.total ? <><b>{money(customer.paid)} <small>من {money(customer.total)} ر.س</small></b><span className="cu-bar" aria-hidden="true"><i style={{ width: `${paidRatio}%` }} /></span></> : <small>لا يوجد طلب مالي</small>}</td>
              <td className="operational-note-cell" data-label="ملاحظة" data-empty={operationalNote ? undefined : "true"}>{operationalNote?<span title={operationalNote}>{operationalNote}</span>:<small>لا توجد ملاحظة</small>}</td>
              <td className="customer-added-at" data-label="أضيف في">
                {added ? <><b dir="ltr">{added.date}</b><small dir="ltr">{added.time}</small></> : <span>—</span>}
              </td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}
