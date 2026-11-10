"use client";

import ClientEffects from "@/components/ClientEffects";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

type Lang = "en" | "sv";
type ProjectKey = "livana" | "brandify" | "apex";

const YEAR = 2026;

const PROJECT_META: { key: ProjectKey; name: string; url: string; image: string; tags: string[] }[] = [
  { key: "livana", name: "Livana", url: "https://livana.vercel.app/", image: "/livana.png", tags: ["Next.js", "MongoDB", "Leaflet"] },
  { key: "brandify", name: "Brandify", url: "https://brandify-nu.vercel.app/", image: "/brandify.png", tags: ["Next.js 16", "Clerk", "MongoDB"] },
  { key: "apex", name: "Apex", url: "https://apex-blush-eight.vercel.app/", image: "/apex.png", tags: ["FastAPI", "MongoDB", "ccxt"] },
];

// Order matches the reviews below: Anna, Erik, Sofia, Lars, Emma
const REVIEW_IMAGES = ["/comment1.png", "/comment2.png", "/comment3.jpg", "/comment4.jpg", "/comment5.jpg"];

const PORTRAIT =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCyY8YFHPJvzXu-BHH6X6sFLMFoC43uiBneZ3-lv8Tbf5Gz20jZX6946r7WED1NhWg0yqGwlsYZVHRIh1Zm9gHcWsLgVipK0bFrE2OVglIUHdcgl-pMUDxxZJr_FW0cTolonFB1qosvoNknI1S0fRCp0x-qPeV2ECRsZUROAc6HY8m4aZsPkckywPQlANE-fZbLAy7Ktfj4czg564Q24tg__9nU56PR_RWlEQudae-6wo9b4gYNH6Lzpg";

const SKILLS = [
  { label: "React", color: "bg-sky-50 text-sky-500", text: "" },
  { label: "Next.js", color: "bg-zinc-900 text-white", text: "N" },
  { label: "TypeScript", color: "bg-blue-500 text-white", text: "TS" },
  { label: "Node.js", color: "bg-emerald-50 text-emerald-600", text: "" },
  { label: "Python", color: "bg-amber-50 text-amber-600", text: "" },
  { label: "Docker", color: "bg-sky-50 text-sky-600", text: "" },
  { label: "AWS", color: "bg-amber-50 text-amber-600", text: "AWS" },
];

const T = {
  en: {
    nav: { home: "Home", about: "About", skills: "Skills", projects: "Portfolio", experience: "Experience", contact: "Contact" },
    letsTalk: "Let's Talk",
    hero: {
      hello: "Hello, I'm",
      first: "Javad",
      last: "Emami",
      role: "Product Developer",
      tag: "• Full-stack",
      text: "I build scalable products, craft exceptional user experiences, and turn ideas into reality.",
      basedIn: "Based in Stockholm",
      work: "View My Work",
      cv: "Download CV",
      scroll: "Scroll to explore",
      stat: "PROJECTS",
      completed: "Completed",
    },
    about: {
      label: "ABOUT ME",
      title1: "Turning Ideas",
      title2: "into Powerful Products",
      body: "Full-stack product developer with a focus on frontend and full-stack development. I build web applications with Next.js, React, FastAPI and MongoDB, with a background in UX/UI design.",
      years: "5+",
      yearsLabel: "Years Experience",
      traits: [
        { title: "Clean Code", desc: "Write maintainable and scalable code." },
        { title: "User-Centric Mindset", desc: "Build products that users love." },
        { title: "Problem Solver", desc: "Turn challenges into solutions." },
        { title: "Continuous Learner", desc: "Always exploring new technologies." },
      ],
    },
    skills: {
      label: "MY SKILLS",
      title: "Technologies I Work With",
      sub: "A versatile developer proficient in modern technologies across the full stack.",
    },
    projects: {
      label: "MY PROJECTS",
      title: "Featured Projects",
      sub: "Hover to explore, click for details.",
      visit: "Visit live site",
      close: "Close",
      stack: "Stack",
      year: "Year",
      items: {
        livana: {
          year: "2024 – Present",
          short: "Property search platform with 1,300+ listings across 7 Swedish cities.",
          details: [
            "Interactive map with marker clustering (Leaflet, OpenStreetMap)",
            "Public transit stops from GTFS (Trafiklab) and OSM Overpass",
            "Admin panel for listings, users, moderation and site settings",
            "Data pipeline that corrected 10,000+ faulty records",
            "Favorites, multi-step listing forms and encrypted messaging",
          ],
        },
        brandify: {
          year: "2026",
          short: "Logo and brand proposal generator built with Next.js 16.",
          details: [
            "Rule-based generator: name, slogan and industry in, logo proposals with palettes, patterns and mockups out",
            "Logo editor with live mockup preview",
            "Brand kit export as PNG",
            "Accounts with Clerk; logos saved per user in MongoDB",
          ],
        },
        apex: {
          year: "2026",
          short: "Automated crypto trading platform (SaaS).",
          details: [
            "Exchange connection via API keys; bots for Strategy, Grid and DCA",
            "Trailing stop, breakeven stop and multiple take-profit levels",
            "FastAPI and MongoDB backend with 150+ REST endpoints and 1,300+ automated tests",
            "Unified adapter layer for BingX, Bybit, OKX and Binance via ccxt",
            "Backtesting with 18 strategies, fee and slippage model",
          ],
        },
      },
    },
    experience: {
      label: "MY EXPERIENCE",
      title: "Professional Journey",
      sub: "A journey of growth, learning, and building impactful products.",
      cv: "View Full Resume",
      items: [
        { date: "Mar 2024 – Present", title: "Freelance Frontend Developer", company: "Stockholm", active: true },
        { date: "Jan 2021 – Mar 2022", title: "Frontend Developer", company: "Golden Ratio Studio, Stockholm", active: false },
        { date: "Nov 2019 – Dec 2020", title: "UX | UI & Web Designer", company: "daKnight Productions AB, Stockholm", active: false },
        { date: "Mar 2012 – Jul 2014", title: "Frontend Developer & UX/UI Designer", company: "SEPIDAN, Tehran", active: false },
      ],
    },
    reviews: {
      label: "TESTIMONIALS",
      title: "What Clients Say",
      prev: "Previous",
      next: "Next",
      items: [
        { name: "Anna Lindberg", quote: "Fantastic collaboration from start to finish! The design turned out exactly as I had imagined, and the result truly exceeded my expectations. Highly recommended!" },
        { name: "Erik Andersson", quote: "Very professional and knowledgeable developer. The website became fast, modern and user-friendly. Everything worked perfectly!" },
        { name: "Sofia Nilsson", quote: "I'm incredibly happy with the result! Communication, design and quality were at the highest level. A really great collaboration!" },
        { name: "Lars Johansson", quote: "A fantastic experience! I especially appreciated the accuracy, the creativity and the ability to understand exactly what I needed." },
        { name: "Emma Karlsson", quote: "Modern design, stylish details and a truly professional website. The whole process was smooth and the result exceeded expectations!" },
      ],
    },
    contact: {
      label: "LET'S WORK TOGETHER",
      title: "Have a Project in Mind?",
      sub: "I'd love to hear about your ideas and help you bring them to life.",
      name: "Your name",
      phone: "Phone (optional)",
      email: "Your email",
      message: "Your message",
      send: "Send Message",
      sending: "Sending...",
      success: "Thanks! Your message has been sent.",
      error: "Something went wrong. Please try again.",
    },
    footer: { rights: "All rights reserved." },
  },
  sv: {
    nav: { home: "Hem", about: "Om mig", skills: "Kompetenser", projects: "Portfölj", experience: "Erfarenhet", contact: "Kontakt" },
    letsTalk: "Hör av dig",
    hero: {
      hello: "Hej, jag är",
      first: "Javad",
      last: "Emami",
      role: "Produktutvecklare",
      tag: "• Fullstack",
      text: "Jag bygger skalbara produkter, skapar utmärkta användarupplevelser och förvandlar idéer till verklighet.",
      basedIn: "Baserad i Stockholm",
      work: "Se mina projekt",
      cv: "Ladda ner CV",
      scroll: "Scrolla för att utforska",
      stat: "PROJEKT",
      completed: "Slutförda",
    },
    about: {
      label: "OM MIG",
      title1: "Att förvandla idéer",
      title2: "till kraftfulla produkter",
      body: "Produktutvecklare med fokus på frontend och fullstack. Jag bygger webbapplikationer med Next.js, React, FastAPI och MongoDB, med bakgrund inom UX/UI-design.",
      years: "5+",
      yearsLabel: "Års erfarenhet",
      traits: [
        { title: "Ren kod", desc: "Skriver underhållbar och skalbar kod." },
        { title: "Användarfokus", desc: "Bygger produkter som användare älskar." },
        { title: "Problemlösare", desc: "Förvandlar utmaningar till lösningar." },
        { title: "Lär mig ständigt", desc: "Utforskar alltid ny teknik." },
      ],
    },
    skills: {
      label: "MINA KOMPETENSER",
      title: "Tekniker jag arbetar med",
      sub: "En mångsidig utvecklare med god kunskap om modern teknik i hela stacken.",
    },
    projects: {
      label: "MINA PROJEKT",
      title: "Utvalda projekt",
      sub: "Håll musen över för att utforska, klicka för detaljer.",
      visit: "Besök webbplatsen",
      close: "Stäng",
      stack: "Teknik",
      year: "År",
      items: {
        livana: {
          year: "2024 – nu",
          short: "Sökplattform för bostäder med över 1 300 annonser i 7 svenska städer.",
          details: [
            "Interaktiv karta med klustring av markörer (Leaflet, OpenStreetMap)",
            "Hållplatser för kollektivtrafik från GTFS (Trafiklab) och OSM Overpass",
            "Adminpanel för annonser, användare, granskning och sajtinställningar",
            "Datapipeline som rättade över 10 000 felaktiga poster",
            "Favoriter, flerstegsformulär för annonser och krypterade meddelanden",
          ],
        },
        brandify: {
          year: "2026",
          short: "Generator för logotyp- och varumärkesförslag byggd med Next.js 16.",
          details: [
            "Regelbaserad generator: namn, slogan och bransch in, logotypförslag med palett, mönster och mockuper ut",
            "Logotypredigerare med förhandsvisning i mockuper",
            "Nedladdning av varumärkeskit som PNG",
            "Konton via Clerk; logotyper sparas per användare i MongoDB",
          ],
        },
        apex: {
          year: "2026",
          short: "Plattform för automatiserad kryptohandel (SaaS).",
          details: [
            "Koppling till börser via API-nycklar; robotar för Strategy, Grid och DCA",
            "Trailing stop, breakeven-stop och flera take-profit-nivåer",
            "Backend i FastAPI och MongoDB med över 150 REST-endpoints och över 1 300 automatiska tester",
            "Enhetligt adaptergränssnitt för BingX, Bybit, OKX och Binance via ccxt",
            "Backtest med 18 strategier och modell för avgifter och slippage",
          ],
        },
      },
    },
    experience: {
      label: "MIN ERFARENHET",
      title: "Yrkesresa",
      sub: "En resa med tillväxt, lärande och att bygga produkter som gör skillnad.",
      cv: "Se hela CV:t",
      items: [
        { date: "Mars 2024 – nu", title: "Frilansande frontendutvecklare", company: "Stockholm", active: true },
        { date: "Januari 2021 – Mars 2022", title: "Frontendutvecklare", company: "Golden Ratio Studio, Stockholm", active: false },
        { date: "November 2019 – December 2020", title: "UX | UI-designer och webbdesigner", company: "daKnight Productions AB, Stockholm", active: false },
        { date: "Mars 2012 – Juli 2014", title: "Frontendutvecklare och UX | UI-designer", company: "SEPIDAN, Teheran", active: false },
      ],
    },
    reviews: {
      label: "REFERENSER",
      title: "Vad kunder säger",
      prev: "Föregående",
      next: "Nästa",
      items: [
        { name: "Anna Lindberg", quote: "Fantastiskt samarbete från början till slut! Designen blev precis som jag hade tänkt mig, och resultatet överträffade verkligen mina förväntningar. Rekommenderas varmt!" },
        { name: "Erik Andersson", quote: "Mycket professionell och kunnig utvecklare. Hemsidan blev både snabb, modern och användarvänlig. Allt fungerade perfekt!" },
        { name: "Sofia Nilsson", quote: "Jag är otroligt nöjd med resultatet! Kommunikation, design och kvalitet var på högsta nivå. Ett riktigt bra samarbete!" },
        { name: "Lars Johansson", quote: "En fantastisk upplevelse! Jag uppskattade särskilt noggrannheten, kreativiteten och förmågan att förstå exakt vad jag behövde." },
        { name: "Emma Karlsson", quote: "Modern design, snygga detaljer och en riktigt professionell hemsida. Hela processen var smidig och resultatet blev över förväntan!" },
      ],
    },
    contact: {
      label: "LÅT OSS JOBBA TILLSAMMANS",
      title: "Har du ett projekt i tankarna?",
      sub: "Berätta gärna om din idé, så hjälper jag dig att göra den verklig.",
      name: "Ditt namn",
      phone: "Telefon (valfritt)",
      email: "Din e-post",
      message: "Ditt meddelande",
      send: "Skicka meddelande",
      sending: "Skickar...",
      success: "Tack! Ditt meddelande har skickats.",
      error: "Något gick fel. Försök igen.",
    },
    footer: { rights: "Alla rättigheter förbehållna." },
  },
};

type FormState = { name: string; phone: string; email: string; message: string };
const EMPTY_FORM: FormState = { name: "", phone: "", email: "", message: "" };

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [selected, setSelected] = useState<number | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const barRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const reviewTrackRef = useRef<HTMLDivElement>(null);

  const t = T[lang];
  const cvHref = lang === "en" ? "/v8e.pdf" : "/v8.pdf";

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "sv") setLang(saved);
    } catch {}
  }, []);

  const changeLang = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  };

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight || 1;
        if (barRef.current) barRef.current.style.transform = `scaleX(${y / max})`;
        if (photoRef.current) photoRef.current.style.transform = `translate3d(0, ${Math.min(y, 800) * -0.06}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (selected === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const scrollReviews = (dir: 1 | -1) => {
    const track = reviewTrackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * track.clientWidth, behavior: "smooth" });
  };

  const onReviewScroll = () => {
    const track = reviewTrackRef.current;
    if (!track) return;
    setReviewIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("failed");
      setForm(EMPTY_FORM);
      setToast({ msg: t.contact.success, type: "success" });
    } catch {
      setToast({ msg: t.contact.error, type: "error" });
    } finally {
      setSending(false);
    }
  };

  const project = selected !== null ? PROJECT_META[selected] : null;
  const projectText = project ? t.projects.items[project.key] : null;

  const inputClass =
    "w-full bg-[#161B26] border border-zinc-700/80 rounded-full py-3.5 px-6 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all";

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0D13]/90 backdrop-blur-md border-b border-white/5" id="navbar">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a aria-label="Javad Emami Home" className="flex items-center gap-3 group focus:outline-none" href="#hero">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 tracking-tighter text-lg shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:border-amber-400 transition-all">
              JE
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a className="text-zinc-400 hover:text-white transition-colors" href="#hero">{t.nav.home}</a>
            <a className="text-zinc-400 hover:text-white transition-colors" href="#about">{t.nav.about}</a>
            <a className="text-zinc-400 hover:text-white transition-colors" href="#skills">{t.nav.skills}</a>
            <a className="text-zinc-400 hover:text-white transition-colors" href="#projects">{t.nav.projects}</a>
            <a className="text-zinc-400 hover:text-white transition-colors" href="#experience">{t.nav.experience}</a>
            <a className="text-zinc-400 hover:text-white transition-colors" href="#contact">{t.nav.contact}</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-white/15 p-0.5 text-[11px] font-bold">
              {(["en", "sv"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => changeLang(l)}
                  aria-pressed={lang === l}
                  className={`px-3 py-1 rounded-full transition-all ${lang === l ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <a className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 transition-all duration-300 hover:scale-105 active:scale-95" href="#contact">
              {t.letsTalk}
            </a>
          </div>
        </div>
        <div ref={barRef} className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-amber-400" />
      </header>

      {/* Hero */}
      <section className="relative min-h-screen bg-[#0B0D13] text-white pt-28 pb-16 flex flex-col justify-between overflow-hidden" id="hero">
        <canvas className="absolute inset-0 z-0 pointer-events-auto" id="particles-canvas"></canvas>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 pt-6">
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-amber-400 text-sm">👋</span>
                <span className="text-xs font-medium text-zinc-300">{t.hero.hello}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-medium text-zinc-300">{t.hero.basedIn}</span>
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-none">
                {t.hero.first}<br />{t.hero.last}
              </h1>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-200 pt-2">
                {t.hero.role} <span className="text-amber-400">{t.hero.tag}</span>
              </p>
            </div>
            <p className="text-zinc-400 text-base sm:text-lg max-w-xl font-normal leading-relaxed">{t.hero.text}</p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-all duration-200 hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:-translate-y-0.5" href="#projects">
                {t.hero.work}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path></svg>
              </a>
              <a className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold bg-white/5 text-white border border-white/15 hover:bg-white/10 transition-all duration-200 hover:border-white/30" href={cvHref} download>
                {t.hero.cv}
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12L12 16.5m0 0L16.5 12M12 16.5V3" strokeLinecap="round" strokeLinejoin="round"></path></svg>
              </a>
            </div>
            <div className="pt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-medium text-zinc-300"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> React</span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-medium text-zinc-300"><span className="w-2 h-2 rounded-full bg-white"></span> Next.js</span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-medium text-zinc-300"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Node.js</span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-medium text-zinc-300"><span className="w-2 h-2 rounded-full bg-blue-400"></span> TypeScript</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex items-end justify-center self-stretch">
            <div className="absolute w-[440px] h-[440px] rounded-full border border-amber-500/20 animate-halo pointer-events-none"></div>
            <div className="absolute w-[360px] h-[360px] rounded-full border border-dashed border-amber-500/25 pointer-events-none"></div>
            <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
            <div className="absolute top-[30%] -left-6 lg:-left-16 z-20 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 rounded-xl p-3.5 shadow-2xl animate-float w-[230px]">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
              </div>
              <pre className="font-mono-code text-[11px] leading-relaxed text-zinc-300"><code className="block whitespace-normal"><span className="block"><span className="text-purple-400">const</span> <span className="text-blue-400">createProduct</span> = () =&gt; (&#123;</span><span className="block pl-3"><span className="text-zinc-400">vision:</span> <span className="text-amber-300">&quot;Better UX&quot;</span>,</span><span className="block pl-3"><span className="text-zinc-400">impact:</span> <span className="text-emerald-400">&quot;Global&quot;</span>,</span><span className="block">&#125;);</span></code></pre>
            </div>
            <div className="absolute top-8 -right-2 sm:right-4 z-20 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 rounded-xl px-4 py-3 shadow-2xl animate-float-reverse flex items-center gap-3">
              <div>
                <div className="text-[10px] tracking-wider uppercase font-semibold text-zinc-400">{t.hero.stat}</div>
                <div className="text-xl font-extrabold text-amber-400 leading-none">42+</div>
                <div className="text-[10px] text-zinc-400">{t.hero.completed}</div>
              </div>
            </div>
            <div ref={photoRef} className="relative z-10 w-[320px] sm:w-[420px] lg:w-[520px] xl:w-[600px] pt-4 will-change-transform">
              <img
                alt="Javad Emami - Product Developer"
                className="w-full h-auto object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] filter contrast-105 [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)]"
                src={PORTRAIT}
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex justify-start pt-6">
          <a className="inline-flex items-center gap-3 text-xs text-zinc-400 hover:text-white transition-colors group" href="#about">
            <div className="w-5 h-8 rounded-full border border-zinc-600 flex items-start justify-center p-1 group-hover:border-amber-400 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mouse-wheel-dot"></div>
            </div>
            <span>{t.hero.scroll}</span>
          </a>
        </div>
      </section>

      {/* About */}
      <section className="py-24 bg-white relative" id="about">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <Reveal className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-zinc-100 to-amber-50/40 border border-zinc-200/80 shadow-xl p-3">
                <div className="relative rounded-2xl overflow-hidden bg-zinc-100 aspect-[4/4.5]">
                  <img alt="Javad Emami portrait" className="w-full h-full object-cover object-top filter grayscale contrast-110 hover:grayscale-0 transition-all duration-500" src="/about.png" loading="lazy" decoding="async" />
                </div>
                <div className="absolute bottom-6 right-6 bg-zinc-950 text-white rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 border border-zinc-800">
                  <span className="text-3xl font-black text-amber-400 leading-none">{t.about.years}</span>
                  <span className="text-xs font-semibold leading-tight text-zinc-300">{t.about.yearsLabel}</span>
                </div>
              </div>
            </Reveal>
            <div className="lg:col-span-7 space-y-6">
              <Reveal>
                <div className="text-amber-500 font-semibold text-xs tracking-wider uppercase flex items-center gap-2 mb-2">
                  <span className="w-6 h-0.5 bg-amber-500"></span> {t.about.label}
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                  {t.about.title1}<br />{t.about.title2}
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="text-zinc-600 text-base leading-relaxed">{t.about.body}</p>
              </Reveal>
              <Reveal delay={150}>
                <span className="font-signature text-3xl sm:text-4xl text-amber-500 tracking-wider">Javad Emami</span>
              </Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {t.about.traits.map((item, i) => (
                  <Reveal key={item.title} delay={200 + i * 80}>
                    <div className="h-full p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 hover:bg-white hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0 text-amber-400 font-bold text-sm">{i + 1}</div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900">{item.title}</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-20 bg-zinc-50/50 border-y border-zinc-100" id="skills">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="mb-12">
              <div className="text-amber-500 font-semibold text-xs tracking-wider uppercase flex items-center gap-2 mb-2">
                <span className="w-6 h-0.5 bg-amber-500"></span> {t.skills.label}
              </div>
              <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">{t.skills.title}</h2>
              <p className="text-zinc-500 text-sm mt-1">{t.skills.sub}</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {SKILLS.map((skill, i) => (
              <Reveal key={skill.label} delay={i * 60}>
                <div className="h-full bg-white rounded-2xl p-5 border border-zinc-200/80 flex flex-col items-center justify-center gap-3 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${skill.color} ${skill.text ? "font-extrabold text-lg" : ""}`}>
                    {skill.text || <span className="text-xl font-bold">{skill.label[0]}</span>}
                  </div>
                  <span className="text-xs font-bold text-zinc-800">{skill.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Projects: hover-expanding strip */}
      <section className="py-24 bg-[#0B0D13] text-white" id="projects">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="mb-12">
              <div className="text-amber-400 font-semibold text-xs tracking-wider uppercase flex items-center gap-2 mb-2">
                <span className="w-6 h-0.5 bg-amber-400"></span> {t.projects.label}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">{t.projects.title}</h2>
              <p className="text-zinc-400 text-sm mt-1">{t.projects.sub}</p>
            </div>
          </Reveal>
          <div className="flex flex-col md:flex-row gap-4 md:h-[480px]">
            {PROJECT_META.map((p, i) => {
              const text = t.projects.items[p.key];
              return (
                <Reveal key={p.key} delay={i * 120} className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    className="group relative w-full h-full min-h-[300px] md:min-h-0 overflow-hidden rounded-3xl bg-zinc-900 border border-white/10 text-left transition-[flex] duration-700 ease-out md:hover:flex-[2.4]"
                  >
                    <img src={p.image} alt={`${p.name} screenshot`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="text-amber-400 text-xs font-bold tracking-widest">0{i + 1}</span>
                      <h3 className="text-2xl font-extrabold mt-1">{p.name}</h3>
                      <p className="text-sm text-zinc-300 mt-2 max-w-sm opacity-100 md:opacity-0 md:translate-y-3 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500">
                        {text.short}
                      </p>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experience and reviews */}
      <section className="py-24 bg-zinc-50/50 border-t border-zinc-100" id="experience">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-6 space-y-6">
              <Reveal>
                <div className="text-amber-500 font-semibold text-xs tracking-wider uppercase flex items-center gap-2 mb-2"><span className="w-6 h-0.5 bg-amber-500"></span> {t.experience.label}</div>
                <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">{t.experience.title}</h2>
                <p className="text-zinc-500 text-sm mt-1">{t.experience.sub}</p>
              </Reveal>
              <div className="relative pl-6 space-y-8 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
                {t.experience.items.map((item, i) => (
                  <Reveal key={item.title} delay={i * 100}>
                    <div className="relative">
                      <div className={`absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full border-4 border-white shadow-sm ${item.active ? "bg-amber-400" : "bg-zinc-300"}`}></div>
                      <div className={`text-xs font-bold tracking-wide ${item.active ? "text-amber-600" : "text-zinc-400"}`}>{item.date}</div>
                      <h3 className="text-base font-bold text-zinc-900 mt-0.5">{item.title}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.company}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal>
                <a className="inline-flex items-center px-4 py-2 rounded-full border border-zinc-300 text-xs font-semibold text-zinc-700 bg-white hover:border-zinc-400 hover:text-black transition-all shadow-sm" href={cvHref} download>
                  {t.experience.cv}
                </a>
              </Reveal>
            </div>

            <div className="lg:col-span-6 space-y-6 min-w-0">
              <Reveal>
                <div className="text-amber-500 font-semibold text-xs tracking-wider uppercase flex items-center gap-2 mb-2"><span className="w-6 h-0.5 bg-amber-500"></span> {t.reviews.label}</div>
                <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">{t.reviews.title}</h2>
              </Reveal>
              <Reveal delay={100}>
                <div
                  ref={reviewTrackRef}
                  onScroll={onReviewScroll}
                  className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-3xl border border-zinc-200/90 bg-white shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {t.reviews.items.map((r, i) => (
                    <div key={r.name} className="snap-center shrink-0 w-full p-6 sm:p-8 flex flex-col gap-5">
                      <div className="flex items-center gap-4">
                        <img src={REVIEW_IMAGES[i]} alt={r.name} loading="lazy" decoding="async" className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 shrink-0" />
                        <div>
                          <h4 className="text-base font-bold text-zinc-900">{r.name}</h4>
                          <div className="text-amber-400 text-sm tracking-widest">★★★★★</div>
                        </div>
                      </div>
                      <blockquote className="text-zinc-700 text-base leading-relaxed italic">“{r.quote}”</blockquote>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center items-center gap-4 pt-5">
                  <button type="button" aria-label={t.reviews.prev} onClick={() => scrollReviews(-1)} className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition-colors">‹</button>
                  <div className="flex items-center gap-1.5">
                    {t.reviews.items.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`${i + 1}`}
                        onClick={() => reviewTrackRef.current?.scrollTo({ left: i * (reviewTrackRef.current?.clientWidth ?? 0), behavior: "smooth" })}
                        className={`h-2 rounded-full transition-all ${i === reviewIndex ? "w-6 bg-amber-400" : "w-2 bg-zinc-300"}`}
                      />
                    ))}
                  </div>
                  <button type="button" aria-label={t.reviews.next} onClick={() => scrollReviews(1)} className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition-colors">›</button>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 bg-white relative" id="contact">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <div className="bg-[#0D1017] rounded-3xl p-8 sm:p-14 relative overflow-hidden border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none"></div>
              <div className="relative z-10 max-w-2xl mx-auto space-y-6 text-center">
                <div className="text-amber-400 font-semibold text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                  <span className="w-4 h-0.5 bg-amber-400"></span> {t.contact.label} <span className="w-4 h-0.5 bg-amber-400"></span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">{t.contact.title}</h2>
                <p className="text-zinc-400 text-sm sm:text-base font-normal max-w-lg mx-auto">{t.contact.sub}</p>
              </div>

              <form onSubmit={onSubmit} className="relative z-10 pt-8 max-w-xl mx-auto space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input className={inputClass} placeholder={t.contact.name} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input className={inputClass} placeholder={t.contact.phone} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <input className={inputClass} placeholder={t.contact.email} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <textarea
                  className={`${inputClass} rounded-3xl min-h-[140px] resize-y`}
                  placeholder={t.contact.message}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
                <div className="text-center pt-2">
                  <button type="submit" disabled={sending} className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95">
                    {sending ? t.contact.sending : t.contact.send}
                  </button>
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B0D13] text-zinc-400 py-10 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">JE</div>
            <span>© {YEAR} Javad Emami. {t.footer.rights}</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a className="hover:text-white transition-colors" href="#hero">{t.nav.home}</a>
            <a className="hover:text-white transition-colors" href="#about">{t.nav.about}</a>
            <a className="hover:text-white transition-colors" href="#skills">{t.nav.skills}</a>
            <a className="hover:text-white transition-colors" href="#projects">{t.nav.projects}</a>
            <a className="hover:text-white transition-colors" href="#experience">{t.nav.experience}</a>
            <a className="hover:text-white transition-colors" href="#contact">{t.nav.contact}</a>
          </div>
        </div>
      </footer>

      {/* Project modal (dark, image left, details right) */}
      {project && projectText && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div role="dialog" aria-modal="true" className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto grid md:grid-cols-2 bg-[#0D1017] text-white border border-white/10 rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-zinc-900 min-h-[260px] md:min-h-full">
              <img src={project.image} alt={`${project.name} screenshot`} className="w-full h-full object-cover object-top" />
            </div>
            <div className="p-8 flex flex-col">
              <p className="text-amber-400 text-xs font-bold tracking-widest">0{(selected ?? 0) + 1} · {projectText.year}</p>
              <h3 className="text-3xl font-extrabold mt-2">{project.name}</h3>
              <p className="text-zinc-400 text-sm mt-3">{projectText.short}</p>

              <div className="mt-6 divide-y divide-white/10 border-y border-white/10 text-sm">
                <div className="flex justify-between gap-4 py-3">
                  <span className="text-zinc-500">{t.projects.stack}</span>
                  <span className="text-right text-zinc-200">{project.tags.join(" · ")}</span>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <span className="text-zinc-500">{t.projects.year}</span>
                  <span className="text-right text-zinc-200">{projectText.year}</span>
                </div>
              </div>

              <ul className="mt-6 space-y-2 text-sm text-zinc-300">
                {projectText.details.map((d) => (
                  <li key={d} className="flex gap-2"><span className="text-amber-400">•</span><span>{d}</span></li>
                ))}
              </ul>

              <div className="mt-auto pt-8 flex flex-wrap items-center justify-between gap-4">
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors">
                  {t.projects.visit}
                </a>
                <button type="button" onClick={() => setSelected(null)} className="text-xs font-bold tracking-widest uppercase text-zinc-400 hover:text-white">
                  {t.projects.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div role="status" className={`toast-in fixed top-24 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 rounded-full shadow-2xl text-sm font-semibold border ${toast.type === "success" ? "bg-zinc-900 text-amber-400 border-amber-500/40" : "bg-rose-950 text-rose-300 border-rose-500/40"}`}>
          {toast.msg}
        </div>
      )}

      {/* Back to top */}
      <a href="#hero" className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-[#11141D]/90 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-90 group" id="scroll-widget" title="Back to Top">
        <svg className="w-12 h-12 -rotate-90 pointer-events-none" viewBox="0 0 48 48">
          <circle className="text-zinc-800" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="2.5"></circle>
          <circle className="text-amber-400 transition-all duration-75" cx="24" cy="24" fill="transparent" id="scroll-progress-circle" r="20" stroke="currentColor" strokeDasharray="125.6" strokeDashoffset="125.6" strokeLinecap="round" strokeWidth="2.5"></circle>
        </svg>
        <span className="absolute text-[10px] font-bold text-amber-400 font-mono-code group-hover:hidden" id="scroll-percent-text">0%</span>
        <svg className="w-4 h-4 text-amber-400 absolute hidden group-hover:block transition-all" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4.5 15.75l7.5-7.5 7.5 7.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
      </a>

      <ClientEffects />
    </>
  );
}