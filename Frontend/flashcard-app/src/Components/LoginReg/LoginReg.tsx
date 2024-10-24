import React from 'react'
import { useState } from 'react'
import './LoginReg.css'
import back_icon from '../Assets/back.png'

function LoginReg() {

  const [state, setState] = useState("Welcome")



  return (
    <div className='container'>
        <div className="header">{state}</div>
        {state === "Welcome"?<div></div>:<div className="backArrow"><img src={back_icon} alt='' onClick={() => setState("Welcome")}/></div>}
      <div className="inputs">
      {state === "Welcome"?<div></div>:<div className="input">
          <input type="text" placeholder='Name'/>
        </div>}

        <div className="input">
          <input type="text" placeholder='Username'/>
        </div>
        <div className="input">
          <input type="password" placeholder='Password'/>
        </div>
      </div>
      {state === "Register"?<div></div>:<div className="forgotxLorR">
        <div className="forgotPassword">Forgot Your Password?</div>
        <div className="LorR" onClick={() => setState("Register")}>New User?</div>
      </div>}

        {state === "Welcome"?<div className="submit">Login</div>:<div className="submit">Register</div>}
    </div>
  )
};

export default LoginReg
