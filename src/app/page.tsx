import { ArrowRight, Heart, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="container hero__grid">
          <div className="stack">
            <p className="eyebrow">Một khoảng dừng cho chính bạn</p>
            <h1>Lắng nghe cảm xúc, theo cách nhẹ nhàng hơn.</h1>
            <p className="lead">
              Một check-in ngắn giúp bạn gọi tên điều đang cảm thấy, nhìn lại qua hình ảnh
              và tìm một gợi ý phù hợp cho hiện tại.
            </p>
            <div className="row">
              <Link className="button" href="/check-in">Bắt đầu check-in <ArrowRight size={17} /></Link>
              <Link className="button button--secondary" href="/dashboard">Xem bản demo</Link>
            </div>
            <p className="small muted">Serenity hỗ trợ tự phản tư, không thay thế chuyên gia hoặc dịch vụ khẩn cấp.</p>
          </div>
          <div className="hero-art" aria-label="Minh họa một không gian yên tĩnh">
            <Sparkles size={24} />
            <p className="quote">“Bạn không cần phải hiểu hết mọi thứ ngay hôm nay.”</p>
            <div className="row small"><LockKeyhole size={16} /> Riêng tư <Heart size={16} /> Không phán xét</div>
          </div>
        </div>
      </section>
    </main>
  );
}
