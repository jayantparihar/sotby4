import React from "react";
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

export default function Month({ title, socket, position, weeks, next, previous, currentYear, currentDate }) {
    
    function getMonthWeekAmount(currentDate) {
        const new_date = new Date(currentDate)
        new_date.setMonth(new_date.getMonth() + 1)
        new_date.setDate(0)
        const last_day_of_month = new_date.getDate()
        let week_day_index = new_date.getDay()
        if (week_day_index === 0) {
          week_day_index = 7
        }
        const week_amount = Math.floor((last_day_of_month - week_day_index) / 7) + 1
        console.log(week_amount)
        return week_amount
    }

    function getWeekNums() {
        console.log('currentDate', currentDate)
        let week_nums = []
        let d2 = new Date(currentDate)
        for (let i = 0; i < getMonthWeekAmount(currentDate); i++) {
            let weekDayName = String(d2.getDate())
            d2.setDate(d2.getDate() + 7)
            week_nums.push(weekDayName)
        }
        return week_nums
    }

    console.log('weeks', weeks)
    console.log('week_nums', getWeekNums())

    const week_nums = getWeekNums()


    return (
        <React.Fragment>
            <div className="grid-month" style={{ gridArea: position.x + " / " + position.y + " / span 1 / span " + week_nums.length }}>
                <Stack direction="row" justifyContent="space-evenly" spacing={1}>
                    <IconButton aria-label="back" onClick={previous}>
                        <ArrowBackIosIcon className='scroll-button'/>
                    </IconButton>
                    <h2 className="grid-header">{title}</h2>
                    <IconButton aria-label="next" onClick={next}>
                        <ArrowForwardIosIcon className='scroll-button'/>
                    </IconButton>
                    <h2 className="grid-header">{currentYear}</h2>
                </Stack>
            </div>
            {
                week_nums.map((item, i) => {
                    return <div key={title + item} className="grid-day" style={{ gridArea: (position.x + 1) + " / " + (position.y + i) + " / span 1 / span 1" }}>
                        {item}
                    </div>
                })
            }
        </React.Fragment>
    );
}
