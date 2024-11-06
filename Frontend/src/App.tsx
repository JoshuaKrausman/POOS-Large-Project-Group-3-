import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom';
import LoginReg from './Components/LoginReg/LoginReg';
import MainMenu from './Components/MainMenu/MainMenu';
import './App.css'

function App() 
{
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginReg />} />
        <Route path="/menu" element={<MainMenu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
