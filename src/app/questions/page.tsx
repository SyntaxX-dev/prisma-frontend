'use client';

import { useState, useEffect, Suspense } from 'react';
import { generateQuiz, type QuizQuestion } from '@/api/quiz/generate-quiz';
import { submitAnswer } from '@/api/quiz/submit-answer';
import { getResult, type QuestionResult } from '@/api/quiz/get-result';
import { getSubscription } from '@/api/subscriptions/get-subscription';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { BackgroundGrid } from "@/components/shared/BackgroundGrid";
import { PlanUpgradeModal } from '@/components/features/subscriptions/PlanUpgradeModal';
import { Sparkles, Check, X, Download, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/features/auth';
import { useCacheInvalidation } from '@/hooks/shared';

type ViewState = 'input' | 'quiz' | 'result';

interface AnswerFeedback {
  isCorrect: boolean;
  correctOption: number;
  explanation: string;
}

export default function QuestionsPage() {
  const { user } = useAuth();
  const { questions: invalidateQuestions } = useCacheInvalidation();
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Quiz state
  const [viewState, setViewState] = useState<ViewState>('input');
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean[]>([]);

  // Result state
  const [finalResult, setFinalResult] = useState<{
    score: number;
    totalQuestions: number;
    questions: QuestionResult[];
  } | null>(null);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Fetch subscription on mount
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await getSubscription();
        setSubscription(response.data);
      } catch (err) {
        console.error('Error fetching subscription:', err);
      }
    };
    fetchSubscription();
  }, []);

  // Warn before leaving during quiz
  useEffect(() => {
    if (viewState === 'quiz') {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [viewState]);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError('Por favor, digite um tema');
      return;
    }

    // Check if user has access (START plan is blocked)
    if (subscription?.planId === 'START') {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await generateQuiz(topic.trim());
      setSessionId(response.data.sessionId);
      setQuestions(response.data.questions);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setAnswerFeedback(null);
      setAnsweredCorrectly([]);
      setViewState('quiz');
    } catch (err) {
      // Enhanced error handling for plan restrictions
      if (err instanceof Error && err.message.includes('plano')) {
        setShowUpgradeModal(true);
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao gerar quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null) return;

    setLoading(true);
    try {
      const currentQuestion = questions[currentQuestionIndex];
      const response = await submitAnswer(sessionId, currentQuestion.id, selectedOption);

      setAnswerFeedback({
        isCorrect: response.data.isCorrect,
        correctOption: response.data.correctOption,
        explanation: response.data.explanation,
      });

      setAnsweredCorrectly([...answeredCorrectly, response.data.isCorrect]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao submeter resposta');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setAnswerFeedback(null);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    setLoading(true);
    try {
      const response = await getResult(sessionId);
      setFinalResult(response.data);

      // Store result in localStorage for PDF generation
      localStorage.setItem(`quiz_result_${sessionId}`, JSON.stringify(response.data));

      // Invalidar cache de questões após completar quiz
      await invalidateQuestions();

      setViewState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter resultado');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!finalResult) return;

    // Get stored result from localStorage
    const storedResult = localStorage.getItem(`quiz_result_${sessionId}`);
    const quizData = storedResult ? JSON.parse(storedResult) : finalResult;

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftMargin = 15;
    const rightMargin = 15;
    const bottomMargin = 20;
    const maxWidth = pageWidth - leftMargin - rightMargin;
    let y = 20;

    // Manual text wrapping function with proper width calculation
    const wrapText = (text: string, maxWidthMM: number, fontSize: number, fontStyle: 'normal' | 'bold' | 'italic' = 'normal'): string[] => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);

      // Use splitTextToSize from jsPDF which handles word wrapping correctly
      const lines = doc.splitTextToSize(text, maxWidthMM);

      // Return as array of strings
      return Array.isArray(lines) ? lines : [lines];
    };

    // Check if need new page
    const checkAddPage = (spaceNeeded: number) => {
      if (y + spaceNeeded > pageHeight - bottomMargin) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    // Title
    doc.setFontSize(18);
    doc.setTextColor(189, 24, 180);
    doc.text('Gabarito do Quiz', pageWidth / 2, y, { align: 'center' });
    y += 12;

    // Topic and Score
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Tema: ${topic}`, leftMargin, y);
    y += 7;
    doc.text(`Pontuacao: ${finalResult.score}/${finalResult.totalQuestions}`, leftMargin, y);
    y += 12;

    // Process each question
    quizData.questions.forEach((q: QuestionResult, qIndex: number) => {
      checkAddPage(20);

      // Question number and text
      const questionText = `${qIndex + 1}. ${q.questionText}`;
      const questionLines = wrapText(questionText, maxWidth, 10, 'bold');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);

      questionLines.forEach((line: string) => {
        checkAddPage(6);
        doc.text(line, leftMargin, y);
        y += 5;
      });

      y += 3;

      // Process options
      q.options.forEach((opt) => {
        const isCorrect = opt.optionNumber === q.correctOption;
        const isSelected = opt.optionNumber === q.selectedOption;

        const optionText = `${opt.optionNumber}. ${opt.optionText}`;
        const optionLines = wrapText(optionText, maxWidth - 10, 10, 'normal');

        if (isCorrect) {
          doc.setTextColor(0, 150, 0); // Green
        } else if (isSelected) {
          doc.setTextColor(220, 0, 0); // Red
        } else {
          doc.setTextColor(100, 100, 100); // Gray
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        optionLines.forEach((line: string) => {
          checkAddPage(6);
          doc.text(line, leftMargin + 5, y);
          y += 5;
        });
      });

      y += 3;

      // Explanation
      const explanationText = `Explicacao: ${q.explanation}`;
      const explanationLines = wrapText(explanationText, maxWidth - 10, 10, 'italic');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);

      explanationLines.forEach((line: string) => {
        checkAddPage(6);
        doc.text(line, leftMargin + 5, y);
        y += 5;
      });

      y += 6;

      // Separator line
      if (qIndex < quizData.questions.length - 1) {
        checkAddPage(3);
        doc.setDrawColor(200, 200, 200);
        doc.line(leftMargin, y, pageWidth - rightMargin, y);
        y += 6;
      }
    });

    doc.save(`gabarito-${topic.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  const handleStartNewQuiz = () => {
    setTopic('');
    setViewState('input');
    setSessionId('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswerFeedback(null);
    setAnsweredCorrectly([]);
    setFinalResult(null);
    setError('');
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen text-white relative">
      <BackgroundGrid />

      <div className="relative z-10">
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="ml-0 lg:ml-72">
          <Suspense fallback={<div className="h-20" />}>
            <Navbar isDark={isDark} toggleTheme={toggleTheme} />
          </Suspense>

          {/* Main Content */}
          <div className="min-h-screen px-4 md:px-8 py-12 md:py-24 flex items-center justify-center">
            <div className="w-full max-w-7xl mx-auto">
              {/* INPUT VIEW */}
              {viewState === 'input' && (
                <>
                  {/* Header */}
                  <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-light mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      Olá, {user?.name || 'Estudante'}
                    </h1>
                  </div>

                  {/* Input principal */}
                  <div className="relative max-w-4xl mx-auto">
                    <div
                      className="rounded-3xl p-1 transition-all duration-500 overflow-hidden"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      <form onSubmit={handleGenerateQuiz}>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4">
                          <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Digite o tema do quiz..."
                            className="flex-1 bg-transparent text-white placeholder-white/50 text-base md:text-lg outline-none"
                            disabled={loading}
                          />

                          <button
                            type="submit"
                            disabled={loading || !topic.trim()}
                            className="flex items-center justify-center gap-2 bg-[#bd18b4] hover:bg-[#aa22c5] text-white font-bold px-6 sm:px-8 py-3 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base shadow-[0_0_20px_rgba(189,24,180,0.3)] hover:shadow-[0_0_30px_rgba(189,24,180,0.5)] transform hover:-translate-y-0.5"
                          >
                            {loading ? (
                              <>
                                <svg className="animate-spin h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24">
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
                                Gerando...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                                Gerar
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl backdrop-blur-sm text-sm md:text-base">
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Sugestões */}
                  <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
                    {[
                      'Questões sobre Física - Cinemática',
                      'História do Brasil - Era Vargas',
                      'Matemática - Funções Quadráticas',
                      'Biologia - Citologia',
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setTopic(suggestion)}
                        disabled={loading}
                        className="text-left px-5 md:px-6 py-4 md:py-5 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:border-white/20 transform hover:-translate-y-1 group"
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div className="flex items-start gap-2 md:gap-3">
                          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span className="text-white/80 text-xs md:text-sm">{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Informações */}
                  <div className="mt-8 md:mt-12 text-center">
                    <div
                      className="inline-block px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <p className="text-white/60 text-xs md:text-sm mb-2">
                        📚 Serão geradas 10 questões de múltipla escolha
                      </p>
                      <p className="text-white/60 text-xs md:text-sm mb-2">
                        ✅ Gabarito completo com explicações detalhadas
                      </p>
                      <p className="text-yellow-400/80 text-xs md:text-sm">
                        ⚠️ Progresso será perdido se sair da página durante o quiz
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* QUIZ VIEW */}
              {viewState === 'quiz' && currentQuestion && (
                <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
                  {/* Progress */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full"
                      style={{
                        background: 'rgba(189, 24, 180, 0.1)',
                        border: '1px solid rgba(189, 24, 180, 0.3)',
                      }}
                    >
                      <span className="text-white/80 text-xs md:text-sm">
                        Questão {currentQuestionIndex + 1} de {questions.length}
                      </span>
                    </div>
                  </div>

                  {/* Question Card */}
                  <div
                    className="rounded-2xl md:rounded-3xl p-4 md:p-8"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <h2 className="text-lg md:text-2xl font-light text-white mb-6 md:mb-8">
                      {currentQuestion.questionText}
                    </h2>

                    {/* Options */}
                    <div className="space-y-3 md:space-y-4">
                      {currentQuestion.options.map((option) => {
                        const isSelected = selectedOption === option.optionNumber;
                        const isCorrect = answerFeedback?.correctOption === option.optionNumber;
                        const isWrong = answerFeedback && isSelected && !answerFeedback.isCorrect;

                        let borderColor = 'rgba(255, 255, 255, 0.2)';
                        let bgColor = 'rgba(255, 255, 255, 0.05)';

                        if (answerFeedback) {
                          if (isCorrect) {
                            borderColor = 'rgba(34, 197, 94, 0.5)';
                            bgColor = 'rgba(34, 197, 94, 0.1)';
                          } else if (isWrong) {
                            borderColor = 'rgba(239, 68, 68, 0.5)';
                            bgColor = 'rgba(239, 68, 68, 0.1)';
                          }
                        } else if (isSelected) {
                          borderColor = 'rgba(189, 24, 180, 0.5)';
                          bgColor = 'rgba(189, 24, 180, 0.1)';
                        }

                        return (
                          <button
                            key={option.id}
                            onClick={() => !answerFeedback && setSelectedOption(option.optionNumber)}
                            disabled={!!answerFeedback}
                            className="w-full text-left px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed"
                            style={{
                              background: bgColor,
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                              border: `2px solid ${borderColor}`,
                            }}
                          >
                            <div className="flex items-center justify-between gap-3 md:gap-4">
                              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                <div
                                  className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{
                                    background: answerFeedback
                                      ? isCorrect
                                        ? 'rgba(34, 197, 94, 0.2)'
                                        : isWrong
                                          ? 'rgba(239, 68, 68, 0.2)'
                                          : 'rgba(255, 255, 255, 0.1)'
                                      : isSelected
                                        ? 'rgba(189, 24, 180, 0.3)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                  }}
                                >
                                  <span className="text-white font-medium text-sm md:text-base">{option.optionNumber}</span>
                                </div>
                                <span className="text-white/90 text-sm md:text-base break-words">{option.optionText}</span>
                              </div>

                              {answerFeedback && isCorrect && (
                                <Check className="w-5 h-5 md:w-6 md:h-6 text-green-400 flex-shrink-0" />
                              )}
                              {answerFeedback && isWrong && (
                                <X className="w-5 h-5 md:w-6 md:h-6 text-red-400 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback */}
                    {answerFeedback && (
                      <div
                        className="mt-4 md:mt-6 p-4 md:p-6 rounded-xl md:rounded-2xl"
                        style={{
                          background: answerFeedback.isCorrect
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                          border: answerFeedback.isCorrect
                            ? '1px solid rgba(34, 197, 94, 0.3)'
                            : '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
                          {answerFeedback.isCorrect ? (
                            <Check className="w-5 h-5 md:w-6 md:h-6 text-green-400 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 md:w-6 md:h-6 text-red-400 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold mb-1 md:mb-2 text-sm md:text-base ${answerFeedback.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              {answerFeedback.isCorrect ? 'Correto!' : 'Incorreto'}
                            </h3>
                            <p className="text-white/80 text-xs md:text-sm break-words">{answerFeedback.explanation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-6 md:mt-8 flex justify-center">
                      {!answerFeedback ? (
                        <button
                          onClick={handleSubmitAnswer}
                          disabled={selectedOption === null || loading}
                          className="flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 text-sm md:text-base"
                          style={{
                            background: 'linear-gradient(135deg, #bd18b4 0%, #e91e63 100%)',
                          }}
                        >
                          {loading ? 'Enviando...' : 'Responder'}
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          disabled={loading}
                          className="flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 text-sm md:text-base"
                          style={{
                            background: 'linear-gradient(135deg, #bd18b4 0%, #e91e63 100%)',
                          }}
                        >
                          {currentQuestionIndex < questions.length - 1 ? (
                            <>
                              Próxima
                              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                            </>
                          ) : (
                            'Ver Resultado'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* RESULT VIEW */}
              {viewState === 'result' && finalResult && (
                <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto pt-8 md:pt-8">
                  {/* Score Card */}
                  <div
                    className="rounded-2xl md:rounded-3xl p-6 md:p-8 text-center max-w-2xl mx-auto"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <h2 className="text-2xl md:text-4xl font-light mb-3 md:mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      Quiz Concluído!
                    </h2>
                    <p className="text-white/60 mb-4 md:mb-6 text-sm md:text-base">Tema: {topic}</p>

                    <div className="inline-flex items-center gap-3 md:gap-4 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl"
                      style={{
                        background: 'rgba(189, 24, 180, 0.1)',
                        border: '1px solid rgba(189, 24, 180, 0.3)',
                      }}
                    >
                      <span className="text-3xl md:text-5xl font-bold text-white">{finalResult.score}</span>
                      <span className="text-white/60 text-lg md:text-xl">/ {finalResult.totalQuestions}</span>
                    </div>

                    <p className="mt-3 md:mt-4 text-white/60 text-sm md:text-base">
                      Você acertou {Math.round((finalResult.score / finalResult.totalQuestions) * 100)}% das questões
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-6 md:mt-8">
                      <button
                        onClick={handleDownloadPDF}
                        className="flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full transition-all duration-200 hover:scale-105 text-sm md:text-base"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <Download className="w-4 h-4 md:w-5 md:h-5" />
                        Baixar PDF
                      </button>

                      <button
                        onClick={handleStartNewQuiz}
                        className="flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 text-sm md:text-base"
                        style={{
                          background: 'linear-gradient(135deg, #bd18b4 0%, #e91e63 100%)',
                        }}
                      >
                        Novo Quiz
                      </button>
                    </div>
                  </div>

                  {/* Gabarito */}
                  <div>
                    <h3 className="text-xl md:text-2xl font-light text-white mb-4 md:mb-6">Gabarito Completo</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {finalResult.questions.map((question, index) => (
                        <div
                          key={index}
                          className="rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <div className="flex items-start gap-2 md:gap-3 mb-4 md:mb-5">
                            <div
                              className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background: question.isCorrect
                                  ? 'rgba(34, 197, 94, 0.2)'
                                  : 'rgba(239, 68, 68, 0.2)',
                              }}
                            >
                              {question.isCorrect ? (
                                <Check className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                              ) : (
                                <X className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                              )}
                            </div>
                            <h4 className="text-sm md:text-base font-medium text-white flex-1 leading-snug">
                              {index + 1}. {question.questionText}
                            </h4>
                          </div>

                          <div className="space-y-2 md:space-y-2.5 mb-4 md:mb-5 ml-9 md:ml-11 flex-grow">
                            {question.options.map((option) => {
                              const isCorrect = option.optionNumber === question.correctOption;
                              const isSelected = option.optionNumber === question.selectedOption;

                              return (
                                <div
                                  key={option.optionNumber}
                                  className="flex items-center gap-2 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 rounded-lg"
                                  style={{
                                    background: isCorrect
                                      ? 'rgba(34, 197, 94, 0.1)'
                                      : isSelected
                                        ? 'rgba(239, 68, 68, 0.1)'
                                        : 'transparent',
                                  }}
                                >
                                  {isCorrect && <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-400 flex-shrink-0" />}
                                  {isSelected && !isCorrect && <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-400 flex-shrink-0" />}
                                  <span className={`text-xs md:text-sm leading-relaxed break-words ${isCorrect ? 'text-green-400' : isSelected ? 'text-red-400' : 'text-white/60'}`}>
                                    {option.optionNumber}. {option.optionText}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div
                            className="p-3 md:p-4 rounded-lg ml-9 md:ml-11 mt-auto"
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            <p className="text-white/60 text-xs md:text-sm leading-relaxed break-words">
                              <span className="text-white/80 font-medium">Explicação:</span> {question.explanation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE UPGRADE */}
      <PlanUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Geração de questões com IA"
      />
    </div>
  );
}
