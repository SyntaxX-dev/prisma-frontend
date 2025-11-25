export interface QuestionResult {
  questionText: string;
  selectedOption: number | null;
  correctOption: number;
  explanation: string;
  isCorrect: boolean;
  options: Array<{
    optionNumber: number;
    optionText: string;
  }>;
}

export interface QuizResultResponse {
  success: boolean;
  data: {
    sessionId: string;
    topic: string;
    score: number;
    totalQuestions: number;
    questions: QuestionResult[];
  };
}

export async function getQuizResult(
  sessionId: string,
): Promise<QuizResultResponse> {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/quiz/${sessionId}/result`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao buscar resultado');
  }

  return response.json();
}

// Alias export for convenience
export { getQuizResult as getResult };
