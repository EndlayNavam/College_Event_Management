import { useEffect, useState } from "react";
import { RiErrorWarningLine } from "react-icons/ri";
import api from "../../api/client";
import EventCard from "../../components/EventCard";
import Reveal from "../../components/Reveal";
import SkeletonCard from "../../components/SkeletonCard";

export default function AdminRejectedPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const response = await api.get("/events/admin/rejected");
        setEvents(response.data.items);
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to load rejected events.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="page-stack">
      <Reveal>
        <section className="glass-shell">
          <div className="glass-core split-head">
            <div>
              <span className="eyebrow">Compliance Log</span>
              <h2>Rejected Events</h2>
              <p>Submissions removed from student visibility after review.</p>
            </div>
            <div className="calendar-pill warn">
              <RiErrorWarningLine size={16} />
              <span>{events.length} Rejected Entries</span>
            </div>
          </div>
        </section>
      </Reveal>

      {message ? <p className="flash-message">{message}</p> : null}

      {loading ? (
        <div className="events-grid premium-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <Reveal key={index} delay={index * 45}>
              <SkeletonCard />
            </Reveal>
          ))}
        </div>
      ) : null}

      {!loading && events.length ? (
        <div className="events-grid premium-grid">
          {events.map((event, index) => (
            <Reveal key={event._id} delay={index * 35}>
              <EventCard
                event={event}
                statusLabel="Rejected"
                actions={
                  event.rejectionReason ? (
                    <div className="reason-pill">{event.rejectionReason}</div>
                  ) : (
                    <div className="reason-pill">No rejection note provided.</div>
                  )
                }
              />
            </Reveal>
          ))}
        </div>
      ) : null}

      {!loading && !events.length ? (
        <Reveal>
          <div className="empty-state">
            <h3>No rejected events</h3>
            <p>Rejected submissions will appear here when moderation declines an event.</p>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
