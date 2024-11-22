import { Route, Routes, BrowserRouter } from 'react-router-dom';
import LoginReg from './Components/LoginReg/LoginReg';
import MainMenu from './Components/MainMenu/MainMenu';
import CardSet from './Components/CardSet/CardSet';
import PasswordRecovery from './Components/PasswordRecovery/PasswordRecovery';
import './App.css';
import EmailRecovery from './Components/EmailRecovery/EmailRecovery';
import EmailCheck from './Components/EmailCheck/EmailCheck';

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<LoginReg />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/card" element={<CardSet />} />
        <Route path="/email-recovery" element={<EmailRecovery />} />
        <Route path="/recover-password" element={<PasswordRecovery />} />
        <Route path="/verify-email" element={<EmailCheck />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
