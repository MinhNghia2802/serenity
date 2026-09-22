import Link from "next/link";
import { ArrowRight, CalendarDays, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return <main className="page container"><div className="stack" style={{ gap: 28 }}>
    <div className="row space-between"><div className="stack-sm"><p className="eyebrow">Tổng quan</p><h1 style={{ fontSize: "3.4rem" }}>Chào bạn.</h1><p className="muted">Hôm nay bạn đang cảm thấy thế nào?</p></div><Link className="button" href="/check-in">Bắt đầu check-in <ArrowRight size={17} /></Link></div>
    <div className="dashboard-grid">
      <section className="soft-card stack"><div className="row space-between"><h3>Nhịp cảm xúc gần đây</h3><TrendingUp size={20} /></div><div className="bars" aria-label="Biểu đồ cảm xúc minh họa">{[42,70,52,84,64,76,58].map((height,index) => <div className="bar" key={index} style={{ height: `${height}%` }} title={`Ngày ${index+1}`} />)}</div><p className="small muted">Biểu đồ sẽ dùng dữ liệu check-in của bạn sau khi kết nối Supabase.</p></section>
      <section className="card stack"><CalendarDays size={24} /><div><p className="metric">0</p><p className="muted">phiên check-in đã lưu trên cloud</p></div><Link href="/history">Xem lịch sử →</Link></section>
    </div>
    <div className="grid-3"><div className="card"><p className="small muted">Cảm xúc thường gặp</p><h3>Chưa đủ dữ liệu</h3></div><div className="card"><p className="small muted">Stress trung bình</p><h3>— / 5</h3></div><div className="card"><p className="small muted">Năng lượng trung bình</p><h3>— / 5</h3></div></div>
    <div className="notice small">Bạn đang xem chế độ local-first. Check-in hoạt động ngay; dữ liệu cloud sẽ xuất hiện sau khi cấu hình Supabase.</div>
  </div></main>;
}
