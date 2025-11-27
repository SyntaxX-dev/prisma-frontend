'use client';

import { useState, useEffect, Suspense } from 'react';
import { generateQuiz, type QuizQuestion } from '@/api/quiz/generate-quiz';
import { submitAnswer } from '@/api/quiz/submit-answer';
import { getResult, type QuestionResult } from '@/api/quiz/get-result';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import DotGrid from '@/components/shared/DotGrid';
import { Sparkles, Check, X, Download, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/features/auth';

type ViewState = 'input' | 'quiz' | 'result';

interface AnswerFeedback {
  isCorrect: boolean;
  correctOption: number;
  explanation: string;
}

export default function QuestionsPage() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(true);

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
      setError(err instanceof Error ? err.message : 'Erro ao gerar quiz');
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
      {/* DotGrid Background */}
      <div className="fixed inset-0 z-0">
        <DotGrid
          dotSize={1}
          gap={24}
          baseColor="rgba(255,255,255,0.25)"
          activeColor="#bd18b4"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div className="relative z-10">
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="ml-72">
          <Suspense fallback={<div className="h-20" />}>
            <Navbar isDark={isDark} toggleTheme={toggleTheme} />
          </Suspense>

          {/* Main Content */}
          <div className="min-h-screen px-8 py-24">
            <div className="w-full max-w-7xl mx-auto">
              {/* INPUT VIEW */}
              {viewState === 'input' && (
                <>
                  {/* Header */}
                  <div className="text-center mb-12">
                    <h1 className="text-6xl font-light mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      Olá, {user?.name || 'Estudante'}
                    </h1>
                  </div>

                  {/* Input principal */}
                  <div className="relative">
                    <div
                      className="rounded-[32px] p-1 transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <form onSubmit={handleGenerateQuiz}>
                        <div className="flex items-center gap-4 px-6 py-4">
                          <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Digite o tema do quiz..."
                            className="flex-1 bg-transparent text-white placeholder-white/50 text-lg outline-none"
                            disabled={loading}
                          />

                          <button
                            type="submit"
                            disabled={loading || !topic.trim()}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                Gerando...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-5 h-5" />
                                Gerar
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-3 rounded-2xl backdrop-blur-sm">
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Sugestões */}
                  <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="text-left px-6 py-4 rounded-2xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span className="text-white/80 text-sm">{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Informações */}
                  <div className="mt-12 text-center">
                    <div
                      className="inline-block px-6 py-4 rounded-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <p className="text-white/60 text-sm mb-2">
                        📚 Serão geradas 10 questões de múltipla escolha
                      </p>
                      <p className="text-white/60 text-sm mb-2">
                        ✅ Gabarito completo com explicações detalhadas
                      </p>
                      <p className="text-yellow-400/80 text-sm">
                        ⚠️ Progresso será perdido se sair da página durante o quiz
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* QUIZ VIEW */}
              {viewState === 'quiz' && currentQuestion && (
                <div className="space-y-8">
                  {/* Progress */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                      style={{
                        background: 'rgba(189, 24, 180, 0.1)',
                        border: '1px solid rgba(189, 24, 180, 0.3)',
                      }}
                    >
                      <span className="text-white/80 text-sm">
                        Questão {currentQuestionIndex + 1} de {questions.length}
                      </span>
                    </div>
                  </div>

                  {/* Question Card */}
                  <div
                    className="rounded-3xl p-8"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <h2 className="text-2xl font-light text-white mb-8">
                      {currentQuestion.questionText}
                    </h2>

                    {/* Options */}
                    <div className="space-y-4">
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
                            className="w-full text-left px-6 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed"
                            style={{
                              background: bgColor,
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                              border: `2px solid ${borderColor}`,
                            }}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
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
                                  <span className="text-white font-medium">{option.optionNumber}</span>
                                </div>
                                <span className="text-white/90">{option.optionText}</span>
                              </div>

                              {answerFeedback && isCorrect && (
                                <Check className="w-6 h-6 text-green-400 flex-shrink-0" />
                              )}
                              {answerFeedback && isWrong && (
                                <X className="w-6 h-6 text-red-400 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback */}
                    {answerFeedback && (
                      <div
                        className="mt-6 p-6 rounded-2xl"
                        style={{
                          background: answerFeedback.isCorrect
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                          border: answerFeedback.isCorrect
                            ? '1px solid rgba(34, 197, 94, 0.3)'
                            : '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          {answerFeedback.isCorrect ? (
                            <Check className="w-6 h-6 text-green-400 flex-shrink-0" />
                          ) : (
                            <X className="w-6 h-6 text-red-400 flex-shrink-0" />
                          )}
                          <div>
                            <h3 className={`font-semibold mb-2 ${answerFeedback.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              {answerFeedback.isCorrect ? 'Correto!' : 'Incorreto'}
                            </h3>
                            <p className="text-white/80 text-sm">{answerFeedback.explanation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-8 flex justify-end">
                      {!answerFeedback ? (
                        <button
                          onClick={handleSubmitAnswer}
                          disabled={selectedOption === null || loading}
                          className="flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
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
                          className="flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, #bd18b4 0%, #e91e63 100%)',
                          }}
                        >
                          {currentQuestionIndex < questions.length - 1 ? (
                            <>
                              Próxima
                              <ArrowRight className="w-5 h-5" />
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
                <div className="space-y-8">
                  {/* Score Card */}
                  <div
                    className="rounded-3xl p-8 text-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <h2 className="text-4xl font-light mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      Quiz Concluído!
                    </h2>
                    <p className="text-white/60 mb-6">Tema: {topic}</p>

                    <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl"
                      style={{
                        background: 'rgba(189, 24, 180, 0.1)',
                        border: '1px solid rgba(189, 24, 180, 0.3)',
                      }}
                    >
                      <span className="text-5xl font-bold text-white">{finalResult.score}</span>
                      <span className="text-white/60 text-xl">/ {finalResult.totalQuestions}</span>
                    </div>

                    <p className="mt-4 text-white/60">
                      Você acertou {Math.round((finalResult.score / finalResult.totalQuestions) * 100)}% das questões
                    </p>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mt-8">
                      <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 hover:scale-105"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <Download className="w-5 h-5" />
                        Baixar PDF
                      </button>

                      <button
                        onClick={handleStartNewQuiz}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105"
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
                    <h3 className="text-2xl font-light text-white mb-6">Gabarito Completo</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {finalResult.questions.map((question, index) => (
                        <div
                          key={index}
                          className="rounded-2xl p-6 flex flex-col"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <div className="flex items-start gap-3 mb-5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background: question.isCorrect
                                  ? 'rgba(34, 197, 94, 0.2)'
                                  : 'rgba(239, 68, 68, 0.2)',
                              }}
                            >
                              {question.isCorrect ? (
                                <Check className="w-5 h-5 text-green-400" />
                              ) : (
                                <X className="w-5 h-5 text-red-400" />
                              )}
                            </div>
                            <h4 className="text-base font-medium text-white flex-1 leading-snug">
                              {index + 1}. {question.questionText}
                            </h4>
                          </div>

                          <div className="space-y-2.5 mb-5 ml-11 flex-grow">
                            {question.options.map((option) => {
                              const isCorrect = option.optionNumber === question.correctOption;
                              const isSelected = option.optionNumber === question.selectedOption;

                              return (
                                <div
                                  key={option.optionNumber}
                                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg"
                                  style={{
                                    background: isCorrect
                                      ? 'rgba(34, 197, 94, 0.1)'
                                      : isSelected
                                      ? 'rgba(239, 68, 68, 0.1)'
                                      : 'transparent',
                                  }}
                                >
                                  {isCorrect && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
                                  {isSelected && !isCorrect && <X className="w-4 h-4 text-red-400 flex-shrink-0" />}
                                  <span className={`text-sm leading-relaxed ${isCorrect ? 'text-green-400' : isSelected ? 'text-red-400' : 'text-white/60'}`}>
                                    {option.optionNumber}. {option.optionText}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div
                            className="p-4 rounded-lg ml-11 mt-auto"
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            <p className="text-white/60 text-sm leading-relaxed">
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
    </div>
  );
}
