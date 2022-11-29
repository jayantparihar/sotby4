import React from "react";
import _ from "lodash";
import TimelineGrid from "./TimelineGrid";
import { Link } from 'react-router-dom';
import { ReactSession } from 'react-client-session';
import RGL, { WidthProvider } from "react-grid-layout";
import { FormControlUnstyledContext } from "@mui/base";

export default class LocalStorageLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    rowHeight: 100,
    margin: [2, 2],
    allowOverlap: true,
    preventCollision: false,
    resizeHandles: ['e'],
    compactType: null,
    autoSize: true,
  };

  constructor({ props, socket, heightLimit, newInstructorArray, weekInformation,
    totalWeeks, firstWeek, currentMonthWeeks, currentMonth, year, firstDate, currentDate}) {
    super(props);

    let timeLineInformation = weekInformation.weekRangesArray[currentMonth];

    this.state = {
      // Loop through the instructor array to get all the courses associated with them
      items: newInstructorArray.reduce(function (acc, element, index) {
        if ((element.timeblocks.length === 0 && element.vacations.length === 0) || weekInformation.length === 0) {
          return acc;
        }

        // Create a course element for every timeblock and concatenate them into one array
        let arr = acc.concat(
          element.timeblocks.map((info) => {
            const start = Math.floor((getDayRange(firstDate, info.start)) / 7);
            const end = Math.floor((getDayRange(firstDate, info.end) + 1) / 7);
            const width = getCourseWidth(info.start, currentDate);
            

            // For finding the width of course in a week view
            const weekMonday = getWeekMonday(info.start)
            const week_start = getDayRange(weekMonday, info.start)
            const week_end = getDayRange(weekMonday, info.end) + 1
            const width_in_week = getCourseWidthWeek(week_start, week_end, weekMonday, firstDate)
            return (
              {
                start: start,
                end: end,
                start_date: info.start,
                text: info.name,
                caId: info.caId,
                userId: info.userId,
                courseNum: info.courseNum,
                weekWidth: width_in_week,
                data: {
                  i: info.caId,
                  x: getWeekIndex(info.start),
                  y: index * 2,
                  w: 1,
                  h: 1,
                }
              }
            )
          })
        );

        return arr.concat(
          element.vacations.map((info) => {
            const start = Math.floor((getDayRange(firstDate, info.vacationStart)) / 7);
            const end = Math.floor((getDayRange(firstDate, info.vacationEnd) + 1) / 7);
            console.log('start and end', start, end)
            console.log(info)
            const width = getVacationWidth(info.vacationStart, start, end, firstDate);;
            console.log('width', width)
            return (
              {
                start: start,
                end: end,
                start_date: info.vacationStart,
                text: element.name + "'s Vacation",
                uid: info.userId,
                vid: info.vacationId,
                data: {
                  i: info.userId + info.vacationId,
                  x: getWeekIndex(info.vacationStart),
                  y: (index * 2) + 1,
                  w: width,
                  h: 1,
                }
              }
            )
          })
        );
      }, []),
      heightLimit: heightLimit.get,
      weekInformation: weekInformation,
      instructorArray: newInstructorArray,
      monthWeeks: currentMonthWeeks,
      currentMonth: currentMonth,
      currentDate: currentDate
    };
    this.firstDate = firstDate
    this.socket = socket;
    this.heightLimit = heightLimit;
    this.totalWeeks = totalWeeks;
    this.mWeeks = currentMonthWeeks;
    this.monthItems = this.state.items.filter((info) => {
      const start = info.start_date;
      // const end = info.end;
      const width = getCourseWidth(start, this.state.currentDate);

      if (width === 0) {
        return false;
      }

      return true;
    });
    this.itemLayout = [];

    // this.socket.on("itemChanged", (item) => {
    //   console.log("Item Received: " + JSON.stringify(item));

    //   this.replaceItem(item);
    // });

    // this.socket.on("courseAdded", (item) => {
    //   console.log("Item Received: " + JSON.stringify(item));

    //   var date = new Date(item.start);

    //   var courseYear = date.getFullYear();

    //   var adjustment = (courseYear - this.props.year) * 12;

    //   date.setMonth(date.getMonth() - adjustment);

    //   item.start = date.getTime();

    //   this.onAddCourse(item, parseInt(item.x), parseInt(item.y), false);
    // });

    // this.socket.on("courseDeleted", (i) => {
    //   console.log("Item Received: " + JSON.stringify(i));

    //   this.onRemoveItem(i, false);
    // });

    // this.socket.on("vacationApproved", (vacation) => {
    //   console.log("Item Received: " + JSON.stringify(vacation));

    //   this.onAddVacation(vacation);
    // });

    // this.socket.on("vacationDeleted", (vacation) => {
    //   console.log("Item Received: " + JSON.stringify(vacation));

    //   this.onRemoveVacation(vacation.vacation_id, false);
    // });
  }

  replaceItem = (item) => {
    for (let i = 0; i < this.state.layout.length; i++) {
      if (this.state.layout[i].i === item.i) {
        const newLayout = this.state.layout.slice();
        newLayout[i] = item;

        this.setState({
          layout: newLayout
        });

        break;
      }
    }
  }

  onLayoutChange = (layout) => {
    this.setState({
      layout: layout
    });
  }

  onItemChange = (layout, oldItem, newItem) => {
    // Update the dates on the postgresql database
    const startDate = findWeekDate(this.state.weekInformation, newItem.x);
    const endDate = findWeekDate(this.state.weekInformation, newItem.w + newItem.x - 1);

    // HTTP request instead of sockets
    const index = _.findIndex(this.monthItems, (element) => { return element.data.i.toString() === newItem.i });
    const foundItem = this.monthItems[index];

    // Restrict movement of the course to one row only
    const yAxisLockedItem = newItem;
    yAxisLockedItem.y = oldItem.y;
    this.replaceItem(yAxisLockedItem);

    const instructor = this.state.instructorArray[Math.floor(newItem.y / 2)];
    this.socket.emit('itemChanged', yAxisLockedItem, { username: instructor.key, courseNum: foundItem.courseNum, caId: foundItem.caId, start: startDate.getTime(), end: endDate.getTime() });
  }

  onAddVacation = (info) => {
    const start = findWeekIndex(this.state.weekInformation, new Date(info.start_date));
    const end = findWeekIndex(this.state.weekInformation, new Date(info.end_date)) + 1;
    const index = _.findIndex(this.state.instructorArray, (element) => { return element.key === info.username });

    const newVacation = {
      text: info.username + "'s Vacation",
      uid: info.username,
      vid: info.vacation_id,
      data: {
        i: info.username + info.vacation_id,
        x: start,
        y: (index * 2) + 1,
        w: end - start,
        h: 1,
      }
    }

    this.setState({
      items: this.state.items.concat(
        newVacation
      )
    });
  }

  onAddCourse = (course, x = 0, y = 0, emit = true) => {
    const w = parseInt(course.weeklength);

    const startDate = findWeekDate(this.state.weekInformation, x + this.props.firstWeek);
    const endDate = findWeekDate(this.state.weekInformation, w + x + this.props.firstWeek);
    const instructor = this.state.instructorArray[Math.floor(y / 2)];

    const start = findWeekIndex(this.state.weekInformation, startDate);
    const end = findWeekIndex(this.state.weekInformation, endDate);

    // User/ instructor was deleted, can't create a course
    if (instructor === undefined) {
      return;
    }

    if (emit) {
      this.socket.emit('courseAdded', { ...course, x: x, y: y, instructorKey: instructor.key, courseNum: course.number, start: startDate.getTime(), end: endDate.getTime() });
    } else {
      this.setState({
        // Add a new item
        items: this.state.items.concat({
          start: start,
          end: end,
          text: course.title,
          userId: instructor.key,
          courseNum: course.number,
          caId: course.caId,
          data: {
            i: course.caId,
            x: x,
            y: y,
            w: w,
            h: 1,
          }
        }),
      });
    }
  }

  onRemoveItem(i, emit = true) {
    // Find the index of the course element in the state
    const index = _.findIndex(this.state.items, (element) => { return element.data.i === i });
    const foundItem = this.state.items[index];

    // Emit a message to all other applications that a course has been edeleted
    if (emit) {
      this.socket.emit("courseDeleted", foundItem, i);
    }

    // Remove the element from the state
    this.setState({ items: _.reject(this.state.items, (element) => { return element.data.i === i }) });
  }

  onRemoveVacation(vid, emit = true) {
    if (emit) {
      this.socket.emit("vacationDeleted", { vacation_id: vid });
    }

    // Remove the element from the state
    this.setState({ items: _.reject(this.state.items, (element) => { return element.vid === vid }) });
  }

  onRemoveUser = (key, y) => {
    const initialLength = this.state.instructorArray.length;
    this.setState({ instructorArray: _.reject(this.state.instructorArray, (element) => { return element.key === key }) },
      () => {
        // No user/ instructor found to delete
        if (this.state.instructorArray.length !== initialLength) {
          // Remove elements on the same row
          console.log("Removed items at: " + y);
          this.setState({ items: _.reject(this.state.items, (element) => { return element.data.y === y || element.data.y === y + 1 }) }
            , () => {
              
              // Move course elements up if they are below the user that was deleted
              this.setState({
                items: _.reduce(this.state.items, (acc, element) => {
                  if (element.data.y > y) {
                    const newElement = element;
                    newElement.data.y -= 2;
                    return [...acc, newElement];
                  } else {
                    return [...acc, element];
                  }
                }, [])
              },
                () => {
                  this.setState({
                    layout: _.reduce(this.state.items, (acc, element) => {
                      if (element.vid !== undefined) {
                        const itemData = { ...element.data, isDraggable: false, isResizable: false };
                        return [...acc, itemData];
                      } else {
                        const itemData = element.data;
                        return [...acc, itemData];
                      }
                    }, [])
                  });
                });
            });
          // Reset layout so that the items are shifted up visually
        }
      });
  }

  onAddUser = (user) => {
    this.setState({ instructorArray: [...this.state.instructorArray, { key: user.username, name: user.firstname + " " + user.lastname, timeblocks: [], vacations: [] }] });
  }


  getMonthWeekAmount(currentDate) {
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


  createElement(el, isVacation = false, layout) { 
    const removeStyle = {
      position: "absolute",
      right: "2px",
      top: 0,
      cursor: "pointer",
      padding: "5px",
      color: "black"
    };
    const dsStyle = {
      position: "absolute",
      left: "2px",
      bottom: 0,
      cursor: "pointer",
      padding: "5px",
      color: "black"
    };

    return (
      <div key={el.data.i} data-grid={isVacation ? { ...el.data, isDraggable: false, isResizable: false } : el.data}
        name={el.text + " el"}>
        <span className="text">{el.text}</span>
        {!isVacation && ReactSession.get("admin") === 1 ?
          <Link
            to={{
              pathname: "/detailed-schedule",
              search: "?courseNum=" + el.courseNum,
            }}
          >
            <span
              className="remove"
              style={dsStyle}
            >
              Detailed
            </span>
          </Link>
          :
          undefined
        }
      </div>
    );
  }

  createItemGrid(props, total_weeks) {

    const ReactGridLayout = WidthProvider(RGL)
    this.updateItems();
    return (
      <ReactGridLayout
        {...props}
        cols={total_weeks}
        maxRows={this.state.heightLimit()}
        layout={this.state.layout}
        isDraggable={false}
        isResizable={false}
        autoSize={true}
      >
        {this.monthItems.map(el => this.createElement(el, el.vid !== undefined ? true : false, this.props.currentMonthWeeks))}
      </ReactGridLayout>
    )
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.weekInformation.weekRangesArray[this.props.currentMonth].month !== prevProps.weekInformation.weekRangesArray[this.props.currentMonth].month) {
      this.onLayoutChange(this.itemLayout);
    }
  }


  resize = () => this.forceUpdate();

  componentDidMount() {
    window.addEventListener('resize', this.resize);
  }

  updateItems() {
    var items = [];
    
    let course_lengths = {};

    var random = this.state.items.filter((item) => {
      const start = item.start;
      const end = item.end;
      let width = getCourseWidth(item.start_date, this.props.currentDate)
      if (typeof item.vid === 'number') {
        console.log('item start_date, start, end', item.start_date, item.start, item.end)
        width = getVacationWidth(item.start_date, item.start, item.end, this.props.currentDate);
      }
      
      if (width === 0) {
        return false;
      }
      if (typeof item.courseNum === 'number') {
        console.log('item', item)
        if (item.userId in course_lengths) {
          if (start in course_lengths[item.userId]) {
            if (item.courseNum in course_lengths[item.userId][start]) {
              course_lengths[item.userId][start][item.courseNum] = course_lengths[item.userId][start][item.courseNum] + item.weekWidth
            } else {
              course_lengths[item.userId][start][item.courseNum] = item.weekWidth
            }
          } else {
            course_lengths[item.userId][start] = {}
            course_lengths[item.userId][start][item.courseNum] = item.weekWidth
          }
        } else {
          course_lengths[item.userId]= {}
          course_lengths[item.userId][start] = {}
          course_lengths[item.userId][start][item.courseNum] = item.weekWidth
        }
      }
      return true;
    })
    
    for (const user_id in course_lengths) {
      
      for (const week in course_lengths[user_id]) {
        const course_amounts = Object.values(course_lengths[user_id][week])

        for (const course_num in course_lengths[user_id][week]) {
          if (course_lengths[user_id][week][course_num] === Math.max(...course_amounts)) {
            course_lengths[user_id][week] = course_num
          
          } else {
            delete course_lengths[user_id][week][course_num]
          
          }
        }
      }
    }
    
    random = random.filter((item) => {
      if (typeof item.courseNum === 'number') {
        if (item.courseNum === Number(course_lengths[item.userId][item.start])) {
          delete course_lengths[item.userId][item.start]
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    })

    random.forEach(element => {
      // const width = getCourseWidth(element.start, element.end, this.props.weekInformation, this.props.weekInformation.weekRangesArray[this.props.currentMonth]);
      const width = getCourseWidth(element.start_date, this.props.currentDate)
      element.data.w = width;
      element.data.i = element.data.i.toString();
      element.data.maxW = this.props.currentMonthWeeeks;
      items.push(element.data);
    });
    console.log('random', random)
    this.monthItems = random;
    this.itemLayout = items;
    return items;
  }

  render() {
    const total_weeks = this.getMonthWeekAmount(this.props.currentDate)
    return (
      <React.Fragment>
        <TimelineGrid
          socket={this.socket}
          heightLimit={this.heightLimit}
          instructorArray={this.state.instructorArray}
          createCourse={this.onAddCourse}
          totalWeeks={total_weeks}
          onRemoveUser={this.onRemoveUser}
          onAddUser={this.onAddUser} 
          viewType={'months'}/>
        <div className="grid-item-container-month" style={{ width: total_weeks * 178, position: "absolute" }}>
          {this.createItemGrid(this.props, total_weeks)}
        </div>
      </React.Fragment>
    );
  }
}

function findWeekIndex(weekInformation, date) {
  // Search for a week in a particular month
  const monthIndex = date.getMonth();

  // Get the first day of every week in that month
  const weekRanges = weekInformation.weekRangesArray[monthIndex].times;

  for (let i = 0; i < weekRanges.length; i++) {
    if (date <= weekRanges[i].date) {
      return weekRanges[i].index - 1;
    }

  }

  // Return the index of the last week of the month
  return weekRanges[weekRanges.length - 1].index;
}

function findWeekDate(weekInformation, index) {

  return weekInformation.indexMap[index];

}

// made this new function. im sure there is a better way. 
function getCourseWidthWeek(start, end, currentDate, firstDate) {
  // monday and friday = how many days they are from jan 3 2022. if the dates for monday and friday are in 2021 they are negative. 

  let [monday, friday] = getMonFri(currentDate, firstDate)

  // start and end values are in the same format as monday and friday.
  // course is an incremented array of 'day values'
  const course = _.range(start, end)
  // week is an incremented array of 'day values'
  const week = _.range(monday, friday + 1)
  // intersect is an array of all the values the week and course share.
  const intersection = course.filter(value => week.includes(value));
  
  // this counts the array. now you have a width
  return intersection.length

}


// this function gets how many days apart the current view's monday and friday are from jan 3 2022
function getMonFri(currentDate, firstDate) {
  const new_date = new Date(currentDate)
  const monday = new_date.getDate()
  const friday = monday + 4

  if ((typeof firstDate !== 'undefined') && (firstDate !== 'nothing :D')){
    let new_monday = getDayRange(firstDate, currentDate)
    let new_friday = getDayRange(firstDate, currentDate) + 4

    return [new_monday, new_friday]
  } else {
    return [monday, friday]
  }
}

// gets the amount of days between two dates
function getDayRange(d1, d2) {
  
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24))
}

// function findWeekDateFromIndex(x, currentDate, firstDate) {
//   const x_date = new Date(currentDate)
//   x_date.setDate(x_date.getDate() + parseInt(x))
  
//   return x_date
// }

function getWeekMonday(currentDate) {
  const current_date = new Date(currentDate)
  const current_date_weekday = currentDate.getDay()
  if (current_date_weekday >= 1) {
    current_date.setDate(currentDate.getDate() - (current_date_weekday - 1))
  } else {
    current_date.setDate(currentDate.getDate() - 6)
  }
  return current_date
}

function getWeekDayIndex(date) {
  if (date.getDay() == 0) {
    return 6
  } else {
    return date.getDay() - 1
  }
}

function getWeekIndex(date) {
  const week_day_index = getWeekDayIndex(date)
  const day_of_month = date.getDate()
  if (day_of_month > week_day_index) {
    const week_index = Math.floor((day_of_month - week_day_index - 1) / 7)
    return week_index
  } else {
    const new_date = new Date(date)
    new_date.setDate(0)
    const last_day_of_prev_month = new_date.getDate()
    const week_index = Math.floor((day_of_month + last_day_of_prev_month - week_day_index - 1) / 7)
    return week_index
  }
}

function getCourseWidth(start_date, current_date) {
  // console.log('current_month', current_month)
  const week_day_index = getWeekDayIndex(start_date)
  const day_of_month = start_date.getDate()
  const current_date_month = current_date.getMonth()
  const current_date_year = current_date.getFullYear()
  if (day_of_month > week_day_index && 
      start_date.getMonth() === current_date_month &&
      start_date.getFullYear() == current_date_year) {

    return 1
  } else if (day_of_month < week_day_index && start_date.getMonth() + 1 === current_date_month &&
              start_date.getFullYear() == current_date_year) {
    return 1
  } else {
    return 0
  }
}

function getVacationWidth(start_date, start_index, end_index, current_date) {
  const week_day_index = getWeekDayIndex(start_date)
  const day_of_month = start_date.getDate()
  const current_date_month = current_date.getMonth()
  const current_date_year = current_date.getFullYear()
  const width = end_index - start_index + 1
  console.log('start_date and current_date year', start_date.getFullYear(), current_date.getFullYear())
  if (day_of_month > week_day_index && 
    start_date.getMonth() === current_date_month &&
    start_date.getFullYear() == current_date_year) {
    
    return width

  } else if (day_of_month < week_day_index && start_date.getMonth() + 1 === current_date_month &&
    start_date.getFullYear() == current_date_year) {
    return width

  } else {
    return 0
  }
}