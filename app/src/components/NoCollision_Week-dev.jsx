import React from "react";
import _ from "lodash";
import TimelineGridWeek from "./TimelineGrid_Week";
import { Link } from 'react-router-dom';
import { ReactSession } from 'react-client-session';
import RGL, { WidthProvider } from "react-grid-layout";

export default class LocalStorageLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    rowHeight: 75.5,
    margin: [2, 2],
    allowOverlap: true,
    preventCollision: false,
    resizeHandles: ['e'],
    compactType: null,
    autoSize: false,
  };
  //###############################################################################
  // ---------DISCLAMER: THIS WILL BE PAINFUL TO LOOK AT. IM SORRY :(.  -love matt
  //############################################################################### 
  
  constructor({ props, socket, heightLimit, newInstructorArray, weekInformation,  
    totalWeeks,  currentWeekDays, currentWeek, currentDate, firstDate }) {
    super(props);
    
    // let timeLineInformation = weekInformation.weekRangesArray[currentMonth];
    console.log('newInstructorArray', newInstructorArray)
    this.state = {
      // Loops through the instructor array to get all the courses associated with them

        items: newInstructorArray.reduce(function (acc, element, index) {
          if ((element.timeblocks.length === 0) || weekInformation.length === 0) {
            
            return acc;
          }
          // Create a course element for every timeblock and concatenate them into one array
          // KEEP IN MIND. it concatenates through every course_assingment in the database. ikr?!?!?!? i didnt do this i swear
          // btw most of this file is copy pasted code. 
          
          console.log('element',element)
          let arr = element.timeblocks.map((info) => {
              console.log('concat elemetn',element.key)
              // this stuff determines the amount of days the course_assignments are from the firstDate -> jan 3, 2022
              const start = getDayRange(currentDate, info.start)
              const end = getDayRange(currentDate, info.end) + 1
              // determines how many days this event will stretch on the week view.
              // it will give any course_assignment that isnt shown in the first week a width of 0. (makes it invisible :0)
              const width = getCourseWidth(start, end, currentDate);
              const m_or_a = info.mOrA;
              // the data values are basically coordinates and dimensions for an RGL.
              // i recommend looking the documentation to know what this is doing (lookup: RGL and RGL).
              return (
                {
                  start: start,
                  end: end,
                  text: info.name,
                  instructorKey: element.key,
                  caId: info.caId,
                  userId: info.userId,
                  courseNum: info.courseNum,
                  data: {
                    i: info.caId,
                    x: start % 7,
                    y: m_or_a,
                    w: width % 7,
                    h: 1,
                  }
                  
                }
              )
            });
          if (acc.length == 0 ) {
            acc = {}
          }
          acc[element.key] = arr
          return acc
        }, []),
      heightLimit: heightLimit.get,
      weekInformation: weekInformation,
      instructorArray: newInstructorArray,
      currentWeekDays: currentWeekDays,
      // i added these. again sorry. i made the same value twice and didnt realize it.
      //makes a static value that can be read all over this file.
      firstWeek: currentWeek,
      currentWeek: currentWeek

    };
    console.log('this.state.items', this.state.items)
    //makes a static value that can be read all over this file. see next change at line 243
    this.firstDate = currentDate
    
    this.socket = socket;
    this.heightLimit = heightLimit;
    this.totalWeeks = totalWeeks;
    this.mWeeks = currentWeekDays;
    // this.monthItems = this.getCurrentItems(this.state.items, currentDate)
    
    // this.monthItems = this.state.items.map((username) => {
    //   return (username.filter((info) => {
    //     const start = info.start;
    //     const end = info.end;
  
    //     const width = getCourseWidth(start, end, currentDate);
        
    //     if (width === 0) {
    //       return false;
    //     }
        
    //     return true;
    //   }))
    // });
    console.log(this.monthItems)
    this.itemLayout = [];

    this.socket.on("itemChanged", (item) => {
      console.log("Item Received: " + JSON.stringify(item));

      this.replaceItem(item);
    });

    this.socket.on("courseAdded", (item) => {
      console.log("Item Received: " + JSON.stringify(item));
      
      var date = new Date(item.start);

      var courseYear = date.getFullYear();

      var adjustment = (courseYear - this.props.year) * 12;

      date.setMonth(date.getMonth() - adjustment);

      item.start = date.getTime();

      // var m_or_a = item.m_or_a
      console.log('item',item)

      this.onAddCourse(item, parseInt(item.x), parseInt(item.y), item.instructorKey, false);
    });

    this.socket.on("courseDeleted", (i) => {
      console.log("Item Received: " + JSON.stringify(i));

      this.onRemoveItem(i, false);
    });
  }
  // getCurrentItems = (state_items, currentDate) => {
  //   let newMonthItems = {}
  //   for (const [username, items] of Object.entries(state_items)) {
  //     newMonthItems[username] = (items.filter((info) => {
  //       const start = info.start;
  //       const end = info.end;
  
  //       const width = getCourseWidth(start, end, currentDate);
        
  //       if (width === 0) {
  //         return false;
  //       }
        
  //       return true;
  //     }))
  //   }
  //   console.log('newmonthitem', newMonthItems)
  //   return newMonthItems
  // }

  getCurrentInstructorItems = (instructor, currentDate, state_items) => {
    if (instructor in state_items) {
      const newItems = (state_items[instructor].filter((info) => {
          const start = info.start;
          const end = info.end;
    
          const width = getCourseWidth(start, end, currentDate);
          
          if (width === 0) {
            return false;
          }
          
          return true;
        }))
      console.log('newItems',newItems)
      return newItems
    } else {
      return []
    }
  }

  replaceItem = (item, username) => {

    for (let i = 0; i < this.state.items[username].length; i++) {
      if (this.state.items[username].i === item.i) {
        const newLayout = this.state.items[username].slice();
        newLayout[i] = item;
        console.log('newLayout', newLayout)
        this.setState({
          items: newLayout
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

  onItemChange = (layout, oldItem, newItem, username) => {
    // Update the dates on the postgresql data
    // const startDate = findWeekDate(this.state.weekInformation, newItem.x);
    // const endDate = findWeekDate(this.state.weekInformation, newItem.w + newItem.x - 1);

    const startDate = findWeekDateFromIndex(newItem.x, this.props.currentDate,this.props.firstDate);
    const endDate = findWeekDateFromIndex(newItem.w + newItem.x - 1, this.props.currentDate, this.props.firstDate);
    const instructorItems = this.getCurrentInstructorItems(username, this.props.currentDate, this.state.items)
    // HTTP request instead of sockets
    const index = _.findIndex(instructorItems, (element) => { return element.data.i.toString() === newItem.i });
    const foundItem = instructorItems[index];
    console.log('foundItem', foundItem)

    // Restrict movement of the course to two rows only
    const yAxisLockedItem = newItem;
    // yAxisLockedItem.x = oldItem.x;
    console.log('newItem', (newItem.y + 1)% 3 )
    if ((newItem.y < oldItem.y + 2) && (newItem.y > oldItem.y - 2)) {
      if ((newItem.y + 1) % 3 !== 0) {
        this.replaceItem(yAxisLockedItem);
      } else {
        yAxisLockedItem.y = oldItem.y;
        this.replaceItem(yAxisLockedItem);
      }
    } else {
      yAxisLockedItem.y = oldItem.y;
      this.replaceItem(yAxisLockedItem);
    }
    const instructor = this.state.instructorArray[Math.floor(newItem.y / 3)];
    if (yAxisLockedItem.y !== oldItem.y) {
      console.log('change my time of day pls')
      this.socket.emit('itemChanged', yAxisLockedItem, { username: instructor.key, courseNum: foundItem.courseNum, caId: foundItem.caId, start: startDate.getTime(), end: endDate.getTime(), m_or_a: newItem.y });
    } else {
      console.log('dont change my time of day!!!')
      this.socket.emit('itemChanged', yAxisLockedItem, { username: instructor.key, courseNum: foundItem.courseNum, caId: foundItem.caId, start: startDate.getTime(), end: endDate.getTime(), m_or_a: oldItem.y });
    }
  }

  onAddCourse = (course, x = 0, y = 0, username, emit = true) => {

    const w = parseInt(course.daylength);
    const end_x = w + x - 1


    const startDate = findWeekDateFromIndex(x, this.props.currentDate,this.props.firstDate);
    const endDate = findWeekDateFromIndex(end_x, this.props.currentDate, this.props.firstDate);

    const instructor = this.state.instructorArray[Math.floor(y / 3)];

    const start = getDayRange(this.props.firstDate, startDate);
    const end = getDayRange(this.props.firstDate, endDate) + 1;
    let m_or_a = 0
    if (y % 4 ===2) {
      m_or_a = 1
    }
    // User/ instructor was deleted, can't create a course
    if (instructor === undefined) {
      return;
    }

    if (emit) {

      this.socket.emit('courseAdded', { ...course, x: x, y: y-1, instructorKey: username, courseNum: course.number, start: startDate.getTime(), end: endDate.getTime(), m_or_a: m_or_a });
    } else {

      
      if (username in this.state.items) {
        this.setState({
          // Add a new item
          items: this.state.items[username].concat({
            start: start,
            end: end,
            text: course.title,
            userId: username,
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
      } else {
        this.setState({
          // Add a new item
          items: this.state.items[username] = {
            start: start,
            end: end,
            text: course.title,
            userId: username,
            courseNum: course.number,
            caId: course.caId,
            data: {
              i: course.caId,
              x: x,
              y: y,
              w: w,
              h: 1,
            }
          },
        });
      }
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
                    newElement.data.y -= 3;
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
        }
      });
  }

  onAddUser = (user) => {
    this.setState({ instructorArray: [...this.state.instructorArray, { key: user.username, name: user.firstname + "\n" + user.lastname, timeblocks: [], vacations: [] }] });
  }

  createElement(el, isVacation = false, layout, instructorKey) {
    

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
      <div key={el.data.i} data-grid={el.data}
        name={el.text + " el"}>
        <span className="text">{el.text}</span>
        {
          ReactSession.get("admin") !== undefined ?
            <span
              className="remove"
              style={removeStyle}
              onClick={this.onRemoveItem.bind(this, el.data.i)}
            >
              x
            </span>
            :
            undefined
        }
        {ReactSession.get("admin") !== undefined ?
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


  createItemGrid(props, reducedMonthItems, instructorKey, noItems = true) {

    const callBackItemChange = (layout, oldItem, newItem) => {
      this.onItemChange(layout, oldItem, newItem, instructorKey)
    }

    const ReactGridLayout = WidthProvider(RGL);
    console.log('empty username schedule check', reducedMonthItems, instructorKey)
    this.updateItems(instructorKey, noItems = true);

    
    console.log('reducedMonthItems', reducedMonthItems, instructorKey)
    return (


      <ReactGridLayout
        {...props}
        cols={5}
        maxRows={3}
        layout={this.state.layout}
        onResizeStop={callBackItemChange}
        onDragStop={callBackItemChange}
        isDraggable={ReactSession.get("admin") !== undefined ? true : false}
        isResizable={ReactSession.get("admin") !== undefined ? true : false}
        autoSize={true}
                                                                // just added 'false'   \/   and this  \/ 'this.props.currentWeekDays' next change line 434
      >
        {reducedMonthItems.map(el => this.createElement(el, el.vid !== undefined ? true : false, this.props.currentWeekDays, this.props.newInstructorArray))} 
      </ReactGridLayout>
    )
  }


  componentDidUpdate(prevProps, prevState) {
    if (this.props.current_date !== prevProps.current_date) {
      this.onLayoutChange(this.itemLayout);

    }
  }


  resize = () => this.forceUpdate();

  componentDidMount() {
    window.addEventListener('resize', this.resize);
  }

  updateItems(instructorKey) {

    var items = [];
    if (instructorKey in this.state.items) {
      var random = this.state.items[instructorKey].filter((item) => {
        const start = item.start;
        const end = item.end;

        const width = getCourseWidth(start, end, this.props.currentDate, this.firstDate); //i change 'width' to be the result of this function i made. same thing on line 468

        if (width === 0) {
          return false;
        }

        return true;
      })


      random.forEach(element => {
        const width = getCourseWidth(element.start, element.end, this.props.currentDate, this.firstDate);//i change 'width' to be the result of this function i made. next change on line 499
        element.data.w = width;
        element.data.i = element.data.i.toString();
        element.data.maxW = this.props.currentWeekDays;
        items.push(element.data);
      });
      this.state.items[instructorKey] = random;

      return items;
    } else {
      return []
    }
  }

  render() {
    console.log('instructorArray', this.state.instructorArray)
    return (
      this.state.instructorArray.map((instructor, i) => {
            // console.log(this.getCurrentInstructorItems(username, this.props.currentDate)[instructor.key])
            let reducedMonthItems = this.getCurrentInstructorItems(instructor.key, this.props.currentDate, this.state.items)
            console.log(this.state.items)
            
            console.log('reducedMOnthitems', reducedMonthItems)
            return (
              <React.Fragment>
                <TimelineGridWeek
                  socket={this.socket}
                  heightLimit={this.heightLimit}
                  instructorArray={[instructor]}
                  createCourse={this.onAddCourse}
                  onRemoveUser={this.onRemoveUser}
                  onAddUser={this.onAddUser} 
                  currentDate={this.props.currentDate}/>
                <div className="grid-item-container-week" style={{top: 183 + 265 * i, width: this.props.currentWeekDays * 178, position: "absolute" }}>
                  {this.createItemGrid(this.props, reducedMonthItems, instructor.key)}
                </div>
              </React.Fragment>
            )
        })

    );
  }
}
// made this new function. im sure there is a better way. 
function getCourseWidth(start, end, currentDate, firstDate='nothing :D') {
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

function findWeekDateFromIndex(x, currentDate, firstDate) {
  const x_date = new Date(currentDate)
  x_date.setDate(x_date.getDate() + parseInt(x))
  
  return x_date
}

function findWeekDate(weekInformation, index, firstDate) {
  return weekInformation.indexMap[index];
}
