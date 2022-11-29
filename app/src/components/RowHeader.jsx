import React from "react";
import Slot from "./Slot";
import { ReactSession } from 'react-client-session';
import { Stack } from "@mui/material";
import Popup from "reactjs-popup";
import RemoveUserForm from "./RemoveUserForm";

export default function RowHeader({position, text, width, height, removeFunction, createCourse, viewType}) {
    
    let header_x_span = 1
    if (viewType === 'years') {
        header_x_span = 2
    } else if (viewType === 'months') {
        header_x_span = 1
    }
    console.log('header x span', header_x_span)

    const createRowSlots = () => {
        let slots = [];
        
        for(let y = 0; y < width; y++) {
            for(let x = 0; x < height; x++) {
                slots.push({
                    key: text + "x:" + (position.x + x) + "y:" + (position.y + y),
                    pos: {x: position.x + x , y: position.y + y + header_x_span},
                });
            }
        }
        return slots;
    }

    const createSlot= (item, i) => {
        return(
            <Slot key={item.key} position={{x: item.pos.x, y: item.pos.y}} 
            // Rowheader has 2 rows associated with it, one that can create courses, one that can't (vacation row)
            createCourse={item.pos.x % 2 === 1 ? createCourse : null} 
            name={text}/>
        );
    }

    // const [slotArray, ] = useState(createRowSlots());

    let slotArray = createRowSlots();

    return(
        <React.Fragment>
            <div className="grid-row-header" style={{gridArea: position.x + " / " + position.y + " / span 2 / span " + header_x_span + ""}}>
                <Stack justifyContent={'row'} style={{ flexDirection: "column"}} spacing={18}>
                    <p className="header-username">{text}</p>
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
            {slotArray.map((item, i) => {
                return (
                    createSlot(item, i)
                )
            })}
        </React.Fragment>
    );
}