import React from 'react';
import LessonPlayer from '../components/LessonPlayer';

const LessonPage = () => {
  const lesson = {}; // Fetch from API

  return <LessonPlayer lesson={lesson} />;
};

export default LessonPage;