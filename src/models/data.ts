import { Instructor } from "@/models/instructor";

export const InstructorData: Instructor[] = [
  {
    id: "001",
    name: "Carlos",
    lastname: "González",
    user_id: "user_001",
    email: "carlos.gonzalez@example.com",
    phone: "+58 4121234567",
    document: "V12345678",
    date: "1985-06-15",
    gender: "male",
    specialty: "Entrenamiento funcional",
    biography: "Carlos tiene más de 10 años de experiencia como instructor de fitness especializado en entrenamiento funcional y movilidad.",
    status: "active",
    uacceso: "2025-10-30T14:45:00"
  },
  {
    id: "002",
    name: "María",
    lastname: "Fernández",
    user_id: "user_002",
    email: "maria.fernandez@example.com",
    phone: "+58 414-7654321",
    document: "V87654321",
    date: "1990-03-22",
    gender: "female",
    specialty: "Yoga y meditación",
    biography: "María es instructora certificada en yoga y meditación, enfocada en bienestar integral y técnicas de respiración consciente.",
    status: "active",
    uacceso: "2025-10-29T09:20:00"
  },
  {
    id: "003",
    name: "Luis",
    lastname: "Ramírez",
    user_id: "user_003",
    email: "luis.ramirez@example.com",
    phone: "+58 424-1122334",
    document: "V11223344",
    date: "1982-11-05",
    gender: "male",
    specialty: "Musculación",
    biography: "Luis ha trabajado como entrenador personal por más de 15 años, especializado en musculación y nutrición deportiva.",
    status: "active",
    uacceso: "2025-10-15T18:10:00"
  },
  {
    id: "004",
    name: "Ana",
    lastname: "Torres",
    user_id: "user_004",
    email: "ana.torres@example.com",
    phone: "+58 412-9988776",
    document: "V99887766",
    date: "1995-08-30",
    gender: "female",
    specialty: "Pilates",
    biography: "Ana combina técnicas de pilates con ejercicios de rehabilitación para mejorar la postura y fortalecer el core.",
    status: "blocked",
    uacceso: "2025-09-28T11:00:00"
  },
];