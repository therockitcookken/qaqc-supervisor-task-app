import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/response";

export async function POST(req: Request) {
  const { lessonId } = await req.json();
  if (!lessonId || typeof lessonId !== "string") return fail(400, "invalid_input");

  const questions = await prisma.question.findMany({
    where: { lessonId },
    select: {
      id: true,
      prompt: true,
      type: true,
      options: true,
      difficulty: true,
      tags: true,
    },
  });

  return ok({ questions });
}
