import { useEffect, useState } from "react";
import { RiBroadcastLine } from "react-icons/ri";
import api from "../../api/client";
import EventCard from "../../components/EventCard";
import Reveal from "../../components/Reveal";
import SkeletonCard from "../../components/SkeletonCard";

export default function AdminActivePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const response = await api.get("/events/admin/active");
        setEvents(response.data.items);
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to load active events.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const upcomingCount = events.filter(
    (event) => event.studentStatus === "Active"
  ).length;

  return (
    <div className="page-stack">
      <Reveal>
        <section className="glass-shell">
          <div className="glass-core split-head">
            <div>
              <span className="eyebrow">Published Feed</span>
              <h2>Active Events</h2>
              <p>Approved events that are now visible to students.</p>
            </div>
            <div className="compact-metrics">
              <div>
                <small>Total Approved</small>
                <strong>{events.length}</strong>
              </div>
              <div>
                <small>Currently Active</small>
                <strong>{upcomingCount}</strong>
              </div>
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
                statusLabel={event.studentStatus}
                actions={
                  <button type="button" className="ghost-action">
                    <span>
                      <RiBroadcastLine size={14} /> Live in Feed
                    </span>
                  </button>
                }
              />
            </Reveal>
          ))}
        </div>
      ) : null}

      {!loading && !events.length ? (
        <Reveal>
          <div className="empty-state">
            <h3>No active events</h3>
            <p>Approve pending submissions to populate this page.</p>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
