import React from "react";
import "./style.css";
import './gridstyles.css';
import "./timeline.css";
import Timeline from './components/Timeline';
const END_POINT_ROOT = "/";
//const END_POINT_ROOT = "http://127.0.0.1:8000/";
const INSTRUCTORS_RESOURCE = "users";

export default class App extends React.Component {
  state = {
    instructors: [],
    heightLimit: 8,
    loaded: false,
    error: ""
  };

  constructor({ socket }) {
    super();
    this.socket = socket;
  }

  getHeightLimit() {
    return this.state.heightLimit;
  }

  setHeightLimit(heightLimit) {
    this.setState({ heightLimit: heightLimit });
  }

  parseData = (data) => {
    if (!data) {
      return null;
    }
    const parsedData = JSON.parse(data);

    let instructorArray = {};
    for (let i = 0; i < parsedData.length; i++) {
      const key = parsedData[i].username;

      let instructor;
      // Check if instructor is already in the object
      if (instructorArray[key]) {
        instructor = instructorArray[key];
      } else {
        instructor = {};
        instructor.timeblocks = [];
        instructor.vacations = [];
        instructor.resources = [];
        instructor.name = parsedData[i].first_name + "\n" + parsedData[i].last_name;
        instructor.key = key;
        instructorArray[key] = instructor;
      }
      // Check if there are any valid courses associated with the instructor
      if (parsedData[i].start_date !== null && parsedData[i].end_date !== null) {
        const entry = {
          start: new Date(parsedData[i].start_date),
          end: new Date(parsedData[i].end_date),
          name: parsedData[i].title,
          courseNum: parsedData[i].course_num,
          caId: parsedData[i].ca_id,
          userId: parsedData[i].username,
          mOrA: parsedData[i].m_or_a
        }

        // this checks for duplicate rows by primary key before adding
        if (instructor.timeblocks.length !== 0) {
          let found_row = instructor.timeblocks.find(row => row.caId === parsedData[i].ca_id);
          if (found_row === undefined) {
            instructor.timeblocks.push(entry);
          }
        } else {
          instructor.timeblocks.push(entry);
        }
        
      }

      // Check if there are any valid vacations associated with the instructor
      if (parsedData[i].vacation_start !== null && parsedData[i].vacation_end !== null && parsedData[i].approved === 1) {
        const entry = {
          vacationId: parsedData[i].vacation_id,
          userId: parsedData[i].username,
          name: parsedData[i].title,
          vacationStart: new Date(parsedData[i].vacation_start),
          vacationEnd: new Date(parsedData[i].vacation_end),
        }
        
        // this checks for duplicate rows by primary key before adding
        if (instructor.vacations.length !== 0) {
          let found_row = instructor.vacations.find(row => row.vacationId === parsedData[i].vacation_id);
          if (found_row === undefined) {
            instructor.vacations.push(entry);
          }
        } else {
          instructor.vacations.push(entry);
        }
      }

      
      if (parsedData[i].resource_start !== null && parsedData[i].resource_end !== null) {
        const entry = {
          raId: parsedData[i].ra_id,
          userId: parsedData[i].username,
          modelNum: parsedData[i].model_num,
          resourceName: parsedData[i].model_name,
          resourceStart: new Date(parsedData[i].resource_start),
          resourceEnd: new Date(parsedData[i].resource_end),
          quantity: parsedData[i].quantity,
        }

        // this checks for duplicate rows by primary key before adding
        if (instructor.resources.length !== 0) {
          let found_row = instructor.resources.find(row => row.raId === parsedData[i].ra_id);
          if (found_row === undefined) {
            instructor.resources.push(entry);
          }
        } else {
          instructor.resources.push(entry);
        }
      }


    }
    instructorArray = Object.values(instructorArray);

    this.setState({ instructors: instructorArray, heightLimit: (instructorArray.length + 1) * 2})
    this.setState({ loaded: true })
  }

  retrieveInstructorDataFromDatabase = () => {
    fetch(END_POINT_ROOT + INSTRUCTORS_RESOURCE)
      .then(response => {
        return response.text();
      })
      .then(data => {
        this.parseData(data)
      });
  }

  componentDidMount() {
    this.retrieveInstructorDataFromDatabase();
  }

  removeElement(el) {
    console.log(el);
  }

  renderApp() {
    return (
      <div className="App">
        {(this.state.error !== "") ?
          <div className="error-modal" key={"errorModal"}>
            <h1>Error:</h1>
            <p>{this.state.error}</p>
            <button style={{ position: "absolute", top: 0, right: 0 }} onClick={() => { this.setState({ error: "" }) }}>
              <p>X</p>
            </button>
          </div>
          :
          undefined
        }

        <Timeline socket={this.socket} heightLimit={{ get: () => this.getHeightLimit(), set: (limit) => this.setHeightLimit(limit) }}
          instructorArray={this.state.instructors} />
      </div>
    );
  }

  render() {
    // Remove this later on and add a real feedback message, this is just for development purposes
    this.socket.on('error', (err) => {
      console.log(err);
      if (typeof (err) === String) {
        this.setState({ error: err });
      } else {
        if (err.detail === undefined) {
          this.setState({ error: "ERROR Code: " + err.code });
        } else {
          this.setState({ error: err.detail });
        }
      }
    });

    return (
      this.state.loaded ?
        this.renderApp()
        :
        <span>Loading data...</span>
    );
  }
}
