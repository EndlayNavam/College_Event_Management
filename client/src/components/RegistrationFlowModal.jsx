import { useEffect, useMemo, useState } from "react";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiCloseLine
} from "react-icons/ri";

const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year", "PG"];

function StepIndicator({ step }) {
  const labels = ["Details", "Verification", "Review"];
  return (
    <div className="registration-steps">
      {labels.map((label, index) => {
        const current = index + 1;
        return (
          <div
            key={label}
            className={`registration-step ${step >= current ? "active" : ""}`}
          >
            <span>{current}</span>
            <small>{label}</small>
          </div>
        );
      })}
    </div>
  );
}

export default function RegistrationFlowModal({
  open,
  event,
  user,
  onClose,
  onSubmit,
  submitting = false,
  submitError = ""
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    participantName: "",
    studentEmail: "",
    phone: "",
    department: "",
    yearOfStudy: "",
    emergencyContact: "",
    additionalNotes: "",
    agreedToTerms: false,
    agreedToPolicy: false
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setError("");
    setForm({
      participantName: user?.name || "",
      studentEmail: user?.email || "",
      phone: "",
      department: "",
      yearOfStudy: "",
      emergencyContact: "",
      additionalNotes: "",
      agreedToTerms: false,
      agreedToPolicy: false
    });
  }, [open, user?.name, user?.email]);

  const eventSummary = useMemo(() => {
    if (!event) return "";
    return `${event.eventName} | ${event.clubName} | ${new Intl.DateTimeFormat(
      "en-IN",
      { dateStyle: "medium" }
    ).format(new Date(event.eventDate))}`;
  }, [event]);

  if (!open || !event) return null;

  const updateField = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));

  const validateStepOne = () => {
    const required = [
      form.participantName,
      form.studentEmail,
      form.phone,
      form.department,
      form.yearOfStudy,
      form.emergencyContact
    ];

    if (required.some((field) => !String(field || "").trim())) {
      return "Please fill all required fields.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.studentEmail.trim())) {
      return "Please enter a valid email.";
    }

    if (!/^[0-9+\-\s()]{8,20}$/.test(form.phone.trim())) {
      return "Please enter a valid phone number.";
    }

    return "";
  };

  const validateStepTwo = () => {
    if (!form.agreedToPolicy || !form.agreedToTerms) {
      return "Please accept the policy and terms to continue.";
    }
    return "";
  };

  const goNext = () => {
    const stepError = step === 1 ? validateStepOne() : validateStepTwo();
    if (stepError) {
      setError(stepError);
      return;
    }
    setError("");
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const goBack = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleConfirm = async () => {
    setError("");
    const stepError = validateStepTwo();
    if (stepError) {
      setError(stepError);
      setStep(2);
      return;
    }

    await onSubmit({
      participantName: form.participantName.trim(),
      studentEmail: form.studentEmail.trim(),
      phone: form.phone.trim(),
      department: form.department.trim(),
      yearOfStudy: form.yearOfStudy.trim(),
      emergencyContact: form.emergencyContact.trim(),
      additionalNotes: form.additionalNotes.trim(),
      agreedToTerms: form.agreedToTerms && form.agreedToPolicy
    });
  };

  return (
    <div className="registration-modal-backdrop" role="presentation">
      <div className="registration-modal" role="dialog" aria-modal="true">
        <div className="registration-modal-head">
          <div>
            <h3>Event Registration</h3>
            <p>{eventSummary}</p>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close registration flow"
            disabled={submitting}
          >
            <RiCloseLine size={16} />
          </button>
        </div>

        <StepIndicator step={step} />

        {step === 1 ? (
          <div className="registration-form-grid">
            <label className="field-wrap">
              <span>Participant Name</span>
              <input
                type="text"
                value={form.participantName}
                onChange={(eventValue) =>
                  updateField("participantName", eventValue.target.value)
                }
              />
            </label>
            <label className="field-wrap">
              <span>College Email</span>
              <input
                type="email"
                value={form.studentEmail}
                onChange={(eventValue) =>
                  updateField("studentEmail", eventValue.target.value)
                }
              />
            </label>
            <label className="field-wrap">
              <span>Phone Number</span>
              <input
                type="text"
                value={form.phone}
                onChange={(eventValue) => updateField("phone", eventValue.target.value)}
              />
            </label>
            <label className="field-wrap">
              <span>Department</span>
              <input
                type="text"
                value={form.department}
                onChange={(eventValue) =>
                  updateField("department", eventValue.target.value)
                }
              />
            </label>
            <label className="field-wrap">
              <span>Year Of Study</span>
              <select
                value={form.yearOfStudy}
                onChange={(eventValue) =>
                  updateField("yearOfStudy", eventValue.target.value)
                }
              >
                <option value="">Select year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-wrap">
              <span>Emergency Contact</span>
              <input
                type="text"
                placeholder="Name and phone number"
                value={form.emergencyContact}
                onChange={(eventValue) =>
                  updateField("emergencyContact", eventValue.target.value)
                }
              />
            </label>
            <label className="field-wrap full">
              <span>Notes (Optional)</span>
              <textarea
                placeholder="Any accommodations or remarks"
                value={form.additionalNotes}
                onChange={(eventValue) =>
                  updateField("additionalNotes", eventValue.target.value)
                }
              />
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="registration-policy-box">
            <h4>Before You Continue</h4>
            <ul>
              <li>Attendance at check-in desk is mandatory 30 minutes before event start.</li>
              <li>Identity verification may be required at venue entry.</li>
              <li>Event coordinators can cancel a registration for policy violations.</li>
            </ul>

            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={form.agreedToPolicy}
                onChange={(eventValue) =>
                  updateField("agreedToPolicy", eventValue.target.checked)
                }
              />
              <span>I confirm my submitted information is accurate.</span>
            </label>
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={form.agreedToTerms}
                onChange={(eventValue) =>
                  updateField("agreedToTerms", eventValue.target.checked)
                }
              />
              <span>I agree to the event participation rules and conduct policy.</span>
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="registration-review-box">
            <h4>Review Registration</h4>
            <div className="review-grid">
              <p>
                <strong>Name:</strong> {form.participantName}
              </p>
              <p>
                <strong>Email:</strong> {form.studentEmail}
              </p>
              <p>
                <strong>Phone:</strong> {form.phone}
              </p>
              <p>
                <strong>Department:</strong> {form.department}
              </p>
              <p>
                <strong>Year:</strong> {form.yearOfStudy}
              </p>
              <p>
                <strong>Emergency:</strong> {form.emergencyContact}
              </p>
              {form.additionalNotes ? (
                <p className="full-line">
                  <strong>Notes:</strong> {form.additionalNotes}
                </p>
              ) : null}
            </div>
            <p className="verify-line">
              <RiCheckboxCircleLine size={14} />
              Terms accepted and ready for final submission.
            </p>
          </div>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}
        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="registration-actions">
          <button
            type="button"
            className="ghost-action"
            onClick={step === 1 ? onClose : goBack}
            disabled={submitting}
          >
            {step === 1 ? "Cancel" : <><RiArrowLeftLine size={14} /> Back</>}
          </button>
          {step < 3 ? (
            <button
              type="button"
              className="primary-action"
              onClick={goNext}
              disabled={submitting}
            >
              Next <RiArrowRightLine size={14} />
            </button>
          ) : (
            <button
              type="button"
              className="primary-action"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Confirm Registration"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
