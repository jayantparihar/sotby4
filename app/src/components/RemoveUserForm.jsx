import React from "react";
import { Stack } from "@mui/system";

export default function RemoveUserForm({ removeFunction }) {

  const renderForm = () => {
    return (
      <div key={"resource div"} style={{ display: "inline", position: "sticky" }}>
        <Stack margin={'10px'} justifyContent={'space-evenly'} spacing={1}>
          <div>
            <p>REMOVE USER</p>
          </div>

          <div>
            <p>Are You Sure?</p>
          </div>

          <div>
            {
              <button className="submit-button" type="button" onClick={() => {removeFunction()}}>
                  YES
              </button>
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