import { useState, useMemo } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Karla:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F7F4EF; color: #1A1814; font-family: 'Karla', sans-serif; min-height: 100vh; }
  input, select {
    width: 100%; background: transparent; border: none;
    border-bottom: 1.5px solid #D4C9B8; padding: 10px 0;
    font-family: 'Karla', sans-serif; font-size: 16px; color: #1A1814;
    outline: none; transition: border-color 0.2s;
    appearance: none; -webkit-appearance: none; border-radius: 0;
  }
  input:focus, select:focus { border-color: #1A1814; }
  input::placeholder { color: #BFB8AA; }
  select option { background: #F7F4EF; }
  button { cursor: pointer; font-family: 'Karla', sans-serif; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .fade-in { animation: fadeIn 0.5s ease forwards; }
`;

const n = (v) => Number(v) || 0;
const fmt = (v, d = 0) => Number(v).toLocaleString("en-US", { maximumFractionDigits: d });

const WORK_COST_FIELDS = [
  { key: "transport",  label: "যাতায়াত (Transportation)",           hint: "মাসিক (Monthly) — বাস/রিকশা/উবার, অফিস যাওয়া-আসা" },
  { key: "clothing",   label: "পোশাক ও গ্রুমিং (Clothing)",         hint: "মাসিক গড় (Monthly avg.) — শুধু অফিসের জন্য কেনা জামা, শু, ইস্ত্রি" },
  { key: "food",       label: "বাইরে খাওয়া (Work Meals)",           hint: "মাসিক (Monthly) — কাজের দিনে লাঞ্চ/চা/স্ন্যাকের বাড়তি খরচ" },
  { key: "decompress", label: "মন ভালো করার খরচ (Decompression)",   hint: "মাসিক (Monthly) — ক্লান্তি কাটাতে নেটফ্লিক্স, ঘুরতে যাওয়া, শপিং" },
  { key: "education",  label: "চাকরি-সংক্রান্ত শিক্ষা (Education)", hint: "মাসিক গড় (Monthly avg.) — শুধু কাজের জন্য করা কোর্স, বই, সার্টিফিকেশন" },
  { key: "other",      label: "অন্যান্য (Other)",                    hint: "মাসিক (Monthly) — ফোন, ইন্টারনেট বা অন্য যেকোনো কাজ-নির্ভর খরচ" },
];

const USE_CASES = [
  { icon: "📱", title: "বড় কেনাকাটার আগে (Before a Big Purchase)",            body: "ফোন, ল্যাপটপ, গাড়ি বা আসবাবপত্রের মতো বড় খরচের সিদ্ধান্ত নেওয়ার আগে বুঝতে পারবেন এটা আসলে কত ঘণ্টার কাজের সমান।" },
  { icon: "🎯", title: "আবেগের বশে কেনার আগে (Impulse Buying Check)",         body: "সেল বা ডিসকাউন্ট দেখে হুট করে কিছু কিনতে মন চাইলে এই ক্যালকুলেটর ব্যবহার করুন। জীবন-শক্তির হিসাব আবেগকে ঠান্ডা করে।" },
  { icon: "💳", title: "ঋণে কেনার আগে (Before Buying on Credit)",              body: "ইএমআই বা ক্রেডিট কার্ডে কোনো কিছু কিনতে গেলে বুঝুন — সুদসহ এটা আসলে কত ঘণ্টার কাজের সমতুল্য।" },
  { icon: "🎓", title: "শিক্ষার্থী ও নতুন চাকরিজীবীদের জন্য (Early Career)", body: "আয় কম থাকলে প্রতিটি টাকার মূল্য বেশি। এই ক্যালকুলেটর আপনাকে শুরু থেকেই সচেতন আর্থিক অভ্যাস গড়তে সাহায্য করবে।" },
  { icon: "🏠", title: "জীবনমান পুনর্মূল্যায়নে (Lifestyle Reassessment)",    body: "আপনার মাসিক খরচের প্রতিটি খাত কত ঘণ্টার জীবন-শক্তি নিচ্ছে তা বুঝলে কোথায় কাটছাঁট করবেন সেটা স্পষ্ট হয়।" },
  { icon: "🕊️", title: "আর্থিক স্বাধীনতার পথে (Financial Freedom / FIRE)",   body: "যারা FIRE বা আর্থিক স্বাধীনতার লক্ষ্যে কাজ করছেন, তাদের জন্য এটি একটি দৈনন্দিন সিদ্ধান্তের হাতিয়ার।" },
];

const CONCEPTS = [
  {
    number: "০১",
    bn_title: "জীবন-শক্তি কী?",
    en_title: "What is Life Energy?",
    bn: "আপনার জীবনে আপনার কাছে সবচেয়ে সীমিত সম্পদ হলো সময়। আপনি যখন কাজ করেন, তখন আপনি আসলে আপনার জীবনের একটা অংশ — অর্থাৎ জীবন-শক্তি — টাকার বিনিময়ে দিচ্ছেন। তাই টাকা আসলে সঞ্চিত জীবন-শক্তির প্রতিনিধিত্ব করে। কোনো কিছু কিনলে আপনি শুধু টাকা দিচ্ছেন না — আপনি জীবনের সময় দিচ্ছেন।",
    en: "The most finite resource in your life is time. When you work, you are exchanging a portion of your life — your life energy — for money. Money, therefore, represents stored life energy. When you spend it, you are not merely handing over currency; you are trading irreplaceable hours of your existence.",
  },
  {
    number: "০২",
    bn_title: "বেতন কি আসল আয়?",
    en_title: "Is Your Salary Your Real Income?",
    bn: "না। আপনার বেতনের একটা বড় অংশ আসলে কাজে যাওয়ার খরচ মেটাতেই চলে যায়। যাতায়াত, পোশাক, বাইরে খাওয়া, ক্লান্তি কাটানোর খরচ — এগুলো বাদ দিলে যা থাকে সেটাই আপনার প্রকৃত আয়। একইভাবে, শুধু চুক্তির সময় নয়, কমিউটের সময়, ওভারটাইম, কাজের প্রস্তুতির সময়ও আপনার জীবন-শক্তির অংশ।",
    en: "No. A significant portion of your salary is consumed by the very act of going to work — transport, clothing, meals, and the cost of recovering from exhaustion. What remains after these deductions is your real income. Similarly, your working hours extend far beyond your contract: commute time, overtime, and preparation all consume your life energy.",
  },
  {
    number: "০৩",
    bn_title: "সুযোগ-ব্যয় — অদৃশ্য মূল্য",
    en_title: "Opportunity Cost — The Invisible Price",
    bn: "প্রতিটি কেনাকাটার একটা অদৃশ্য মূল্য আছে — সেই টাকাটা যদি বিনিয়োগ করা হত, ভবিষ্যতে কত হত। এটাকে বলে সুযোগ-ব্যয়। একটি ৫০,০০০ টাকার কেনাকাটা শুধু ৫০,০০০ টাকার ক্ষতি নয় — এটা হয়তো ২০ বছর পর কয়েক লক্ষ টাকার সুযোগ হারানো। প্রতিটি টাকা খরচের আগে এই প্রশ্ন করুন: এই টাকাটা ভবিষ্যতে কী হতে পারত?",
    en: "Every purchase carries an invisible price — what that money could have become if invested. This is called opportunity cost. A ৳50,000 purchase isn't just a ৳50,000 loss; it may represent hundreds of thousands in foregone wealth decades later. Before every purchase, ask: what could this money have become?",
  },
  {
    number: "০৪",
    bn_title: "যথেষ্ট মানে কী? — 'Enough' ধারণা",
    en_title: "What is 'Enough'?",
    bn: "আধুনিক সমাজ আমাদের বোঝায় যে 'আরও বেশি' মানেই 'আরও ভালো'। কিন্তু Vicki Robin দেখিয়েছেন, একটা নির্দিষ্ট পর্যায়ের পর বেশি জিনিস কম সুখ দেয় — কারণ সেগুলো রক্ষণাবেক্ষণ, মনোযোগ ও সময় দাবি করে। 'যথেষ্ট' মানে হলো সেই বিন্দু যেখানে আপনার প্রকৃত প্রয়োজন পূরণ হয় — তার বেশি কেনা মানে জীবন-শক্তি অপচয়।",
    en: "Modern culture conditions us to believe 'more is better.' But Vicki Robin demonstrated that beyond a certain point, more possessions yield less happiness — because they demand maintenance, attention, and time. 'Enough' is the point where your genuine needs are met. Anything beyond that is life energy wasted.",
  },
  {
    number: "০৫",
    bn_title: "আর্থিক স্বাধীনতার সাথে সংযোগ",
    en_title: "The Link to Financial Independence",
    bn: "প্রতিটি অপ্রয়োজনীয় কেনাকাটা দুইভাবে আর্থিক স্বাধীনতাকে দূরে ঠেলে দেয়: এক, সঞ্চয় কমায়; দুই, বিনিয়োগের সুযোগ নষ্ট করে। বিপরীতে, সচেতনভাবে কম খরচ করলে সঞ্চয় বাড়ে, বিনিয়োগ বাড়ে, এবং একটা সময় আসে যখন বিনিয়োগের আয়ই জীবন চালাতে পারে। তখন কাজ করাটা বাধ্যতামূলক থাকে না — এটাই আর্থিক স্বাধীনতা।",
    en: "Every unnecessary purchase delays financial independence in two ways: it reduces savings, and it destroys an investment opportunity. Conversely, conscious spending accelerates savings and investment until a point where passive income covers living expenses. At that moment, work becomes a choice, not a necessity. That is financial independence.",
  },
];

function calculate(f) {
  const gross      = n(f.salary) + n(f.bonus) / 12;
  const net        = gross - n(f.taxAmount);
  const workCost   = WORK_COST_FIELDS.reduce((s, { key }) => s + n(f[key]), 0);
  const disposable = net - workCost;
  const totalHours = (n(f.hoursPerDay) + n(f.commute)) * n(f.daysPerMonth);
  const realWage   = totalHours > 0 ? disposable / totalHours : 0;
  const p          = n(f.price);
  const lifeHours  = realWage > 0 ? p / realWage : 0;
  const lifeDays   = lifeHours / (n(f.hoursPerDay) || 8);
  const yrs        = n(f.lifetime) || 1;
  const oppCostLow  = p * Math.pow(1.05, yrs);
  const oppCostHigh = p * Math.pow(1.09, yrs);
  return { realWage, lifeHours, lifeDays, oppCostLow, oppCostHigh, disposable };
}

const Label = ({ children }) => (
  <div style={{ fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase", color: "#9E9585", marginBottom: 6, fontWeight: 500, lineHeight: 1.5 }}>
    {children}
  </div>
);
const Hint = ({ children }) => (
  <div style={{ fontSize: 11, color: "#BFB8AA", marginBottom: 6, lineHeight: 1.5 }}>{children}</div>
);
const Divider = () => (
  <div style={{ borderTop: "1px solid #E5DDD0", margin: "36px 0" }} />
);
const SectionTitle = ({ bn, en }) => (
  <div style={{ fontFamily: "'Lora', serif", fontSize: 13, fontStyle: "italic", color: "#9E9585", marginBottom: 28 }}>
    {bn} <span style={{ fontStyle: "normal", fontSize: 11, color: "#BFB8AA" }}>({en})</span>
  </div>
);
const ResultRow = ({ label, value, accent }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0", borderBottom: "1px solid #EDE6DA" }}>
    <span style={{ fontSize: 14, color: "#6B6356" }}>{label}</span>
    <span style={{ fontFamily: "'Lora', serif", fontSize: 17, color: accent ? "#1A1814" : "#5A5248", fontWeight: accent ? 600 : 400 }}>{value}</span>
  </div>
);

function ConceptSection() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", background: "transparent", border: "none",
          borderBottom: `1px solid ${open ? "#1A1814" : "#D4C9B8"}`,
          padding: "0 0 14px 0", cursor: "pointer", textAlign: "left",
          transition: "border-color .2s",
        }}
      >
        <div>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9E9585", marginBottom: 4 }}>
            মূল ধারণা
          </div>
          <div style={{ fontSize: 11, color: "#BFB8AA", fontStyle: "italic" }}>
            Core Concepts from "Your Money or Your Life"
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#9E9585", transition: "transform .3s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0, marginLeft: 16 }}>
          ▾
        </div>
      </button>
      {open && (
        <div style={{ marginTop: 40, animation: "fadeIn .4s ease forwards" }}>
          {CONCEPTS.map((c, i) => (
            <div key={i} style={{ paddingBottom: 36, marginBottom: 36, borderBottom: i < CONCEPTS.length - 1 ? "1px solid #EDE6DA" : "none" }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#D4C9B8", letterSpacing: 2, marginBottom: 12 }}>
                {c.number}
              </div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 17, fontWeight: 600, color: "#1A1814", marginBottom: 4, lineHeight: 1.4 }}>
                {c.bn_title}
              </div>
              <div style={{ fontSize: 11, color: "#BFB8AA", fontStyle: "italic", marginBottom: 14 }}>
                {c.en_title}
              </div>
              <div style={{ fontSize: 14, color: "#4A4238", lineHeight: 1.9, marginBottom: 12 }}>
                {c.bn}
              </div>
              <div style={{ fontSize: 13, color: "#9E9585", lineHeight: 1.85, fontStyle: "italic", paddingLeft: 14, borderLeft: "2px solid #E5DDD0" }}>
                {c.en}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState({
    salary: "", taxAmount: "", bonus: "",
    transport: "", clothing: "", food: "", decompress: "", education: "", other: "",
    hoursPerDay: 8, daysPerMonth: 22, commute: 1.5,
    productName: "", price: "", frequency: "weekly", lifetime: 3, needWant: "want",
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const [seed, setSeed] = useState(0);
  const [shown, setShown] = useState(false);

  const res = useMemo(() => {
    if (!n(form.price) || !n(form.salary)) return null;
    return calculate(form);
  }, [form]);

  const canSubmit = n(form.price) && n(form.salary);

  return (
    <>
      <style>{css}</style>
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: "#9E9585", marginBottom: 14 }}>
            Your Money or Your Life
          </div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 36, fontWeight: 600, lineHeight: 1.2, color: "#1A1814" }}>
            Life Energy<br /><span style={{ fontStyle: "italic", fontWeight: 400 }}>Calculator</span>
          </h1>
          <p style={{ marginTop: 14, fontSize: 15, color: "#6B6356", lineHeight: 1.7, maxWidth: 400 }}>
            প্রতিটি কেনাকাটা শুধু টাকা নয়, <em>জীবনের কিছু ঘণ্টা</em> খরচ করে।{" "}
            <span style={{ color: "#BFB8AA" }}>(Every purchase costs not just money, but hours of your life.)</span>
          </p>
        </div>

        {/* Core Concepts */}
        <ConceptSection />
        <Divider />

        {/* আয় */}
        <SectionTitle bn="আয়" en="Income" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px 32px" }}>
          <div>
            <Label>মাসিক বেতন (Monthly Salary) (৳)</Label>
            <input type="number" value={form.salary} onChange={set("salary")} placeholder="50000" />
          </div>
          <div>
            <Label>মাসিক ট্যাক্স (Monthly Tax) (৳)</Label>
            <Hint>প্রতি মাসে যে পরিমাণ ট্যাক্স কাটা যায় (Tax deducted per month)</Hint>
            <input type="number" value={form.taxAmount} onChange={set("taxAmount")} placeholder="5000" />
          </div>
          <div>
            <Label>বার্ষিক বোনাস (Annual Bonus) (৳)</Label>
            <Hint>বছরে মোট যা পান — মাসিক গড় হিসেবে যোগ হবে (Total yearly bonus, averaged monthly)</Hint>
            <input type="number" value={form.bonus} onChange={set("bonus")} placeholder="0" />
          </div>
        </div>

        <Divider />

        {/* কাজ-সংক্রান্ত খরচ */}
        <SectionTitle bn="কাজ-সংক্রান্ত খরচ" en="Work-Related Expenses" />
        <p style={{ fontSize: 12, color: "#BFB8AA", marginBottom: 28, lineHeight: 1.8, marginTop: -16 }}>
          বেতন মানেই পুরোটা আপনার নয়। কাজে যোগ দিতে গিয়ে যেসব খরচ অনিবার্যভাবে তৈরি হয়, সেগুলো বাদ দিলেই বোঝা যায় — আসলে প্রতি ঘণ্টায় আপনি কতটুকু পাচ্ছেন।{" "}
          <span style={{ color: "#D4C9B8", fontStyle: "italic" }}>(Your salary isn't fully yours. Subtract what you spend just to earn it — that reveals your true hourly wage.)</span>
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px 32px" }}>
          {WORK_COST_FIELDS.map(({ key, label, hint }) => (
            <div key={key}>
              <Label>{label} (৳)</Label>
              <Hint>{hint}</Hint>
              <input type="number" value={form[key]} onChange={set(key)} placeholder="0" />
            </div>
          ))}
        </div>

        <Divider />

        {/* সময় */}
        <SectionTitle bn="সময়" en="Time" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "28px 24px" }}>
          <div>
            <Label>ঘণ্টা/দিন (Hrs/Day)</Label>
            <input type="number" value={form.hoursPerDay} onChange={set("hoursPerDay")} placeholder="8" />
          </div>
          <div>
            <Label>দিন/মাস (Days/Month)</Label>
            <input type="number" value={form.daysPerMonth} onChange={set("daysPerMonth")} placeholder="22" />
          </div>
          <div>
            <Label>যাতায়াত ঘণ্টা/দিন (Commute Hrs/Day)</Label>
            <input type="number" value={form.commute} onChange={set("commute")} placeholder="1.5" />
          </div>
        </div>

        <Divider />

        {/* কেনাকাটা */}
        <SectionTitle bn="কেনাকাটা" en="The Purchase" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px 32px" }}>
          <div>
            <Label>পণ্যের নাম (Product Name)</Label>
            <input type="text" value={form.productName} onChange={set("productName")} placeholder="যেমন: iPhone" />
          </div>
          <div>
            <Label>মূল্য (Price) (৳)</Label>
            <input type="number" value={form.price} onChange={set("price")} placeholder="0" />
          </div>
          <div style={{ position: "relative" }}>
            <Label>ব্যবহারের ঘনত্ব (Usage Frequency)</Label>
            <select value={form.frequency} onChange={set("frequency")}>
              <option value="daily">প্রতিদিন (Daily)</option>
              <option value="weekly">সাপ্তাহিক (Weekly)</option>
              <option value="monthly">মাসিক (Monthly)</option>
              <option value="rarely">কদাচিৎ (Rarely)</option>
            </select>
            <div style={{ position: "absolute", right: 0, bottom: 14, pointerEvents: "none", color: "#9E9585", fontSize: 10 }}>▾</div>
          </div>
          <div>
            <Label>আয়ুষ্কাল (Lifetime) (বছর / Years)</Label>
            <input type="number" value={form.lifetime} onChange={set("lifetime")} placeholder="3" />
          </div>
          <div style={{ position: "relative" }}>
            <Label>প্রয়োজন না শখ? (Need or Want?)</Label>
            <select value={form.needWant} onChange={set("needWant")}>
              <option value="need">আসল প্রয়োজন (Genuine Need)</option>
              <option value="mixed">মাঝামাঝি (Mixed)</option>
              <option value="want">শুধুই চাওয়া (Pure Want)</option>
            </select>
            <div style={{ position: "absolute", right: 0, bottom: 14, pointerEvents: "none", color: "#9E9585", fontSize: 10 }}>▾</div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 48 }}>
          <button
            onClick={() => canSubmit && setShown(true)}
            disabled={!canSubmit}
            style={{
              width: "100%", padding: "16px",
              background: canSubmit ? "#1A1814" : "#D4C9B8",
              color: canSubmit ? "#F7F4EF" : "#9E9585",
              border: "none", borderRadius: 2,
              fontSize: 13, letterSpacing: 1.8, textTransform: "uppercase", fontWeight: 500,
              transition: "background 0.2s",
            }}
          >
            জীবন-শক্তির হিসাব করুন · Calculate Life Energy
          </button>
        </div>

        {/* Results */}
        {res && shown && (() => {
          const name = form.productName || "এই জিনিসটি";
          const yrs  = n(form.lifetime) || 1;

          const fixedThoughts = [
            {
              q:   `আপনি ${fmt(res.lifeHours, 1)} ঘণ্টা কাজ করেছেন এটার জন্য।`,
              en:  `You worked ${fmt(res.lifeHours, 1)} hours for this.`,
              sub: `প্রতিদিন ${n(form.hoursPerDay)} ঘণ্টা করে হিসাব করলে এটা কিনতে আপনার ${fmt(res.lifeDays, 1)}টি কর্মদিবস লেগেছে। (That's ${fmt(res.lifeDays, 1)} full working days.)`,
            },
            {
              q:   `এই ৳${fmt(n(form.price))} বিনিয়োগ করলে ${yrs} বছরে কত হত?`,
              en:  `What if you invested ৳${fmt(n(form.price))} for ${yrs} years instead?`,
              sub: `৫%–৯% বার্ষিক রিটার্নে এই টাকা ৳${fmt(res.oppCostLow, 0)} থেকে ৳${fmt(res.oppCostHigh, 0)} হত। (At 5%–9% annual return over ${yrs} years, this becomes ৳${fmt(res.oppCostLow, 0)} – ৳${fmt(res.oppCostHigh, 0)}.)`,
            },
            {
              q:   "৩০ দিন পরেও কি একইরকম কিনতে চাইবেন?",
              en:  "Would you still want this after 30 days?",
              sub: "আজকের আগ্রহ আর এক মাস পরের আগ্রহ প্রায়ই এক থাকে না। যদি ৩০ দিন পরেও একই উত্তর হয়, তাহলে এটা সত্যিকারের প্রয়োজন। (Desire fades. If you still want it after 30 days, it's likely a real need.)",
            },
            {
              q:   "এটা না কিনলে আপনার জীবন কতটুকু বদলাত?",
              en:  "How much would your life change without this?",
              sub: "যদি উত্তর 'খুব বেশি না' হয়, তাহলে এটা সম্ভবত চাওয়া, প্রয়োজন নয়। চাওয়া ভুল নয় — শুধু সচেতন থাকুন। (If the answer is 'not much', it's likely a want. Wants aren't wrong — just be conscious.)",
            },
          ];

          const extraThoughts = [
            {
              q:   "আপনার কাছে ইতিমধ্যে এরকম কিছু আছে?",
              en:  "Do you already own something similar?",
              sub: "যা আছে সেটা পুরনো বা অপছন্দের হলেও প্রশ্ন করুন — নতুনটা কি সত্যিই ভিন্ন কিছু দেবে, নাকি শুধু নতুন অনুভূতি? (Even if what you have is old, ask — will the new one truly serve you better, or just feel new?)",
            },
            {
              q:   "আপনি কি এটা নিজের জন্য কিনছেন, নাকি অন্যরা কী ভাববে সেটার জন্য?",
              en:  "Are you buying this for yourself, or for how others will perceive you?",
              sub: "গবেষণা বলে, সামাজিক স্বীকৃতির জন্য কেনা জিনিস দীর্ঘমেয়াদে সন্তুষ্টি দেয় না। ব্র্যান্ড ও লোগো সরিয়ে রেখে প্রশ্ন করুন — জিনিসটা কি তখনও একইরকম আকর্ষণীয় লাগছে? (Research shows purchases driven by social signalling rarely bring lasting satisfaction. Strip away the brand — does it still feel worth it?)",
            },
            {
              q:   "এই কেনাকাটা কি আপনার কোনো আসল সমস্যার সমাধান করবে?",
              en:  "Does this purchase solve a real problem you have?",
              sub: "অনেক কেনাকাটা সমস্যা সমাধান করে না, বরং নতুন সমস্যা তৈরি করে — রক্ষণাবেক্ষণ, জায়গা, মনোযোগ। সমস্যাটা আসলে কী, সেটা আগে স্পষ্ট করুন। (Many purchases don't solve problems — they create new ones: maintenance, space, attention. Define the real problem first.)",
            },
            {
              q:   "এক বছর পর কি এই কেনাকাটার কথা মনে থাকবে?",
              en:  "Will this purchase matter to you a year from now?",
              sub: "মানুষ নতুন জিনিসে দ্রুত অভ্যস্ত হয়ে যায় — এটাকে বলে Hedonic Adaptation। আজকে যা উত্তেজনা লাগছে, এক বছর পর সেটা সাধারণ হয়ে যাবে। (Humans adapt quickly to new things — it's called Hedonic Adaptation. What feels exciting today often becomes ordinary within months.)",
            },
            {
              q:   "আপনি কি এখন মানসিক চাপে বা ক্লান্ত অবস্থায় আছেন?",
              en:  "Are you currently stressed or emotionally drained?",
              sub: "গবেষণায় দেখা গেছে মানুষ চাপের মুহূর্তে বেশি কেনাকাটা করে — কারণ এটা সাময়িক স্বস্তি দেয়। কিন্তু সেই স্বস্তি স্থায়ী হয় না, বিল থেকে যায়। (Studies show people spend more when stressed — shopping provides temporary relief. But the relief fades; the bill doesn't.)",
            },
            {
              q:   "সবচেয়ে সস্তায় এই চাহিদা মেটানোর অন্য কোনো উপায় আছে?",
              en:  "Is there a cheaper way to meet the same need?",
              sub: "একই ফলাফল পাওয়ার জন্য সবসময় সবচেয়ে দামি বিকল্পটা লাগে না। ভাড়া, সেকেন্ডহ্যান্ড, বা বিকল্প পণ্য বিবেচনা করেছেন? (The most expensive option isn't always necessary. Have you considered renting, secondhand, or an alternative?)",
            },
            {
              q:   "এই টাকা দিয়ে কোনো অভিজ্ঞতা কিনলে কি বেশি আনন্দ পেতেন?",
              en:  "Would spending this money on an experience bring more joy?",
              sub: "গবেষণা বলে, জিনিস কেনার চেয়ে অভিজ্ঞতা কেনা (ভ্রমণ, শেখা, সময়) দীর্ঘমেয়াদে বেশি সুখ দেয়। (Research consistently shows experiences — travel, learning, time — bring more lasting happiness than possessions.)",
            },
            {
              q:   "আপনার কাছের মানুষ কি এই কেনাকাটাকে যৌক্তিক মনে করবেন?",
              en:  "Would someone who knows you well think this is a rational purchase?",
              sub: "নিজেকে প্রশ্ন করুন: আপনি যদি এই কেনাকাটার কথা কারো কাছে ব্যাখ্যা করতেন, সেটা কি স্বাভাবিক শোনাত? নাকি একটু লুকাতে চাইতেন? (Ask yourself: would you feel comfortable explaining this purchase to someone you respect? Or would you feel the need to justify it?)",
            },
          ];

          const shuffledExtras = [...extraThoughts]
            .map((t, i) => ({ t, sort: Math.sin(seed * 9301 + i * 49297) }))
            .sort((a, b) => a.sort - b.sort)
            .slice(0, 2)
            .map(x => x.t);

          const thoughts = [...fixedThoughts, ...shuffledExtras];

          return (
            <div className="fade-in" style={{ marginTop: 56 }}>
              <div style={{ borderTop: "1px solid #1A1814", paddingTop: 40 }}>

                <ResultRow label="প্রকৃত ঘণ্টা-মজুরি (Real Hourly Wage)" value={`৳${fmt(res.realWage, 2)} / ঘণ্টা`} accent />
                <ResultRow label="জীবন-শক্তির খরচ (Life Energy Cost)" value={`${fmt(res.lifeHours, 1)} ঘণ্টা`} accent />
                <ResultRow label="কার্যদিবস হিসেবে (Working Days)" value={`${fmt(res.lifeDays, 1)} দিন`} />
                <ResultRow
                  label={`সুযোগ-ব্যয় ${yrs} বছরে, ৫%–৯% (Opportunity Cost)`}
                  value={`৳${fmt(res.oppCostLow, 0)} – ৳${fmt(res.oppCostHigh, 0)}`}
                />

                <div style={{ margin: "40px 0 36px", padding: "28px 24px", background: "#EFEBE3", borderRadius: 2 }}>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: 13, color: "#9E9585", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
                    Life Energy Cost
                  </div>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: 42, fontWeight: 600, color: "#1A1814", lineHeight: 1.1 }}>
                    {fmt(res.lifeHours, 1)}
                    <span style={{ fontSize: 18, fontWeight: 400, color: "#9E9585", marginLeft: 8 }}>ঘণ্টা</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#9E9585", marginTop: 10, lineHeight: 1.6 }}>
                    {name}-এর জন্য আপনার জীবন থেকে এতটুকু সময় চলে যাবে।
                  </div>
                  <div style={{ fontSize: 12, color: "#BFB8AA", marginTop: 4, fontStyle: "italic" }}>
                    {fmt(res.lifeHours, 1)} hours of your life will go toward this purchase.
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#9E9585" }}>
                    কেনার আগে ভাবুন · Think Before You Buy
                  </div>
                  <button
                    onClick={() => setSeed(s => s + 1)}
                    style={{ background: "transparent", border: "1px solid #D4C9B8", borderRadius: 2, color: "#9E9585", fontSize: 11, letterSpacing: 1, padding: "5px 12px", textTransform: "uppercase", transition: "all .2s" }}
                    onMouseEnter={e => e.target.style.borderColor = "#1A1814"}
                    onMouseLeave={e => e.target.style.borderColor = "#D4C9B8"}
                  >
                    ↻ নতুন প্রশ্ন
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {thoughts.map((t, i) => (
                    <div key={`${seed}-${i}`} style={{ padding: "20px 0", borderBottom: "1px solid #EDE6DA", animation: "fadeIn .4s ease forwards", opacity: 0, animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}>
                      <div style={{ fontFamily: "'Lora', serif", fontSize: 15, color: "#1A1814", marginBottom: 4, lineHeight: 1.5 }}>{t.q}</div>
                      <div style={{ fontSize: 11, color: "#BFB8AA", marginBottom: 8, fontStyle: "italic" }}>{t.en}</div>
                      <div style={{ fontSize: 13, color: "#9E9585", lineHeight: 1.75 }}>{t.sub}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShown(false)}
                  style={{ marginTop: 40, background: "transparent", border: "none", color: "#9E9585", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", textDecoration: "underline", padding: 0 }}
                >
                  ← ইনপুট পরিবর্তন করুন (Edit Inputs)
                </button>
              </div>
            </div>
          );
        })()}

        {/* কখন ব্যবহার করবেন */}
        <Divider />
        <div style={{ marginTop: 8 }}>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9E9585", marginBottom: 6 }}>
            এই ক্যালকুলেটর কখন ব্যবহার করবেন
          </div>
          <div style={{ fontSize: 11, color: "#BFB8AA", marginBottom: 32, fontStyle: "italic" }}>When to use this calculator</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {USE_CASES.map((u, i) => (
              <div key={i} style={{ padding: "22px 0", borderBottom: i < USE_CASES.length - 1 ? "1px solid #EDE6DA" : "none" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{u.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Lora', serif", fontSize: 14, color: "#1A1814", marginBottom: 6, lineHeight: 1.5 }}>{u.title}</div>
                    <div style={{ fontSize: 13, color: "#9E9585", lineHeight: 1.75 }}>{u.body}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: "1px solid #E5DDD0", textAlign: "center" }}>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 12, color: "#BFB8AA", fontStyle: "italic", lineHeight: 1.8 }}>
            "আপনার টাকা বা আপনার জীবন — দুটো একই জিনিস।"
          </div>
          <div style={{ fontSize: 11, color: "#D4C9B8", marginTop: 4 }}>
            "Your money or your life — they are the same thing." — Vicki Robin
          </div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #EDE6DA" }}>
            <div style={{ fontSize: 11, color: "#BFB8AA", lineHeight: 1.8 }}>
              এই ক্যালকুলেটরের ধারণা <span style={{ color: "#9E9585", fontStyle: "italic" }}>Vicki Robin</span>-এর{" "}
              <span style={{ color: "#9E9585", fontStyle: "italic" }}>Your Money or Your Life</span> বই থেকে অনুপ্রাণিত।
            </div>
            <div style={{ fontSize: 11, color: "#D4C9B8", marginTop: 2, fontStyle: "italic" }}>
              Inspired by the book <em style={{ color: "#BFB8AA" }}>Your Money or Your Life</em> by Vicki Robin.
            </div>
            <div style={{ marginTop: 16, fontSize: 11, color: "#BFB8AA" }}>
              Developed by{" "}
              <span style={{ color: "#9E9585", fontWeight: 500, letterSpacing: 0.5 }}>Md. Nur Uddin Mahmud</span>
            </div>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 16 }}>
              <a href="https://www.linkedin.com/in/nmahmudcu" target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9E9585", textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#1A1814"}
                onMouseLeave={e => e.currentTarget.style.color = "#9E9585"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
              <a href="https://www.facebook.com/ZinQi/" target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9E9585", textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#1A1814"}
                onMouseLeave={e => e.currentTarget.style.color = "#9E9585"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
