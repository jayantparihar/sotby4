import React, { useState } from 'react';
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from '@mui/material/Select';
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import { styled } from "@mui/system";
import { ReactSession } from 'react-client-session';
import AdminNav from '../../../src/components/AdminNav';
import UserNav from "../../../src/components/UserNav";
import DefaultNav from "../../../src/components/DefaultNav";
import '../../../src/navbar.css';
import "react-datepicker/dist/react-datepicker.css";
import "./stylesDate.css";

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


function getBusinessDateCount(startDate, endDate) {
  let elapsed, daysAfterLastSunday;
  let ifThen = function (a, b, c) {
    return a === b ? c : a;
  };

  elapsed = endDate - startDate;
  elapsed /= 86400000;

  let daysBeforeFirstSunday = (7 - startDate.getDay()) % 7;
  daysAfterLastSunday = endDate.getDay();

  elapsed -= (daysBeforeFirstSunday + daysAfterLastSunday);
  elapsed = (elapsed / 7) * 5;
  elapsed += ifThen(daysBeforeFirstSunday - 1, -1, 0) + ifThen(daysAfterLastSunday, 6, 5);

  return Math.ceil(elapsed);
}

const UserInputContainer = styled('div')({
  display: "flex",
  flexDirection: "column",
  alignItems: "left",
})

const Form = styled('form')({

})

const VacationInput = ({ onAdd }) => {
  const [NC, setNC] = useState('');
  const [startingDate, setStartingDate] = useState('');
  const [endingDate, setEndingDate] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [VABT, setVABT] = useState('');
  const [notes, setNotes] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const styles = makeStyles({
    button: {
      display: "inline-block",
      width: "141%",
      background: "steelblue",
      color: "Black",
      "&:hover": {
        background: "skyblue",
        color:"Black"
      },
      border: "none",
      padding: 10,
      margin: 5,
      borderRadius: 5,
      cursor: "pointer",
      textDecoration: "none",
      fontSize: 15,
      fontFamily: "inherit",
      marginLeft: "12px"
    }

    
  });

  function AddButton() {
    const classes = styles();
    return <Button className={classes.button} type="submit">Add</Button>
  }

  const onSubmit = (e) => {
    e.preventDefault();

    onAdd({ NC, startingDate, endingDate, day, hour, VABT, notes });
    setNC('');
    setStartingDate('');
    setEndingDate('');
    setDay('');
    setHour('');
    setVABT('');
    setNotes('');
  }

  // const DatePickerWrapperStyles = createGlobalStyle`
  //   .date_picker.full-width {
  //       width: 100%;
  //   }
  // `;

  return (
    
    <UserInputContainer>
      <SelectNav userStatus={ReactSession.get("admin")} />
      <Form onSubmit={onSubmit}>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <InputLabel id="demo-simple-select-helper-label">NEW/CANCEL</InputLabel>
          <Select style={{
              display: "inline-block",
              width: "355%",
              border: "none",
              padding: "10px 0px",
              margin: 5,
              borderRadius: 5,
              cursor: "pointer",
              textDecoration: "none",
              fontSize: 15,
              fontFamily: "inherit"
            }}
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            label="NEW/CANCEL"
            onChange={(e) => setNC(e.target.value)}
          >
            <MenuItem value={"N"} style={{
      display: "inline-block",
      width: "111%",
      border: "none",
      padding: 10,
      margin: 5,
      borderRadius: 5,
      cursor: "pointer",
      textDecoration: "none",
      fontSize: 15,
      fontFamily: "inherit"
    }}>New</MenuItem>
            <MenuItem value={"C"} style={{
      display: "inline-block",
      width: "100%",
      border: "none",
      padding: 10,
      margin: 5,
      borderRadius: 5,
      cursor: "pointer",
      textDecoration: "none",
      fontSize: 15,
      fontFamily: "inherit"
    }}>Cancel</MenuItem>
          </Select>
        </FormControl><br />
        <text>&nbsp;&nbsp;&nbsp;Date</text>
        <DatePicker className='ab'

          //wrapperClassName='date_picker full-width'
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => {
            console.log('update', update)
            // doing it all at once seems to be a bit buggy. maybe add some logic
            setDateRange(update);
            setStartingDate(update[0]);
            if (update[1] !== null) {
              setEndingDate(update[1]);
              setDay(`${getBusinessDateCount(update[0], update[1])}`);
            }
            // const start = new Date(update[0]);
            // const end = new Date(update[1]);

            // exclude weekends
          }}
        />
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <InputLabel id="demo-simple-select-helper-label">VA/BT</InputLabel>
          <Select style={{
              display: "inline-block",
              width: "355%",
              border: "none",
              padding: "10px 0px",
              margin: 5,
              borderRadius: 5,
              cursor: "pointer",
              textDecoration: "none",
              fontSize: 15,
              fontFamily: "inherit"
            }}
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            label="VA/BT"
            onChange={(e) => setVABT(e.target.value)}
          >
            <MenuItem value={"VA"} style={{
      display: "inline-block",
      width: "235%",
      border: "none",
      padding: 10,
      margin: 5,
      borderRadius: 5,
      cursor: "pointer",
      textDecoration: "none",
      fontSize: 15,
      fontFamily: "inherit"
    }}>Vacation</MenuItem>
            <MenuItem value={"BT"} style={{
      display: "inline-block",
      width: "249%",
      border: "none",
      padding: 10,
      margin: 5,
      borderRadius: 5,
      cursor: "pointer",
      textDecoration: "none",
      fontSize: 15,
      fontFamily: "inherit"
    }}>Banked</MenuItem>
          </Select>
        </FormControl><br />
        <text>&nbsp;&nbsp;&nbsp;Notes on vacation</text><br />
        <input style={{
          display: "inline-block",
          width: "104%",
          border: "1",
          padding: 10,
          margin: 5,
          marginLeft:"15px",
          height:"25px",
          borderRadius: 5,
          cursor: "pointer",
          textDecoration: "none",
          fontSize: 15,
          fontFamily: "inherit"
          }} 
          className="vacation-input-large" type="text" placeholder="..." value={notes} 
          onChange={(e) => setNotes(e.target.value)} /><br />
        <AddButton />
      </Form>
    </UserInputContainer>
  );
};

export default VacationInput;
