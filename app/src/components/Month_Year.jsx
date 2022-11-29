import React from "react";
import { IconButton, Stack } from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

export default function Month({ title, socket, position, weeks, next, previous, month_index, firstDate}) {
   
    const year = firstDate.getFullYear()

    return (
        <React.Fragment>
                <div className="grid-month" style={{ gridArea: position.x + " / " + position.y + " / span 1 / span " + weeks.length }}>
                    <h2 className="grid-header">{title}</h2>
                </div>
                {
                    weeks.map((item, i) => {
                        return <div key={title + item} className="grid-day" style={{ gridArea: (position.x + 1) + " / " + (position.y + i) + " / span 1 / span 1" }}>
                            {item}
                        </div>
                    })
                }
                <div style={{ gridArea: 2 + " / " + 1 + " / span 1 / span 2 " }}>
                    <Stack className="year-scroll"  direction="row" justifyContent="space-evenly" spacing={0}>
                        <IconButton aria-label="back" onClick={previous}>
                            <ArrowBackIosIcon className='scroll-button-year' />
                        </IconButton>
                        <h2 className="grid-header">{year}</h2>
                        <IconButton aria-label="next" onClick={next}>
                            <ArrowForwardIosIcon className='scroll-button-year' />
                        </IconButton>
                    </Stack>
                </div>
        </React.Fragment>
    );
}