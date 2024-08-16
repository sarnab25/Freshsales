const mongoose = require("mongoose");  
const contactSchema=new mongoose.Schema({

    fisrt_name:
    {
        type:String,
        
    },

    last_name:
    {
        type:String,
    },
    email:
    {
        type:String,
    },
    mobile_Number:
    {
        type:Number,
    },
})

const Contact=mongoose.model("Contact", contactSchema)
module.exports=Contact