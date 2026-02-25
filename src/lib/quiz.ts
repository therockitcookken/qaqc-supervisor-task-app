export function scoreQuiz(questions: {id:string; type:string; correctAnswer:string}[], answers: Record<string,string>) {
  let correct = 0;
  const results = questions.map((q) => {
    const isCorrect = (answers[q.id] || "").trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    if (isCorrect) correct++;
    return { questionId: q.id, isCorrect };
  });
  return { correct, total: questions.length, score: questions.length ? Math.round((correct/questions.length)*100) : 0, results };
}
