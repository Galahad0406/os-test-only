import { useState } from "react"
import { Check } from "lucide-react"
import {
  AlertModal,
  Card,
  ContractHeader,
  ContractShell,
  FieldRow,
  IOSRadio,
  NativeSelect,
  PaymentModal,
  SignatureModal,
  TextInput,
  formatPhone,
  type AlertState,
  type PaymentInfo,
} from "./contract-ui"

export default function InformationChangeContract({ onBack }: { onBack: () => void }) {
  const [studentName, setStudentName] = useState("")
  const [buyerName, setBuyerName] = useState("")
  const [cellPhone, setCellPhone] = useState("")
  const [emailId, setEmailId] = useState("")
  const [emailDomain, setEmailDomain] = useState("")
  const [emailOther, setEmailOther] = useState("")

  const [changeType, setChangeType] = useState<"payment" | "contact">("payment")

  const [payType, setPayType] = useState<"cc" | "ach" | "">("")
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingPayType, setPendingPayType] = useState<"cc" | "ach">("cc")

  const [agreeCheck, setAgreeCheck] = useState(false)
  const [showSigModal, setShowSigModal] = useState(false)
  const [signatureData, setSignatureData] = useState("")
  const [showSignatureArea, setShowSignatureArea] = useState(false)

  const [alert, setAlert] = useState<AlertState | null>(null)
  const showAlert = (title: string, message: string, variant: AlertState["variant"] = "warn") =>
    setAlert({ title, message, variant })

  const [submitting, setSubmitting] = useState(false)

  // handlePaymentSelection (unchanged): opens the payment detail modal.
  const handlePaymentSelection = (type: "cc" | "ach") => {
    setPendingPayType(type)
    setShowPaymentModal(true)
  }

  // agreeCheck onchange logic (unchanged): require Buyer Name before signing.
  const handleAgreeChange = (checked: boolean) => {
    if (checked) {
      if (!buyerName) {
        showAlert("Warning", "Please enter Buyer Name first", "warn")
        return
      }
      setShowSigModal(true)
    } else {
      setAgreeCheck(false)
      setShowSignatureArea(false)
      setSignatureData("")
    }
  }

  const handleSubmit = () => {
    const domainPart = emailDomain === "other" ? emailOther : emailDomain
    const payload = {
      student: studentName,
      buyer: buyerName,
      phone: cellPhone,
      email: `${emailId}@${domainPart}`,
      paymentType: paymentInfo ? paymentInfo.type : "Contact Update Only",
      dateSigned: displayDate,
    }
    setSubmitting(true)
    console.log("Submitting:", payload)
    showAlert("Success", "Payment method change requested.", "success")
    setSubmitting(false)
  }

  const today = new Date()
  const displayDate = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}.`

  return (
    <ContractShell backLabel="Registration Hub" onBack={onBack}>
      {alert && <AlertModal alert={alert} onClose={() => setAlert(null)} />}
      {showSigModal && (
        <SignatureModal
          onConfirm={(data) => {
            setSignatureData(data)
            setShowSigModal(false)
            setAgreeCheck(true)
            setShowSignatureArea(true)
          }}
          onCancel={() => {
            setShowSigModal(false)
            setAgreeCheck(false)
          }}
        />
      )}
      {showPaymentModal && (
        <PaymentModal
          type={pendingPayType}
          onConfirm={(info) => {
            setPaymentInfo(info)
            setPayType(pendingPayType)
            setShowPaymentModal(false)
          }}
          onCancel={() => {
            setShowPaymentModal(false)
          }}
        />
      )}

      <ContractHeader title="Payment Method Change Form" subtitle="Update your billing information on file" />

      {/* Notice */}
      <Card className="mb-6">
        <div className="px-4 py-4">
          <p className="text-[13px] text-[#3A3A3C] leading-relaxed">
            <span className="font-semibold text-[#1D1D1F]">Notice:</span> Please complete this form to update your billing information.
            Changes will be applied to your next billing cycle.
          </p>
        </div>
      </Card>

      {/* Member Information */}
      <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider px-1 mb-2">Member Information</p>
      <Card className="mb-6">
        <FieldRow label="Student Name(s)" required>
          <TextInput value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter student name(s)" />
        </FieldRow>
        <div className="flex border-b border-[#F2F2F7]">
          <div className="flex-1 px-4 py-3 border-r border-[#F2F2F7]">
            <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">
              Buyer Name<span className="text-[#FF3B30]">*</span>
            </p>
            <TextInput value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Full Name" />
          </div>
          <div className="flex-1 px-4 py-3">
            <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">
              Cell Phone<span className="text-[#FF3B30]">*</span>
            </p>
            <TextInput
              value={cellPhone}
              onChange={(e) => setCellPhone(formatPhone(e.target.value))}
              placeholder="000-000-0000"
              inputMode="numeric"
              maxLength={12}
            />
          </div>
        </div>
        <FieldRow label="Email Address" required last>
          <div className="flex items-center gap-2">
            <TextInput value={emailId} onChange={(e) => setEmailId(e.target.value)} placeholder="Username" className="!w-auto flex-1" />
            <span className="text-[15px] text-[#AEAEB2] select-none">@</span>
            {emailDomain !== "other" ? (
              <NativeSelect
                value={emailDomain}
                onChange={(e) => {
                  setEmailDomain(e.target.value)
                  if (e.target.value !== "other") setEmailOther("")
                }}
                className="!w-auto flex-1"
              >
                <option value="" disabled>
                  Select Domain
                </option>
                <option value="gmail.com">gmail.com</option>
                <option value="outlook.com">outlook.com</option>
                <option value="icloud.com">icloud.com</option>
                <option value="other">Other (Direct Input)</option>
              </NativeSelect>
            ) : (
              <TextInput value={emailOther} onChange={(e) => setEmailOther(e.target.value)} placeholder="domain.com" autoFocus className="!w-auto flex-1" />
            )}
          </div>
        </FieldRow>
      </Card>

      {/* Change Request Details */}
      <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider px-1 mb-2">Change Request Details</p>
      <Card className="mb-6">
        <div className="px-4 py-4 border-b border-[#F2F2F7]">
          <p className="text-[13px] font-semibold text-[#1D1D1F] mb-3">What information would you like to update?</p>
          <div className="flex flex-col gap-2">
            <label
              onClick={() => setChangeType("payment")}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                changeType === "payment" ? "bg-[#EBF5FF] border-[#0071E3]/25" : "bg-[#F5F5F7] border-transparent"
              }`}
            >
              <IOSRadio checked={changeType === "payment"} />
              <span className={`text-[15px] font-medium ${changeType === "payment" ? "text-[#0071E3]" : "text-[#1D1D1F]"}`}>
                Update Payment Method (Card/Bank)
              </span>
            </label>
            <label
              onClick={() => setChangeType("contact")}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                changeType === "contact" ? "bg-[#EBF5FF] border-[#0071E3]/25" : "bg-[#F5F5F7] border-transparent"
              }`}
            >
              <IOSRadio checked={changeType === "contact"} />
              <span className={`text-[15px] font-medium ${changeType === "contact" ? "text-[#0071E3]" : "text-[#1D1D1F]"}`}>
                Update Contact Info (Phone/Email)
              </span>
            </label>
          </div>
        </div>
        <div className="px-4 py-4">
          <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-2">
            Select New Payment Method<span className="text-[#FF3B30]">*</span>
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {[
              { value: "cc" as const, label: "Credit Card" },
              { value: "ach" as const, label: "Bank Account (ACH)" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handlePaymentSelection(opt.value)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  payType === opt.value ? "bg-[#EBF5FF] border-[#0071E3]/25" : "bg-[#F5F5F7] border-transparent"
                }`}
              >
                <IOSRadio checked={payType === opt.value} />
                <span className={`text-[15px] font-medium ${payType === opt.value ? "text-[#0071E3]" : "text-[#1D1D1F]"}`}>{opt.label}</span>
              </button>
            ))}
          </div>
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              paymentInfo ? "bg-[#F0FFF4] border-[#34C759]/20" : "bg-[#F5F5F7] border-transparent"
            }`}
          >
            <div
              className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center ${
                paymentInfo ? "bg-[#34C759] border-[#34C759]" : "bg-white border-[#C7C7CC]"
              }`}
            >
              {paymentInfo && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            <span className={`text-[15px] ${paymentInfo ? "text-[#1D1D1F] font-medium" : "text-[#6E6E73]"}`}>
              {paymentInfo ? `New Method: ${paymentInfo.type} Selected (${paymentInfo.details})` : "Status: No new method selected"}
            </span>
          </div>
        </div>
      </Card>

      {/* Authorization */}
      <Card className="mb-6">
        <div
          onClick={() => handleAgreeChange(!agreeCheck)}
          className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors ${agreeCheck ? "bg-[#EBF5FF]" : "hover:bg-[#FAFAFA]"}`}
        >
          <div
            className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              agreeCheck ? "border-[#0071E3] bg-[#0071E3]" : "border-[#C7C7CC] bg-white"
            }`}
          >
            {agreeCheck && <Check className="w-4 h-4 text-white" strokeWidth={2.5} />}
          </div>
          <span className="text-[14px] text-[#1D1D1F] leading-relaxed">
            I hereby authorize Dynamic Taekwondo to update my billing information as provided above. I understand that my future tuition
            payments will be processed using this new method.
          </span>
        </div>
      </Card>

      {showSignatureArea && signatureData && (
        <Card className="mb-6 p-6 text-center">
          <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider mb-4">Authorized Signature</p>
          <img
            src={signatureData || "/placeholder.svg"}
            alt="Verified signature"
            className="border border-[#D2D2D7] rounded-xl w-full max-w-[400px] mx-auto bg-white"
          />
          <div className="flex justify-between max-w-[400px] mx-auto mt-3 text-[13px] text-[#6E6E73]">
            <span>
              Name: <span className="font-medium text-[#1D1D1F]">{buyerName || "———"}</span>
            </span>
            <span>
              Date: <span className="font-medium text-[#1D1D1F]">{displayDate}</span>
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-6 w-full max-w-[400px] mx-auto block py-4 bg-[#0071E3] hover:bg-[#0077ED] active:bg-[#006CD6] text-white rounded-2xl text-[17px] font-semibold disabled:opacity-50 transition-colors"
          >
            {submitting ? "Processing…" : "Submit Changes"}
          </button>
        </Card>
      )}
    </ContractShell>
  )
}
