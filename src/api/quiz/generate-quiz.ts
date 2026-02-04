export interface QuizQuestion {
  id: string;
  questionText: string;
  order: number;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  optionText: string;
  optionNumber: number;
}

export interface GenerateQuizResponse {
  success: boolean;
  data: {
    sessionId: string;
    topic: string;
    questions: QuizQuestion[];
  };
}

export async function generateQuiz(topic: string): Promise<GenerateQuizResponse> {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    const error = await response.json();

    // Handle 403 Forbidden (plan restriction)
    if (response.status === 403) {
      throw new Error(error.message || 'Você precisa fazer upgrade do seu plano para gerar questões.');
    }

    throw new Error(error.message || 'Erro ao gerar quiz');
  }

  return response.json();
}
