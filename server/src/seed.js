import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectDatabase, getDb } from "./config/db.js";

dotenv.config();

const mockUsers = [
  {
    name: "Priya Menon",
    email: "admin@campus.test",
    password: "Admin123!",
    role: "admin"
  },
  {
    name: "Arjun Kapoor",
    email: "arjun.organizer@campus.test",
    password: "Organize123!",
    role: "organizer"
  },
  {
    name: "Nisha Verma",
    email: "nisha.organizer@campus.test",
    password: "Organize123!",
    role: "organizer"
  },
  {
    name: "Ananya Rao",
    email: "ananya.student@campus.test",
    password: "Student123!",
    role: "student"
  },
  {
    name: "Rahul Iyer",
    email: "rahul.student@campus.test",
    password: "Student123!",
    role: "student"
  },
  {
    name: "Meera Shah",
    email: "meera.student@campus.test",
    password: "Student123!",
    role: "student"
  }
];

const imageByCategory = {
  Technical:
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1000&q=80",
  Cultural:
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
  Seminar:
    "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=1000&q=80",
  Sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80",
  Creative:
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80",
  Workshop:
    "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1000&q=80"
};

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

const mockEvents = [
  {
    key: "hackathon",
    eventName: "Apex Campus Hackathon",
    clubName: "Coding Club",
    eventDate: daysFromNow(8),
    timing: "09:00 AM - 08:00 PM",
    venue: "Innovation Block Lab 2",
    cost: 0,
    category: "Technical",
    shortDescription:
      "Team-based product sprint with mentor checkpoints and demo showcase.",
    prizes: "Winner: INR 30,000 | Runner-up: INR 15,000",
    moderationStatus: "approved",
    createdByEmail: "arjun.organizer@campus.test"
  },
  {
    key: "ai-workshop",
    eventName: "Applied AI Workshop",
    clubName: "AI Society",
    eventDate: daysFromNow(12),
    timing: "10:30 AM - 01:30 PM",
    venue: "Seminar Hall 1",
    cost: 50,
    category: "Workshop",
    shortDescription: "Hands-on practical on model deployment and prompt workflows.",
    prizes: "Certificate + Internship shortlist",
    moderationStatus: "approved",
    createdByEmail: "arjun.organizer@campus.test"
  },
  {
    key: "robotics",
    eventName: "Robotics Build Challenge",
    clubName: "Robotics Forum",
    eventDate: daysFromNow(18),
    timing: "11:00 AM - 05:00 PM",
    venue: "Mechanical Workshop Floor",
    cost: 100,
    category: "Technical",
    shortDescription: "Prototype race focused on autonomous navigation constraints.",
    prizes: "Winner: INR 20,000",
    moderationStatus: "pending",
    createdByEmail: "arjun.organizer@campus.test"
  },
  {
    key: "classical-night",
    eventName: "Classical Evening",
    clubName: "Music Club",
    eventDate: daysFromNow(6),
    timing: "06:00 PM - 09:00 PM",
    venue: "Open Air Theatre",
    cost: 20,
    category: "Cultural",
    shortDescription: "Solo and ensemble performances with jury-based scoring.",
    prizes: "Best Solo: INR 8,000 | Best Ensemble: INR 12,000",
    moderationStatus: "approved",
    createdByEmail: "nisha.organizer@campus.test"
  },
  {
    key: "street-play",
    eventName: "Street Play Jam",
    clubName: "Dramatics Circle",
    eventDate: daysFromNow(15),
    timing: "04:00 PM - 07:00 PM",
    venue: "Central Courtyard",
    cost: 0,
    category: "Creative",
    shortDescription: "Short-format social issue performances across student teams.",
    prizes: "Best Storytelling Team: INR 10,000",
    moderationStatus: "draft",
    createdByEmail: "nisha.organizer@campus.test"
  },
  {
    key: "entre-summit",
    eventName: "Startup Pitch Summit",
    clubName: "E-Cell",
    eventDate: daysFromNow(22),
    timing: "09:30 AM - 04:30 PM",
    venue: "Business Block Auditorium",
    cost: 120,
    category: "Seminar",
    shortDescription: "Early-stage startup pitches with investor-style review panel.",
    prizes: "Top Pitch: Seed grant recommendation",
    moderationStatus: "rejected",
    rejectionReason: "Please attach clearer judging rubric and participation limits.",
    createdByEmail: "arjun.organizer@campus.test"
  },
  {
    key: "debate-forum",
    eventName: "Public Debate Forum",
    clubName: "Literary Club",
    eventDate: daysFromNow(-5),
    timing: "02:00 PM - 05:00 PM",
    venue: "Humanities Lecture Hall",
    cost: 0,
    category: "Seminar",
    shortDescription: "Inter-department policy debate with adjudication rounds.",
    prizes: "Best Speaker: INR 5,000",
    moderationStatus: "approved",
    createdByEmail: "nisha.organizer@campus.test"
  },
  {
    key: "football",
    eventName: "Inter-Department Football League",
    clubName: "Sports Council",
    eventDate: daysFromNow(10),
    timing: "07:00 AM - 11:30 AM",
    venue: "Main Football Ground",
    cost: 0,
    category: "Sports",
    shortDescription: "Knockout fixtures with final match hosted on annual sports day.",
    prizes: "Champion Trophy + INR 18,000",
    moderationStatus: "approved",
    createdByEmail: "nisha.organizer@campus.test"
  },
  {
    key: "design-clinic",
    eventName: "Design Critique Clinic",
    clubName: "Design Guild",
    eventDate: daysFromNow(14),
    timing: "01:00 PM - 04:00 PM",
    venue: "Architecture Studio 3",
    cost: 30,
    category: "Creative",
    shortDescription: "Portfolio review circles with faculty and alumni feedback.",
    prizes: "Top Portfolio Mention",
    moderationStatus: "pending",
    createdByEmail: "nisha.organizer@campus.test"
  },
  {
    key: "poetry-slam",
    eventName: "Campus Poetry Slam",
    clubName: "Literary Club",
    eventDate: daysFromNow(4),
    timing: "05:00 PM - 07:30 PM",
    venue: "Library Amphitheatre",
    cost: 0,
    category: "Cultural",
    shortDescription: "Open microphone poetry rounds with audience-vote finale.",
    prizes: "Winner: INR 6,000",
    moderationStatus: "approved",
    createdByEmail: "nisha.organizer@campus.test"
  }
];

async function insertUsers() {
  const userInsertStatement = getDb().prepare(
    `
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `
  );

  const userIdByEmail = {};
  for (const user of mockUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const result = userInsertStatement.run(
      user.name,
      user.email,
      passwordHash,
      user.role
    );
    userIdByEmail[user.email] = Number(result.lastInsertRowid);
  }

  return userIdByEmail;
}

function insertEvents(userIdByEmail) {
  const eventInsertStatement = getDb().prepare(
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
        rejection_reason,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  );

  const eventIdByKey = {};

  for (const event of mockEvents) {
    const result = eventInsertStatement.run(
      event.eventName,
      event.clubName,
      event.eventDate,
      event.timing,
      event.venue,
      event.cost,
      event.category,
      event.shortDescription,
      event.prizes,
      imageByCategory[event.category],
      event.moderationStatus,
      event.rejectionReason || "",
      userIdByEmail[event.createdByEmail]
    );
    eventIdByKey[event.key] = Number(result.lastInsertRowid);
  }

  return eventIdByKey;
}

function insertRegistrations(userIdByEmail, eventIdByKey) {
  const registrationInsertStatement = getDb().prepare(
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
  );

  const registrations = [
    {
      eventKey: "hackathon",
      email: "ananya.student@campus.test",
      participantName: "Ananya Rao",
      phone: "9876543210",
      department: "Computer Science",
      yearOfStudy: "3rd Year",
      emergencyContact: "Anand Rao - 9898001122",
      notes: "Available for full-day challenge."
    },
    {
      eventKey: "ai-workshop",
      email: "ananya.student@campus.test",
      participantName: "Ananya Rao",
      phone: "9876543210",
      department: "Computer Science",
      yearOfStudy: "3rd Year",
      emergencyContact: "Anand Rao - 9898001122",
      notes: "Interested in deployment track."
    },
    {
      eventKey: "classical-night",
      email: "rahul.student@campus.test",
      participantName: "Rahul Iyer",
      phone: "9811223344",
      department: "Mechanical Engineering",
      yearOfStudy: "2nd Year",
      emergencyContact: "Suman Iyer - 9811223300",
      notes: "Participating as vocalist."
    },
    {
      eventKey: "football",
      email: "rahul.student@campus.test",
      participantName: "Rahul Iyer",
      phone: "9811223344",
      department: "Mechanical Engineering",
      yearOfStudy: "2nd Year",
      emergencyContact: "Suman Iyer - 9811223300",
      notes: "Team captain for Dept B."
    },
    {
      eventKey: "poetry-slam",
      email: "meera.student@campus.test",
      participantName: "Meera Shah",
      phone: "9900112233",
      department: "Electronics",
      yearOfStudy: "1st Year",
      emergencyContact: "Ritu Shah - 9900112200",
      notes: "Open mic category."
    }
  ];

  registrations.forEach((registration) => {
    registrationInsertStatement.run(
      eventIdByKey[registration.eventKey],
      userIdByEmail[registration.email],
      registration.participantName,
      registration.email,
      registration.phone,
      registration.department,
      registration.yearOfStudy,
      registration.emergencyContact,
      registration.notes,
      1
    );
  });
}

function clearAllData() {
  getDb().exec(
    `
      DELETE FROM registrations;
      DELETE FROM events;
      DELETE FROM users;
      DELETE FROM sqlite_sequence WHERE name IN ('registrations', 'events', 'users');
    `
  );
}

function printCredentials() {
  // eslint-disable-next-line no-console
  console.log("Mock seed completed. Test users:");
  // eslint-disable-next-line no-console
  console.table(
    mockUsers.map((user) => ({
      role: user.role,
      name: user.name,
      email: user.email,
      password: user.password
    }))
  );
}

async function runSeed() {
  await connectDatabase();
  clearAllData();

  const userIdByEmail = await insertUsers();
  const eventIdByKey = insertEvents(userIdByEmail);
  insertRegistrations(userIdByEmail, eventIdByKey);

  printCredentials();
}

runSeed()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", error.message);
    process.exit(1);
  });
