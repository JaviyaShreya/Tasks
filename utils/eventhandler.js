const EventEmmiter = require('node:events');

const event = new EventEmmiter()

//Event Listeners
event.on('itemCreated',()=>{
    console.log("Item Created Successfully")
})
event.on('itemUpdated',()=>{
    console.log("Item Updated Successfully")
})
event.on('itemDeleted',()=>{
    console.log("Item Deleted Successfully")
})

module.exports = {event}