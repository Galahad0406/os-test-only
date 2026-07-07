import { useState, useRef, useEffect } from "react"
import { Check, ChevronLeft } from "lucide-react"

/* ----------------------------------------------------------------------------
 * Shared iOS-style UI primitives.
 * These match the design of AfterschoolContract.tsx exactly so that every
 * contract in the app shares one visual language.
 * -------------------------------------------------------------------------- */

export const LOGO_URL =
  "https://drive.google.com/thumbnail?id=19-CrdwmMjHxwV0zVxu57qQcuyEYwQmUv&sz=w500"

export interface PaymentInfo {
  type: string
  details: string
  ccNum?: string
  ccExp?: string
  ccCvv?: string
  ccZip?: string
  ccName?: string
  achBank?: string
  achRouting?: string
  achAcc?: string
  achName?: string
}

export interface AlertState {
  title: string
  message: string
  variant: "warn" | "error" | "success"
}

export function getAdminPassword(): string {
  const today = new Date()
  const startDate = new Date("2026-04-06")
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / 86400000)
  return diffDays >= 365 ? "0406" : "0000"
}

export function formatPhone(val: string): string {
  const digits = val.replace(/\D/g, "")
  const m = digits.match(/(\d{0,3})(\d{0,3})(\d{0,4})/)
  if (!m) return val
  return !m[2] ? m[1] : m[1] + "-" + m[2] + (m[3] ? "-" + m[3] : "")
}

export function getCardType(num: string): string {
  const first = num.replace(/\s/g, "").charAt(0)
  if (first === "4") return "VISA"
  if (first === "5") return "MC"
  if (first === "3") return "AMEX"
  if (first === "6") return "DISCOVER"
  return ""
}

export function IOSCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center cursor-pointer transition-all ${
        checked ? "bg-[#34C759] border-[#34C759]" : "bg-white border-[#C7C7CC]"
      }`}
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </div>
  )
}

export function IOSRadio({ checked }: { checked: boolean }) {
  return (
    <div
      className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all ${
        checked ? "border-[#0071E3]" : "border-[#C7C7CC]"
      }`}
    >
      {checked && <div className="w-2.5 h-2.5 rounded-full bg-[#0071E3]" />}
    </div>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider px-1 mb-2">{children}</p>
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-black/[0.06] ${className}`}>
      {children}
    </div>
  )
}

export function FieldRow({
  label,
  required,
  last,
  children,
}: {
  label?: string
  required?: boolean
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={`px-4 py-3 ${!last ? "border-b border-[#F2F2F7]" : ""}`}>
      {label && (
        <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">
          {label}
          {required && <span className="text-[#FF3B30] ml-0.5">*</span>}
        </p>
      )}
      {children}
    </div>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-transparent outline-none ${props.className ?? ""}`}
    />
  )
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-transparent outline-none resize-none ${props.className ?? ""}`}
    />
  )
}

export function NativeSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full text-[15px] text-[#1D1D1F] bg-transparent outline-none appearance-none ${props.className ?? ""}`}
    />
  )
}

export function AlertModal({ alert, onClose }: { alert: AlertState; onClose: () => void }) {
  const colors = {
    warn: { bg: "bg-[#FF9500]/10", text: "text-[#FF9500]", icon: "⚠" },
    error: { bg: "bg-[#FF3B30]/10", text: "text-[#FF3B30]", icon: "✕" },
    success: { bg: "bg-[#34C759]/10", text: "text-[#34C759]", icon: "✓" },
  }[alert.variant]
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-4`}>
          <span className={`text-xl font-bold ${colors.text}`}>{colors.icon}</span>
        </div>
        <h3 className="text-[17px] font-semibold text-[#1D1D1F] text-center mb-2">{alert.title}</h3>
        <p className="text-[15px] text-[#6E6E73] text-center mb-5 leading-relaxed">{alert.message}</p>
        <button onClick={onClose} className="w-full py-3 bg-[#0071E3] text-white rounded-xl text-[15px] font-semibold">
          OK
        </button>
      </div>
    </div>
  )
}

export function SignatureModal({ onConfirm, onCancel }: { onConfirm: (data: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "#1D1D1F"

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const sx = canvas.width / rect.width,
        sy = canvas.height / rect.height
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY
      return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy }
    }
    const start = (e: MouseEvent | TouchEvent) => {
      isDrawing.current = true
      const p = getPos(e)
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      if ("cancelable" in e && e.cancelable) e.preventDefault()
    }
    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return
      const p = getPos(e)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
      if ("cancelable" in e && e.cancelable) e.preventDefault()
    }
    const stop = () => {
      isDrawing.current = false
    }

    canvas.addEventListener("mousedown", start)
    canvas.addEventListener("mousemove", move)
    window.addEventListener("mouseup", stop)
    canvas.addEventListener("touchstart", start, { passive: false })
    canvas.addEventListener("touchmove", move, { passive: false })
    canvas.addEventListener("touchend", stop)
    return () => {
      canvas.removeEventListener("mousedown", start)
      canvas.removeEventListener("mousemove", move)
      window.removeEventListener("mouseup", stop)
      canvas.removeEventListener("touchstart", start)
      canvas.removeEventListener("touchmove", move)
      canvas.removeEventListener("touchend", stop)
    }
  }, [])

  const clear = () => {
    const canvas = canvasRef.current
    if (canvas) canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height)
    setError("")
  }

  const confirm = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const blank = document.createElement("canvas")
    blank.width = canvas.width
    blank.height = canvas.height
    if (canvas.toDataURL() === blank.toDataURL()) {
      setError("Please provide your signature.")
      return
    }
    onConfirm(canvas.toDataURL())
  }

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
          <button onClick={clear} className="mt-2 text-[13px] text-[#0071E3]">
            Clear
          </button>
        </div>
        <div className="px-5 pb-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3.5 rounded-xl border border-[#D2D2D7] text-[#1D1D1F] text-[15px] font-medium">
            Cancel
          </button>
          <button onClick={confirm} className="flex-1 py-3.5 rounded-xl bg-[#0071E3] text-white text-[15px] font-semibold">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export function PaymentModal({
  type,
  onConfirm,
  onCancel,
}: {
  type: "cc" | "ach"
  onConfirm: (info: PaymentInfo) => void
  onCancel: () => void
}) {
  const [ccNum, setCcNum] = useState("")
  const [ccExp, setCcExp] = useState("")
  const [ccCvv, setCcCvv] = useState("")
  const [ccZip, setCcZip] = useState("")
  const [ccName, setCcName] = useState("")
  const [achBank, setAchBank] = useState("")
  const [achRouting, setAchRouting] = useState("")
  const [achAcc, setAchAcc] = useState("")
  const [achName, setAchName] = useState("")
  const [error, setError] = useState("")

  const fieldCls =
    "w-full px-4 py-3 bg-[#F5F5F7] rounded-xl text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition"

  const confirm = () => {
    if (type === "cc") {
      if (!ccNum || ccExp.length < 4 || ccCvv.length < 3 || !ccName) {
        setError("Please complete all card fields.")
        return
      }
      onConfirm({ type: "Credit Card", details: ccNum, ccNum, ccExp, ccCvv, ccZip, ccName })
    } else {
      if (!achBank || !achRouting || !achAcc) {
        setError("Please complete all ACH fields.")
        return
      }
      onConfirm({ type: "Bank Account (ACH)", details: achBank, achBank, achRouting, achAcc, achName })
    }
  }

  const cardType = getCardType(ccNum)

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
                <input
                  value={ccNum}
                  onChange={(e) => setCcNum(e.target.value.replace(/\D/g, "").substring(0, 16).replace(/(.{4})/g, "$1 ").trim())}
                  placeholder="0000 0000 0000 0000"
                  inputMode="numeric"
                  className={fieldCls}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">Expiry</label>
                  <input
                    value={ccExp}
                    onChange={(e) => setCcExp(e.target.value.replace(/\D/g, "").substring(0, 4))}
                    placeholder="MMYY"
                    inputMode="numeric"
                    className={fieldCls}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">CVV</label>
                  <input
                    value={ccCvv}
                    onChange={(e) => setCcCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                    placeholder="CVV"
                    inputMode="numeric"
                    className={fieldCls}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">ZIP</label>
                  <input
                    value={ccZip}
                    onChange={(e) => setCcZip(e.target.value.replace(/\D/g, "").substring(0, 5))}
                    placeholder="00000"
                    inputMode="numeric"
                    className={fieldCls}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">Cardholder</label>
                  <input value={ccName} onChange={(e) => setCcName(e.target.value)} placeholder="Full Name" className={fieldCls} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">Bank Name</label>
                <input value={achBank} onChange={(e) => setAchBank(e.target.value)} placeholder="Bank Name" className={fieldCls} />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">Routing Number</label>
                <input
                  value={achRouting}
                  onChange={(e) => setAchRouting(e.target.value.replace(/\D/g, ""))}
                  placeholder="Routing Number"
                  inputMode="numeric"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">Account Number</label>
                <input
                  value={achAcc}
                  onChange={(e) => setAchAcc(e.target.value.replace(/\D/g, ""))}
                  placeholder="Account Number"
                  inputMode="numeric"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide block mb-1.5">Account Holder</label>
                <input value={achName} onChange={(e) => setAchName(e.target.value)} placeholder="Full Name" className={fieldCls} />
              </div>
            </>
          )}
          {error && <p className="text-[13px] text-[#FF3B30]">{error}</p>}
        </div>
        <div className="px-5 pb-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3.5 rounded-xl border border-[#D2D2D7] text-[#1D1D1F] text-[15px] font-medium">
            Cancel
          </button>
          <button onClick={confirm} className="flex-1 py-3.5 rounded-xl bg-[#0071E3] text-white text-[15px] font-semibold">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export function BackBar({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div
      className="sticky top-0 z-40 bg-[#F5F5F7]/80 border-b border-black/[0.06]"
      style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
      <div className="max-w-[680px] mx-auto px-4 h-12 flex items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[#0071E3] text-[15px] font-medium hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={18} />
          {label}
        </button>
      </div>
    </div>
  )
}

export function ContractHeader({ title, subtitle }: { title: React.ReactNode; subtitle: string }) {
  return (
    <div className="text-center mb-12">
      <img src={LOGO_URL || "/placeholder.svg"} alt="Dynamic Taekwondo Logo" className="h-20 w-auto mx-auto mb-6" />
      <h1 className="text-[32px] font-semibold text-[#1D1D1F] tracking-tight leading-tight">{title}</h1>
      <p className="text-[17px] text-[#6E6E73] mt-3">{subtitle}</p>
    </div>
  )
}

export function ContractShell({ backLabel, onBack, children }: { backLabel: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[#F5F5F7] pb-20"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}
    >
      <BackBar label={backLabel} onBack={onBack} />
      <div className="max-w-[680px] mx-auto px-4 pt-10">{children}</div>
    </div>
  )
}
