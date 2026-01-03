import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Form,
  Modal,
  ProgressBar,
  Stack,
  Table
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useData } from '../contexts/DataContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

const InstructorQuiz = ({ quiz }) => {
  const { user } = useAuth();
  const { saveQuizAttempt } = useData();
  const { theme } = useTheme();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [evaluatedAnswers, setEvaluatedAnswers] = useState([]);
  const [score, setScore] = useState(0);

  const total = quiz.questions?.length || 0;
  const current = quiz.questions?.[index];
  const currentAnswer = userAnswers[index] || '';
  const allQuestionsAnswered = Object.keys(userAnswers).length === total;

  const startQuiz = () => {
    setStarted(true);
    setIndex(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setShowResults(false);
    setEvaluatedAnswers([]);
    setScore(0);
  };

  const handleNext = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
    }
  };

  const handlePrevious = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const evaluated = [];
    let correctCount = 0;

    quiz.questions.forEach((question, idx) => {
      const userAnswer = userAnswers[idx] || '';
      const correct = userAnswer === question.options[question.correctAnswer];
      if (correct) correctCount++;

      evaluated.push({
        question: question.question,
        selected: userAnswer || '(Not answered)',
        correct,
        answer: question.options[question.correctAnswer],
        explanation: question.explanation
      });
    });

    const percentage = Math.round((correctCount / total) * 100);
    const passed = percentage >= quiz.passThreshold;

    setEvaluatedAnswers(evaluated);
    setScore(correctCount);

    if (user && quiz.courseId) {
      saveQuizAttempt(user.id, quiz.courseId, correctCount, total, passed);
    }

    setQuizCompleted(true);
    setStarted(false);
    setTimeout(() => {
      setShowResults(true);
    }, 500);
  };

  const resetQuiz = () => {
    setStarted(false);
    setIndex(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setShowResults(false);
    setEvaluatedAnswers([]);
    setScore(0);
  };

  const percentage = quizCompleted ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= quiz.passThreshold;

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <Alert variant="warning">This quiz has no questions yet.</Alert>;
  }

  return (
    <>
      <Card className="shadow-sm">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{quiz.title}</strong>
              {quiz.description && <div className="small text-muted">{quiz.description}</div>}
            </div>
            <Badge bg="info">{total} Questions</Badge>
          </div>
        </Card.Header>
        <Card.Body>
          {!started && !quizCompleted && (
            <>
              <p className="text-muted mb-3">
                Answer all questions, then submit your quiz. You need {quiz.passThreshold}% to pass.
              </p>
              <div className="mb-3">
                <Badge bg="info" className="me-2">
                  {total} Questions
                </Badge>
                <Badge bg="success">{quiz.passThreshold}% to pass</Badge>
              </div>
              <Button variant="primary" onClick={startQuiz}>
                Start Quiz
              </Button>
            </>
          )}

          {started && !quizCompleted && (
            <>
              <ProgressBar
                now={((index + 1) / total) * 100}
                className="mb-3"
                label={`Question ${index + 1} of ${total}`}
              />

              <p className="fw-semibold mb-2">{current.question}</p>
              {current.options.map((opt, optIdx) => (
                <Form.Check
                  key={optIdx}
                  type="radio"
                  label={opt}
                  name={`quiz-${index}`}
                  value={opt}
                  checked={currentAnswer === opt}
                  onChange={(e) => {
                    setUserAnswers((prev) => ({
                      ...prev,
                      [index]: e.target.value
                    }));
                  }}
                  className="mb-2"
                />
              ))}

              <div className="mt-3 mb-2">
                <small className="text-muted">
                  {currentAnswer ? '✓ Answer selected' : 'Please select an answer'}
                </small>
              </div>

              <Stack direction="horizontal" gap={2} className="mt-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={handlePrevious}
                  disabled={index === 0}
                >
                  ← Previous
                </Button>
                {index < total - 1 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    disabled={!currentAnswer}
                  >
                    Next Question →
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="success"
                    onClick={handleSubmitQuiz}
                    disabled={!allQuestionsAnswered}
                  >
                    Submit Quiz
                  </Button>
                )}
                <Button type="button" variant="outline-danger" onClick={resetQuiz}>
                  Reset
                </Button>
              </Stack>

              <Alert variant="info" className="mt-3 mb-0">
                <div className="small">
                  <strong>Progress:</strong> {Object.keys(userAnswers).length} of {total} questions answered
                </div>
              </Alert>
            </>
          )}

          {quizCompleted && (
            <Alert variant={passed ? 'success' : 'warning'} className="mb-0">
              <div className="fw-bold mb-2">
                {passed ? '🎉 Congratulations! You passed!' : 'Quiz Completed'}
              </div>
              <div>
                Score: <strong>{score}/{total}</strong> ({percentage}%)
              </div>
              {!passed && (
                <div className="mt-2">
                  You need {quiz.passThreshold}% to pass. You can retake the quiz to improve your score.
                </div>
              )}
              <Button variant={theme === 'dark' ? 'outline-light' : 'outline-primary'} className="mt-2" onClick={() => setShowResults(true)}>
                View Detailed Results
              </Button>
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Modal show={showResults} onHide={() => setShowResults(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Quiz Results: {quiz.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card className="mb-3">
            <Card.Body className="text-center">
              <h2 className={passed ? 'text-success' : 'text-warning'}>{percentage}%</h2>
              <p className="mb-0">
                Score: {score} out of {total} questions
              </p>
              <Badge bg={passed ? 'success' : 'warning'} className="mt-2">
                {passed ? 'PASSED' : 'NOT PASSED'}
              </Badge>
            </Card.Body>
          </Card>

          <h6 className="mb-2">Question Review:</h6>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Question</th>
                <th>Your Answer</th>
                <th>Correct Answer</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {evaluatedAnswers.map((answer, idx) => (
                <tr key={idx}>
                  <td>{answer.question}</td>
                  <td>{answer.selected}</td>
                  <td>{answer.answer}</td>
                  <td>
                    <Badge bg={answer.correct ? 'success' : 'danger'}>
                      {answer.correct ? '✓ Correct' : '✗ Wrong'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="mt-3">
            {evaluatedAnswers.map((answer, idx) => (
              <Alert key={idx} variant={answer.correct ? 'success' : 'danger'} className="mb-2">
                <div className="fw-semibold">Q{idx + 1}: {answer.question}</div>
                <div className="small mt-1 mb-1">
                  <strong>Your answer:</strong> {answer.selected}
                  {!answer.correct && (
                    <>
                      <br />
                      <strong>Correct answer:</strong> {answer.answer}
                    </>
                  )}
                </div>
                {answer.explanation && <div className="small mt-1">{answer.explanation}</div>}
              </Alert>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResults(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={resetQuiz}>
            Retake Quiz
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InstructorQuiz;

