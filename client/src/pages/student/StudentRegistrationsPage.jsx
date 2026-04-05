import { useEffect, useMemo, useState } from "react";
import { RiArrowRightUpLine, RiDeleteBinLine, RiTicketLine } from "react-icons/ri";
import api from "../../api/client";
import EventCard from "../../components/EventCard";
import Reveal from "../../components/Reveal";

export default function StudentRegistrationsPage() {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [removingId, setRemovingId] = useState("");

  useEffect(() => {
    async function loadRegistrations() {
      setLoading(true);
      try {
        const response = await api.get("/events/student/registrations");
        setEvents(response.data.items);
      } catch (error) {
        setMessage(error.response?.data?.message || "Unable to load registrations.");
      } finally {
        setLoading(false);
      }
    }

    loadRegistrations();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesQuery =
        event.eventName.toLowerCase().includes(query.toLowerCase()) ||
        event.clubName.toLowerCase().includes(query.toLowerCase());

      if (!matchesQuery) return false;

      if (mode === "all") return true;
      const isPast = new Date(event.eventDate) < new Date();
      return mode === "past" ? isPast : !isPast;
    });
  }, [events, query, mode]);

  const upcomingCount = events.filter(
    (event) => new Date(event.eventDate) >= new Date()
  ).length;

  const handleRemove = async (eventId) => {
    setRemovingId(eventId);
    setMessage("");
    try {
      const response = await api.delete(`/events/student/registrations/${eventId}`);
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to remove registration.");
    } finally {
      setRemovingId("");
    }
  };

  return (
    <div className="page-stack">
      <Reveal>
        <section className="glass-shell">
          <div className="glass-core split-head">
            <div>
              <span className="eyebrow">Student Portfolio</span>
              <h2>My Registrations</h2>
              <p>Track upcoming participations and past attendance history.</p>
            </div>
            <div className="compact-metrics">
              <div>
                <small>Total Tickets</small>
                <strong>{events.length}</strong>
              </div>
              <div>
                <small>Upcoming</small>
                <strong>{upcomingCount}</strong>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={70}>
        <section className="glass-shell">
          <div className="glass-core toolbar-grid">
            <label className="field-wrap">
              <span>Search registrations</span>
              <input
                type="text"
                placeholder="Event or club name"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <div className="pill-tabs">
              <button
                type="button"
                className={mode === "all" ? "active" : ""}
                onClick={() => setMode("all")}
              >
                All
              </button>
              <button
                type="button"
                className={mode === "upcoming" ? "active" : ""}
                onClick={() => setMode("upcoming")}
              >
                Upcoming
              </button>
              <button
                type="button"
                className={mode === "past" ? "active" : ""}
                onClick={() => setMode("past")}
              >
                Past
              </button>
            </div>
          </div>
        </section>
      </Reveal>

      {message ? <p className="flash-message">{message}</p> : null}

      {loading ? (
        <Reveal>
          <div className="empty-state">
            <h3>Loading registrations...</h3>
          </div>
        </Reveal>
      ) : null}

      {!loading && filteredEvents.length ? (
        <section className="events-grid premium-grid">
          {filteredEvents.map((event, index) => (
            <Reveal key={event._id} delay={index * 40}>
              <EventCard
                event={event}
                actions={
                  <div className="event-actions">
                    {event.registrationDetails ? (
                      <div className="registration-meta">
                        <small>
                          {event.registrationDetails.department} |{" "}
                          {event.registrationDetails.yearOfStudy}
                        </small>
                        <small>Phone: {event.registrationDetails.phone}</small>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      className="ghost-action"
                      onClick={() => handleRemove(event._id)}
                      disabled={removingId === event._id}
                    >
                      <span>
                        {removingId === event._id ? "Removing..." : "Cancel Registration"}
                      </span>
                      <span className="action-icon">
                        <RiDeleteBinLine size={14} />
                      </span>
                    </button>
                    <button type="button" className="primary-action">
                      <span>Open Pass</span>
                      <span className="action-icon">
                        <RiArrowRightUpLine size={14} />
                      </span>
                    </button>
                  </div>
                }
              />
            </Reveal>
          ))}
        </section>
      ) : null}

      {!loading && !filteredEvents.length ? (
        <Reveal>
          <div className="empty-state">
            <h3>No registrations found</h3>
            <p>Register from the Explore page to see your tickets here.</p>
            <p className="empty-hint">
              <RiTicketLine size={16} /> Registrations are synced with your student account.
            </p>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
