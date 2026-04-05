import {
  RiBarChartBoxLine,
  RiCalendarEventLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiDraftLine,
  RiLayoutGridLine,
  RiListCheck3,
  RiMagicLine,
  RiSearchLine
} from "react-icons/ri";

export const roleNavigation = {
  student: {
    title: "Student Dashboard",
    subtitle: "Discover events and manage registrations.",
    items: [
      {
        label: "Explore",
        to: "/student/events",
        icon: RiSearchLine
      },
      {
        label: "Registrations",
        to: "/student/registrations",
        icon: RiListCheck3
      },
      {
        label: "Calendar",
        to: "/student/calendar",
        icon: RiCalendarLine
      }
    ]
  },
  organizer: {
    title: "Organizer Dashboard",
    subtitle: "Create events and track approvals.",
    items: [
      {
        label: "Create Event",
        to: "/organizer/create",
        icon: RiMagicLine
      },
      {
        label: "Submissions",
        to: "/organizer/submissions",
        icon: RiDraftLine
      },
      {
        label: "Insights",
        to: "/organizer/insights",
        icon: RiBarChartBoxLine
      }
    ]
  },
  admin: {
    title: "Admin Dashboard",
    subtitle: "Moderate events and manage status.",
    items: [
      {
        label: "Pending",
        to: "/admin/pending",
        icon: RiCalendarEventLine
      },
      {
        label: "Active",
        to: "/admin/active",
        icon: RiCheckboxCircleLine
      },
      {
        label: "Rejected",
        to: "/admin/rejected",
        icon: RiCloseCircleLine
      }
    ]
  }
};

export const defaultRouteByRole = {
  student: "/student/events",
  organizer: "/organizer/create",
  admin: "/admin/pending"
};

export function getRoleNavigation(role) {
  return roleNavigation[role] || roleNavigation.student;
}

export function getDefaultRoute(role) {
  return defaultRouteByRole[role] || "/student/events";
}

export const roleGlyph = {
  student: RiLayoutGridLine,
  organizer: RiMagicLine,
  admin: RiCalendarEventLine
};
