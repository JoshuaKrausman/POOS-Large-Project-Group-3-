import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom';
import LoginReg from './Components/LoginReg/LoginReg';
import './App.css'

function App() 
{
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginReg />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
