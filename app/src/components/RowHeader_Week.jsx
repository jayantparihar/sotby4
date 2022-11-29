import React from "react";
import SlotWeek from "./Slot_Week";
import ResourceSlotWeek from "./Resource_Slot_Week";
import { ReactSession } from 'react-client-session';
import Stack from '@mui/material/Stack';
import RemoveUserForm from "./RemoveUserForm"
import Popup from "reactjs-popup";
import "../timeline.css";

export default function RowHeader({position, text, width, height, removeFunction, createCourse, currentDate, username}) {
    
    function nFormat(n){ if(n <= 9){ return "0" + n } else { return n } }
    
    const getFormatedDate = (dt) => {
        return dt.getFullYear() + "-" + nFormat((dt.getMonth()+1)) + "-" + nFormat(dt.getDate())
    }
    
    const createSlotDates = () => {
        let slotDates = []
            for(let y = 0; y < width; y++) {
                const newDate = new Date(currentDate)
                newDate.setDate(currentDate.getDate() + y)
                slotDates.push(getFormatedDate(newDate))
            }
        return slotDates
    }
    const slotDates = createSlotDates()

    const createRowSlots = () => {
        let slots = [];
        for(let y = 0; y < width; y++) {
            for(let x = 0; x < height; x++) {
                slots.push({
                    key: text + "x:" + (position.x + x) + "y:" + (position.y + y),
                    pos: {x: position.x + x + 1, y: position.y + y + 1},
                });

            }
        }
        return slots;
    }

    const createSlot= (item, i) => {
        if (item.pos.x % 4 == 0) {
            return(
                <ResourceSlotWeek key={item.key} position={{x: item.pos.x, y: item.pos.y}} 
                // Rowheader has 3 rows associated with it, one that can create courses, one that can't (vacation row)
                createResource={item.pos.x % 4 == 0 && item.pos.x % 4 != 1 ? createCourse : null} 
                username={username} date={slotDates[item.pos.y - 2]}/>
            );
        } else {
            return(
                <SlotWeek key={item.key} position={{x: item.pos.x, y: item.pos.y}} 
                // Rowheader has 3 rows associated with it, one that can create courses, one that can't (vacation row)
                createCourse={item.pos.x % 4 != 0 && item.pos.x % 4 != 1 ? createCourse : null} 
                name={text} username={username} />
            );
        }
    }

    // const [slotArray, ] = useState(createRowSlots());

    let slotArray = createRowSlots();

    return(
        <React.Fragment>
            <div className="grid-row-header" style={{height: 20, gridArea: position.x + " / " + position.y + " / span 1 / span 6"}}>
                 <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <p>{text}</p>
                    {
                        <Popup trigger={
                            ReactSession.get("admin") === 1 ? 
                            <button name={text + " remove"} className="grid-row-header-close">
                                <p>Remove</p>
                            </button>
                            :
                            undefined
                          } modal>
                            <div className="add-row-modal-bg">
                              <RemoveUserForm 
                                removeFunction={removeFunction}/> {/*Coordinates are based on CSS grid, needs to be offset*/}
                            </div>
                            
                        </Popup>


                    }
                </Stack>
            </div>
            <div className="grid-row-label-container" style={{gridArea: (position.x + 1) + " / " + position.y + " / span 3 / span 1"}}>
                <div className="grid-row-labels" style={{gridArea: (1) + " / " + position.y + " / span 1 / span 1"}}>
                    <p>Morning</p>
                </div>
                <div className="grid-row-labels" style={{gridArea: (2) + " / " + position.y + " / span 1 / span 1"}}>
                    <p>Afternoon</p>
                </div>
                <div className="grid-row-labels" style={{gridArea: (3) + " / " + position.y + " / span 1 / span 1"}}>
                    <p>Resources</p>
                </div>
            </div>
            {slotArray.map((item, i) => {
                return (
                    createSlot(item, i)
                )
            })}
        </React.Fragment>
    );
}