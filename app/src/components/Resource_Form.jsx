import React, { useEffect, useState } from "react";
import { Stack } from "@mui/system";

export default function Form({ callBack, username, date }) {

  const renderForm = () => {
    return (
      <div key={"resource div"} style={{ display: "inline", position: "sticky" }}>
        <Stack margin={'10px'} spacing={1}>
          <p>Request Resource?</p>
          <div>
          {
            <a href={`/resources?date=${date}&username=${username}`}>
              <button className="submit-button" type="button">
                  Book Resource
              </button>
            </a>
          }
          </div>
        </Stack>

      </div>
    );
  }

  return (
    <React.Fragment>
      {
        renderForm()
      }
    </React.Fragment>
  );
}