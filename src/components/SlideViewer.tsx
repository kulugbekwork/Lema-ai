import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Slide {
  id: string;
  slide_number: number;
  title: string;
  content: string;
}

interface Question {
  id: string;
  slide_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
}

interface UserAnswer {
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
}

interface SlideViewerProps {
  lessonId: string;
  lessonTitle: string;
  courseContext: string;
  moduleContext: string;
  estimatedDuration: number;
  onBack: () => void;
  onComplete: () => void;
}

export function SlideViewer({
  lessonId,
  lessonTitle,
  courseContext,
  moduleContext,
  estimatedDuration,
  onBack,
  onComplete,
}: SlideViewerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLessonContent();
  }, [lessonId]);

  useEffect(() => {
    const currentItem = getCurrentItem();
    if (currentItem && currentItem.type === 'question' && userAnswers.has((currentItem.data as Question).id)) {
      setShowResult(true);
    } else {
      setShowResult(false);
    }
  }, [currentIndex, userAnswers, slides, questions]);

  const loadLessonContent = async () => {
    try {
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('content_generated')
        .eq('id', lessonId)
        .single();

      if (!(lessonData as any)?.content_generated) {
        await generateLessonContent();
      } else {
        await loadExistingContent();
      }
    } catch (err: any) {
      console.error('Error loading lesson:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const generateLessonContent = async () => {
    setGenerating(true);
    try {
      // Get the user's session token (JWT)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to generate lesson content');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-lesson-content`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonTitle,
          courseContext,
          moduleContext,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate lesson content';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('Edge Function error:', errorData);
        } catch {
          const responseText = await response.text();
          errorMessage = `Server error: ${response.status} ${response.statusText}. ${responseText || ''}`;
          console.error('Edge Function response:', responseText);
        }
        throw new Error(errorMessage);
      }

      const content = await response.json();

      for (const slide of content.slides) {
        await supabase.from('lesson_slides').insert({
          lesson_id: lessonId,
          slide_number: slide.slideNumber,
          title: slide.title,
          content: slide.content,
        } as any);
      }

      for (const question of content.questions) {
        await supabase.from('lesson_questions').insert({
          lesson_id: lessonId,
          slide_number: question.slideNumber,
          question_text: question.questionText,
          option_a: question.optionA,
          option_b: question.optionB,
          option_c: question.optionC,
          option_d: question.optionD,
          correct_answer: question.correctAnswer,
          explanation: question.explanation,
        } as any);
      }

      await (supabase.from('lessons') as any)
        .update({ content_generated: true })
        .eq('id', lessonId);

      await loadExistingContent();
    } catch (err: any) {
      console.error('Error generating content:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const loadExistingContent = async () => {
    try {
      const { data: slidesData } = await supabase
        .from('lesson_slides')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('slide_number');

      const { data: questionsData } = await supabase
        .from('lesson_questions')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('slide_number');

      const { data: answersData } = await supabase
        .from('user_lesson_answers')
        .select('question_id, selected_answer, is_correct')
        .eq('user_id', user!.id)
        .in('question_id', (questionsData || []).map((q: any) => q.id));

      setSlides(slidesData || []);
      setQuestions(questionsData || []);

      const answersMap = new Map();
      (answersData || []).forEach((answer: any) => {
        answersMap.set(answer.question_id, answer);
      });
      setUserAnswers(answersMap);
    } catch (err: any) {
      console.error('Error loading content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const currentItem = getCurrentItem();
    if (!currentItem) return;
    if (currentItem.type === 'question' && !showResult && !userAnswers.has((currentItem.data as Question).id)) {
      return;
    }

    setSelectedAnswer('');
    setShowResult(false);
    setCurrentIndex(prev => Math.min(prev + 1, getTotalItems() - 1));
  };

  const handlePrevious = () => {
    setSelectedAnswer('');
    setShowResult(false);
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const handleAnswerSubmit = async (answer?: string) => {
    const answerToSubmit = answer || selectedAnswer;
    if (!answerToSubmit) return;

    const currentItem = getCurrentItem();
    if (!currentItem || currentItem.type !== 'question') return;

    const question = currentItem.data as Question;
    const isCorrect = answerToSubmit === question.correct_answer;

    try {
      await supabase.from('user_lesson_answers').upsert({
        user_id: user!.id,
        question_id: question.id,
        selected_answer: answerToSubmit,
        is_correct: isCorrect,
      } as any, {
        onConflict: 'user_id,question_id'
      });

      const newAnswers = new Map(userAnswers);
      newAnswers.set(question.id, {
        question_id: question.id,
        selected_answer: answerToSubmit,
        is_correct: isCorrect,
      });
      setUserAnswers(newAnswers);
      setSelectedAnswer(answerToSubmit);
      setShowResult(true);
    } catch (err: any) {
      console.error('Error saving answer:', err);
    }
  };

  const getTotalItems = () => {
    return slides.length + questions.length;
  };

  const getCurrentItem = () => {
    const items: Array<{ type: 'slide' | 'question'; data: Slide | Question; position: number }> = [];

    slides.forEach(slide => {
      items.push({ type: 'slide', data: slide, position: slide.slide_number });
    });

    questions.forEach(question => {
      items.push({ type: 'question', data: question, position: question.slide_number + 0.5 });
    });

    items.sort((a, b) => a.position - b.position);

    if (items.length === 0) return undefined;
    return items[currentIndex] || items[0];
  };

  const formatInlineMarkdown = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    
    // Handle bold **text**
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;
    const boldMatches: Array<{ start: number; end: number; text: string }> = [];
    
    while ((match = boldRegex.exec(text)) !== null) {
      boldMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[1]
      });
    }
    
    // Handle italic *text* (but not if part of bold **text**)
    const italicRegex = /\*([^*]+?)\*/g;
    const italicMatches: Array<{ start: number; end: number; text: string }> = [];
    
    while ((match = italicRegex.exec(text)) !== null) {
      // Check if this is part of a bold match (skip if it is)
      const isPartOfBold = boldMatches.some(b => 
        match!.index >= b.start && match!.index < b.end
      );
      // Also check if previous or next char is * (meaning it's part of **)
      const prevChar = text[match.index - 1];
      const nextCharAfterMatch = text[match.index + match[0].length];
      const isPartOfBoldStars = prevChar === '*' || nextCharAfterMatch === '*';
      
      if (!isPartOfBold && !isPartOfBoldStars) {
        italicMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[1]
        });
      }
    }
    
    // Combine and sort all matches
    const allMatches = [
      ...boldMatches.map(m => ({ ...m, type: 'bold' as const })),
      ...italicMatches.map(m => ({ ...m, type: 'italic' as const }))
    ].sort((a, b) => a.start - b.start);
    
    // Build parts array
    allMatches.forEach((match, idx) => {
      // Add text before match
      if (match.start > lastIndex) {
        parts.push(text.substring(lastIndex, match.start));
      }
      
      // Add formatted text
      if (match.type === 'bold') {
        parts.push(<strong key={`bold-${idx}`} className="font-bold">{match.text}</strong>);
      } else {
        parts.push(<em key={`italic-${idx}`} className="italic">{match.text}</em>);
      }
      
      lastIndex = match.end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  };

  const formatContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let inList = false;
    let listItems: string[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Headers
      if (trimmedLine.startsWith('# ')) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc ml-6 mb-4 space-y-2">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700 leading-relaxed">
                  {formatInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h1 key={index} className="text-3xl font-bold text-gray-900 mt-6 mb-4">
            {formatInlineMarkdown(trimmedLine.slice(2))}
          </h1>
        );
        return;
      }
      
      if (trimmedLine.startsWith('## ')) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc ml-6 mb-4 space-y-2">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700 leading-relaxed">
                  {formatInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h2 key={index} className="text-2xl font-bold text-gray-900 mt-5 mb-3">
            {formatInlineMarkdown(trimmedLine.slice(3))}
          </h2>
        );
        return;
      }
      
      if (trimmedLine.startsWith('### ')) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc ml-6 mb-4 space-y-2">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700 leading-relaxed">
                  {formatInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h3 key={index} className="text-xl font-bold text-gray-900 mt-4 mb-2">
            {formatInlineMarkdown(trimmedLine.slice(4))}
          </h3>
        );
        return;
      }
      
      // List items
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (!inList) {
          inList = true;
        }
        listItems.push(trimmedLine.slice(2));
        return;
      }
      
      // Numbered lists
      const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (numberedMatch) {
        if (!inList) {
          inList = true;
        }
        listItems.push(numberedMatch[1]);
        return;
      }
      
      // Empty line
      if (trimmedLine === '') {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc ml-6 mb-4 space-y-2">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700 leading-relaxed">
                  {formatInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(<div key={index} className="h-3"></div>);
        return;
      }
      
      // Regular paragraph
      if (inList) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc ml-6 mb-4 space-y-2">
            {listItems.map((item, i) => (
              <li key={i} className="text-gray-700 leading-relaxed">
                {formatInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
      
      elements.push(
        <p key={index} className="text-gray-700 leading-relaxed mb-2">
          {formatInlineMarkdown(trimmedLine)}
        </p>
      );
    });
    
    // Close any remaining list
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key="list-final" className="list-disc ml-6 mb-4 space-y-2">
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-700 leading-relaxed">
              {formatInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
    }
    
    return elements;
  };

  const isLastItem = currentIndex === getTotalItems() - 1;
  const allQuestionsAnswered = questions.every(q => userAnswers.has(q.id));

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {generating ? 'Generating lesson content...' : 'Loading lesson...'}
          </p>
          {generating && (
            <p className="text-gray-500 text-sm mt-2">This may take 30-60 seconds</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={onBack} className="text-blue-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const currentItem = getCurrentItem();

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No content available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Course</span>
            </button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{estimatedDuration} min</span>
              </div>
              <div className="text-sm font-medium text-gray-600">
                {currentIndex + 1} / {getTotalItems()}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / getTotalItems()) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[500px] flex flex-col">
            <div className="p-8 sm:p-12 flex-1">
              {currentItem.type === 'slide' ? (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {(currentItem.data as Slide).title}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    {formatContent((currentItem.data as Slide).content)}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Quiz Question</h3>
                    <p className="text-blue-800">Test your understanding of what you just learned</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {(currentItem.data as Question).question_text}
                  </h2>

                  <div className="space-y-3 mb-6">
                    {['a', 'b', 'c', 'd'].map((option) => {
                      const question = currentItem.data as Question;
                      const optionText = question[`option_${option}` as keyof Question] as string;
                      const isSelected = selectedAnswer === option;
                      const existingAnswer = userAnswers.get(question.id);
                      const wasSelected = existingAnswer?.selected_answer === option;
                      const isCorrect = question.correct_answer === option;

                      let buttonClass = 'w-full text-left p-4 rounded-xl border-2 transition-all ';

                      if (showResult || existingAnswer) {
                        if (wasSelected && isCorrect) {
                          buttonClass += 'border-green-500 bg-green-50 text-green-900';
                        } else if (wasSelected && !isCorrect) {
                          buttonClass += 'border-red-500 bg-red-50 text-red-900';
                        } else if (isCorrect) {
                          buttonClass += 'border-green-500 bg-green-50 text-green-900';
                        } else {
                          buttonClass += 'border-gray-200 bg-gray-50 text-gray-600';
                        }
                      } else if (isSelected) {
                        buttonClass += 'border-blue-600 bg-blue-50 text-blue-900';
                      } else {
                        buttonClass += 'border-gray-300 hover:border-blue-400 hover:bg-blue-50';
                      }

                      return (
                        <button
                          key={option}
                          onClick={() => {
                            if (!showResult && !existingAnswer) {
                              handleAnswerSubmit(option);
                            }
                          }}
                          disabled={showResult || !!existingAnswer}
                          className={buttonClass}
                        >
                          <div className="flex items-center">
                            <span className="font-bold text-lg mr-3">{option.toUpperCase()}.</span>
                            <span className="font-medium">{optionText}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {(showResult || userAnswers.has((currentItem.data as Question).id)) && (
                    <div className={`p-4 rounded-xl ${
                      userAnswers.get((currentItem.data as Question).id)?.is_correct
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`font-bold mb-2 ${
                        userAnswers.get((currentItem.data as Question).id)?.is_correct
                          ? 'text-green-900'
                          : 'text-red-900'
                      }`}>
                        {userAnswers.get((currentItem.data as Question).id)?.is_correct
                          ? 'Correct!'
                          : 'Incorrect'}
                      </p>
                      <p className="text-gray-700">
                        {(currentItem.data as Question).explanation}
                      </p>
                    </div>
                  )}

                </div>
              )}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>

                {isLastItem && allQuestionsAnswered ? (
                  <button
                    onClick={onComplete}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Complete Lesson</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={
                      currentIndex === getTotalItems() - 1 ||
                      (currentItem.type === 'question' && !showResult && !userAnswers.has((currentItem.data as Question).id))
                    }
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
