import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/response";
import { scoreQuiz } from "@/lib/quiz";

export async function POST(req: Request) {
  const body = await req.json();
  if (
    typeof body.userId !== "string" ||
    typeof body.lessonId !== "string" ||
    !Array.isArray(body.questions) ||
    !body.answers ||
    typeof body.answers !== "object"
  ) {
    return fail(400, "invalid_input");
  }

  const questionIds = body.questions
    .map((question: unknown) => (question && typeof question === "object" && "id" in question
      ? (question as { id?: unknown }).id
      : null))
    .filter((id: unknown): id is string => typeof id === "string");

  const uniqueQuestionIds = [...new Set(questionIds)];
  if (uniqueQuestionIds.length === 0 || uniqueQuestionIds.length !== body.questions.length) {
    return fail(400, "invalid_input");
  }

  const questions = await prisma.question.findMany({
    where: {
      id: { in: uniqueQuestionIds },
      lessonId: body.lessonId,
    },
    select: {
      id: true,
      type: true,
      correctAnswer: true,
    },
  });

  if (questions.length !== uniqueQuestionIds.length) {
    return fail(400, "invalid_input");
  }

  const s = scoreQuiz(questions, body.answers);
  const attempt = await prisma.attempt.create({
    data: {
      userId: body.userId,
      lessonId: body.lessonId,
      score: s.score,
      timeSpentSec: typeof body.timeSpentSec === "number" ? body.timeSpentSec : 0,
      answers: {
        create: s.results.map((result) => ({
          questionId: result.questionId,
          userAnswer: body.answers[result.questionId] || "",
          isCorrect: result.isCorrect,
        })),
      },
    },
    include: { answers: true },
  });

  return ok({ attemptId: attempt.id, score: s.score, results: s.results });
}
