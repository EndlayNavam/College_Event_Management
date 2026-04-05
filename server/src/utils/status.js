export function getStudentFacingStatus(event) {
  if (event.moderationStatus === "draft") {
    return "Draft";
  }

  const now = new Date();
  const isPast = new Date(event.eventDate) < now;
  return isPast ? "Past" : "Active";
}
