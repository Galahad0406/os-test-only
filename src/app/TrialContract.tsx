import { useState } from "react"
import { Check } from "lucide-react"
import {
  AlertModal,
  Card,
  ContractHeader,
  ContractShell,
  FieldRow,
  IOSCheckbox,
  IOSRadio,
  NativeSelect,
  SignatureModal,
  TextArea,
  TextInput,
  formatPhone,
  type AlertState,
} from "./contract-ui"

const LIABILITY_WAIVER =
  "The Member understands and agrees that strict observation of the rules and regulations relative to training, including the use of protective equipment, is required and that the use of facilities and the Member's presence at the school are at the sole risk of the Member. It is understood and agreed by the Member that Martial Arts involves defensive and offensive skills and training which include violent and sudden movements and that is connection with training and instruction sessions, there will be physical contact between instructors and Member and between and among the Members themselves and that such contact may result in personal injury despite the best intentions and following adequate precautions. The Members agrees that the School and its instructors, agents, employees, operators and authorized representatives, shall not be responsible for and are hereby released from and liability, claim, loss, including loss of property, damage, personal injury, or expense incurred by a Member or anyone claiming through a Member, or related to any activity connected with the School including, but not limited to, any caused by the negligence or gross negligence of the School or tis instructors, Members, agents, employees, operators, or authorized representatives."

const PROGRAMS = [
  { value: "Little Tigers", label: "Little Tigers", sub: "4-5 Years" },
  { value: "Children", label: "Children", sub: "6-12 Years" },
  { value: "Teens/Adults", label: "Teens/Adults", sub: "" },
]

export default function TrialContract({ onBack }: { onBack: () => void }) {
  const [studentName, setStudentName] = useState("")
  const [studentGender, setStudentGender] = useState("")
  const [studentDob, setStudentDob] = useState("")
  const [studentAge, setStudentAge] = useState("")
  const [medicalInfo, setMedicalInfo] = useState("")

  const [parentName, setParentName] = useState("")
  const [cellPhone, setCellPhone] = useState("")
  const [parentEmail, setParentEmail] = useState("")
  const [address, setAddress] = useState("")

  const [selectedProgram, setSelectedProgram] = useState("")
  const [discoverySource, setDiscoverySource] = useState("")

  const [photoConsent, setPhotoConsent] = useState(false)
  const [agreeCheck, setAgreeCheck] = useState(false)

  const [showSigModal, setShowSigModal] = useState(false)
  const [signatureData, setSignatureData] = useState("")
  const [showSignatureArea, setShowSignatureArea] = useState(false)

  const [alert, setAlert] = useState<AlertState | null>(null)
  const showAlert = (title: string, message: string, variant: AlertState["variant"] = "warn") =>
    setAlert({ title, message, variant })

  const [submitting, setSubmitting] = useState(false)

  // agreeCheck onchange logic (unchanged from source): require Name + Program before signing.
  const handleAgreeChange = (checked: boolean) => {
    if (checked) {
      if (!parentName || !selectedProgram) {
        showAlert("Notice", "Please fill in Name and Program first.", "warn")
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
    const payload = {
      studentName,
      gender: studentGender,
      dob: studentDob,
      age: studentAge,
      medical: medicalInfo,
      parentName,
      phone: cellPhone,
      email: parentEmail,
      address,
      program: selectedProgram,
      source: discoverySource,
      photoConsent,
      dateSigned: displayDate,
    }

    // Validation (unchanged): required student name, parent name, phone, program.
    if (!payload.studentName || !payload.parentName || !payload.phone || !payload.program) {
      showAlert("Error", "Please fill in all required (*) fields.", "error")
      return
    }

    setSubmitting(true)
    if (typeof (window as any).google !== "undefined" && (window as any).google?.script) {
      ;(window as any).google.script.run
        .withSuccessHandler(() => {
          showAlert("Success", "Registration Submitted!", "success")
        })
        .withFailureHandler((err: { message: string }) => {
          showAlert("Error", err.message, "error")
          setSubmitting(false)
        })
        .processContract(payload, signatureData)
    } else {
      console.log("Payload:", payload)
      showAlert("Success", "Registration Submitted!", "success")
      setSubmitting(false)
    }
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

      <ContractHeader title="Free Trial Class Sign-Up Form" subtitle="Complete the form to reserve your free trial class" />

      {/* Liability Waiver & Release */}
      <Card className="mb-6">
        <div className="px-4 py-4 bg-[#FFF1F0] border-b border-[#FFD8D6]">
          <p className="text-[13px] font-semibold text-[#FF3B30] mb-2">Liability Waiver &amp; Release</p>
          <p className="text-[13px] text-[#3A3A3C] leading-relaxed">{LIABILITY_WAIVER}</p>
        </div>
      </Card>

      {/* Student Information */}
      <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider px-1 mb-2">Student Information</p>
      <Card className="mb-6">
        <FieldRow label="Student Full Name" required>
          <TextInput value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Name" />
        </FieldRow>
        <div className="flex border-b border-[#F2F2F7]">
          <div className="flex-1 px-4 py-3 border-r border-[#F2F2F7]">
            <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">
              Gender<span className="text-[#FF3B30]">*</span>
            </p>
            <NativeSelect value={studentGender} onChange={(e) => setStudentGender(e.target.value)}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </NativeSelect>
          </div>
          <div className="flex-1 px-4 py-3">
            <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">
              Current Age<span className="text-[#FF3B30]">*</span>
            </p>
            <TextInput
              value={studentAge}
              onChange={(e) => setStudentAge(e.target.value.replace(/\D/g, "").substring(0, 2))}
              placeholder="Age"
              inputMode="numeric"
              maxLength={2}
            />
          </div>
        </div>
        <FieldRow label="Date of Birth" required>
          <input
            type="date"
            value={studentDob}
            onChange={(e) => setStudentDob(e.target.value)}
            className="w-full text-[15px] text-[#1D1D1F] bg-transparent outline-none"
          />
        </FieldRow>
        <FieldRow label="Medical Conditions / Allergies" last>
          <TextArea rows={2} value={medicalInfo} onChange={(e) => setMedicalInfo(e.target.value)} placeholder="Any medical concerns?" />
        </FieldRow>
      </Card>

      {/* Parent / Guardian Information */}
      <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider px-1 mb-2">Parent / Guardian Information</p>
      <Card className="mb-6">
        <FieldRow label="Guardian Full Name" required>
          <TextInput value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Full Name" />
        </FieldRow>
        <div className="flex border-b border-[#F2F2F7]">
          <div className="flex-1 px-4 py-3 border-r border-[#F2F2F7]">
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
          <div className="flex-1 px-4 py-3">
            <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">
              Email Address<span className="text-[#FF3B30]">*</span>
            </p>
            <TextInput
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
        </div>
        <FieldRow label="Home Address" last>
          <TextInput value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street Address, City, State, Zip" />
        </FieldRow>
      </Card>

      {/* Class Selection */}
      <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider px-1 mb-2">Class Selection</p>
      <Card className="mb-6">
        <FieldRow label="Select Program" required>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {PROGRAMS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setSelectedProgram(p.value)}
                className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border text-center transition-all ${
                  selectedProgram === p.value ? "bg-[#EBF5FF] border-[#0071E3]/25" : "bg-[#F5F5F7] border-transparent"
                }`}
              >
                <span className={`text-[14px] font-semibold ${selectedProgram === p.value ? "text-[#0071E3]" : "text-[#1D1D1F]"}`}>
                  {p.label}
                </span>
                {p.sub && <span className="text-[11px] text-[#6E6E73]">{p.sub}</span>}
              </button>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="How did you hear about us?" last>
          <NativeSelect value={discoverySource} onChange={(e) => setDiscoverySource(e.target.value)}>
            <option value="">Please select</option>
            <option value="Google/Search">Google / Web Search</option>
            <option value="Social Media">Social Media (FB/IG)</option>
            <option value="Friend/Referral">Friend / Referral</option>
            <option value="Flyer/Signage">Flyer / Signage</option>
            <option value="Other">Other</option>
          </NativeSelect>
        </FieldRow>
      </Card>

      {/* Consents */}
      <Card className="mb-6">
        <div
          onClick={() => setPhotoConsent(!photoConsent)}
          className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors border-b border-[#F2F2F7] ${
            photoConsent ? "bg-[#F0FFF4]" : "hover:bg-[#FAFAFA]"
          }`}
        >
          <div className="mt-0.5">
            <IOSCheckbox checked={photoConsent} onChange={setPhotoConsent} />
          </div>
          <span className="text-[14px] text-[#1D1D1F] leading-relaxed">
            I consent to the use of photos/videos of the student for Dynamic Taekwondo&apos;s marketing purposes. (Optional)
          </span>
        </div>
        <div
          onClick={() => handleAgreeChange(!agreeCheck)}
          className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors ${agreeCheck ? "bg-[#EBF5FF]" : "hover:bg-[#FAFAFA]"}`}
        >
          <div
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              agreeCheck ? "border-[#0071E3] bg-[#0071E3]" : "border-[#C7C7CC] bg-white"
            }`}
          >
            {agreeCheck && <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
          </div>
          <span className="text-[14px] text-[#1D1D1F] leading-relaxed">
            <strong>(Required)</strong> I have read and agree to the Liability Waiver and Release of Liability.{" "}
            <span className="text-[#FF3B30]">*</span>
          </span>
        </div>
      </Card>

      {showSignatureArea && signatureData && (
        <Card className="mb-6 p-6 text-center">
          <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider mb-4">Parent/Guardian Signature</p>
          <img
            src={signatureData || "/placeholder.svg"}
            alt="Verified signature"
            className="border border-[#D2D2D7] rounded-xl w-full max-w-[400px] mx-auto bg-white"
          />
          <div className="flex justify-between max-w-[400px] mx-auto mt-3 text-[13px] text-[#6E6E73]">
            <span>
              Name: <span className="font-medium text-[#1D1D1F]">{parentName || "———"}</span>
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
            {submitting ? "Submitting…" : "Submit Registration"}
          </button>
        </Card>
      )}
    </ContractShell>
  )
}
