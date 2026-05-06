import React, { useState } from 'react';

const TestForm = ({ test }) => {
  const [answers, setAnswers] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit answers
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{test.title}</h2>
      {test.questions.map((q, i) => (
        <div key={i}>
          <p>{q.question}</p>
          {q.options.map((opt, j) => (
            <label key={j}>
              <input type="radio" name={`q${i}`} value={opt} />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};

export default TestForm;