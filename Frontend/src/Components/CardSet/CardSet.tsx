<<<<<<< Updated upstream
// import { useState, useEffect } from 'react'
import './CardSet.css'
import arrow_icon from '../Assets/arrow.png'
=======
import React from "react";
import { useState, useEffect } from "react";
import "./CardSet.css";
import arrow_icon from "../Assets/arrow.png";
>>>>>>> Stashed changes

function CardSet() {
  let CardID = localStorage.getItem("card_id");
  console.log("CardID: " + CardID);

  const [cards, setCards] = useState<any[]>([]);
  const [state, setState] = useState("normal");
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editState, setEditState] = useState(false);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [isFadingOut, setIsFadingOut] = useState(false);

  const cardSetId = localStorage.getItem("card_set_id");

  function backToMenu() {
    window.location.href = "/menu";
  }

  async function showCards(): Promise<void> {
    if (!cardSetId) {
      console.error("Card set ID is missing");
      return;
    }

    let obj = { cardSetId: cardSetId };
    let js = JSON.stringify(obj);

    try {
      const response = await fetch("api/getCards", {
        method: "POST",
        body: js,
        headers: { "Content-Type": "application/json" },
      });

      const resText = await response.text();
      if (!resText) {
        console.error("Empty response received from the server");
        return;
      }

      let res = JSON.parse(resText);

      if (!res.cards || !Array.isArray(res.cards)) {
        console.error("Expected 'cards' array not found in response", res);
        return;
      }

      setCards(res.cards);
      console.log(cards);
    } catch (error: any) {
      alert(error.toString());
    }
  }

  async function deleteCard(id: string) {
    let obj = { id: id };
    let js = JSON.stringify(obj);
    try {
      const response = await fetch("api/deleteCard", {
        method: "POST",
        body: js,
        headers: { "Content-Type": "application/json" },
      });

      const resText = await response.text();
      if (!resText) {
        console.error("Empty response received from the server");
        return;
      }
      console.log("CardID:" + id + " deleted");
      showCards();
    } catch (error: any) {
      alert(error.toString());
    }
  }

  async function editCard(id: string) {
    console.log("Editing Card ID: " + id);
    console.log("New Question: " + editQuestion);
    console.log("New Answer: " + editAnswer);
    let obj = { id: id, question: editQuestion, answer: editAnswer };
    let js = JSON.stringify(obj);
    try {
      const response = await fetch("api//updateCard", {
        method: "POST",
        body: js,
        headers: { "Content-Type": "application/json" },
      });

      const resText = await response.text();
      if (!resText) {
        console.error("Empty response received from the sever");
        return;
      }
      console.log("Card updated");
      showCards();
      setEditState(false);
    } catch (error: any) {
      alert(error.toString());
    }
  }

  async function addCard(event: any): Promise<void> {
    event.preventDefault();
    let obj = {
      cardSetId: cardSetId,
      question: newQuestion,
      answer: newAnswer,
    };
    let js = JSON.stringify(obj);
    try {
      const response = await fetch("api/createCard", {
        method: "POST",
        body: js,
        headers: { "Content-Type": "application/json" },
      });

      const resText = await response.text();
      if (!resText) {
        console.error("Empty response received from the server");
        return;
      }
      console.log("Card added");
      setState("normal");
      showCards();
    } catch (error: any) {
      alert(error.toString());
    }
  }

  function addCardWrapper(): void {
    if (state === "adding") {
      setIsFadingOut(true);
      setTimeout(() => {
        setState("normal");
        setIsFadingOut(false);
      }, 150);
    } else {
      setState("adding");
    }
  }

  function handleNewQuestion(event: any): void {
    setNewQuestion(event.target.value);
  }

  function handleNewAnswer(event: any): void {
    setNewAnswer(event.target.value);
  }

  return (
    <div>
      <div className="blurredBackground"></div>
      <div>
        <img src={arrow_icon} id="backMenu" onClick={backToMenu} />
      </div>
    </div>
  );
}

export default CardSet;
