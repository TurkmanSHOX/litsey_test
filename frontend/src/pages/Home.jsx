import React from 'react';
import CourseCard from '../components/CourseCard';

const Home = () => {
  const courses = []; // Fetch from API

  return (
    <div>
      <h1>Welcome to Educational Platform</h1>
      <div className="courses">
        {courses.map(course => <CourseCard key={course.id} course={course} />)}
      </div>
    </div>
  );
};

export default Home;