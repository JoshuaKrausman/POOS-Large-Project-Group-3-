// import { useState, useEffect } from 'react'
import './CardSet.css'
import arrow_icon from '../Assets/arrow.png'

function CardSet()
{

    let CardID = localStorage.getItem('card_id');
    console.log("CardID: " + CardID);

    function backToMenu()
    {
        window.location.href = '/menu'
    }
    
  return (
    <div>
        <div className="blurredBackground"></div>
        <div><img src={arrow_icon} id="backMenu" onClick={backToMenu}/></div>
    </div>
  )
}

export default CardSet
