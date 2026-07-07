import { useState } from "react"
import { Check, Lock, Unlock } from "lucide-react"
import {
  AlertModal,
  Card,
  ContractHeader,
  ContractShell,
  FieldRow,
  IOSRadio,
  NativeSelect,
  PaymentModal,
  SectionLabel,
  SignatureModal,
  TextInput,
  formatPhone,
  getAdminPassword,
  type AlertState,
  type PaymentInfo,
} from "./contract-ui"

interface Member {
  name: string
  category: string
  gender: string
  dobMm: string
  dobDd: string
  dobYyyy: string
}

const EMPTY_MEMBER: Member = { name: "", category: "", gender: "", dobMm: "", dobDd: "", dobYyyy: "" }

const CATEGORY_OPTIONS = ["Tiny Tiger", "Children", "Teen/Adult"]

const AGREEMENT_TEXTS = [
  "Every student will receive their required sparring gear at yellow belt testing. I agree for Dynamic Taekwondo to automatically charge my account on file $299 upon receipt of sparring gear. AND I agree for Dynamic Taekwondo automatically charge test fees with my account on file if not eligible.",
  "$69 testing fee for belt white through brown stripe, $99 for all red belts. BLACK BELT testing fee is NOT included. There is a $10 make up fee if unable to attend group testing date.",
  "Registration Fee: $150.00 per member mandatory one time registration fee will be charged with first month's tuition.",
  "Automatic Renewal: This contract will automatically renew unless written notice is given to Dynamic Taekwondo Inc. on or prior to the ending contract date above. Same temrs and conditions apply to automatic renewal.",
]

const INTRO_TEXT =
  "This is a contract between you and Dynamic Taekwondo, Inc. by signing the membership agreement you are agreeing to the following terms and conditions. The person signing this agreement acknowledges that he/she is signing both on behalf of himself/herself and as parent or guardian on behalf of the persons listed as members."

const TERMS_SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Health and Safety",
    body: "Buyer(s) certify that the Member(s) listed on the first page of this Agreement are in good health and are able to safely participate in taekwondo classes. Buyer(s) represent that he/she/they have had an opportunity to observe the program and the Member(s) have had an opportunity to participate in the program prior to the signing of this Agreement and Member(s) are physically and mentally fit to participate in the program selected. The Buyer(s) and Member(s) understand that strict observance of the rules relative to training, including the use of protective equipment, is required. Any health issue, injury, communicable disease or any other health related concern or condition whatsoever incurred by the Member for any reason is at the sole risk of the member, the use of the facilities and participation in programs and courses in at the sole risk of the Member. It is understood that and participation in programs and courses is at the Member taekwondo involves defensive and offensive skills and training that includes violent and sudden movements and that there will be physical contact between instructors and Members and among Members and that personal injury may result despite the best intentions and following adequate precautions. The Member agrees that Dynamic Taekwondo Inc., its owners, instructors, operators, employees, and authorized representatives shall not be responsible for and are hereby released from any liability or claim related to any activity concerned to the program, courses or use of the facility, including , but not limited to, any causes by the negligence or gross negligence of the Dynamic Taekwondo Inc. or  its owners, instructors, operators, employees, and authorized representatives. Dynamic Taekwondo Inc. reserves the right to suspend or cancel this Agreement at any time if it, in its sole discretion, determines that the Member(s) cannot safely participate in taekwondo activities or if the Member(s) are not following facility rules, are being disruptive or posing a hazard to other member(s) or to Dynamic Taekwondo Inc. staff, or for any other reason. Any suspension or termination due to failure to follow the rules and regulations related to use of the facility and participation in any program or course shall not entitle the Member(s) to a reimbursement of any fees already paid and will not cancel any unpaid balance due, provided; however, the Right of Cancellation provisions as set forth below shall apply.",
  },
  {
    title: "Additional Fees",
    body: "The Member(s) shall take belt promotion tests upon recommendation by  Dynamic Taekwondo staff and, unless expressly included in the membership option selected, uniforms, seminars, special activities, testings, tournaments, belts and equipment are an additional charge and are not included in the terms of this Agreement.",
  },
  {
    title: "Right of Cancellation",
    body: (
      <>
        This Agreement may be cancelled by Buyer(s) without penalty only: (1) if notice of cancellation is provided Dynamic Taekwondo
        Inc. in writing within 3 business days of signing this Agreement; (2) upon death, disability or long-term illness of the Member(s)
        that would prevent participation in taekwondo class when documented in writing by a physician or with a death certificate; (3) if
        the enrollee moves more than 25 miles from this or any other Dynamic Taekwondo facility and provides written proof of such move to
        Dynamic Taekwondo Inc.; 30 days written notice of cancellation is provided to Dynamic Taekwondo Inc.
        <br />
        <br />
        <span className="text-[#FF3B30] font-bold">
          (1) The Buyer(s) may cancel this Agreement for reasons other than those set forth above only upon the payment of a cancellation
          fee of $1,000.00(Per Member).
          <br />
          (2) At least 30 days
        </span>{" "}
        notice must be provided to stop scheduled automatic debits as set forth under Pay Simple Authorization and Cancellation below.
        <br />
        (3) Cancellation will not be effective until the cancellation fee is paid in full.
        <br />
        <br />
        The failure of the Member(s) to use the facilities, classes or services for any reason will not relieve or suspend the obligation
        to pay the fees as set forth in this Agreement except as provided herein. The Membership fee shall not be refunded in the event of
        cancellation.
      </>
    ),
  },
  {
    title: "Pay Simple Authorization and Cancellation",
    body: "Buyer(s) hereby authorize the automatic debit of Buyer credit card or checking account as set forth on the first page of this Agreement. The authorization for automatic debits shall remain in full force and effect through the date set forth on the first of date of this Agreement, as modified by any agreed upon hold. The automatic debits will not be stopped sooner unless and until the Buyer(s) provide 30 days written notice to Pay Simple to cancel. Such notice shall be sent by regular and certified mail, return receipt requested, postage prepaid. Cancellation of the Pay Simple authorization will be release Buyer(s) from the terms of this Agreement and is not a cancellation of the Agreement. The terms set forth in the Right of Cancellation provision above must be followed for cancellation of the Agreement.",
  },
  {
    title: "Hold",
    body: "This Agreement may be placed on hold for an agreed upon period only with the written consent of Dynamic Taekwondo Inc. Holds may or may not be granted by Dynamic Taekwondo, Inc. in its sole discretion. During a hold the Buyer(s) will not be charged for Course Fees while the hold is in place but, unless the parties otherwise agree in writing, the term of the Agreement will be automatically extended for the length of the hold and the Buyer(s) will be charged for the Course Fees not paid during the hold period through additional weekly or monthly payments (as indicated on the first page of this Agreement) added to the end of the Agreement term. Buyer(s) hereby authorizes Dynamic Taekwondo Inc. or its billing agent Pay Simple to charge The account after the date indicated on the first page of the Agreement to make up for any payments missed while the Agreement was placed on hold.",
  },
  {
    title: "Unavailability",
    body: "In the event the school or its facilities are unavailable for use due to damage or loss by fire, accident, act of God, Covid-19 pandemic or any other cause, this Agreement will remain binding and classes and class schedules will be modified and/or temporarily suspended at Dynamic Taekwondo's discretion.",
  },
  {
    title: "Scheduling/Contact",
    body: "Dynamic Taekwondo Inc. agrees to furnish the Member with qualified instructors to teach and supervise classes, practice sessions and contests conducted by Dynamic Taekwondo Inc. Scheduling and content of classes and programs and furnishing of facilities and instructors are at the sole discretion of Dynamic Taekwondo Inc. and are subject to change from time-to-time upon notice posted at the facility. instructors, authorized personnel and other members will be engaged in a course of conduct requiring physical contact with the Member(s). Member(s) give full consent to such contact as is within the scope of the training program and classes.",
  },
  {
    title: "Compliance with Laws and Regulations",
    body: "All rights and obligations of Dynamic Taekwondo Inc. and the Buyer(s) and Member(s) under this Agreement are subject to all applicable federal, state and local laws and regulations. When in conflict with this Agreement, the contents of such laws and regulations shall be deemed to expressly modify this Agreement and this Agreement shall be deemed to incorporate such text as may be necessary in order to bring this Agreement into compliance with such laws or regulations, Dynamic Taekwondo Inc. and the Buyer(s) and Member(s) agree to be bound by the Agreement as so modified. If any portion of this Agreement shall be deemed unenforceable, the unenforceable provision(s) shall be deemed severable and the remainder of the Agreement shall remain valid and enforceable. No waiver or delay by Dynamic Taekwondo Inc. to enforce any right under this Agreement shall be deemed a waiver of its right to later do so.",
  },
  {
    title: "Default",
    body: "The non-payment of scheduled payments for 7 days past the due date for summer camp, winter camp or the before/after school program, or for 30 days past the due date for other courses or programs, shall constitute a default under this Agreement. Upon non-payment the membership shall be suspended and the Member(s) shall not be permitted to participate in any programs or courses until payments are brought current; provided, however, that Course Fees shall continue to be charged and will accrue during this suspension period unless this Agreement has been terminated in accordance with the Right of Cancellation provision of this Agreement. Upon a default that continues for more than 60 days the contract will be automatically cancelled and the cancellation fee, as set forth in the Right of Cancellation provision of this Agreement, shall apply in addition to any charges incurred prior to the date of cancellation. Dynamic Taekwondo Inc. or its agent may take any lawful collection action to collect on any unpaid balance, including the cancellation fee, and the Buyer(s) shall be jointly and severaly liable for the payment of the balance due plus costs of collection including attorney's fees and court costs.",
  },
  {
    title: "Non-use",
    body: "The failure or inability of the  Member to use the facilities, class or services of the School for any reason, will neither relieve nor suspend the Member's obligation to make all the payments required under this Agreement on a timely basis, nor entitle the Member to a refund or credit of Course Fees.",
  },
  {
    title: "Disability",
    body: "The member may extend the term of the Agreement at no additional cost for a period of time equal to the duration of a disability where the Members has a disability that precludes the Member from using one-third or more of the facilities for a period of less than 6 months and the disability is verified by a physician. The member or his/her legal representative may cancel the Agreement if the Member dies or becomes permanently disabled. A permanent disability means a condition which precludes the Member from using one-third or more of the facilities for 6 months or more and the condition is verified by a physician.",
  },
  {
    title: "Release and Waiver of Liability",
    body: "We, the student & guarantor, if applicable, on behalf of ourselves, members of our family, our heirs, executors, administrators, and assigns, hereby forever release, discharge and hold harmless Dynamic Taekwondo representative and agents for any injury, loss, or damage to my person or property howsoever caused, arising out of or in connection with my taking part in martial arts classes and activities and notwithstanding that the same may have been contributed to or occasioned by the negligence of Dynamic Taekwondo representatives or agents. Please note: participants must supply their own protective equipment.",
  },
]

function MemberSection({ index, member, onChange }: { index: number; member: Member; onChange: (field: keyof Member, val: string) => void }) {
  const req = index === 0
  return (
    <div className="mb-6">
      <SectionLabel>
        Member {index + 1}{" "}
        {req ? <span className="text-[#FF3B30]">*</span> : <span className="text-[#AEAEB2] normal-case font-normal">(Optional)</span>}
      </SectionLabel>
      <Card>
        <FieldRow label="Full Name" required={req}>
          <TextInput value={member.name} onChange={(e) => onChange("name", e.target.value)} placeholder="Member's Name" />
        </FieldRow>
        <FieldRow label="Class Category" required={req}>
          <NativeSelect value={member.category} onChange={(e) => onChange("category", e.target.value)}>
            <option value="">Select Class Category</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect>
        </FieldRow>
        <FieldRow label="Gender" required={req}>
          <NativeSelect value={member.gender} onChange={(e) => onChange("gender", e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </NativeSelect>
        </FieldRow>
        <FieldRow label="Date of Birth" required={req} last>
          <div className="flex gap-2">
            <input
              value={member.dobMm}
              onChange={(e) => onChange("dobMm", e.target.value.replace(/\D/g, "").substring(0, 2))}
              placeholder="MM"
              inputMode="numeric"
              maxLength={2}
              className="flex-1 text-center text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-[#F5F5F7] rounded-xl py-2.5 outline-none"
            />
            <input
              value={member.dobDd}
              onChange={(e) => onChange("dobDd", e.target.value.replace(/\D/g, "").substring(0, 2))}
              placeholder="DD"
              inputMode="numeric"
              maxLength={2}
              className="flex-1 text-center text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-[#F5F5F7] rounded-xl py-2.5 outline-none"
            />
            <input
              value={member.dobYyyy}
              onChange={(e) => onChange("dobYyyy", e.target.value.replace(/\D/g, "").substring(0, 4))}
              placeholder="YYYY"
              inputMode="numeric"
              maxLength={4}
              className="flex-[2] text-center text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-[#F5F5F7] rounded-xl py-2.5 outline-none"
            />
          </div>
        </FieldRow>
      </Card>
    </div>
  )
}

export default function TkdContract({ onBack }: { onBack: () => void }) {
  const [buyerName, setBuyerName] = useState("")
  const [address, setAddress] = useState("")
  const [emailId, setEmailId] = useState("")
  const [emailDomain, setEmailDomain] = useState("")
  const [emailOther, setEmailOther] = useState("")
  const [cellPhone, setCellPhone] = useState("")

  const [members, setMembers] = useState<Member[]>([{ ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }])
  const updateMember = (i: number, field: keyof Member, val: string) =>
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: val } : m)))

  const [termStart, setTermStart] = useState("")
  const [termEnd, setTermEnd] = useState("")

  const [adminPwInput, setAdminPwInput] = useState("")
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [adminError, setAdminError] = useState(false)

  const [payCount, setPayCount] = useState("")
  const [payAmount, setPayAmount] = useState("")
  const [payDay, setPayDay] = useState("")
  const [payType, setPayType] = useState<"cc" | "ach" | "">("")
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingPayType, setPendingPayType] = useState<"cc" | "ach">("cc")

  const [hasReadTerms, setHasReadTerms] = useState(false)
  const [otherChecks, setOtherChecks] = useState([false, false, false, false])
  const toggleOther = (i: number) => setOtherChecks((prev) => prev.map((c, idx) => (idx === i ? !c : c)))

  const [agreeCheck, setAgreeCheck] = useState(false)
  const [showSigModal, setShowSigModal] = useState(false)
  const [signatureData, setSignatureData] = useState("")
  const [showSignatureArea, setShowSignatureArea] = useState(false)

  const [alert, setAlert] = useState<AlertState | null>(null)
  const showAlert = (title: string, message: string, variant: AlertState["variant"] = "warn") => setAlert({ title, message, variant })

  const [submitting, setSubmitting] = useState(false)

  const unlockAdmin = () => {
    if (adminPwInput === getAdminPassword()) {
      setAdminUnlocked(true)
      setAdminError(false)
    } else {
      setAdminError(true)
    }
  }

  // handlePaymentSelection (unchanged): require payment schedule amount before entering details.
  const handlePaymentTypeClick = (type: "cc" | "ach") => {
    if (!payAmount || parseFloat(payAmount) <= 0) {
      showAlert("Notice", "Please enter payment schedule.", "warn")
      return
    }
    setPendingPayType(type)
    setShowPaymentModal(true)
  }

  // validateStepByStep (unchanged)
  const validate = (): boolean => {
    if (!buyerName) {
      showAlert("Warning", "Please enter Buyer Full Name")
      return false
    }
    if (!address) {
      showAlert("Warning", "Please enter Mailing Address")
      return false
    }
    const domain = emailDomain === "other" ? emailOther : emailDomain
    if (!emailId || !domain) {
      showAlert("Warning", "Please complete Email Address")
      return false
    }
    if (!cellPhone) {
      showAlert("Warning", "Please enter Cell Phone")
      return false
    }
    if (!members[0].name) {
      showAlert("Warning", "Please enter Member 1 Name")
      return false
    }
    if (!members[0].category) {
      showAlert("Warning", "Please select Member 1 Class Category")
      return false
    }
    if (!members[0].gender) {
      showAlert("Warning", "Please select Member 1 Gender")
      return false
    }
    if (!members[0].dobMm || !members[0].dobDd || !members[0].dobYyyy) {
      showAlert("Warning", "Please complete Member 1 Date of Birth (MM/DD/YYYY)")
      return false
    }
    if (!termStart || !termEnd) {
      showAlert("Warning", "Please select both Start and End Dates for Membership Term")
      return false
    }
    if (!paymentInfo) {
      showAlert("Warning", "Staff must complete Payment details.")
      return false
    }
    if (!otherChecks.every((c) => c)) {
      showAlert("Warning", "Please review and check all agreement boxes.")
      return false
    }
    if (!hasReadTerms) {
      showAlert("Warning", "Please scroll through the Main Terms and Conditions.")
      return false
    }
    return true
  }

  const handleAgreeChange = (checked: boolean) => {
    if (checked) {
      if (validate()) {
        setShowSigModal(true)
      }
    } else {
      setAgreeCheck(false)
      setShowSignatureArea(false)
      setSignatureData("")
    }
  }

  const handleSubmit = () => {
    const domainPart = emailDomain === "other" ? emailOther : emailDomain
    const payload = {
      buyer: buyerName,
      address,
      email: `${emailId}@${domainPart}`,
      phone: cellPhone,
      term: `${termStart} ~ ${termEnd}`,
      paymentTerm: `${payCount} payments of $${payAmount}`,
      paymentType: paymentInfo?.type,
      paymentDetail: paymentInfo?.details,
      paymentInfo,
      members: members
        .filter((m) => m.name)
        .map((m) => ({
          name: m.name,
          category: m.category,
          gender: m.gender,
          dob: m.dobMm && m.dobDd && m.dobYyyy ? `${m.dobYyyy}-${m.dobMm}-${m.dobDd}` : "",
        })),
      dateSigned: displayDate,
    }
    setSubmitting(true)
    if (typeof (window as any).google !== "undefined" && (window as any).google?.script) {
      ;(window as any).google.script.run
        .withSuccessHandler(() => {
          showAlert("Success", "Agreement submitted!", "success")
          ;(window as any).google.script.run.withSuccessHandler((url: string) => {
            window.top!.location.href = url
          }).getServiceUrl()
        })
        .withFailureHandler((err: { message: string }) => {
          showAlert("Error", err.message, "error")
          setSubmitting(false)
        })
        .processContract(payload, signatureData)
    } else {
      console.log("Payload:", payload)
      showAlert("Success", "Agreement submitted!", "success")
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
            setPayType("")
          }}
        />
      )}

      <ContractHeader title="Dynamic Taekwondo Agreement" subtitle="Please complete all required fields to enroll" />

      <SectionLabel>
        Buyer&apos;s Information <span className="text-[#FF3B30]">*</span>
      </SectionLabel>
      <Card className="mb-6">
        <FieldRow label="Full Name" required>
          <TextInput value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Full Name" />
        </FieldRow>
        <FieldRow label="Mailing Address" required>
          <TextInput value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full Address" />
        </FieldRow>
        <FieldRow label="Email Address" required>
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
                <option value="yahoo.com">yahoo.com</option>
                <option value="hotmail.com">hotmail.com</option>
                <option value="other">Other (Direct Input)</option>
              </NativeSelect>
            ) : (
              <TextInput value={emailOther} onChange={(e) => setEmailOther(e.target.value)} placeholder="domain.com" autoFocus className="!w-auto flex-1" />
            )}
          </div>
        </FieldRow>
        <FieldRow label="Cell Phone" required last>
          <TextInput value={cellPhone} onChange={(e) => setCellPhone(formatPhone(e.target.value))} placeholder="000-000-0000" inputMode="numeric" maxLength={12} />
        </FieldRow>
      </Card>

      {[0, 1, 2, 3].map((i) => (
        <MemberSection key={i} index={i} member={members[i]} onChange={(f, v) => updateMember(i, f, v)} />
      ))}

      <SectionLabel>Membership Term</SectionLabel>
      <Card className="mb-6">
        <div className="flex">
          <div className="flex-1 px-4 py-3 border-r border-[#F2F2F7]">
            <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">
              Start Date<span className="text-[#FF3B30]">*</span>
            </p>
            <input type="date" value={termStart} onChange={(e) => setTermStart(e.target.value)} className="w-full text-[15px] text-[#1D1D1F] bg-transparent outline-none" />
          </div>
          <div className="flex-1 px-4 py-3">
            <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">
              End Date<span className="text-[#FF3B30]">*</span>
            </p>
            <input type="date" value={termEnd} onChange={(e) => setTermEnd(e.target.value)} className="w-full text-[15px] text-[#1D1D1F] bg-transparent outline-none" />
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
            <p className="text-[13px] text-[#6E6E73] mb-6">Enter password to set Payment Schedule &amp; Method</p>
            <div className="flex gap-2 justify-center max-w-[260px] mx-auto">
              <input
                type="password"
                value={adminPwInput}
                onChange={(e) => {
                  setAdminPwInput(e.target.value)
                  setAdminError(false)
                }}
                onKeyDown={(e) => e.key === "Enter" && unlockAdmin()}
                placeholder="Password"
                inputMode="numeric"
                className={`flex-1 px-4 py-2.5 rounded-xl text-[15px] outline-none border transition ${adminError ? "border-[#FF3B30] bg-[#FFF1F0]" : "border-[#D2D2D7] bg-[#F5F5F7]"}`}
              />
              <button onClick={unlockAdmin} className="px-5 py-2.5 bg-[#0071E3] text-white rounded-xl text-[15px] font-medium">
                Unlock
              </button>
            </div>
            {adminError && <p className="text-[13px] text-[#FF3B30] mt-2">Incorrect Password</p>}
          </div>
        ) : (
          <div>
            <div className="px-4 py-4 border-b border-[#F2F2F7]">
              <div className="flex items-center gap-2 mb-3">
                <Unlock className="w-4 h-4 text-[#0071E3]" />
                <p className="text-[11px] font-semibold text-[#0071E3] uppercase tracking-wider">Payment Schedule</p>
              </div>
              <div className="bg-[#F5F5F7] rounded-xl p-4 text-[15px] text-[#1D1D1F] leading-loose">
                Payment due will be paid by buyer in{" "}
                <select
                  value={payCount}
                  onChange={(e) => setPayCount(e.target.value)}
                  className="inline-block mx-1 border-b-2 border-[#0071E3] bg-transparent outline-none text-[15px] font-semibold text-[#0071E3] text-center appearance-none"
                >
                  <option value="">--</option>
                  {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>{" "}
                monthly payments of $
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0.00"
                  inputMode="decimal"
                  className="inline-block w-24 mx-1 border-b-2 border-[#0071E3] bg-transparent outline-none text-[15px] font-semibold text-[#0071E3] text-center"
                />{" "}
                on the{" "}
                <select
                  value={payDay}
                  onChange={(e) => setPayDay(e.target.value)}
                  className="inline-block mx-1 border-b-2 border-[#0071E3] bg-transparent outline-none text-[15px] font-semibold text-[#0071E3] text-center appearance-none"
                >
                  <option value="">--</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>{" "}
                day of each month.
                <span className="block mt-3 text-[#FF3B30] font-bold">A $30 late charge will be assessed for any fee 5 days past due date.</span>
              </div>
            </div>
            <div className="px-4 py-4">
              <p className="text-[11px] font-semibold text-[#0071E3] uppercase tracking-wider mb-3">Payment Method</p>
              <p className="text-[13px] text-[#6E6E73] mb-3">Select payment type to enter details:</p>
              <div className="flex flex-col gap-2 mb-4">
                {[
                  { value: "cc" as const, label: "Credit Card" },
                  { value: "ach" as const, label: "Bank Account (ACH)" },
                ].map((opt) => (
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
                  {paymentInfo ? "Confirmation: Setup Complete." : "Payment details required"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <SectionLabel>Main Terms and Conditions</SectionLabel>
      <Card className="mb-6">
        <div className="px-4 pt-3 flex justify-end">
          {hasReadTerms ? <span className="text-[12px] text-[#34C759] font-medium">✓ Reviewed</span> : <span className="text-[12px] text-[#AEAEB2]">Scroll to the bottom</span>}
        </div>
        <div
          className="px-4 pb-4 h-60 overflow-y-auto text-[13px] text-[#3A3A3C] leading-relaxed"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#D2D2D7 transparent" }}
          onScroll={(e) => {
            const el = e.currentTarget
            if (Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 20) setHasReadTerms(true)
          }}
        >
          <p className="font-bold text-[#1D1D1F] leading-snug mb-4">{INTRO_TEXT}</p>
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
          <span className="text-[15px] font-medium text-[#1D1D1F]">I have reviewed and agree to ALL terms and conditions.</span>
        </div>
      </Card>

      {showSignatureArea && signatureData && (
        <Card className="mb-6 p-6 text-center">
          <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider mb-4">Signature (Verified)</p>
          <img src={signatureData || "/placeholder.svg"} alt="Verified signature" className="border border-[#D2D2D7] rounded-xl w-full max-w-[400px] mx-auto bg-white" />
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
            {submitting ? "Submitting…" : "Submit Agreement"}
          </button>
        </Card>
      )}
    </ContractShell>
  )
}
