import React from "react";
import Form from "./Form";
import Popup from "reactjs-popup";

export default function Slot({ name, position, createCourse }) {

  return (
    <div className="grid-slot" style={{ position: "relative", gridArea: position.x + " / " + position.y + " / span 1 / span 1" }}>
    </div>
  );
}