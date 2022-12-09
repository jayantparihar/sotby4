import React from "react";
import ResourceForm from "./Resource_Form";
import Popup from "reactjs-popup";
import { ReactSession } from 'react-client-session';

export default function ResourceSlotWeek({ name, position, createResource, username, date}) {
  let userStatus = ReactSession.get("admin")
  if (userStatus === 1) {  
    return (
      <div className="grid-slot" style={{ position: "relative", gridArea: position.x + " / " + position.y + " / span 1 / span 1" }}>
        
        {createResource &&
          <Popup trigger={
            <button
              name={`${name} slot ${position.y}`}
              style={{ opacity: 0, height: '100%', width: '100%', position: "absolute", zIndex: 99 }}
              onClick={() => { console.log("CLICKCLACK") }}
              >

            </button>
          } modal>
            <div className="add-row-modal-bg">
              <ResourceForm 
                date={date}
                username={username}/> {/*Coordinates are based on CSS grid, needs to be offset*/}
            </div>
            
          </Popup>
        }
        
      </div>
    );
    } else {
      return (
        <div className="grid-slot" style={{ position: "relative", gridArea: position.x + " / " + position.y + " / span 1 / span 1" }}></div>
      )
    }
}