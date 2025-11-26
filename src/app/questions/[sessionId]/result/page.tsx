'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getQuizResult } from '@/api/quiz/get-result';

interface QuestionResult {
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

interface QuizResult {
  sessionId: string;
  topic: string;
  score: number;
  totalQuestions: number;
  questions: QuestionResult[];
}

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await getQuizResult(sessionId);
        setResult(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar resultado');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  const handleDownloadPDF = async () => {
    if (!result) return;

    setDownloadingPdf(true);

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Gabarito - Quiz', margin, yPosition);
      yPosition += 10;

      // Topic and score
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tema: ${result.topic}`, margin, yPosition);
      yPosition += 7;
      doc.text(
        `Pontuação: ${result.score}/${result.totalQuestions} (${Math.round((result.score / result.totalQuestions) * 100)}%)`,
        margin,
        yPosition,
      );
      yPosition += 12;

      // Questions
      result.questions.forEach((question, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Question number and text
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const questionLines = doc.splitTextToSize(
          `${index + 1}. ${question.questionText}`,
          contentWidth,
        );
        doc.text(questionLines, margin, yPosition);
        yPosition += questionLines.length * 5 + 3;

        // Options
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        question.options
          .sort((a, b) => a.optionNumber - b.optionNumber)
          .forEach((option) => {
            const isCorrect = option.optionNumber === question.correctOption;
            const isSelected = option.optionNumber === question.selectedOption;

            let prefix = `   ${option.optionNumber}. `;
            if (isCorrect && isSelected) {
              prefix = '✓ ' + prefix;
              doc.setTextColor(0, 150, 0); // Green
            } else if (isCorrect) {
              prefix = '✓ ' + prefix;
              doc.setTextColor(0, 100, 200); // Blue
            } else if (isSelected) {
              prefix = '✗ ' + prefix;
              doc.setTextColor(200, 0, 0); // Red
            }

            const optionLines = doc.splitTextToSize(
              prefix + option.optionText,
              contentWidth - 5,
            );
            doc.text(optionLines, margin, yPosition);
            yPosition += optionLines.length * 5;

            doc.setTextColor(0, 0, 0); // Reset to black

            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
          });

        yPosition += 2;

        // Explanation
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(80, 80, 80);
        const explanationLines = doc.splitTextToSize(
          `Explicação: ${question.explanation}`,
          contentWidth,
        );
        doc.text(explanationLines, margin, yPosition);
        yPosition += explanationLines.length * 5 + 8;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');

        if (yPosition > 260) {
          doc.addPage();
          yPosition = 20;
        }
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${totalPages}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' },
        );
      }

      // Save
      const fileName = `gabarito-${result.topic.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                      text-red-700 dark:text-red-400 px-6 py-4 rounded-lg">
          {error || 'Erro ao carregar resultado'}
        </div>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz Finalizado!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {result.topic}
            </p>

            {/* Score */}
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {percentage}%
                </div>
                <div className="text-sm text-blue-100">
                  {result.score}/{result.totalQuestions}
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {percentage >= 70
                ? 'Parabéns! Excelente resultado! 🎉'
                : percentage >= 50
                  ? 'Bom trabalho! Continue estudando! 📚'
                  : 'Continue praticando! Você vai melhorar! 💪'}
            </p>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPdf}
                className="bg-green-600 hover:bg-green-700 text-white font-medium
                         py-3 px-6 rounded-lg transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2"
              >
                {downloadingPdf ? (
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
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Baixar PDF
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/questions')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium
                         py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Novo Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Gabarito */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Gabarito Comentado
          </h2>

          {result.questions.map((question, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              {/* Question */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold
                            ${question.isCorrect
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}
                >
                  {question.isCorrect ? '✓' : '✗'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {index + 1}. {question.questionText}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {question.options
                      .sort((a, b) => a.optionNumber - b.optionNumber)
                      .map((option) => {
                        const isCorrect = option.optionNumber === question.correctOption;
                        const isSelected = option.optionNumber === question.selectedOption;

                        return (
                          <div
                            key={option.optionNumber}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrect && isSelected
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : isCorrect
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : isSelected
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {isCorrect && (
                                <span className="text-green-600 dark:text-green-400 font-bold">
                                  ✓
                                </span>
                              )}
                              {isSelected && !isCorrect && (
                                <span className="text-red-600 dark:text-red-400 font-bold">
                                  ✗
                                </span>
                              )}
                              <span
                                className={`${
                                  isCorrect
                                    ? 'text-green-900 dark:text-green-100 font-medium'
                                    : isSelected
                                      ? 'text-red-900 dark:text-red-100'
                                      : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {option.optionNumber}. {option.optionText}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Explanation */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      Explicação:
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
