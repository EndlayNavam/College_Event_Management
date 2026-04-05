import { useEffect, useMemo, useState } from "react";
import { RiCalendarScheduleLine, RiMapPinLine, RiTimeLine } from "react-icons/ri";
import api from "../../api/client";
import Reveal from "../../components/Reveal";
import SkeletonCard from "../../components/SkeletonCard";

function monthLabel(dateValue) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric"
  }).format(new Date(dateValue));
}

function dayLabel(dateValue) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short"
  }).format(new Date(dateValue));
}

export default function StudentCalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const response = await api.get("/events/student", {
          params: { page: 1, limit: 100, status: "Active" }
        });
        setEvents(response.data.items);
      } catch (error) {
        setMessage(error.response?.data?.message || "Unable to load calendar data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    events.forEach((event) => {
      const key = monthLabel(event.eventDate);
      const current = map.get(key) || [];
      current.push(event);
      map.set(key, current);
    });
    return Array.from(map.entries());
  }, [events]);

  return (
    <div className="page-stack">
      <Reveal>
        <section className="glass-shell">
          <div className="glass-core split-head">
            <div>
              <span className="eyebrow">Schedule Surface</span>
              <h2>Event Calendar</h2>
              <p>Chronological view of active events to plan your semester.</p>
            </div>
            <div className="calendar-pill">
              <RiCalendarScheduleLine size={18} />
              <span>{events.length} Active Events</span>
            </div>
          </div>
        </section>
      </Reveal>

      {message ? <p className="flash-message">{message}</p> : null}

      {loading ? (
        <div className="events-grid premium-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <Reveal key={index} delay={index * 50}>
              <SkeletonCard />
            </Reveal>
          ))}
        </div>
      ) : null}

      {!loading && grouped.length ? (
        <section className="timeline-stack">
          {grouped.map(([label, monthEvents], monthIndex) => (
            <Reveal key={label} delay={monthIndex * 60}>
              <article className="month-shell">
                <div className="month-core">
                  <h3>{label}</h3>
                  <div className="timeline-list">
                    {monthEvents.map((event) => (
                      <div key={event._id} className="timeline-item">
                        <div className="timeline-date">{dayLabel(event.eventDate)}</div>
                        <div className="timeline-content">
                          <h4>{event.eventName}</h4>
                          <p>{event.clubName}</p>
                          <small>
                            <RiTimeLine size={14} /> {event.timing} <span>|</span>{" "}
                            <RiMapPinLine size={14} /> {event.venue}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </section>
      ) : null}

      {!loading && !grouped.length ? (
        <Reveal>
          <div className="empty-state">
            <h3>No active events in calendar</h3>
            <p>Approved upcoming events will automatically appear here.</p>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
