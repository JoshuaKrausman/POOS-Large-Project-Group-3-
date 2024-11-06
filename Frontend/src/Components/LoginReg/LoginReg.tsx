import React from 'react'
import { useState } from 'react'
import './LoginReg.css'
import back_icon from '../Assets/back.png'

function LoginReg() 
{
  // const app_name = 'cop4331-project.online'
  // function buildPath(route:string) : string
  // {
  //     if (process.env.NODE_ENV != 'development') 
  //     {
  //         return 'http://' + app_name +  ':5000/' + route;
  //     }
  //     else
  //     {        
  //         return 'http://localhost:5000/' + route;
  //     }
  // }

  const [state, setState] = useState("Welcome");
  const [message, setMessage] = useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [username, setUserame] = React.useState('');
  const [password, setPassword] = React.useState('');

  async function doRegister(event: any) : Promise<void>
  {
    event.preventDefault();
    console.log("username:" + username);
    console.log("password:" + password);
    console.log("email:" + email);
    console.log("displayName:" + displayName);
    var obj = {username:username,password:password,displayName:displayName,email:email};
    var js = JSON.stringify(obj);

    try
    {    
        const response = await fetch('http://localhost:5000/api/register',
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

        var res = JSON.parse(await response.text());

        if( res.id <= 0 )
        {
            // setMessage('User/Password combination incorrect');
        }
        else
        {
            var user = {firstName:res.firstName,lastName:res.lastName,id:res.id}
            localStorage.setItem('user_data', JSON.stringify(user));
            setDisplayName('');
            setEmail('');
            setUserame('');
            setPassword('');
            console.log("Reg Sucessful");
            setState("Welcome");
        }
    }
    catch(error:any)
    {
        alert(error.toString());
        return;
    } 

  };

  async function doLogin(event: any) : Promise<void>
  {
    event.preventDefault();
    var obj = {username:username,password:password};
    var js = JSON.stringify(obj);

    try
    {    
        const response = await fetch('http://localhost:5000/api/login',
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

        var res = JSON.parse(await response.text());

        if( res.id <= 0 )
        {
            setMessage('User/Password incorrect');
        }
        else
        {
            var user = {username:res.Username, id:res.id, displayName:res.DisplayName, email:res.Email}
            localStorage.setItem('user_data', JSON.stringify(user));
            // Clear the input fields after successful login
            setUserame('');
            setPassword('');
            setMessage('Login successful');
            window.location.href = '/menu';
        }
    }
    catch(error:any)
    {
        alert(error.toString());
        return;
    }

    
  };

  function handleSetRegDisplayName( e: any ) : void
  {
    setDisplayName( e.target.value );
  }

  function handleSetRegEmail( e: any ) : void
  {
    setEmail( e.target.value );
  }

  function handleSetRegUsername( e: any ) : void
  {
    setUserame( e.target.value );
  }

  function handleSetRegPassword( e: any ) : void
  {
    setPassword( e.target.value );
  }

  return (
    <div className='container'>
        <div className="header">{state}</div>
        {state === "Welcome"?<div></div>:<div className="backArrow"><img src={back_icon} alt='' onClick={() => setState("Welcome")}/></div>}
      <div className="inputs">
      {state === "Welcome"?<div></div>:<div className="input"><input type="text" id='displayName' onChange={handleSetRegDisplayName} placeholder='Name'/></div>}
      {state === "Welcome"?<div></div>:<div className="input"><input type="text" id='email' onChange={handleSetRegEmail} placeholder='Email'/></div>}

        <div className="input">
          <input type="text" id='username' onChange={handleSetRegUsername} placeholder='Username' autoComplete='off'/>
        </div>
        <div className="input">
          <input type="password" id='password' onChange={handleSetRegPassword} placeholder='Password' autoComplete='off'/>
        </div>
      </div>
      {state === "Register"?<div></div>:<div className="forgotxLorR">
        <div className="forgotPassword">Forgot Your Password?</div>
        <div className="LorR" onClick={() => setState("Register")}>New User?</div>
      </div>}

        {state === "Welcome"?<div className="submit" onClick={doLogin}>Login</div>:<div className="submit" onClick={doRegister}>Register</div>}
        <div>{message}</div>
    </div>
  )
};

export default LoginReg
