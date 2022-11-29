import React from "react";
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import {useEffect} from 'react';
import { useState } from 'react';

// this code is copy paste from month.jsx. i altered it to be a week view.
export default function Week({ title, socket, position, next, previous, currentYear, current_date, current_month, setCurrentDate, setCurrentMonth, setYear}) {

    const weekDayNameArray = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday'
    ]

    const monthNameArray = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    let d2 = new Date(current_date)
    const weeks = weekDayNameArray.map((element) => {
        let weekDayName = String(element + '  ' + String(d2.getDate()))
        d2.setDate(d2.getDate() + 1)
        return  weekDayName
    })

    const month_name = (current_date, current_month) => {
        let next_week_friday = new Date(current_date)
        next_week_friday.setDate(current_date.getDate() + 4)
        
        const friday_month = next_week_friday.getMonth();
        const month_index = current_date.getMonth()

        console.log(monthNameArray[current_month] + ' - ' + monthNameArray[0])
        if ( friday_month!=month_index ){
            if (current_month ===11) {
                return monthNameArray[current_month] + ' - ' + monthNameArray[0];
            } else {
                return monthNameArray[current_month] + ' - ' + monthNameArray[current_month + 1]
            }
        } else {
            if (month_index !== month_index) {
                if (current_month ===11) {
                    return monthNameArray[0]
                } else {
                    return monthNameArray[current_month + 1]
                }
            } else {
                return monthNameArray[current_month]
            }
        }
    }

    return (
        <React.Fragment>
            <div className="grid-week" style={{gridArea: position.x + " / " + position.y  + " / span 1 / span " + weeks.length }}>
                <Stack direction="row" justifyContent="space-evenly" spacing={1}>
                    <IconButton aria-label="back" onClick={previous}>
                        <ArrowBackIosIcon className='scroll-button' />
                    </IconButton>
                    <h2 className="grid-header">{month_name(current_date, current_month)}</h2>
                    <IconButton aria-label="next" onClick={next}>
                        <ArrowForwardIosIcon className='scroll-button' />
                    </IconButton>
                    <h2 className="grid-header" id="grid-header-month-name">{currentYear}</h2>
                </Stack>
            </div>
            {
                weeks.map((item, i) => {
                    return <div key={title + item} className="grid-day" style={{ gridArea: (position.x + 1) + " / " + (position.y + i) + " / span 1 / span 1" }}>
                        {item}
                        
                    </div>
                })
            }
        </React.Fragment>
    );
}
