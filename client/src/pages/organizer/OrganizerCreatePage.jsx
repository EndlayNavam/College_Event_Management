import { useMemo, useState } from "react";
import { RiArrowRightUpLine, RiDraftLine, RiSparkling2Line } from "react-icons/ri";
import api from "../../api/client";
import EventCard from "../../components/EventCard";
import Reveal from "../../components/Reveal";

const initialForm = {
  eventName: "",
  clubName: "",
  eventDate: "",
  timing: "",
  venue: "",
  cost: 0,
  category: "Technical",
  shortDescription: "",
  prizes: "",
  imageUrl:
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=80"
};

const categories = [
  "Technical",
  "Cultural",
  "Sports",
  "Seminar",
  "Workshop",
  "Creative"
];

export default function OrganizerCreatePage() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const previewEvent = useMemo(
    () => ({
      ...form,
      _id: "preview",
      eventDate: form.eventDate || new Date().toISOString(),
      cost: Number(form.cost || 0),
      studentStatus: "Draft"
    }),
    [form]
  );

  const updateField = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));

  async function saveEvent(submissionType) {
    setSaving(true);
    setMessage("");
    try {
      await api.post("/events", { ...form, submissionType });
      setMessage(
        submissionType === "draft"
          ? "Draft saved. You can submit it from the Submissions page."
          : "Event submitted to admin moderation."
      );
      setForm((prev) => ({
        ...initialForm,
        clubName: prev.clubName
      }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <Reveal>
        <section className="bento-grid organizer-bento">
          <div className="glass-shell bento-main">
            <div className="glass-core">
              <span className="eyebrow">Organizer Craft</span>
              <h2>Compose events with student-first clarity.</h2>
              <p>
                Your submission enters moderation instantly and appears in student feed
                after approval.
              </p>
            </div>
          </div>
          <div className="glass-shell metric-shell">
            <div className="glass-core">
              <p className="metric-label">Workflow</p>
              <h3>Draft to Live</h3>
              <small>Single-click moderation pipeline</small>
            </div>
          </div>
        </section>
      </Reveal>

      {message ? <p className="flash-message">{message}</p> : null}

      <section className="dual-grid">
        <Reveal delay={70}>
          <div className="glass-shell">
            <div className="glass-core form-core">
              <div className="section-head">
                <span className="eyebrow">Event Builder</span>
                <h3>Create Event</h3>
              </div>

              <div className="form-grid premium">
                <label className="field-wrap">
                  <span>Event Name</span>
                  <input
                    type="text"
                    placeholder="Design Sprint Weekend"
                    value={form.eventName}
                    onChange={(event) => updateField("eventName", event.target.value)}
                  />
                </label>
                <label className="field-wrap">
                  <span>Club Name</span>
                  <input
                    type="text"
                    placeholder="Design Guild"
                    value={form.clubName}
                    onChange={(event) => updateField("clubName", event.target.value)}
                  />
                </label>
                <label className="field-wrap">
                  <span>Date</span>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(event) => updateField("eventDate", event.target.value)}
                  />
                </label>
                <label className="field-wrap">
                  <span>Timings</span>
                  <input
                    type="text"
                    placeholder="10:00 AM - 03:00 PM"
                    value={form.timing}
                    onChange={(event) => updateField("timing", event.target.value)}
                  />
                </label>
                <label className="field-wrap">
                  <span>Venue</span>
                  <input
                    type="text"
                    placeholder="Innovation Lab"
                    value={form.venue}
                    onChange={(event) => updateField("venue", event.target.value)}
                  />
                </label>
                <label className="field-wrap">
                  <span>Cost</span>
                  <input
                    type="number"
                    min="0"
                    value={form.cost}
                    onChange={(event) => updateField("cost", event.target.value)}
                  />
                </label>
                <label className="field-wrap">
                  <span>Category</span>
                  <select
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-wrap">
                  <span>Cover Image URL</span>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(event) => updateField("imageUrl", event.target.value)}
                  />
                </label>
                <label className="field-wrap full">
                  <span>Description</span>
                  <textarea
                    placeholder="Short student-facing event summary"
                    value={form.shortDescription}
                    onChange={(event) =>
                      updateField("shortDescription", event.target.value)
                    }
                  />
                </label>
                <label className="field-wrap full">
                  <span>Prizes</span>
                  <input
                    type="text"
                    placeholder="Winner: INR 10000"
                    value={form.prizes}
                    onChange={(event) => updateField("prizes", event.target.value)}
                  />
                </label>
              </div>

              <div className="action-row">
                <button
                  type="button"
                  className="ghost-action"
                  onClick={() => saveEvent("draft")}
                  disabled={saving}
                >
                  <span>{saving ? "Saving..." : "Save Draft"}</span>
                  <span className="action-icon">
                    <RiDraftLine size={14} />
                  </span>
                </button>
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => saveEvent("pending")}
                  disabled={saving}
                >
                  <span>{saving ? "Submitting..." : "Submit for Review"}</span>
                  <span className="action-icon">
                    <RiArrowRightUpLine size={14} />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="page-stack">
            <div className="glass-shell">
              <div className="glass-core preview-head">
                <span className="eyebrow">Live Preview</span>
                <h3>Student Event Card</h3>
              </div>
            </div>

            <EventCard event={previewEvent} statusLabel="Draft" />

            <div className="glass-shell">
              <div className="glass-core hint-list">
                <h4>
                  <RiSparkling2Line size={16} /> Premium Submission Tips
                </h4>
                <p>Lead with action words in title and keep timing precise.</p>
                <p>Use clear prize language to improve registration conversions.</p>
                <p>Keep descriptions under 220 characters for better readability.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
