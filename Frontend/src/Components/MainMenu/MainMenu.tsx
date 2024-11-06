import React from 'react'
import { useState, useEffect } from 'react'
import './MainMenu.css'

function MainMenu()
{
    let userJSON = localStorage.getItem('user_data')
    let userObj = JSON.parse(userJSON!);
    const [state, setState] = useState('normal');
    const [newName, setNewName] = useState('');
    const [newTopic, setNewTopic] = useState('');

    async function showSets(): Promise<void> {
        // Check if userObj is valid
        if (!userObj || !userObj.id) {
          console.error("User object or user ID is missing");
          return;
        }
      
        // console.log("This is UserID: ", userObj.id);
        let obj = { userId: userObj.id };
        let js = JSON.stringify(obj);
      
        try {
          const response = await fetch('http://localhost:5000/api/getUserSets', {
            method: 'POST',
            body: js,
            headers: { 'Content-Type': 'application/json' },
          });
      
          // Parse the response safely
          const resText = await response.text();
          if (!resText) {
            console.error("Empty response received from the server");
            return;
          }
      
          let res;
          try {
            res = JSON.parse(resText);
          } catch (error) {
            console.error("Error parsing response:", error);
            return;
          }
      
          // Check if res.sets exists and is an array
          if (!res.sets || !Array.isArray(res.sets)) {
            console.error("Expected 'sets' array not found in response", res);
            return;
          }
      
          let userSets = res.sets;
        //   console.log("The amount of card sets " + userObj.displayName + " has is: " + userSets.length);
          console.log(userSets);
      
          let collection = "";
          for (let i = 0; i < userSets.length; i++) 
            {
                collection += (`<div class="cardSet" id="set` + (i+1) +`">` + userSets[i].Name + '</br><span id="topic">' + userSets[i].Topic + `</span></div>`);
                if (i !== userSets.length) collection += "\n";
            }
          console.log(collection);
      
          const element = document.querySelector(".listCardSets");
          if (element)
            element.innerHTML = collection;
          else 
            console.error("Element with class 'listCardSets' not found");
      
        } catch (error: any) {
          alert(error.toString());
        }
      }

    function doLogout(event:any) : void
    {
	    event.preventDefault();
		
      localStorage.removeItem("user_data")
      window.location.href = '/';
    }; 

    async function addCardSet(event:any) : Promise<void>
    {
        event.preventDefault();
        let obj = {Name:newName, Topic:newTopic, UserId: userObj.id, Published: "true"};
        let js = JSON.stringify(obj);
        try
        {
            const response = await fetch('http://localhost:5000/api/createCardSet', {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' },
              });

        // Parse the response safely
          const resText = await response.text();
          if (!resText) {
            console.error("Empty response received from the server");
            return;
          }
      
          let res;
          try 
          {
            res = JSON.parse(resText);
          } 
          catch (error) 
          {
            console.error("Error parsing response:", error);
            return;
          }

          console.log("Added")
          setState("normal");
          showSets();
        }
        catch
        {

        }
    }

    function addCardWrapper() : void
    {
        setState("adding");
    }

    function handleNewName(event:any) : void
    {
        setNewName(event.target.value);
    }

    function handleNewTopic(event:any) : void
    {
        setNewTopic(event.target.value);
    }


    showSets();
  return (
    <div>
        <div className="blurredBackground"></div>
        <div className="addButton" onClick={addCardWrapper}>+</div>
        <div className="logoutButton" onClick={doLogout}>Log Out</div>
        <div><h1>Welcome {userObj.displayName}</h1></div>
        <div><h2>Here are your sets</h2></div>
        {state === "normal"?<div></div>:
        <div className="cardSet" id="set0">
            <input type="text" id='setName' placeholder="Set Name"onChange={handleNewName}></input>
            <input type="text" id='setTopic' placeholder="Set Topic"onChange={handleNewTopic}></input>
            <div className='makeSet'onClick={addCardSet}>Add</div>
        </div>}
        <div className="listCardSets"></div>
    </div>
  )
}

export default MainMenu
