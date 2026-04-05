import {
  RiArrowRightUpLine,
  RiMapPinLine,
  RiMedalLine,
  RiTimeLine
} from "react-icons/ri";
import StatusTag from "./StatusTag";

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium"
  }).format(new Date(dateValue));
}

function occupancyScore(eventName) {
  const value = eventName
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (value % 46) + 40;
}

export default function EventCard({
  event,
  statusLabel,
  showRegister = false,
  isRegistered = false,
  onRegister,
  registerLoading = false,
  registerDisabled = false,
  actions
}) {
  const occupancy = occupancyScore(event.eventName || "");

  return (
    <article className="event-shell reveal-item in">
      <div className="event-core">
        <img src={event.imageUrl} alt={event.eventName} className="event-cover" />
        <div className="event-content">
          <div className="event-meta-top">
            <p className="event-club">{event.clubName}</p>
            <StatusTag label={statusLabel || event.studentStatus || "pending"} />
          </div>

          <h3>{event.eventName}</h3>
          <p className="event-description">{event.shortDescription}</p>

          <div className="event-details">
            <p>
              <strong>Date:</strong> {formatDate(event.eventDate)}
            </p>
            <p>
              <RiTimeLine size={14} /> {event.timing}
            </p>
            <p>
              <RiMapPinLine size={14} /> {event.venue}
            </p>
            <p>
              <strong>Category:</strong> {event.category}
            </p>
            <p>
              <strong>Cost:</strong> INR {event.cost}
            </p>
            <p>
              <RiMedalLine size={14} /> {event.prizes}
            </p>
          </div>

          <div className="card-meter">
            <div className="meter-track">
              <span style={{ width: `${occupancy}%` }} />
            </div>
            <div className="meter-row">
              <small>{occupancy}% slots filled</small>
              <strong>INR {event.cost}</strong>
            </div>
          </div>

          <div className="event-hover-cta">
            <button type="button" className="ghost-action cta-inline">
              <span>Learn More</span>
              <span className="action-icon">
                <RiArrowRightUpLine size={14} />
              </span>
            </button>
          </div>

          {showRegister && (
          <button
            type="button"
            className="primary-action card-btn"
            onClick={() => onRegister?.(event)}
            disabled={registerLoading || registerDisabled}
          >
            <span>
              {registerLoading
                ? "Registering..."
                : isRegistered
                  ? "Registered"
                  : "Start Registration"}
            </span>
            <span className="action-icon">
              <RiArrowRightUpLine size={14} />
            </span>
            </button>
          )}

          {actions ? <div className="event-actions">{actions}</div> : null}
        </div>
      </div>
    </article>
  );
}
