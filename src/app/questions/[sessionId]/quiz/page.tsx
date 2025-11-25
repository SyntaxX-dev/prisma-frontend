'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { submitAnswer } from '@/api/quiz/submit-answer';

interface QuizQuestion {
  id: string;
  questionText: string;
  order: number;
  options: Array<{
    id: string;
    optionText: string;
    optionNumber: number;
  }>;
}

interface QuizData {
  sessionId: string;
  topic: string;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get quiz data from sessionStorage (passed from generate page)
    const storedData = sessionStorage.getItem(`quiz_${sessionId}`);
    if (!storedData) {
      router.push('/questions');
      return;
    }

    try {
      const data = JSON.parse(storedData);
      setQuizData(data);
    } catch (err) {
      console.error('Error parsing quiz data:', err);
      router.push('/questions');
    }
  }, [sessionId, router]);

  useEffect(() => {
    // Warn user before leaving page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const hasAnsweredCurrent = answers.has(currentQuestion.id);

  const handleOptionSelect = (optionNumber: number) => {
    setSelectedOption(optionNumber);
  };

  const handleNext = async () => {
    if (selectedOption === null) {
      setError('Por favor, selecione uma alternativa');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await submitAnswer(sessionId, currentQuestion.id, selectedOption);

      // Save answer locally
      const newAnswers = new Map(answers);
      newAnswers.set(currentQuestion.id, selectedOption);
      setAnswers(newAnswers);

      if (isLastQuestion) {
        // Go to result page
        sessionStorage.removeItem(`quiz_${sessionId}`);
        router.push(`/questions/${sessionId}/result`);
      } else {
        // Go to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao submeter resposta');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevQuestion = quizData.questions[currentQuestionIndex - 1];
      setSelectedOption(answers.get(prevQuestion.id) || null);
      setError('');
    }
  };

  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {quizData.topic}
            </h1>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Questão {currentQuestionIndex + 1} de {quizData.questions.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {currentQuestion.questionText}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options
              .sort((a, b) => a.optionNumber - b.optionNumber)
              .map((option) => {
                const isSelected = selectedOption === option.optionNumber;
                const savedAnswer = answers.get(currentQuestion.id);
                const wasSelected = savedAnswer === option.optionNumber;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.optionNumber)}
                    disabled={loading || hasAnsweredCurrent}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                              ${isSelected || wasSelected
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                              }
                              ${(loading || hasAnsweredCurrent) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                              `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                                  ${isSelected || wasSelected
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-gray-300 dark:border-gray-600'
                                  }`}
                      >
                        {(isSelected || wasSelected) && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                          {option.optionNumber}.
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {option.optionText}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                          text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || loading}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={selectedOption === null || loading || hasAnsweredCurrent}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium
                       py-2 px-6 rounded-lg transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Enviando...
                </>
              ) : isLastQuestion ? (
                'Finalizar'
              ) : (
                <>
                  Próxima →
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
