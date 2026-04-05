import { useEffect, useMemo, useState } from "react";
import { RiCalendarLine, RiSearch2Line, RiSparkling2Line, RiTicketLine } from "react-icons/ri";
import api from "../../api/client";
import EventCard from "../../components/EventCard";
import Pagination from "../../components/Pagination";
import RegistrationFlowModal from "../../components/RegistrationFlowModal";
import Reveal from "../../components/Reveal";
import SkeletonCard from "../../components/SkeletonCard";
import { useAuth } from "../../context/AuthContext";

const categories = [
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Seminar",
  "Creative"
];

export default function StudentEventsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    club: "",
    date: "",
    status: ""
  });
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState("");
  const [message, setMessage] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const queryParams = useMemo(
    () => ({
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    }),
    [pagination.page, pagination.limit, filters]
  );

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get("/events/student", { params: queryParams });
        setItems(response.data.items);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.pagination.totalPages || 1,
          totalItems: response.data.pagination.totalItems || 0
        }));
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to load events.");
      } finally {
        setLoading(false);
      }
    }, 260);

    return () => clearTimeout(timeout);
  }, [queryParams]);

  const activeCount = items.filter((item) => item.studentStatus === "Active").length;
  const draftCount = items.filter((item) => item.studentStatus === "Draft").length;

  const updateFilter = (key, value) => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openRegistration = (event) => {
    if (!event || event.isRegistered || event.studentStatus !== "Active") return;
    setRegistrationError("");
    setSelectedEvent(event);
  };

  const closeRegistration = () => {
    if (registeringId) return;
    setSelectedEvent(null);
    setRegistrationError("");
  };

  const handleRegister = async (payload) => {
    if (!selectedEvent) return;
    setRegisteringId(selectedEvent._id);
    setMessage("");
    setRegistrationError("");
    try {
      const response = await api.post(`/events/${selectedEvent._id}/register`, payload);
      setItems((prev) =>
        prev.map((event) =>
          event._id === selectedEvent._id ? { ...event, isRegistered: true } : event
        )
      );
      setMessage(response.data.message);
      setSelectedEvent(null);
    } catch (error) {
      setRegistrationError(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setRegisteringId("");
    }
  };

  return (
    <div className="page-stack">
      <Reveal>
        <section className="bento-grid">
          <div className="glass-shell bento-main">
            <div className="glass-core">
              <span className="eyebrow">Student Discovery</span>
              <h2>Find campus experiences that match your momentum.</h2>
              <p>
                Explore curated events, filter by club or category, and register in one
                fluid flow.
              </p>
            </div>
          </div>

          <div className="glass-shell metric-shell">
            <div className="glass-core">
              <p className="metric-label">Visible Events</p>
              <h3>{pagination.totalItems}</h3>
              <small>Across all student-facing statuses</small>
            </div>
          </div>

          <div className="glass-shell metric-shell">
            <div className="glass-core">
              <p className="metric-label">Active This Week</p>
              <h3>{activeCount}</h3>
              <small>Open for registration</small>
            </div>
          </div>

          <div className="glass-shell metric-shell">
            <div className="glass-core">
              <p className="metric-label">Draft Releases</p>
              <h3>{draftCount}</h3>
              <small>Soon to be approved</small>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={70}>
        <section className="glass-shell">
          <div className="glass-core form-core">
            <div className="section-head">
              <span className="eyebrow">Filters</span>
              <h3>Shape Your Feed</h3>
            </div>
            <div className="filter-grid premium">
              <label className="field-wrap">
                <span>
                  <RiSearch2Line size={14} />
                  Search
                </span>
                <input
                  type="text"
                  placeholder="Title or keyword"
                  value={filters.search}
                  onChange={(event) => updateFilter("search", event.target.value)}
                />
              </label>

              <label className="field-wrap">
                <span>
                  <RiSparkling2Line size={14} />
                  Category
                </span>
                <select
                  value={filters.category}
                  onChange={(event) => updateFilter("category", event.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-wrap">
                <span>
                  <RiTicketLine size={14} />
                  Club
                </span>
                <input
                  type="text"
                  placeholder="Club name"
                  value={filters.club}
                  onChange={(event) => updateFilter("club", event.target.value)}
                />
              </label>

              <label className="field-wrap">
                <span>
                  <RiCalendarLine size={14} />
                  Date
                </span>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(event) => updateFilter("date", event.target.value)}
                />
              </label>

              <label className="field-wrap">
                <span>Status</span>
                <select
                  value={filters.status}
                  onChange={(event) => updateFilter("status", event.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Past">Past</option>
                </select>
              </label>
            </div>
          </div>
        </section>
      </Reveal>

      {message ? <p className="flash-message">{message}</p> : null}

      <section className="events-grid premium-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Reveal key={index} delay={index * 50}>
                <SkeletonCard />
              </Reveal>
            ))
          : items.map((event, index) => (
              <Reveal key={event._id} delay={index * 40}>
                <EventCard
                  event={event}
                  showRegister
                  isRegistered={Boolean(event.isRegistered)}
                  registerLoading={registeringId === event._id}
                  registerDisabled={
                    event.studentStatus !== "Active" || Boolean(event.isRegistered)
                  }
                  onRegister={openRegistration}
                />
              </Reveal>
            ))}
      </section>

      {!loading && !items.length ? (
        <Reveal>
          <div className="empty-state">
            <h3>No events match your filters</h3>
            <p>Adjust the search or category mix to discover more opportunities.</p>
          </div>
        </Reveal>
      ) : null}

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(nextPage) =>
          setPagination((prev) => ({ ...prev, page: nextPage }))
        }
      />

      <RegistrationFlowModal
        open={Boolean(selectedEvent)}
        event={selectedEvent}
        user={user}
        onClose={closeRegistration}
        onSubmit={handleRegister}
        submitting={Boolean(registeringId)}
        submitError={registrationError}
      />
    </div>
  );
}
