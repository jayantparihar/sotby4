import React from 'react'
import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { styled } from '@mui/system';
import Button from "@material-ui/core/Button";
import { ReactSession } from "react-client-session";

const Form = styled('form')({
})

const buttonStyles = makeStyles({

    button: {
        display: "inline-block",
        width: "100%",
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
        fontFamily: "inherit"
      }
});

function SubmitButton() {
    const classes = buttonStyles();
    return <Button className={classes.button} onMouseOver="this.style.background='green'" type="submit">Submit</Button>
}

const UserInfo = ({ onAdd }) => {

    const [first, setFirst] = useState('')
    const [last, setLast] = useState('')
    const [emp, setEmp] = useState('')
    const [ext, setExt] = useState('')

    const submit = (e) => {
        e.preventDefault()
        // makeusername function
        onAdd(ReactSession.get("username"))
        setFirst('')
        setLast('')
        setEmp('')
        setExt('')
    }

    return (
        <Form onSubmit={submit}>
            <SubmitButton />
        </Form>
    )
}

export default UserInfo