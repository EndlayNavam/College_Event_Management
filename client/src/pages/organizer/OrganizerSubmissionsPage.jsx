import { useEffect, useMemo, useState } from "react";
import { RiArrowRightUpLine, RiLoader4Line } from "react-icons/ri";
import api from "../../api/client";
import Reveal from "../../components/Reveal";
import StatusTag from "../../components/StatusTag";

export default function OrganizerSubmissionsPage() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitId, setSubmitId] = useState("");

  async function loadEvents() {
    setLoading(true);
    try {
      const response = await api.get("/events/organizer/mine");
      setEvents(response.data.items);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load submissions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (status === "all") return events;
    return events.filter((event) => event.moderationStatus === status);
  }, [events, status]);

  const counts = useMemo(
    () => ({
      all: events.length,
      draft: events.filter((event) => event.moderationStatus === "draft").length,
      pending: events.filter((event) => event.moderationStatus === "pending").length,
      approved: events.filter((event) => event.moderationStatus === "approved").length,
      rejected: events.filter((event) => event.moderationStatus === "rejected").length
    }),
    [events]
  );

  async function submitDraft(eventId) {
    setSubmitId(eventId);
    setMessage("");
    try {
      await api.patch(`/events/organizer/${eventId}/submit`);
      await loadEvents();
      setMessage("Draft moved to pending review.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to submit draft.");
    } finally {
      setSubmitId("");
    }
  }

  const tabs = [
    { key: "all", label: `All (${counts.all})` },
    { key: "draft", label: `Draft (${counts.draft})` },
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` }
  ];

  return (
    <div className="page-stack">
      <Reveal>
        <section className="glass-shell">
          <div className="glass-core split-head">
            <div>
              <span className="eyebrow">Submission Ledger</span>
              <h2>Track moderation progress with precision.</h2>
              <p>Review each event status and push drafts to pending in one click.</p>
            </div>
            <div className="pill-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={status === tab.key ? "active" : ""}
                  onClick={() => setStatus(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {message ? <p className="flash-message">{message}</p> : null}

      {loading ? (
        <Reveal>
          <div className="empty-state">
            <h3>Loading submissions...</h3>
          </div>
        </Reveal>
      ) : null}

      {!loading && filteredEvents.length ? (
        <div className="list-stack premium-list">
          {filteredEvents.map((event, index) => (
            <Reveal key={event._id} delay={index * 45}>
              <article className="list-shell">
                <div className="list-core">
                  <div className="list-main">
                    <h3>{event.eventName}</h3>
                    <p>
                      {event.clubName} | {event.category} |{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "medium"
                      }).format(new Date(event.eventDate))}
                    </p>
                  </div>

                  <StatusTag label={event.moderationStatus} />

                  {event.moderationStatus === "draft" ? (
                    <button
                      type="button"
                      className="primary-action"
                      onClick={() => submitDraft(event._id)}
                      disabled={submitId === event._id}
                    >
                      <span>
                        {submitId === event._id ? (
                          <>
                            <RiLoader4Line className="spin-icon" size={14} /> Sending
                          </>
                        ) : (
                          "Move to Pending"
                        )}
                      </span>
                      <span className="action-icon">
                        <RiArrowRightUpLine size={14} />
                      </span>
                    </button>
                  ) : (
                    <button type="button" className="ghost-action">
                      <span>View Details</span>
                      <span className="action-icon">
                        <RiArrowRightUpLine size={14} />
                      </span>
                    </button>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      ) : null}

      {!loading && !filteredEvents.length ? (
        <Reveal>
          <div className="empty-state">
            <h3>No events in this status</h3>
            <p>Create events from the Create page to populate this section.</p>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
