import { useState } from "react";
import { GraduationCap, Shield, Sparkles, FileQuestion, CreditCard, UserCog, ChevronRight, Search, Bell, FileText } from "lucide-react";
import AfterschoolContract from "./AfterschoolContract";
import InformationChangeContract from "./InformationChangeContract";
import TrialContract from "./TrialContract";
import TkdContract from "./TkdContract";

const contracts = [
  {
    id: 1,
    title: "Dynamic Afterschool",
    subtitle: "Afterschool Program",
    icon: GraduationCap,
    count: 0,
    color: "#0071e3",
    bg: "#e8f1fc",
    href: "#",
  },
  {
    id: 2,
    title: "TKD",
    icon: Shield,
    count: 0,
    color: "#30a852",
    bg: "#e6f5ec",
    href: "#",
  },
  {
    id: 3,
    title: "Trial",
    icon: Sparkles,
    count: 0,
    color: "#ff9500",
    bg: "#fff4e0",
    href: "#",
  },
  {
    id: 6,
    title: "Information change",
    icon: UserCog,
    count: 2,
    color: "#6e6e73",
    bg: "#ebebef",
    href: "#",
  },
  {
    id: 4,
    title: "Blank",
    icon: FileQuestion,
    count: 0,
    color: "#af52de",
    bg: "#f3e8fd",
    href: "#",
  },
  {
    id: 5,
    title: "Payment change",
    icon: CreditCard,
    count: 5,
    color: "#ff3b30",
    bg: "#ffecea",
    href: "#",
  },
];

export default function App() {
  const [page, setPage] = useState<string | null>(null);
  const [activeLink, setActiveLink] = useState<number | null>(null);

  if (page === "afterschool") return <AfterschoolContract onBack={() => setPage(null)} />;
  if (page === "information-change") return <InformationChangeContract onBack={() => setPage(null)} />;
  if (page === "trial") return <TrialContract onBack={() => setPage(null)} />;
  if (page === "tkd") return <TkdContract onBack={() => setPage(null)} />;

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
    >
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 border-b border-border" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <FileText size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground tracking-tight">Applicatoin portal</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors duration-150">
              <Search size={16} />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors duration-150 relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center ml-1">
              Dynamic School
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-2">Contract Hub</p>
          <h1 className="text-4xl font-bold text-foreground tracking-tight leading-tight mb-2">
            Dynamic From Hub
          </h1>
          <p className="text-base text-muted-foreground font-normal">
            Pleaes click link.
          </p>
        </header>

        {/* Contract Links Grid */}
        <section className="mb-12">
          <div className="grid grid-cols-1 gap-3">
            {contracts.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeLink === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveLink(item.id);
                    if (item.id === 1) setPage("afterschool");
                    if (item.id === 6) setPage("information-change");
                    if (item.id === 3) setPage("trial");
                    if (item.id === 2) setPage("tkd");
                  }}
                  className="group block bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                  style={{
                    animationDelay: `${index * 60}ms`,
                    boxShadow: isActive
                      ? `0 0 0 2px ${item.color}33, 0 8px 24px rgba(0,0,0,0.08)`
                      : "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
                  }}
                >
                  <div className="flex items-center gap-5 px-6 py-5">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                      style={{ backgroundColor: item.bg }}
                    >
                      <Icon size={22} style={{ color: item.color }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-base font-semibold text-foreground tracking-tight">{item.title}</h2>
                        {item.count > 0 && (
                          <span
                            className="inline-flex items-center justify-center text-xs font-semibold rounded-full px-2 py-0.5 min-w-[22px]"
                            style={{ backgroundColor: item.color + "1a", color: item.color }}
                          >
                            {item.count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-normal truncate">{item.subtitle}</p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground flex-shrink-0 transition-all duration-200 group-hover:text-foreground group-hover:translate-x-0.5"
                    />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
