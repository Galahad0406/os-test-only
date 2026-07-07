import { useState, useRef, useEffect } from "react"
import { Check, Lock, Unlock, ChevronLeft } from "lucide-react"

interface Member {
  name: string; school: string; grade: string;
  gender: string; dobMm: string; dobDd: string; dobYyyy: string;
}

interface PaymentInfo {
  type: string; details: string;
  ccNum?: string; ccExp?: string; ccCvv?: string; ccZip?: string; ccName?: string;
  achBank?: string; achRouting?: string; achAcc?: string; achName?: string;
}

interface AlertState {
  title: string; message: string; variant: "warn" | "error" | "success";
}

const EMPTY_MEMBER: Member = { name: "", school: "", grade: "", gender: "", dobMm: "", dobDd: "", dobYyyy: "" };

function getAdminPassword(): string {
  const today = new Date();
  const startDate = new Date("2026-04-06");
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / 86400000);
  return diffDays >= 365 ? "0406" : "0000";
}

function formatPhone(val: string): string {
  const digits = val.replace(/\D/g, "");
  const m = digits.match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
  if (!m) return val;
  return !m[2] ? m[1] : m[1] + "-" + m[2] + (m[3] ? "-" + m[3] : "");
}

function getCardType(num: string): string {
  const first = num.replace(/\s/g, "").charAt(0);
  if (first === "4") return "VISA";
  if (first === "5") return "MC";
  if (first === "3") return "AMEX";
  if (first === "6") return "DISCOVER";
  return "";
}

function IOSCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center cursor-pointer transition-all ${
        checked ? "bg-[#34C759] border-[#34C759]" : "bg-white border-[#C7C7CC]"
      }`}
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </div>
  );
}

function IOSRadio({ checked }: { checked: boolean }) {
  return (
    <div className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all ${
      checked ? "border-[#0071E3]" : "border-[#C7C7CC]"
    }`}>
      {checked && <div className="w-2.5 h-2.5 rounded-full bg-[#0071E3]" />}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider px-1 mb-2">{children}</p>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-black/[0.06] ${className}`}>
      {children}
    </div>
  );
}

function FieldRow({ label, required, last, children }: { label?: string; required?: boolean; last?: boolean; children: React.ReactNode }) {
  return (
    <div className={`px-4 py-3 ${!last ? "border-b border-[#F2F2F7]" : ""}`}>
      {label && (
        <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">
          {label}{required && <span className="text-[#FF3B30] ml-0.5">*</span>}
        </p>
      )}
      {children}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-transparent outline-none"
    />
  );
}

function NativeSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full text-[15px] text-[#1D1D1F] bg-transparent outline-none appearance-none"
    />
  );
}

function AlertModal({ alert, onClose }: { alert: AlertState; onClose: () => void }) {
  const colors = {
    warn: { bg: "bg-[#FF9500]/10", text: "text-[#FF9500]", icon: "⚠" },
    error: { bg: "bg-[#FF3B30]/10", text: "text-[#FF3B30]", icon: "✕" },
    success: { bg: "bg-[#34C759]/10", text: "text-[#34C759]", icon: "✓" },
  }[alert.variant];
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-4`}>
          <span className={`text-xl font-bold ${colors.text}`}>{colors.icon}</span>
        </div>
        <h3 className="text-[17px] font-semibold text-[#1D1D1F] text-center mb-2">{alert.title}</h3>
        <p className="text-[15px] text-[#6E6E73] text-center mb-5 leading-relaxed">{alert.message}</p>
        <button onClick={onClose} className="w-full py-3 bg-[#0071E3] text-white rounded-xl text-[15px] font-semibold">OK</button>
      </div>
    </div>
  );
}

function SignatureModal({ onConfirm, onCancel }: { onConfirm: (data: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#1D1D1F";

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy };
    };
    const start = (e: MouseEvent | TouchEvent) => {
      isDrawing.current = true;
      const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y);
      if ("cancelable" in e && e.cancelable) e.preventDefault();
    };
    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;
      const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke();
      if ("cancelable" in e && e.cancelable) e.preventDefault();
    };
    const stop = () => { isDrawing.current = false; };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", stop);
    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", stop);
    };
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setError("");
  };

  const confirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blank = document.createElement("canvas");
    blank.width = canvas.width; blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) { setError("Please provide your signature."); return; }
    onConfirm(canvas.toDataURL());
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-[#F2F2F7] flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-semibold text-[#1D1D1F]">Digital Signature</h3>
            <p className="text-[13px] text-[#6E6E73] mt-0.5">Sign using finger, stylus, or mouse</p>
          </div>
        </div>
        <div className="p-5">
          <canvas
            ref={canvasRef}
            width={460}
            height={180}
            className="w-full rounded-xl border border-dashed border-[#C7C7CC] bg-[#FAFAFA] cursor-crosshair"
            style={{ touchAction: "none" }}
          />
          {error && <p className="text-[13px] text-[#FF3B30] mt-1.5">{error}</p>}
          <button onClick={clear} className="mt-2 text-[13px] text-[#0071E3]">Clear</button>
        </div>
        <div className="px-5 pb-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3.5 rounded-xl border border-[#D2D2D7] text-[#1D1D1F] text-[15px] font-medium">Cancel</button>
          <button onClick={confirm} className="flex-1 py-3.5 rounded-xl bg-[#0071E3] text-white text-[15px] font-semibold">Confirm</button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({
  type, onConfirm, onCancel
}: {
  type: "cc" | "ach";
  onConfirm: (info: PaymentInfo) => void;
  onCancel: () => void;
}) {
  const [ccNum, setCcNum] = useState("");
  const [ccExp, setCcExp] = useState("");
  const [ccCvv, setCcCvv] = useState("");
  const [ccZip, setCcZip] = useState("");
  const [ccName, setCcName] = useState("");
  const [achBank, setAchBank] = useState("");
  const [achRouting, setAchRouting] = useState("");
  const [achAcc, setAchAcc] = useState("");
  const [achName, setAchName] = useState("");
  const [error, setError] = useState("");

  const fieldCls = "w-full px-4 py-3 bg-[#F5F5F7] rounded-xl text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition";

  const confirm = () => {
    if (type === "cc") {
      if (!ccNum || ccExp.length < 4 || ccCvv.length < 3 || !ccName) { setError("Please complete all card fields."); return; }
      onConfirm({ type: "Credit Card", details: ccNum, ccNum, ccExp, ccCvv, ccZip, ccName });
    } else {
      if (!achBank || !achRouting || !achAcc) { setError("Please complete all ACH fields."); return; }
      onConfirm({ type: "Bank Account (ACH)", details: achBank, achBank, achRouting, achAcc, achName });
    }
  };

  const cardType = getCardType(ccNum);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-[#F2F2F7]">
          <h3 className="text-[17px] font-semibold text-[#1D1D1F]">
            {type === "cc" ? "Card Information" : "Bank Account (ACH)"}
          </h3>
        </div>
        <div className="p-5 space-y-3">
          {type === "cc" ? (
            <>
              <div>
                <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">
                  Card Number {cardType && <span className="text-[#0071E3] normal-case font-semibold">{cardType}</span>}
                </label>
                <input value={ccNum} onChange={e => setCcNum(e.target.value.replace(/\D/g,"").substring(0,16).replace(/(.{4})/g,"$1 ").trim())} placeholder="0000 0000 0000 0000" inputMode="numeric" className={fieldCls} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">Expiry</label>
                  <input value={ccExp} onChange={e => setCcExp(e.target.value.replace(/\D/g,"").substring(0,4))} placeholder="MMYY" inputMode="numeric" className={fieldCls} />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">CVV</label>
                  <input value={ccCvv} onChange={e => setCcCvv(e.target.value.replace(/\D/g,"").substring(0,4))} placeholder="CVV" inputMode="numeric" className={fieldCls} />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">ZIP</label>
                  <input value={ccZip} onChange={e => setCcZip(e.target.value.replace(/\D/g,"").substring(0,5))} placeholder="00000" inputMode="numeric" className={fieldCls} />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">Cardholder</label>
                  <input value={ccName} onChange={e => setCcName(e.target.value)} placeholder="Full Name" className={fieldCls} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">Bank Name</label>
                <input value={achBank} onChange={e => setAchBank(e.target.value)} placeholder="Bank Name" className={fieldCls} />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">Routing Number</label>
                <input value={achRouting} onChange={e => setAchRouting(e.target.value.replace(/\D/g,""))} placeholder="Routing Number" inputMode="numeric" className={fieldCls} />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">Account Number</label>
                <input value={achAcc} onChange={e => setAchAcc(e.target.value.replace(/\D/g,""))} placeholder="Account Number" inputMode="numeric" className={fieldCls} />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">Account Holder</label>
                <input value={achName} onChange={e => setAchName(e.target.value)} placeholder="Full Name" className={fieldCls} />
              </div>
            </>
          )}
          {error && <p className="text-[13px] text-[#FF3B30]">{error}</p>}
        </div>
        <div className="px-5 pb-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3.5 rounded-xl border border-[#D2D2D7] text-[#1D1D1F] text-[15px] font-medium">Cancel</button>
          <button onClick={confirm} className="flex-1 py-3.5 rounded-xl bg-[#0071E3] text-white text-[15px] font-semibold">Save</button>
        </div>
      </div>
    </div>
  );
}

function MemberSection({ index, member, onChange }: {
  index: number;
  member: Member;
  onChange: (field: keyof Member, val: string) => void;
}) {
  const req = index === 0;
  return (
    <div className="mb-6">
      <SectionLabel>
        Member {index + 1}{" "}
        {req ? <span className="text-[#FF3B30]">*</span> : <span className="text-[#AEAEB2] normal-case font-normal">(Optional)</span>}
      </SectionLabel>
      <Card>
        <FieldRow label="Name" required={req}>
          <TextInput value={member.name} onChange={e => onChange("name", e.target.value)} placeholder="Full Name" />
        </FieldRow>
        <FieldRow label="School" required={req}>
          <TextInput value={member.school} onChange={e => onChange("school", e.target.value)} placeholder="School Name" />
        </FieldRow>
        <div className="flex border-b border-[#F2F2F7]">
          <div className="flex-1 px-4 py-3 border-r border-[#F2F2F7]">
            <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">Grade{req && <span className="text-[#FF3B30]">*</span>}</p>
            <TextInput value={member.grade} onChange={e => onChange("grade", e.target.value)} placeholder="Grade" />
          </div>
          <div className="flex-1 px-4 py-3">
            <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">Gender{req && <span className="text-[#FF3B30]">*</span>}</p>
            <NativeSelect value={member.gender} onChange={e => onChange("gender", e.target.value)}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </NativeSelect>
          </div>
        </div>
        <FieldRow label="Date of Birth" required={req} last>
          <div className="flex gap-2">
            <input value={member.dobMm} onChange={e => onChange("dobMm", e.target.value.replace(/\D/g,"").substring(0,2))} placeholder="MM" inputMode="numeric" maxLength={2} className="flex-1 text-center text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-[#F5F5F7] rounded-xl py-2.5 outline-none" />
            <input value={member.dobDd} onChange={e => onChange("dobDd", e.target.value.replace(/\D/g,"").substring(0,2))} placeholder="DD" inputMode="numeric" maxLength={2} className="flex-1 text-center text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-[#F5F5F7] rounded-xl py-2.5 outline-none" />
            <input value={member.dobYyyy} onChange={e => onChange("dobYyyy", e.target.value.replace(/\D/g,"").substring(0,4))} placeholder="YYYY" inputMode="numeric" maxLength={4} className="flex-[2] text-center text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-[#F5F5F7] rounded-xl py-2.5 outline-none" />
          </div>
        </FieldRow>
      </Card>
    </div>
  );
}

function DatePair({ startId, endId, startVal, endVal, onStart, onEnd }: {
  startId: string; endId: string; startVal: string; endVal: string;
  onStart: (v: string) => void; onEnd: (v: string) => void;
}) {
  return (
    <div className="flex border-b border-[#F2F2F7]">
      <div className="flex-1 px-4 py-3 border-r border-[#F2F2F7]">
        <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">Start Date<span className="text-[#FF3B30]">*</span></p>
        <input type="date" id={startId} value={startVal} onChange={e => onStart(e.target.value)} className="w-full text-[15px] text-[#1D1D1F] bg-transparent outline-none" />
      </div>
      <div className="flex-1 px-4 py-3">
        <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">End Date<span className="text-[#FF3B30]">*</span></p>
        <input type="date" id={endId} value={endVal} onChange={e => onEnd(e.target.value)} className="w-full text-[15px] text-[#1D1D1F] bg-transparent outline-none" />
      </div>
    </div>
  );
}

export default function AfterschoolContract({ onBack }: { onBack: () => void }) {
  const [buyerName, setBuyerName] = useState("");
  const [address, setAddress] = useState("");
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [emailOther, setEmailOther] = useState("");
  const [cellPhone, setCellPhone] = useState("");

  const [members, setMembers] = useState<Member[]>([
    { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }
  ]);
  const updateMember = (i: number, field: keyof Member, val: string) =>
    setMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));

  const [programOpt, setProgramOpt] = useState("");
  const [beforeSchool1, setBeforeSchool1] = useState(false);
  const [startDate1, setStartDate1] = useState("");
  const [endDate1, setEndDate1] = useState("");
  const [enrollCheck1, setEnrollCheck1] = useState(false);
  const [summerCheck1, setSummerCheck1] = useState(false);
  const [deposit1, setDeposit1] = useState("");

  const [programOptAlt, setProgramOptAlt] = useState("");
  const [beforeSchool2, setBeforeSchool2] = useState(false);
  const [startDate2, setStartDate2] = useState("");
  const [endDate2, setEndDate2] = useState("");
  const [enrollCheck2, setEnrollCheck2] = useState(false);
  const [summerCheck2, setSummerCheck2] = useState(false);
  const [deposit2, setDeposit2] = useState("");

  const [termStart, setTermStart] = useState("");
  const [termEnd, setTermEnd] = useState("");

  const [adminPwInput, setAdminPwInput] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminError, setAdminError] = useState(false);

  const [payAmount, setPayAmount] = useState("");
  const [payType, setPayType] = useState<"cc" | "ach" | "">("");
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPayType, setPendingPayType] = useState<"cc" | "ach">("cc");

  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [otherChecks, setOtherChecks] = useState([false, false, false, false, false]);
  const toggleOther = (i: number) => setOtherChecks(prev => prev.map((c, idx) => idx === i ? !c : c));

  const [agreeCheck, setAgreeCheck] = useState(false);
  const [showSigModal, setShowSigModal] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const [showSignatureArea, setShowSignatureArea] = useState(false);

  const [alert, setAlert] = useState<AlertState | null>(null);
  const showAlert = (title: string, message: string, variant: AlertState["variant"] = "warn") =>
    setAlert({ title, message, variant });

  const [submitting, setSubmitting] = useState(false);

  const unlockAdmin = () => {
    if (adminPwInput === getAdminPassword()) { setAdminUnlocked(true); setAdminError(false); }
    else { setAdminError(true); }
  };

  const handlePaymentTypeClick = (type: "cc" | "ach") => {
    if (!payAmount || parseFloat(payAmount) <= 0) {
      showAlert("Notice", "Please enter the weekly payment amount first.");
      return;
    }
    setPendingPayType(type);
    setShowPaymentModal(true);
  };

  const validate = (): boolean => {
    if (!buyerName) { showAlert("Required", "Please enter Parent/Guardian Full Name"); return false; }
    if (!address) { showAlert("Required", "Please enter Mailing Address"); return false; }
    const domain = emailDomain === "other" ? emailOther : emailDomain;
    if (!emailId || !domain) { showAlert("Required", "Please complete Email Address"); return false; }
    if (!cellPhone) { showAlert("Required", "Please enter Cell Phone"); return false; }
    if (!members[0].name) { showAlert("Required", "Please enter Member 1 Name"); return false; }
    if (!members[0].school) { showAlert("Required", "Please enter Member 1 School"); return false; }
    if (!members[0].grade) { showAlert("Required", "Please enter Member 1 Grade"); return false; }
    if (!members[0].gender) { showAlert("Required", "Please select Member 1 Gender"); return false; }
    if (!members[0].dobMm || !members[0].dobDd || !members[0].dobYyyy) {
      showAlert("Required", "Please complete Member 1 Date of Birth"); return false;
    }
    if (!termStart || !termEnd) { showAlert("Required", "Please select Membership Term dates"); return false; }
    if (!paymentInfo) { showAlert("Required", "Staff must complete Payment details"); return false; }
    if (!otherChecks.every(c => c)) { showAlert("Required", "Please review and check all agreement boxes"); return false; }
    if (!hasReadTerms) { showAlert("Required", "Please scroll through the Terms and Conditions to the bottom"); return false; }
    return true;
  };

  const handleAgreeChange = (checked: boolean) => {
    if (checked) {
      if (validate()) { setAgreeCheck(true); setShowSigModal(true); }
    } else {
      setAgreeCheck(false); setShowSignatureArea(false); setSignatureData("");
    }
  };

  const handleSubmit = () => {
    const domainPart = emailDomain === "other" ? emailOther : emailDomain;
    const payload = {
      buyer: buyerName, address, email: `${emailId}@${domainPart}`, phone: cellPhone,
      term: `${termStart} ~ ${termEnd}`,
      paymentTerm: `payments of $${payAmount}`,
      paymentType: paymentInfo?.type, paymentDetail: paymentInfo?.details, paymentInfo,
      members: members.filter(m => m.name).map(m => ({
        name: m.name, gender: m.gender, school: m.school, grade: m.grade,
        dob: m.dobMm && m.dobDd && m.dobYyyy ? `${m.dobYyyy}-${m.dobMm}-${m.dobDd}` : "",
      })),
      dateSigned: new Date().toLocaleDateString(),
    };
    setSubmitting(true);
    if (typeof (window as any).google !== "undefined" && (window as any).google?.script) {
      (window as any).google.script.run
        .withSuccessHandler(() => {
          showAlert("Submitted!", "Agreement has been submitted successfully.", "success");
          (window as any).google.script.run.withSuccessHandler((url: string) => { window.top!.location.href = url; }).getServiceUrl();
        })
        .withFailureHandler((err: { message: string }) => {
          showAlert("Error", err.message, "error"); setSubmitting(false);
        })
        .processContract(payload, signatureData);
    } else {
      console.log("Payload:", payload);
      showAlert("Submitted!", "Offline mode — data logged to console.", "success");
      setSubmitting(false);
    }
  };

  const today = new Date();
  const displayDate = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}.`;

  const TIER_OPTIONS = ["Diamond", "Platinum", "Gold", "Silver"];
  const ALT_OPTIONS = [
    { value: "Opt1", label: "After School Only" },
    { value: "Opt2", label: "After School Only — Part Time" },
    { value: "Opt3", label: "Summer Camp Only" },
  ];

  const AGREEMENT_TEXTS = [
    "Every student will receive their required sparring gear at yellow belt testing. I agree for Dynamic Taekwondo to automatically charge my account on file $299 upon receipt of sparring gear. AND I agree for Dynamic Taekwondo to automatically charge test fees with my account on file if not eligible.",
    "$69 testing fee for belt white through brown stripe, $99 for all red belts. BLACK BELT testing fee is NOT included. There is a $10 make-up fee if unable to attend group testing date.",
    "Annual renewal fee of $250.00 upon contract renewal. Renewal — no changes.",
    "Before School Care Program — ALL STUDENTS MUST ARRIVE NO LATER THAN 8:15am. We DEPART AT 8:30am — No exceptions. DAT will close at 8:30am.",
    "At least 1 hour notice MUST be reported to DAT (via DAT Class Dojo app and/or email: leesdynamic@gmail.com) for ALL ABSENCES and/or schedule changes. A $10.00 SERVICE FEE will automatically be charged to account on file for failure to notify DAT.",
  ];

  const TERMS_SECTIONS = [
    { title: "Health and Safety", body: "Buyer(s) certify that the Member(s) listed on the first page of this Agreement are in good health and are able to safely participate in taekwondo classes. Buyer(s) represent that he/she/they have had an opportunity to observe the program and the Member(s) have had an opportunity to participate in the program prior to the signing of this Agreement and Member(s) are physically and mentally fit to participate in the program selected. The Buyer(s) and Member(s) understand that strict observance of the rules relative to training, including the use of protective equipment, is required. Any health issue, injury, communicable disease or any other health related concern or condition whatsoever incurred by the Member for any reason is at the sole risk of the member. Dynamic Taekwondo Inc., its owners, instructors, operators, employees, and authorized representatives shall not be responsible for and are hereby released from any liability or claim related to any activity connected to the program, courses or use of the facility." },
    { title: "Additional Fees", body: "The Member(s) shall take belt promotion tests upon recommendation by Dynamic Taekwondo staff and, unless expressly included in the membership option selected, uniforms, seminars, special activities, testings, tournaments, belts and equipment are an additional charge and are not included in the terms of this Agreement." },
    { title: "Right of Cancellation", body: "This Agreement may be cancelled by Buyer(s) without penalty only: (1) if notice of cancellation is provided to Dynamic Taekwondo Inc. in writing within 3 business days of signing this Agreement; (2) upon death, disability or long-term illness of the Member(s) that would prevent participation in taekwondo classes when documented in writing by a physician or with a death certificate; (3) if the enrollee moves more than 25 miles from this or any other Dynamic Taekwondo facility and provides written proof of such move. The buyer(s) may cancel this agreement for other reasons only upon payment of a cancellation fee of 50% of remaining balance. At least 30 days notice must be provided to stop scheduled automatic debits." },
    { title: "Pay Simple Authorization and Cancellation", body: "Buyer(s) hereby authorize the automatic debit of Buyers' credit card or checking account as set forth on the first page of this Agreement. The authorization for automatic debits shall remain in full force and effect through the date set forth on the first date of this Agreement. The automatic debits will not be stopped sooner unless and until the Buyer(s) provide 30 days written notice to Pay Simple to cancel." },
    { title: "Holds", body: "This Agreement may be placed on hold for an agreed upon period only with the written consent of Dynamic Taekwondo Inc. During a hold the Buyer(s) will not be charged for Course Fees while the hold is in place but, unless the parties otherwise agree in writing, the term of the Agreement will be automatically extended for the length of the hold." },
    { title: "Unavailability", body: "In the event the school or its facilities are unavailable for use due to damage or loss by fire, accident, act of God, pandemic or any other cause, this Agreement will remain binding and classes and class schedules will be modified and/or temporarily suspended at Dynamic Taekwondo's discretion." },
    { title: "Scheduling / Contact", body: "Dynamic Taekwondo Inc. agrees to furnish the Member with qualified instructors to teach and supervise classes, practice sessions and contests. Scheduling and content of classes and programs and furnishing of facilities and instructors are at the sole discretion of Dynamic Taekwondo Inc. and are subject to change from time-to-time upon notice posted at the facility." },
    { title: "Default", body: "The non-payment of scheduled payments for 7 days past the due date for summer camp, winter camp or the before/after school program, or for 30 days past the due date for other courses or programs, shall constitute a default under this Agreement. Upon non-payment the membership shall be suspended until payments are brought current." },
    { title: "Non-use", body: "The failure or inability of the Member to use the facilities, class or services of the School for any reason, will neither relieve nor suspend the Member's obligation to make all the payments required under this Agreement on a timely basis, nor entitle the Member to a refund or credit of Course Fees." },
    { title: "Disability", body: "The Member may extend the term of the Agreement at no additional cost for a period equal to the duration of a disability that precludes the Member from using one-third or more of the facilities for less than 6 months, verified by a physician. The Member or legal representative may cancel the Agreement if the Member dies or becomes permanently disabled." },
  ];

  return (
    <div
      className="min-h-screen bg-[#F5F5F7] pb-20"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}
    >
      {alert && <AlertModal alert={alert} onClose={() => setAlert(null)} />}
      {showSigModal && (
        <SignatureModal
          onConfirm={data => { setSignatureData(data); setShowSigModal(false); setShowSignatureArea(true); }}
          onCancel={() => { setShowSigModal(false); setAgreeCheck(false); }}
        />
      )}
      {showPaymentModal && (
        <PaymentModal
          type={pendingPayType}
          onConfirm={info => { setPaymentInfo(info); setPayType(pendingPayType); setShowPaymentModal(false); }}
          onCancel={() => { setShowPaymentModal(false); setPayType(""); }}
        />
      )}

      {/* Back nav */}
      <div className="sticky top-0 z-40 bg-[#F5F5F7]/80 border-b border-black/[0.06]" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="max-w-[680px] mx-auto px-4 h-12 flex items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-[#0071E3] text-[15px] font-medium hover:opacity-70 transition-opacity"
          >
            <ChevronLeft size={18} />
            Registration Hub
          </button>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4 pt-10">
        <div className="text-center mb-12">
          <img
            src="https://drive.google.com/thumbnail?id=19-CrdwmMjHxwV0zVxu57qQcuyEYwQmUv&sz=w500"
            alt="Dynamic Afterschool Logo"
            className="h-20 w-auto mx-auto mb-6"
          />
          <h1 className="text-[32px] font-semibold text-[#1D1D1F] tracking-tight leading-tight">
            Dynamic Afterschool<br />Agreement
          </h1>
          <p className="text-[17px] text-[#6E6E73] mt-3">Please complete all required fields to enroll</p>
        </div>

        <SectionLabel>Parent / Guardian Information <span className="text-[#FF3B30]">*</span></SectionLabel>
        <Card className="mb-6">
          <FieldRow label="Full Name" required>
            <TextInput value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Full Name" />
          </FieldRow>
          <FieldRow label="Mailing Address" required>
            <TextInput value={address} onChange={e => setAddress(e.target.value)} placeholder="Full Address" />
          </FieldRow>
          <FieldRow label="Email Address" required>
            <div className="flex items-center gap-2">
              <TextInput value={emailId} onChange={e => setEmailId(e.target.value)} placeholder="Username" className="!w-auto flex-1" />
              <span className="text-[15px] text-[#AEAEB2] select-none">@</span>
              {emailDomain !== "other" ? (
                <NativeSelect value={emailDomain} onChange={e => { setEmailDomain(e.target.value); if (e.target.value !== "other") setEmailOther(""); }} className="!w-auto flex-1">
                  <option value="" disabled>Domain</option>
                  <option value="gmail.com">gmail.com</option>
                  <option value="outlook.com">outlook.com</option>
                  <option value="icloud.com">icloud.com</option>
                  <option value="yahoo.com">yahoo.com</option>
                  <option value="hotmail.com">hotmail.com</option>
                  <option value="other">Other…</option>
                </NativeSelect>
              ) : (
                <TextInput value={emailOther} onChange={e => setEmailOther(e.target.value)} placeholder="domain.com" autoFocus className="!w-auto flex-1" />
              )}
            </div>
          </FieldRow>
          <FieldRow label="Cell Phone" required last>
            <TextInput value={cellPhone} onChange={e => setCellPhone(formatPhone(e.target.value))} placeholder="000-000-0000" inputMode="numeric" maxLength={12} />
          </FieldRow>
        </Card>

        {[0, 1, 2, 3].map(i => (
          <MemberSection key={i} index={i} member={members[i]} onChange={(f, v) => updateMember(i, f, v)} />
        ))}

        <SectionLabel>Program Selection <span className="text-[#FF3B30]">*</span></SectionLabel>
        <Card className="mb-3">
          <div className="px-4 py-4 border-b border-[#F2F2F7]">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {TIER_OPTIONS.map(opt => (
                <label key={opt} onClick={() => setProgramOpt(opt)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${programOpt === opt ? "bg-[#EBF5FF] border-[#0071E3]/25" : "bg-[#F5F5F7] border-transparent"}`}>
                  <IOSRadio checked={programOpt === opt} />
                  <span className={`text-[15px] font-medium ${programOpt === opt ? "text-[#0071E3]" : "text-[#1D1D1F]"}`}>{opt}</span>
                </label>
              ))}
            </div>
            <label onClick={() => setBeforeSchool1(!beforeSchool1)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${beforeSchool1 ? "bg-[#FFF1F0] border-[#FF3B30]/20" : "bg-[#F5F5F7] border-transparent"}`}>
              <IOSCheckbox checked={beforeSchool1} onChange={setBeforeSchool1} />
              <span className={`text-[15px] font-semibold ${beforeSchool1 ? "text-[#FF3B30]" : "text-[#6E6E73]"}`}>+ Before School</span>
            </label>
          </div>
          <DatePair startId="sd1" endId="ed1" startVal={startDate1} endVal={endDate1} onStart={setStartDate1} onEnd={setEndDate1} />
          <FieldRow>
            <label className="flex items-start gap-3 cursor-pointer" onClick={() => setEnrollCheck1(!enrollCheck1)}>
              <IOSCheckbox checked={enrollCheck1} onChange={setEnrollCheck1} />
              <span className="text-[15px] text-[#1D1D1F] leading-snug">Enrollment fee (non-refundable): <strong>$250</strong> per member</span>
            </label>
          </FieldRow>
          <FieldRow>
            <label className="flex items-start gap-3 cursor-pointer" onClick={() => setSummerCheck1(!summerCheck1)}>
              <IOSCheckbox checked={summerCheck1} onChange={setSummerCheck1} />
              <span className="text-[15px] text-[#1D1D1F] leading-snug">Summer camp activity fee (non-refundable): <strong>$250</strong> per member</span>
            </label>
          </FieldRow>
          <FieldRow label="First Week Deposit Required" last>
            <div className="flex justify-end">
              <input type="number" value={deposit1} onChange={e => setDeposit1(e.target.value)} placeholder="$0.00" inputMode="decimal" className="text-right text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-[#F5F5F7] rounded-xl px-4 py-2 outline-none w-36" />
            </div>
          </FieldRow>
        </Card>

        <Card className="mb-6">
          <div className="px-4 py-4 border-b border-[#F2F2F7]">
            <div className="flex flex-col gap-2 mb-3">
              {ALT_OPTIONS.map(opt => (
                <label key={opt.value} onClick={() => setProgramOptAlt(opt.value)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${programOptAlt === opt.value ? "bg-[#EBF5FF] border-[#0071E3]/25" : "bg-[#F5F5F7] border-transparent"}`}>
                  <IOSRadio checked={programOptAlt === opt.value} />
                  <span className={`text-[15px] font-medium ${programOptAlt === opt.value ? "text-[#0071E3]" : "text-[#1D1D1F]"}`}>{opt.label}</span>
                </label>
              ))}
            </div>
            <label onClick={() => setBeforeSchool2(!beforeSchool2)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${beforeSchool2 ? "bg-[#FFF1F0] border-[#FF3B30]/20" : "bg-[#F5F5F7] border-transparent"}`}>
              <IOSCheckbox checked={beforeSchool2} onChange={setBeforeSchool2} />
              <span className={`text-[15px] font-semibold ${beforeSchool2 ? "text-[#FF3B30]" : "text-[#6E6E73]"}`}>+ Before School</span>
            </label>
          </div>
          <DatePair startId="sd2" endId="ed2" startVal={startDate2} endVal={endDate2} onStart={setStartDate2} onEnd={setEndDate2} />
          <FieldRow>
            <label className="flex items-start gap-3 cursor-pointer" onClick={() => setEnrollCheck2(!enrollCheck2)}>
              <IOSCheckbox checked={enrollCheck2} onChange={setEnrollCheck2} />
              <span className="text-[15px] text-[#1D1D1F] leading-snug">Enrollment fee (non-refundable): <strong>$250</strong> per member</span>
            </label>
          </FieldRow>
          <FieldRow>
            <label className="flex items-start gap-3 cursor-pointer" onClick={() => setSummerCheck2(!summerCheck2)}>
              <IOSCheckbox checked={summerCheck2} onChange={setSummerCheck2} />
              <span className="text-[15px] text-[#1D1D1F] leading-snug">Summer camp activity fee (non-refundable): <strong>$250</strong> per member</span>
            </label>
          </FieldRow>
          <FieldRow label="First Week Deposit Required" last>
            <div className="flex justify-end">
              <input type="number" value={deposit2} onChange={e => setDeposit2(e.target.value)} placeholder="$0.00" inputMode="decimal" className="text-right text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-[#F5F5F7] rounded-xl px-4 py-2 outline-none w-36" />
            </div>
          </FieldRow>
        </Card>

        <SectionLabel>Membership Term</SectionLabel>
        <Card className="mb-6">
          <div className="flex">
            <div className="flex-1 px-4 py-3 border-r border-[#F2F2F7]">
              <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">Start Date<span className="text-[#FF3B30]">*</span></p>
              <input type="date" value={termStart} onChange={e => setTermStart(e.target.value)} className="w-full text-[15px] text-[#1D1D1F] bg-transparent outline-none" />
            </div>
            <div className="flex-1 px-4 py-3">
              <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">End Date<span className="text-[#FF3B30]">*</span></p>
              <input type="date" value={termEnd} onChange={e => setTermEnd(e.target.value)} className="w-full text-[15px] text-[#1D1D1F] bg-transparent outline-none" />
            </div>
          </div>
        </Card>

        <SectionLabel>Staff Only</SectionLabel>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-dashed border-[#0071E3]/30 mb-6">
          {!adminUnlocked ? (
            <div className="px-6 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EBF5FF] flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-[#0071E3]" />
              </div>
              <p className="text-[17px] font-semibold text-[#1D1D1F] mb-1">Staff Only Section</p>
              <p className="text-[13px] text-[#6E6E73] mb-6">Enter password to configure Payment Schedule &amp; Method</p>
              <div className="flex gap-2 justify-center max-w-[260px] mx-auto">
                <input
                  type="password"
                  value={adminPwInput}
                  onChange={e => { setAdminPwInput(e.target.value); setAdminError(false); }}
                  onKeyDown={e => e.key === "Enter" && unlockAdmin()}
                  placeholder="Password"
                  inputMode="numeric"
                  className={`flex-1 px-4 py-2.5 rounded-xl text-[15px] outline-none border transition ${adminError ? "border-[#FF3B30] bg-[#FFF1F0]" : "border-[#D2D2D7] bg-[#F5F5F7]"}`}
                />
                <button onClick={unlockAdmin} className="px-5 py-2.5 bg-[#0071E3] text-white rounded-xl text-[15px] font-medium">
                  Unlock
                </button>
              </div>
              {adminError && <p className="text-[13px] text-[#FF3B30] mt-2">Incorrect password</p>}
            </div>
          ) : (
            <div>
              <div className="px-4 py-4 border-b border-[#F2F2F7]">
                <div className="flex items-center gap-2 mb-3">
                  <Unlock className="w-4 h-4 text-[#0071E3]" />
                  <p className="text-[11px] font-semibold text-[#0071E3] uppercase tracking-wider">Payment Schedule</p>
                </div>
                {programOpt ? (
                  <div className="bg-[#F5F5F7] rounded-xl p-4 text-[15px] text-[#1D1D1F] leading-relaxed">
                    You have selected the{" "}
                    <span className="text-[#0071E3] font-semibold">{programOpt}</span> program.
                    The weekly payment due is $
                    <input
                      type="number"
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      placeholder="0.00"
                      inputMode="decimal"
                      className="inline-block w-24 mx-1 border-b-2 border-[#0071E3] bg-transparent outline-none text-[15px] font-semibold text-[#0071E3] text-center"
                    />
                    . I hereby agree that Dynamic Afterschool may charge the payment source on file for all fees incurred.
                  </div>
                ) : (
                  <p className="text-[15px] text-[#AEAEB2] italic">Please select a program above to see payment terms.</p>
                )}
              </div>
              <div className="px-4 py-4">
                <p className="text-[11px] font-semibold text-[#0071E3] uppercase tracking-wider mb-3">Payment Method</p>
                <p className="text-[13px] text-[#6E6E73] mb-3">Select payment type to enter details:</p>
                <div className="flex flex-col gap-2 mb-4">
                  {[{ value: "cc" as const, label: "Credit Card" }, { value: "ach" as const, label: "Bank Account (ACH)" }].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handlePaymentTypeClick(opt.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${payType === opt.value ? "bg-[#EBF5FF] border-[#0071E3]/25" : "bg-[#F5F5F7] border-transparent"}`}
                    >
                      <IOSRadio checked={payType === opt.value} />
                      <span className={`text-[15px] font-medium ${payType === opt.value ? "text-[#0071E3]" : "text-[#1D1D1F]"}`}>{opt.label}</span>
                    </button>
                  ))}
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${paymentInfo ? "bg-[#F0FFF4] border-[#34C759]/20" : "bg-[#F5F5F7] border-transparent"}`}>
                  <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center ${paymentInfo ? "bg-[#34C759] border-[#34C759]" : "bg-white border-[#C7C7CC]"}`}>
                    {paymentInfo && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-[15px] ${paymentInfo ? "text-[#1D1D1F] font-medium" : "text-[#6E6E73]"}`}>
                    {paymentInfo ? `Setup Complete — ${paymentInfo.type}` : "Payment details required"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <SectionLabel>Main Terms and Conditions</SectionLabel>
        <Card className="mb-6">
          <div className="px-4 pt-3 flex justify-end">
            {hasReadTerms
              ? <span className="text-[12px] text-[#34C759] font-medium">✓ Reviewed</span>
              : <span className="text-[12px] text-[#AEAEB2]">Scroll to the bottom</span>
            }
          </div>
          <div
            className="px-4 pb-4 h-60 overflow-y-auto text-[13px] text-[#3A3A3C] leading-relaxed"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#D2D2D7 transparent" }}
            onScroll={e => {
              const el = e.currentTarget;
              if (Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 5) setHasReadTerms(true);
            }}
          >
            <p className="text-[12px] font-bold text-[#FF3B30] leading-snug mb-4 uppercase">
              This agreement is a contract between you and Dynamic Taekwondo, Inc. By signing the membership agreement you are agreeing to the following terms and conditions. The person signing this agreement acknowledges that he/she is signing both on behalf of himself/herself and as parent or guardian on behalf of the persons listed as members.
            </p>
            {TERMS_SECTIONS.map(({ title, body }) => (
              <div key={title} className="mb-4">
                <p className="font-semibold text-[#1D1D1F] mb-1">{title}</p>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </Card>

        <SectionLabel>Additional Agreements</SectionLabel>
        <Card className="mb-6">
          {AGREEMENT_TEXTS.map((text, i) => (
            <div
              key={i}
              onClick={() => toggleOther(i)}
              className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors ${i < AGREEMENT_TEXTS.length - 1 ? "border-b border-[#F2F2F7]" : ""} ${otherChecks[i] ? "bg-[#F0FFF4]" : "hover:bg-[#FAFAFA]"}`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${otherChecks[i] ? "bg-[#34C759] border-[#34C759]" : "bg-white border-[#C7C7CC]"}`}>
                {otherChecks[i] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className="text-[14px] text-[#1D1D1F] leading-relaxed">{text}</span>
            </div>
          ))}
        </Card>

        <Card className="mb-6">
          <div
            onClick={() => handleAgreeChange(!agreeCheck)}
            className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors ${agreeCheck ? "bg-[#EBF5FF]" : "hover:bg-[#FAFAFA]"}`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${agreeCheck ? "border-[#0071E3] bg-[#0071E3]" : "border-[#C7C7CC] bg-white"}`}>
              {agreeCheck && <Check className="w-4 h-4 text-white" strokeWidth={2.5} />}
            </div>
            <span className="text-[15px] font-medium text-[#1D1D1F]">
              I have reviewed and agree to ALL terms and conditions.
            </span>
          </div>
        </Card>

        {showSignatureArea && signatureData && (
          <Card className="mb-6 p-6 text-center">
            <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider mb-4">Signature (Verified)</p>
            <img
              src={signatureData}
              alt="Verified signature"
              className="border border-[#D2D2D7] rounded-xl w-full max-w-[400px] mx-auto bg-white"
            />
            <div className="flex justify-between max-w-[400px] mx-auto mt-3 text-[13px] text-[#6E6E73]">
              <span>Name: <span className="font-medium text-[#1D1D1F]">{buyerName || "———"}</span></span>
              <span>Date: <span className="font-medium text-[#1D1D1F]">{displayDate}</span></span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-6 w-full max-w-[400px] mx-auto block py-4 bg-[#0071E3] hover:bg-[#0077ED] active:bg-[#006CD6] text-white rounded-2xl text-[17px] font-semibold disabled:opacity-50 transition-colors"
            >
              {submitting ? "Submitting…" : "Submit Agreement"}
            </button>
          </Card>
        )}
      </div>
    </div>
  );
}
