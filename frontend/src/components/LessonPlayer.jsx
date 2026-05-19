const LessonPlayer = ({ lesson }) => {
  return (
    <div className="lesson-player">
      <h2>{lesson.title}</h2>
      <p>{lesson.content}</p>
    </div>
  );
};

export default LessonPlayer;
