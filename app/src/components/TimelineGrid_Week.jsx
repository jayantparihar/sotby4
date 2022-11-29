import React, { useEffect } from "react";
import _ from "lodash";
import { useState } from "react";
import RowHeaderWeek from './RowHeader_Week'
// const [display, setDisplay] = useState('Week');

export default function TimelineGrid({socket, heightLimit, instructorArray, createCourse, onRemoveUser, onAddUser, currentDate}) {
    console.log('instructorArray',instructorArray)
    const initialRowHeaderArray = instructorArray;
    // 100px height cells + 4 px total margin, change later if needed
    const rowHeight = 265; 

    // Height for the grid and for correct placment of the add row button
    const [height, setHeight] = useState(rowHeight);

    // List of users
    const [rowHeaderArray, setRowHeaderArray] = useState(initialRowHeaderArray);

    // Add a user to the timeline
    const addRowHeader = (user, emit=true) => {
        if(emit) {
            socket.emit('userAdded', user);
        } else {
            setRowHeaderArray(rowHeaderArray => [...rowHeaderArray, {key: user.username, name: user.firstname + " " + user.lastname, timeblocks: [], vacations: []}]);

            // Set the height limit to the number of users * 2 since each user takes up 2 rows
            heightLimit.set((rowHeaderArray.length + 1) * 3);
            setHeight((height) => {
                return height + rowHeight
            });
    
            // Call the add user function passed in from the interactive grid so that it could also be updated
            onAddUser(user);
        }
    }

    const removeRowHeader = (key, x, emit=true) => {
        // Check that an element has been found and removed before adjusting the row heights
        setRowHeaderArray(rowHeaderArray => _.reject(rowHeaderArray, (element) => {return element.key === key}));
        setHeight(height => height - rowHeight);

        // Height limit not used, elements are locked to their rows
        heightLimit.set((rowHeaderArray.length - 1) * 3);

        // Call the add user function passed in from the interactive grid so that it could also be updated
        onRemoveUser(key, x - 1);

        if(emit)
            socket.emit('userDeleted', key, x); 
    }

    const createRowHeaderWeek = (item, i) => {
        const x = i * 3 + 1;
        
        return <RowHeaderWeek key={item.key + "rowHeader" + i} socket={socket} text={item.name} currentDate={currentDate} username={instructorArray[0].key}
        position={{x: x, y: 1}} width={5} height={3} 
        removeFunction={() => {
            removeRowHeader(item.key, x)}} 
            createCourse={createCourse}/>
    }

    //Use effect for attaching socket event listeners once the component mounts
    useEffect(() => {
        socket.on("userAdded", (user, state) => {
            console.log("Added: " + JSON.stringify(user));
            addRowHeader(user, false, state);
        });

        socket.on("userDeleted", (id, x) => {
            console.log(x);
            console.log(id);
            removeRowHeader(id, x, false);
        });
    }, []);

    return(
                <React.Fragment>
                    <div key={instructorArray[0].key} className="grid-container-layout-weeks" style={{height:height}}>
                        {
                            rowHeaderArray.map((item, i) => {
                                console.log('item, i', item, i)
                                return (
                                    createRowHeaderWeek(item, i)
                                )
                            })
                        }
                    </div>
                </React.Fragment>
        )
}