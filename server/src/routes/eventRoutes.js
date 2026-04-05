import express from "express";
import { getDb } from "../config/db.js";
import { authorize, authenticate } from "../middleware/auth.js";
import { getStudentFacingStatus } from "../utils/status.js";

const router = express.Router();

const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80";

function toEventResponse(row) {
  if (!row) return null;

  const mappedEvent = {
    _id: String(row.id),
    eventName: row.event_name,
    clubName: row.club_name,
    eventDate: row.event_date,
    timing: row.timing,
    venue: row.venue,
    cost: Number(row.cost || 0),
    category: row.category,
    shortDescription: row.short_description,
    prizes: row.prizes,
    imageUrl: row.image_url || DEFAULT_IMAGE_URL,
    moderationStatus: row.moderation_status,
    rejectionReason: row.rejection_reason || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isRegistered: Boolean(row.is_registered)
  };

  if (row.creator_id) {
    mappedEvent.createdBy = {
      id: String(row.creator_id),
      name: row.creator_name,
      email: row.creator_email
    };
  } else if (row.created_by) {
    mappedEvent.createdBy = String(row.created_by);
  }

  return mappedEvent;
}

function withStudentStatus(event) {
  return {
    ...event,
    studentStatus: getStudentFacingStatus(event)
  };
}

function getEventById(eventId) {
  const row = getDb()
    .prepare(
      `
        SELECT
          e.*,
          u.id AS creator_id,
          u.name AS creator_name,
          u.email AS creator_email
        FROM events e
        LEFT JOIN users u ON u.id = e.created_by
        WHERE e.id = ?
      `
    )
    .get(Number(eventId));

  return toEventResponse(row);
}

router.get("/student", authenticate, authorize("student"), async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      club = "",
      date = "",
      status = "",
      page = "1",
      limit = "6"
    } = req.query;

    const conditions = [];
    const params = [];

    const normalizedStatus = String(status).toLowerCase();
    if (normalizedStatus === "draft") {
      conditions.push("e.moderation_status = 'draft'");
    } else if (normalizedStatus === "active") {
      conditions.push("e.moderation_status = 'approved'");
      conditions.push("datetime(e.event_date) >= datetime('now')");
    } else if (normalizedStatus === "past") {
      conditions.push("e.moderation_status = 'approved'");
      conditions.push("datetime(e.event_date) < datetime('now')");
    } else {
      conditions.push("e.moderation_status IN ('approved', 'draft')");
    }

    if (search) {
      const searchValue = `%${String(search).toLowerCase()}%`;
      conditions.push(
        `
          (
            LOWER(e.event_name) LIKE ?
            OR LOWER(e.short_description) LIKE ?
            OR LOWER(e.club_name) LIKE ?
            OR LOWER(e.category) LIKE ?
          )
        `
      );
      params.push(searchValue, searchValue, searchValue, searchValue);
    }

    if (category) {
      conditions.push("LOWER(e.category) = LOWER(?)");
      params.push(category);
    }

    if (club) {
      conditions.push("LOWER(e.club_name) LIKE ?");
      params.push(`%${String(club).toLowerCase()}%`);
    }

    if (date) {
      conditions.push("date(e.event_date) = date(?)");
      params.push(date);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 6, 1);
    const offset = (pageNumber - 1) * pageSize;

    const countRow = getDb()
      .prepare(`SELECT COUNT(*) AS total_items FROM events e ${whereClause}`)
      .get(...params);

    const rows = getDb()
      .prepare(
        `
          SELECT
            e.*,
            u.id AS creator_id,
            u.name AS creator_name,
            u.email AS creator_email,
            CASE WHEN r.id IS NULL THEN 0 ELSE 1 END AS is_registered
          FROM events e
          LEFT JOIN registrations r
            ON r.event_id = e.id
           AND r.student_id = ?
          LEFT JOIN users u ON u.id = e.created_by
          ${whereClause}
          ORDER BY datetime(e.event_date) ASC
          LIMIT ? OFFSET ?
        `
      )
      .all(Number(req.user.id), ...params, pageSize, offset);

    const events = rows.map((row) => withStudentStatus(toEventResponse(row)));
    const totalItems = Number(countRow?.total_items || 0);

    res.json({
      items: events,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student events." });
  }
});

router.get(
  "/student/registrations",
  authenticate,
  authorize("student"),
  async (req, res) => {
    try {
      const rows = getDb()
        .prepare(
          `
            SELECT
              e.*,
              u.id AS creator_id,
              u.name AS creator_name,
              u.email AS creator_email,
              1 AS is_registered,
              r.id AS registration_id,
              r.created_at AS registered_at,
              r.participant_name,
              r.student_email,
              r.phone,
              r.department,
              r.year_of_study,
              r.emergency_contact,
              r.additional_notes
            FROM registrations r
            INNER JOIN events e ON e.id = r.event_id
            LEFT JOIN users u ON u.id = e.created_by
            WHERE r.student_id = ?
            ORDER BY datetime(e.event_date) ASC
          `
        )
        .all(Number(req.user.id));

      const items = rows.map((row) => ({
        ...withStudentStatus(toEventResponse(row)),
        registrationId: String(row.registration_id),
        registeredAt: row.registered_at,
        registrationDetails: {
          participantName: row.participant_name,
          studentEmail: row.student_email,
          phone: row.phone,
          department: row.department,
          yearOfStudy: row.year_of_study,
          emergencyContact: row.emergency_contact,
          additionalNotes: row.additional_notes
        }
      }));

      res.json({ items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations." });
    }
  }
);

router.post("/", authenticate, authorize("organizer", "admin"), async (req, res) => {
  try {
    const {
      eventName,
      clubName,
      eventDate,
      timing,
      venue,
      cost,
      category,
      shortDescription,
      prizes,
      imageUrl,
      submissionType = "pending"
    } = req.body;

    const requiredFields = [
      eventName,
      clubName,
      eventDate,
      timing,
      venue,
      category,
      shortDescription,
      prizes
    ];

    if (requiredFields.some((field) => !field)) {
      res.status(400).json({ message: "Please fill all required fields." });
      return;
    }

    const parsedEventDate = new Date(eventDate);
    if (Number.isNaN(parsedEventDate.getTime())) {
      res.status(400).json({ message: "Invalid event date." });
      return;
    }

    const moderationStatus = submissionType === "draft" ? "draft" : "pending";

    const insertResult = getDb()
      .prepare(
        `
          INSERT INTO events (
            event_name,
            club_name,
            event_date,
            timing,
            venue,
            cost,
            category,
            short_description,
            prizes,
            image_url,
            moderation_status,
            created_by
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        eventName,
        clubName,
        parsedEventDate.toISOString(),
        timing,
        venue,
        Number(cost || 0),
        category,
        shortDescription,
        prizes,
        imageUrl || DEFAULT_IMAGE_URL,
        moderationStatus,
        Number(req.user.id)
      );

    const event = getEventById(Number(insertResult.lastInsertRowid));
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ message: "Failed to create event." });
  }
});

router.get(
  "/organizer/mine",
  authenticate,
  authorize("organizer"),
  async (req, res) => {
    try {
      const rows = getDb()
        .prepare(
          `
            SELECT
              e.*,
              u.id AS creator_id,
              u.name AS creator_name,
              u.email AS creator_email
            FROM events e
            LEFT JOIN users u ON u.id = e.created_by
            WHERE e.created_by = ?
            ORDER BY datetime(e.created_at) DESC
          `
        )
        .all(Number(req.user.id));

      res.json({ items: rows.map(toEventResponse) });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organizer events." });
    }
  }
);

router.patch(
  "/organizer/:eventId/submit",
  authenticate,
  authorize("organizer"),
  async (req, res) => {
    try {
      const eventId = Number(req.params.eventId);
      const updateResult = getDb()
        .prepare(
          `
            UPDATE events
            SET moderation_status = 'pending', updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND created_by = ?
          `
        )
        .run(eventId, Number(req.user.id));

      if (!updateResult.changes) {
        res.status(404).json({ message: "Event not found." });
        return;
      }

      const event = getEventById(eventId);
      res.json({ event });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit event for approval." });
    }
  }
);

router.post(
  "/:eventId/register",
  authenticate,
  authorize("student"),
  async (req, res) => {
    try {
      const {
        participantName,
        studentEmail,
        phone,
        department,
        yearOfStudy,
        emergencyContact,
        additionalNotes = "",
        agreedToTerms
      } = req.body || {};

      const requiredFields = [
        participantName,
        studentEmail,
        phone,
        department,
        yearOfStudy,
        emergencyContact
      ];

      if (requiredFields.some((field) => !String(field || "").trim())) {
        res.status(400).json({ message: "Please complete all registration details." });
        return;
      }

      const emailValue = String(studentEmail).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        res.status(400).json({ message: "Please provide a valid email address." });
        return;
      }

      if (!/^[0-9+\-\s()]{8,20}$/.test(String(phone).trim())) {
        res.status(400).json({ message: "Please provide a valid phone number." });
        return;
      }

      if (!Boolean(agreedToTerms)) {
        res.status(400).json({ message: "You must accept the terms to continue." });
        return;
      }

      const eventId = Number(req.params.eventId);
      const event = getDb()
        .prepare(
          `
            SELECT id, moderation_status, event_date
            FROM events
            WHERE id = ?
          `
        )
        .get(eventId);

      if (!event) {
        res.status(404).json({ message: "Event not found." });
        return;
      }

      if (event.moderation_status !== "approved") {
        res
          .status(400)
          .json({ message: "Registration opens only for approved events." });
        return;
      }

      if (new Date(event.event_date) < new Date()) {
        res.status(400).json({ message: "Cannot register for past events." });
        return;
      }

      const registrationResult = getDb()
        .prepare(
          `
            INSERT INTO registrations (
              event_id,
              student_id,
              participant_name,
              student_email,
              phone,
              department,
              year_of_study,
              emergency_contact,
              additional_notes,
              agreed_to_terms
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `
        )
        .run(
          eventId,
          Number(req.user.id),
          String(participantName).trim(),
          emailValue,
          String(phone).trim(),
          String(department).trim(),
          String(yearOfStudy).trim(),
          String(emergencyContact).trim(),
          String(additionalNotes || "").trim(),
          1
        );

      res.status(201).json({
        message: "Successfully registered for the event.",
        registration: {
          _id: String(registrationResult.lastInsertRowid),
          event: String(eventId),
          student: String(req.user.id),
          participantName: String(participantName).trim(),
          studentEmail: emailValue
        }
      });
    } catch (error) {
      const isDuplicate =
        error?.code === "SQLITE_CONSTRAINT_UNIQUE" ||
        String(error?.message || "").includes("UNIQUE constraint failed");

      if (isDuplicate) {
        res.status(409).json({ message: "You already registered." });
        return;
      }

      res.status(500).json({ message: "Failed to register for event." });
    }
  }
);

router.delete(
  "/student/registrations/:eventId",
  authenticate,
  authorize("student"),
  async (req, res) => {
    try {
      const result = getDb()
        .prepare(
          `
            DELETE FROM registrations
            WHERE student_id = ? AND event_id = ?
          `
        )
        .run(Number(req.user.id), Number(req.params.eventId));

      if (!result.changes) {
        res.status(404).json({ message: "Registration not found." });
        return;
      }

      res.json({ message: "Registration removed successfully." });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove registration." });
    }
  }
);

router.get(
  "/admin/pending",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const rows = getDb()
        .prepare(
          `
            SELECT
              e.*,
              u.id AS creator_id,
              u.name AS creator_name,
              u.email AS creator_email
            FROM events e
            LEFT JOIN users u ON u.id = e.created_by
            WHERE e.moderation_status = 'pending'
            ORDER BY datetime(e.created_at) DESC
          `
        )
        .all();

      res.json({ items: rows.map(toEventResponse) });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending events." });
    }
  }
);

router.get(
  "/admin/active",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const rows = getDb()
        .prepare(
          `
            SELECT
              e.*,
              u.id AS creator_id,
              u.name AS creator_name,
              u.email AS creator_email
            FROM events e
            LEFT JOIN users u ON u.id = e.created_by
            WHERE e.moderation_status = 'approved'
            ORDER BY datetime(e.event_date) ASC
          `
        )
        .all();

      const items = rows.map((row) => withStudentStatus(toEventResponse(row)));
      res.json({ items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active events." });
    }
  }
);

router.get(
  "/admin/rejected",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const rows = getDb()
        .prepare(
          `
            SELECT
              e.*,
              u.id AS creator_id,
              u.name AS creator_name,
              u.email AS creator_email
            FROM events e
            LEFT JOIN users u ON u.id = e.created_by
            WHERE e.moderation_status = 'rejected'
            ORDER BY datetime(e.updated_at) DESC
          `
        )
        .all();

      res.json({ items: rows.map(toEventResponse) });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rejected events." });
    }
  }
);

router.patch(
  "/admin/:eventId/moderate",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { action, rejectionReason = "" } = req.body;
      if (!["approve", "reject"].includes(action)) {
        res.status(400).json({ message: "Invalid moderation action." });
        return;
      }

      const eventId = Number(req.params.eventId);
      let updateResult;

      if (action === "approve") {
        updateResult = getDb()
          .prepare(
            `
              UPDATE events
              SET moderation_status = 'approved',
                  rejection_reason = '',
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `
          )
          .run(eventId);
      } else {
        updateResult = getDb()
          .prepare(
            `
              UPDATE events
              SET moderation_status = 'rejected',
                  rejection_reason = ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `
          )
          .run(rejectionReason, eventId);
      }

      if (!updateResult.changes) {
        res.status(404).json({ message: "Event not found." });
        return;
      }

      const event = getEventById(eventId);
      res.json({ event });
    } catch (error) {
      res.status(500).json({ message: "Failed to update event status." });
    }
  }
);

export default router;
