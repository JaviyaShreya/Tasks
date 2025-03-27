const EventEmmiter = require('node:events');

const event = new EventEmmiter()

//Event Listeners
event.on('itemCreated',(odata)=>{
    console.log("Item Created Successfully",odata)
})
event.on('itemUpdated',(odata)=>{
    console.log("Item Updated Successfully",odata)
})
event.on('itemDeleted',(odata)=>{
    console.log("Item Deleted Successfully",odata)
})

module.exports = {event}