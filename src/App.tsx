import React from 'react';
import { useApp } from './context/AppContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const { currentUser } = useApp();

  // If nobody is logged in, show login page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Define tab security accessibility by role
  const canAccessTab = (tab: string) => {
    const role = currentUser.role;
    if (role === 'Administrator') return true;
    if (role === 'Accountant') {
      return ['dashboard', 'register', 'reports'].includes(tab);
    }
    if (role === 'Teacher') {
      return ['register'].includes(tab);
    }
    return false;
  };

  return (
    <Dashboard canAccessTab={canAccessTab} />
  );
};

export default App;
