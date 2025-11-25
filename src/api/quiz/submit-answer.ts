export interface SubmitAnswerResponse {
  success: boolean;
  data: {
    isCorrect: boolean;
    correctOption: number;
    explanation: string;
  };
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedOption: number,
): Promise<SubmitAnswerResponse> {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/quiz/${sessionId}/answer`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questionId, selectedOption }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao submeter resposta');
  }

  return response.json();
}
