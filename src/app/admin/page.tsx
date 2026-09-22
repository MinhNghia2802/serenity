import Link from "next/link";

export default function AdminPage() {
  return <div className="stack"><div><p className="eyebrow">Admin console</p><h1 style={{ fontSize: "3rem" }}>Nội dung Serenity</h1></div><div className="grid-2"><Link className="soft-card stack-sm" href="/admin/artwork-sets"><span className="metric">01</span><h3>Bộ tranh demo</h3><p className="muted">Quản lý tranh, tag cảm xúc và license.</p></Link><Link className="soft-card stack-sm" href="/admin/question-sets"><span className="metric">01</span><h3>Bộ câu hỏi mặc định</h3><p className="muted">Quản lý prompt, loại câu hỏi và thứ tự.</p></Link></div><div className="notice">Chỉ nội dung đã publish được phép xuất hiện trong check-in của người dùng.</div></div>;
}
