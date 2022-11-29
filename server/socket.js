const socket = require("socket.io");
const { createAdapter } = require("@socket.io/postgres-adapter");
const argon2 = require("argon2");
const EventEmitter = require('events');

console.log("Socket Script started");

async function lockUserDeletion(lock, bus) {
    if (lock) {
        console.log("Locked");
        await new Promise(resolve => bus.once('unlocked', resolve));
        console.log("Unlocked");
    }
}
// const WebSocketServer = require('ws').Server
// const wss = new WebSocketServer( /* some config */);
// wss.on('connection', function(ws) {
//     ws.on('message', function (message) {
//         try {
//             var obj = JSON.parse(message) // using JSON  over the conversation
//         } catch (err) {
//             var obj = {};
//             console.log('probably not valid json');
//         }
//         switch (true) {
//             case obj.name !== undefined:
//                 ws.name = obj.name; // Here's the poor man's session variable
//                 ws.send('Hello '+ws.name);
//             break;
//         }
//     });
// });

// Socket.io code
const socketStart = async (server, pool, instructorModel) => {
    const io = socket(server);
    io.adapter(createAdapter(pool));
    const bus = new EventEmitter();
    let lock = false;

    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('itemChanged', (item, itemInfo) => {
            // Update posgresql database with the changed item
            console.log('itemInfo', itemInfo)
            instructorModel.putCourse(itemInfo.username, itemInfo.caId, itemInfo.start, itemInfo.end, itemInfo.m_or_a)
                .then(response => {
                    console.log("Update Success");

                    // Broadcast to everyone except sender
                    socket.broadcast.emit('itemChanged', item);
                })
                .catch(error => {
                    console.log(error);
                    socket.emit('error', error);
                })
        });

        socket.on('courseDeleted', (course, i) => {
            // Update posgresql database with the changed item

            instructorModel.deleteCourse(course.caId)
                .then(response => {
                    console.log("Update Success");

                    // Broadcast to everyone except sender
                    socket.broadcast.emit('courseDeleted', i);
                })
                .catch(error => {
                    console.log(error);
                    socket.emit('error', error);
                })
        });

        socket.on('userAdded', async (user, rownum) => {
            // Update posgresql database
            const password = user.password;
            user.password = await argon2.hash(password, { type: argon2.argon2id });
            instructorModel.postUser(user, rownum)
                .then(response => {
                    console.log("Add Success");

                    socket.emit('userAdded', user);
                })
                .catch(error => {
                    console.log(error);
                    socket.emit('error', error);
                })
        });

        socket.on('userDeleted', (key, x) => {
            lockUserDeletion(lock, bus);
            lock = true;

            // Update posgresql database
            instructorModel.getUser(key)
                // Check if the user exists
                .then(response => {
                    console.log("User exists");
                    instructorModel.deleteUser(key)
                        .then(response => {
                            console.log("Delete Success");
                            // Broadcast to everyone except sender
                            socket.broadcast.emit('userDeleted', key, x);
                        })
                        .catch(error => {
                            console.log(error);
                            socket.emit('error', error);
                        })
                        .finally(() => {
                            lock = false;
                            bus.emit('unlocked');
                        });
                })
                .catch((err) => {
                    console.log(err);
                    lock = false;
                    bus.emit('unlocked');
                })
        });

        socket.on('courseAdded1', (course) => {
            // Update posgresql database
            instructorModel.postCourse1(course)
                .then(response => {
                    console.log("Course Post Success");
                    // Broadcast to everyone
                    socket.emit('courseAdded1', course);
                    socket.broadcast.emit('courseAdded1', course);
                })
                .catch(error => {
                    console.log(error);
                    // Error code
                    let msg;
                    switch (error.code) {
                        case ('23505'):
                            msg = "Course number already exists for another course! Please choose another.";
                            break;
                        case ('23503'):
                            msg = "The user you are creating a course for doesn't exist.";
                            break;
                        default:
                            msg = "Error in inserting course. Please check your course input.";
                            break;
                    }

                    console.log(msg);

                    socket.emit('error', msg);
                })
        });

        socket.on('courseAdded', (course) => {
            // Update posgresql database
            instructorModel.postCourseAssignment(course)
                .then(response => {
                    console.log('yo a course is added bruh o.o')
                    // Broadcast to everyone
                    socket.emit('courseAdded', { ...course, caId: response });
                    socket.broadcast.emit('courseAdded', { ...course, caId: response });
                })
                .catch(error => {
                    console.log(error);
                    // Error code
                    let msg;
                    switch (error.code) {
                        case ('23505'):
                            msg = "Course number already exists for another course! Please choose another.";
                            break;
                        case ('23503'):
                            msg = "The user you are creating a course for doesn't exist.";
                            break;
                        default:
                            msg = "Error in inserting course. Please check your course input.";
                            break;
                    }

                    console.log(msg);

                    socket.emit('error', msg);
                })
        });

        socket.on('resourceAdded', async (resource) => {
            // Update posgresql database
            instructorModel.postResource(resource)
                .then(response => {
                    socket.emit('resourceAdded', resource);
                })
                .catch(error => {
                    console.log(error);
                    socket.emit('error', error);
                })
        });

        socket.on('changeDay', (rowInfo) => {
            instructorModel.updateCourseDetailDay(rowInfo)
                .then(response => {
                    console.log("Updated Course Detail Day");
                    socket.broadcast.emit('changeDay', rowInfo);
                })
                .catch(error => {
                    console.log(error);
                })
        });

        socket.on('bookResource', (bookingInfo) => {
            instructorModel.bookResource(bookingInfo)
                .then(response => {
                    console.log("Added to resource_allocation");
                    io.emit('bookResource', {
                        model_num: bookingInfo.model_num,
                        model_name: bookingInfo.model_name,
                        quantity_booked: bookingInfo.quantity_booked,
                        date: bookingInfo.date,
                        username: bookingInfo.username
                    });
                })
                .catch(error => {
                    console.log(error);
                })
        });

        socket.on('bookChanged', (bookingItem, bookingInfo) => {
            console.log(bookingInfo)
            instructorModel.bookChanged(bookingInfo)
                .then(response => {
                    console.log("Updated Course Detail Day");
                    socket.emit('resourceAdded', bookingItem);
                })
                .catch(error => {
                    console.log('yoooooo')
                    console.log(error);
                    socket.emit('error', error);
                })
        });

        socket.on('bookedResourceDeleted', (bookedResource, i) => {
            // Update posgresql database with the changed item

            instructorModel.deleteBookedResource(bookedResource.raId)
                .then(response => {
                    console.log("Update Success");

                    // Broadcast to everyone except sender
                    socket.broadcast.emit('bookResourceDeleted', i);
                })
                .catch(error => {
                    console.log(error);
                    socket.emit('error', error);
                })
        });

        socket.on('vacationAdded', (vacation) => {
            console.log(vacation);
            instructorModel.postVacation(vacation)
                .then(response => {
                    console.log("Vacation Post Success");
                })
                .catch(error => {
                    console.log(error);
                })
        });

        socket.on('vacationApproved', (vacation) => {
            instructorModel.approveVacation(vacation)
                .then(response => {
                    console.log("Vacation Approval Success");
                    console.log(vacation);
                    socket.broadcast.emit('vacationApproved', vacation);
                })
                .catch(error => {
                    console.log(error);
                })
        });

        socket.on('vacationDeleted', (vacation) => {
            instructorModel.deleteVacation(vacation)
                .then(response => {
                    console.log("Vacation Delete Success");
                    console.log(vacation);
                    socket.broadcast.emit('vacationDeleted', vacation);
                })
                .catch(error => {
                    console.log(error);
                })
        });
    });
}

module.exports = {
    socketStart
}