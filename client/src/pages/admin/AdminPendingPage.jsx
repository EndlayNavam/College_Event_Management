import { useEffect, useState } from "react";
import { RiCheckLine, RiCloseLine } from "react-icons/ri";
import api from "../../api/client";
import Reveal from "../../components/Reveal";
import StatusTag from "../../components/StatusTag";

export default function AdminPendingPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [moderatingId, setModeratingId] = useState("");

  async function loadPending() {
    setLoading(true);
    try {
      const response = await api.get("/events/admin/pending");
      setEvents(response.data.items);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load pending events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function moderate(eventId, action) {
    setModeratingId(eventId);
    setMessage("");
    try {
      await api.patch(`/events/admin/${eventId}/moderate`, { action });
      setMessage(
        action === "approve"
          ? "Event approved and moved to active."
          : "Event rejected and hidden from student feed."
      );
      await loadPending();
    } catch (error) {
      setMessage(error.response?.data?.message || "Moderation failed.");
    } finally {
      setModeratingId("");
    }
  }

  return (
    <div className="page-stack">
      <Reveal>
        <section className="glass-shell">
          <div className="glass-core split-head">
            <div>
              <span className="eyebrow">Moderation Queue</span>
              <h2>Pending Events</h2>
              <p>Approve or reject submissions before they become student-visible.</p>
            </div>
            <div className="calendar-pill">
              <span>{events.length} Awaiting Review</span>
            </div>
          </div>
        </section>
      </Reveal>

      {message ? <p className="flash-message">{message}</p> : null}

      {loading ? (
        <Reveal>
          <div className="empty-state">
            <h3>Loading moderation queue...</h3>
          </div>
        </Reveal>
      ) : null}

      {!loading && events.length ? (
        <div className="list-stack premium-list">
          {events.map((event, index) => (
            <Reveal key={event._id} delay={index * 50}>
              <article className="review-shell">
                <div className="review-core">
                  <div>
                    <div className="review-head">
                      <h3>{event.eventName}</h3>
                      <StatusTag label="Pending" />
                    </div>
                    <p>{event.shortDescription}</p>
                    <p className="muted-copy">
                      {event.clubName} | {event.venue} | {event.timing}
                    </p>
                  </div>

                  <div className="review-actions">
                    <button
                      type="button"
                      className="primary-action approve"
                      onClick={() => moderate(event._id, "approve")}
                      disabled={moderatingId === event._id}
                    >
                      <span>Approve</span>
                      <span className="action-icon">
                        <RiCheckLine size={14} />
                      </span>
                    </button>
                    <button
                      type="button"
                      className="ghost-action reject"
                      onClick={() => moderate(event._id, "reject")}
                      disabled={moderatingId === event._id}
                    >
                      <span>Reject</span>
                      <span className="action-icon">
                        <RiCloseLine size={14} />
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      ) : null}

      {!loading && !events.length ? (
        <Reveal>
          <div className="empty-state">
            <h3>No pending submissions</h3>
            <p>New organizer submissions will appear here automatically.</p>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
