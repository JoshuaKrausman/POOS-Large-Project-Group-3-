import { Route, Routes, BrowserRouter } from 'react-router-dom';
import LoginReg from './Components/LoginReg/LoginReg';
import MainMenu from './Components/MainMenu/MainMenu';
import CardSet from './Components/CardSet/CardSet';
import './App.css';

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<LoginReg />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/card" element={<CardSet />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
