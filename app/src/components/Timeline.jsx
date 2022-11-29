import React from "react";
import Month from './Month';
import { useState } from "react";
import NoCollisionLayout from './NoCollisionLayout';
import { ReactSession } from 'react-client-session';
import AdminNav from "./AdminNav";
import UserNav from "./UserNav";
import DefaultNav from "./DefaultNav";
import '../navbar.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import NoCollisionYear from './NoCollision_Year';
// week import
import NoCollisionWeek from './NoCollision_Week';
import MonthYear from './Month_Year';
import Week from './Week';

// import { Navigate } from 'react-router-dom';

// "/detailed-schedule" courseNum=
// const navigate = Navigate();

function SelectNav(props) {
    const userStatus = props.userStatus;
    if (userStatus === 1) {
        return <AdminNav />
    }
    if (userStatus === 0) {
        return <UserNav />
    }
    return <DefaultNav />
}

export default function Timeline({ socket, heightLimit, instructorArray }) {

    const [year, setYear] = useState(2022);

    let thisYear = new Date();
    // this is a base for when the app starts
    thisYear.setFullYear(year, 0, 3);



    let weekInformation = { weekNum: 0, weekRangesArray: [], indexMap: {} };


    const initialMonthArray = getMonthArray(thisYear);

    // const initialDayArray = getWeekDayArray(thisYear);

    const [year_month_array, setYearMonthArray] = useState(initialMonthArray);

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

    const firstWeekDayNameArray = [
        'Monday 3',
        'Tuesday 4',
        'Wednesday 5',
        'Thursday 6',
        'Friday 7'
    ]


    const monthWeekArray = [
        5, 4, 4, 5, 4, 4, 5, 4, 4, 5
    ];
    

    

    const firstWeekArray = getFirstWeek();

    const [monthArray,] = useState(year_month_array);

    const [current_month, setCurrentMonth] = useState(0);

    const [current_month_name, setCurrentMonthName] = useState(monthNameArray[current_month])
    // week view
    const [current_week, setCurrentWeek] = useState(0);

    const [month_weeks, setMonthWeeks] = useState(monthWeekArray[current_month]);

    const [first_week, setFirstWeek] = useState(firstWeekArray[0]);
    // week view
    const [first_date, setFirstDate] = useState(new Date("Jan 03, 2022 00:00:00"));

    const [display, setDisplay] = useState('Week');
    //week view
    const [current_date, setCurrentDate] = useState(new Date("Jan 03, 2022 00:00:00"))
    //week view
    const [current_day_name_array, setDayNameArray] = useState(firstWeekDayNameArray)
    



    function getMonthArray(year) {

        const monthArray = Array.from(Array(12).keys()).map((item, i) => {
            return ({
                monthIndex: i,
                weeks: getWeeks(year, i, weekInformation),
            });
        });

        return monthArray;
    }


    let totalWeeks = 0;
    for (let i = 0; i < monthArray.length; i++) {
        totalWeeks += monthArray[i].weeks.length;
    }

    function nextYear() {
        let d = new Date(first_date.getFullYear() + 1, 0, 1)
        const week_day_index = d.getDay()
        if (week_day_index <= 1) {
            d.setDate(2 - week_day_index)
        } else {
            d.setDate(9 - week_day_index)
        }
        console.log('d',d)
        setFirstDate(d)
    }

    function previousYear() {
        let d = new Date(first_date.getFullYear() - 1, 0, 1)
        const week_day_index = d.getDay()
        if (week_day_index <= 1) {
            d.setDate(2 - week_day_index)
        } else {
            d.setDate(9 - week_day_index)
        }
        console.log('d',d)
        setFirstDate(d)
    }

    function nextMonth() {
        //next month
        let d = new Date(current_date)
        d.setMonth(current_month + 1)
        d.setDate(1)

        if (d.getDay() !== 1) {
            if (d.getDay() === 0) {
                d.setDate(2)

            } else {

                d.setDate(9-d.getDay())
            }
        }
        if (current_month === 11) {
            setYear(year + 1);
            thisYear.setFullYear(year, 0, 1);
            
            thisYear.setMonth(thisYear.getMonth() + 12);
            
            setYearMonthArray(getMonthArray(thisYear));
            
            setCurrentMonth(0);
            setMonthWeeks(weekInformation.weekRangesArray[0].times.length);
            setFirstWeek(firstWeekArray[0]);
        } else {
            setCurrentMonth(current_month + 1);
            setMonthWeeks(weekInformation.weekRangesArray[current_month + 1].times.length);
            setFirstWeek(firstWeekArray[current_month + 1]);
            
        }

        setCurrentDate(d)
    }

    function previousMonth() {
        let d = new Date(current_date)
        d.setMonth(current_month - 1)
        d.setDate(1)

        if (d.getDay() !== 1) {
            if (d.getDay() === 0) {
                d.setDate(2)
            } else {
                d.setDate(9-d.getDay())
            }
        }
        
        if (current_month === 0) {
            setYear(year - 1);
            
            thisYear.setMonth(thisYear.getMonth() - 12);
            
            setYearMonthArray(getMonthArray(thisYear));
            
            setCurrentMonth(11);
            setMonthWeeks(weekInformation.weekRangesArray[11].times.length);
            setFirstWeek(firstWeekArray[11]);
        } else {
            setCurrentMonth(current_month - 1);
            setMonthWeeks(weekInformation.weekRangesArray[current_month - 1].times.length);
            setFirstWeek(firstWeekArray[current_month - 1]);
        }
        setCurrentDate(d)
    }

    // see the 'previousWeek' function. its the same thing as this but mirrored
    const nextWeek = async () => {
        // Step 1: find the date of last week monday
        let d = new Date(current_date)
        //last week monday
        d.setDate(d.getDate() + 7)
        setCurrentDate(d)
        setCurrentMonth(d.getMonth())
        setYear(d.getFullYear())
    }

    // this function determines the week header for the previous week
    function previousWeek() {

        // Step 1: find the date of last week monday
        let d = new Date(current_date)
        //last week monday
        d.setDate(d.getDate() - 7)
        setCurrentDate(d)
        setCurrentMonth(d.getMonth())
        setYear(d.getFullYear())
    }

    function getFirstWeek() {
        var firstWeek = [0];

        for (var i = 0; i < 12; i++) {
            var weekNumber = weekInformation.weekRangesArray[i].times.length + firstWeek[i];
            firstWeek.push(weekNumber);
        }
        return firstWeek;
    }

    
    const createWeekColumns = () => {
        
        return (
            <NoCollisionLayout socket={socket} heightLimit={heightLimit} newInstructorArray={instructorArray}
            weekInformation={weekInformation} totalWeeks={totalWeeks} firstDate={new Date("Jan 03, 2022 00:00:00")}
            currentMonthWeeks={month_weeks} currentMonth={current_month} year={year} currentDate={current_date}/>
            )
        }
    // this is just for the week view rows and instructor header. it imports 'noCollision_week.jsx'.
    // keep in mind some of these values are useless as it was originally copied from the month_view one above ^
    const createDayColumns = (instructorArray) => {
        return (
            <NoCollisionWeek socket={socket} heightLimit={heightLimit} newInstructorArray={instructorArray}
            weekInformation={weekInformation} totalWeeks={7} currentDate={current_date} firstDate={first_date}
            currentWeekDays={5} currentWeek={current_week}  />
            )
        }
    const createMonth = (item, i) => {
        return (
            <Month key={monthNameArray[item.monthIndex] + " month"} title={monthNameArray[item.monthIndex]}
                position={{ x: 1, y: i === 0 ? i + 2 : getNumberOfWeeks(year_month_array, i) + 2 }} weeks={item.weeks}
                next={nextMonth} previous={previousMonth} currentYear={year} currentDate={current_date}/>
        );
    }
            
    const createMonthYear = (week_num_pair, index, new_year) => {
        return <MonthYear key={monthNameArray[index] + " month"} title={monthNameArray[index]} 
            firstDate={first_date} position={{ x: 1, y: index === 0 ? index + 3 : week_num_pair[1] + 3 }} 
            weeks={week_num_pair[0]} next={nextYear} previous={previousYear} month_index={index}/>
    }
    // this is just for the week view header. it imports 'Week.jsx'
    // keep in mind some of these values are useless as it was originally copied from the month_view one above ^ 'createMonth()'
    const createWeek = (item, i) => {
        return (
            <Week key={monthNameArray[current_month] + " month"} title={current_month_name} first_week={first_week}
                position={{ x: 1, y: i === 0 ? i + 2 : 2}} setCurrentDate={setCurrentDate} setCurrentMonth={setCurrentMonth}
                next={nextWeek} previous={previousWeek} currentYear={year} current_date={current_date} current_month={current_month} />
        );
    }


    const handleChange = (event) => {
        setDisplay(event.target.value);
    }

    const createDisplayOption = () => {

        return (
            <div id="display-selector">
                <FormControl sx={{ m: 1, minWidth: 100 }}>
                    <InputLabel id="display-select-label">View</InputLabel>
                    <Select
                        labelId="display-select-label"
                        id="display-select"
                        value={display}
                        onChange={handleChange}
                        autoWidth
                        label="Display"
                    >
                        <MenuItem value={"Week"}>Week</MenuItem>
                        <MenuItem value={"Year"}>Year</MenuItem>
                        <MenuItem value={"Month"}>Month</MenuItem>
                    </Select>
                </FormControl>
            </div>
        )
    }


    

    if (display === "Month") {
        return (
            <React.Fragment>
                <SelectNav userStatus={ReactSession.get("admin")} />
                <div className="page">
                    <div className="grid-container-months">
                        {
                            createDisplayOption()
                        }
                        {
                            createMonth(monthArray[current_month])
                        }
                    </div>
                    {
                        createWeekColumns()
                    }
                </div>
            </React.Fragment>
        );
    } else if (display === "Week") {
        return (
            <React.Fragment>
                <SelectNav userStatus={ReactSession.get("admin")} />
                <div className="page">
                    <div className="grid-container-weeks">
                        {
                            createDisplayOption()
                        }
                        {
                            createWeek(current_day_name_array, monthArray[current_month])
                        }
                    </div>
                    {
                        (createDayColumns(instructorArray))
                        
                    }
                </div>
            </React.Fragment>
        )
    }
    if (display === "Year") {
        let week_num_set = [];
        let week_amount = 0;
        let month_date = new Date(first_date)
        for (let month_index = 0; month_index < 12; month_index++) {
            const week_set = getWeekNums(month_date)
            month_date.setDate(month_date.getDate() + week_set[1] * 7)
            week_num_set.push([week_set[0], week_amount])
            week_amount = week_amount + week_set[1]
        }
        
        console.log('week_num_array', week_num_set)
        console.log('first_date', first_date)
        console.log('monthArray', monthArray)

        return (
            <React.Fragment>
                <SelectNav userStatus={ReactSession.get("admin")} />
                <div className="page">
                    <div className="grid-container-years">
                        {
                            createDisplayOption()
                        }
                        {
                            week_num_set.map((week_num_pair, index) => {
                                return (
                                    createMonthYear(week_num_pair, index)
                                )
                            })
                        }
                    </div>
                    <NoCollisionYear socket={socket} heightLimit={heightLimit} newInstructorArray={instructorArray} 
                                weekInformation={weekInformation} totalWeeks={totalWeeks} firstDate={first_date} />
                </div>
            </React.Fragment>
        )
    }

}

function getWeeks(startDate, month, weekInformation) {
    const weeks = [];
    const weekTimes = { month: startDate.getMonth(), times: [] };

    // Retrieve first days of every week in all of the months
    while (startDate.getMonth() === month) {
        // Save the date to an array to position courses in the timeline
        const index = weekInformation.weekNum + weeks.length
        const date = new Date(startDate.getTime());
        weekTimes.times.push({ index: index, date: date });
        weekInformation.indexMap[index] = date;

        // Get the first day of every week
        weeks.push(startDate.getDate());

        // Increment the date by a week
        startDate.setDate(startDate.getDate() + 7);
    }

    weekInformation.weekRangesArray.push(weekTimes);
    weekInformation.weekNum += weeks.length;
    return weeks;
}


function getNumberOfWeeks(weeks, index) {
    let sum = 0;

    for (let i = index - 1; i >= 0; i--) {
        sum += weeks[i].weeks.length;
    }

    return sum;
}


// function getMonthWeekAmount(currentDate) {
//     const new_date = new Date(currentDate)
//     new_date.setMonth(new_date.getMonth() + 1)
//     new_date.setDate(0)
//     const last_day_of_month = new_date.getDate()
//     let week_day_index = new_date.getDay()
//     if (week_day_index === 0) {
//       week_day_index = 7
//     }
//     const week_amount = Math.floor((last_day_of_month - week_day_index) / 7) + 1
//     return week_amount
//   }

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
    return week_amount
}

function getWeekNums(date) {
    console.log('currentDate', date)
    let week_nums = []
    let d2 = new Date(date)
    let week_count = getMonthWeekAmount(date)
    for (let i = 0; i < week_count; i++) {
        week_nums.push(d2.getDate())
        d2.setDate(d2.getDate() + 7)
    }
    return [week_nums, week_count]
}