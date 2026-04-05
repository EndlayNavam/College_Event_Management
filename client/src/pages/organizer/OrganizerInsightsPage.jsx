import { useEffect, useMemo, useState } from "react";
import { RiBarChartLine, RiCalendarCheckLine, RiPulseLine } from "react-icons/ri";
import api from "../../api/client";
import Reveal from "../../components/Reveal";

function toPercentage(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export default function OrganizerInsightsPage() {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const response = await api.get("/events/organizer/mine");
        setEvents(response.data.items);
      } catch (error) {
        setMessage(error.response?.data?.message || "Unable to load insights.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const metrics = useMemo(() => {
    const now = new Date();
    const total = events.length;
    const approved = events.filter((event) => event.moderationStatus === "approved").length;
    const pending = events.filter((event) => event.moderationStatus === "pending").length;
    const upcoming = events.filter((event) => new Date(event.eventDate) >= now).length;
    return { total, approved, pending, upcoming };
  }, [events]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map();
    events.forEach((event) => {
      map.set(event.category, (map.get(event.category) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: toPercentage(count, events.length)
      }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  return (
    <div className="page-stack">
      <Reveal>
        <section className="bento-grid insights-bento">
          <div className="glass-shell metric-shell">
            <div className="glass-core">
              <p className="metric-label">Total Events</p>
              <h3>{metrics.total}</h3>
              <small>Created by your account</small>
            </div>
          </div>
          <div className="glass-shell metric-shell">
            <div className="glass-core">
              <p className="metric-label">Approved</p>
              <h3>{metrics.approved}</h3>
              <small>Live in student feed</small>
            </div>
          </div>
          <div className="glass-shell metric-shell">
            <div className="glass-core">
              <p className="metric-label">Pending</p>
              <h3>{metrics.pending}</h3>
              <small>Awaiting moderation</small>
            </div>
          </div>
          <div className="glass-shell metric-shell">
            <div className="glass-core">
              <p className="metric-label">Upcoming</p>
              <h3>{metrics.upcoming}</h3>
              <small>Future date schedule</small>
            </div>
          </div>
        </section>
      </Reveal>

      {message ? <p className="flash-message">{message}</p> : null}

      {loading ? (
        <Reveal>
          <div className="empty-state">
            <h3>Loading organizer insights...</h3>
          </div>
        </Reveal>
      ) : null}

      {!loading ? (
        <section className="dual-grid">
          <Reveal delay={60}>
            <div className="glass-shell">
              <div className="glass-core">
                <div className="section-head">
                  <span className="eyebrow">
                    <RiBarChartLine size={13} /> Category Spread
                  </span>
                  <h3>Event Mix by Category</h3>
                </div>

                {categoryBreakdown.length ? (
                  <div className="chart-stack">
                    {categoryBreakdown.map((item, index) => (
                      <div key={item.name} className="chart-row">
                        <div className="chart-head">
                          <span>{item.name}</span>
                          <strong>{item.count}</strong>
                        </div>
                        <div className="chart-track">
                          <span
                            className="chart-fill"
                            style={{
                              transform: `scaleX(${item.percentage / 100})`,
                              transitionDelay: `${120 + index * 80}ms`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted-copy">No category data yet.</p>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="page-stack">
              <div className="glass-shell">
                <div className="glass-core insight-callout">
                  <h3>
                    <RiPulseLine size={16} /> Approval Rate
                  </h3>
                  <p>
                    {metrics.total
                      ? `${toPercentage(metrics.approved, metrics.total)}% of your events are approved.`
                      : "Create your first event to unlock approval metrics."}
                  </p>
                </div>
              </div>

              <div className="glass-shell">
                <div className="glass-core insight-callout">
                  <h3>
                    <RiCalendarCheckLine size={16} /> Next Action
                  </h3>
                  <p>
                    Move draft events to pending and keep timing details specific to
                    reduce moderation turnaround.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      ) : null}
    </div>
  );
}
