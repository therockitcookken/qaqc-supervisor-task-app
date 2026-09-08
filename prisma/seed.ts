import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const admin = await prisma.user.upsert({ where: { email: "admin@local.test" }, update: {}, create: { email: "admin@local.test", name: "Admin", role: "Admin", passwordHash: await bcrypt.hash("Admin123!",10) } });
  const course = await prisma.course.create({ data: { title: "English Basics", description: "Starter", units: { create: [{ title: "Unit 1", order: 1, lessons: { create: [{ title: "Greetings", type: "reading", level: "A1", durationMin: 15, tags: ["intro"], content: "Hello lesson", questions: { create: [{ prompt: "Hello means?", type: "MCQ", options: ["Hi","Bye"], correctAnswer: "Hi", explanation: "synonym", tags: ["placement"] },{ prompt: "Fill: Good ___", type: "gap_fill", correctAnswer: "morning", explanation: "common phrase", tags:["placement"] }] } }] } }] } } });
  const student = await prisma.user.upsert({ where: { email: "student@local.test" }, update: {}, create: { email: "student@local.test", name: "Student", role: "Student", passwordHash: await bcrypt.hash("Student123!",10) } });
  const vocab = await prisma.vocabItem.create({ data: { userId: student.id, word: "greet", meaning: "say hello", sourceLessonId: course.id } });
  await prisma.srsCard.create({ data: { userId: student.id, vocabItemId: vocab.id, dueAt: new Date(), easeFactor: 2.5, interval: 1, repetitions: 0 } });
  console.log({ admin: admin.email, course: course.title });
}
main().finally(() => prisma.$disconnect());
