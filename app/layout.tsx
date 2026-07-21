import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"سلوكيرا | مركز العمليات",description:"نظام موحد لإدارة العملاء والتسجيلات والعمليات الأكاديمية والتحصيل المالي."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><body>{children}</body></html>}
