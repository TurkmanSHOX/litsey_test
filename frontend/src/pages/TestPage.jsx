import React from 'react';
import TestForm from '../components/TestForm';

const TestPage = () => {
  const test = {}; // Fetch from API

  return <TestForm test={test} />;
};

export default TestPage;