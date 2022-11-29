import React from "react";
import Form from "./Form";
import Popup from "reactjs-popup";
import "../timeline.css"
import { ReactSession } from 'react-client-session';

export default function SlotWeek({ name, position, createCourse, username}) {
  const const_username = username
  let userStatus = ReactSession.get("admin")
  if (userStatus === 1) {  
  
    return (
      <div className="grid-slot" style={{ position: "relative", gridArea: position.x + " / " + position.y + " / span 1 / span 1" }}>
  
        {createCourse &&
          <Popup trigger={
            <button 
            name={`${name} slot ${position.y}`} 
            style={{ opacity: 0, height: '100%', width: '100%', position: "absolute", zIndex: 99 }} 
              onClick={() => { console.log("CLICKCLACK") }}>
            </button>
  
          } modal>
  
            <div className="add-row-modal-bg">
              <Form text={"Add Row: "}
                title={"course"}
                textObject={["Day Length "]}
                isCourse={true}
                username={username}
                callBack={(course) => createCourse(course, position.y - 2, position.x - 1, const_username)} /> {/*Coordinates are based on CSS grid, needs to be offset*/}
            </div>
            
          </Popup>
        }
        
      </div>
      );
  
  } return (
      <div className="grid-slot" style={{ position: "relative", gridArea: position.x + " / " + position.y + " / span 1 / span 1" }}>
      </div>
  )
}
