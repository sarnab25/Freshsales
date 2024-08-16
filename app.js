const dotenv=require("dotenv")
const express = require("express");
const mongoose = require("mongoose");                                      
const path = require("path");
const Contact = require("./modules/contact.js")
const ejsMate= require("ejs-mate");
const methodOverride=require("method-override");
const twilio = require("twilio");
const { error } = require("console");
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const app=express()
dotenv.config()

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({extended:true}))
app.engine("ejs", ejsMate)
app.use(methodOverride("_method"))

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const dbURL= process.env.ATLAS_URL
main().then(()=>{
    console.log("Connected to DB")
}).catch((err)=>
{
    console.log(err)
})

app.listen(9090, ()=>
    {
        console.log("Server is listening to port 9090")
    })
async function main()
{
    await mongoose.connect(dbURL)
}


// app.get("/", (req,res)=>
// {
// res.send("I am root")
// })

//test route
app.get("/test", async(req, res)=>
{
    let newContact = new Contact(
        {
           fisrt_name:"Sarnab",
           last_name:"Ghosh",
           email:"abc@gmail.com",
           mobile_Number:9723233433, 
        })

        await newContact.save()
        console.log("Saved Contact")
        res.send("successfully saved")
})


// home route -all contacts
app.get("/", async(req,res)=>
{
    const allContacts = await Contact.find({})
    res.render("Contacts/index.ejs", {allContacts})
})



app.get("/create", (req,res)=>
{
    res.render("Contacts/createContact.ejs")
})


// createContact Route
app.post("/createContact", async(req,res)=>
    {
        let {first, last, email,mobile}=req.body
        const newContact = new Contact(
            {
               fisrt_name:first,
               last_name:last,
               email:email,
               mobile_Number:mobile, 
            })
    
            await newContact.save()
            console.log("Saved Contact")
          res.redirect("/")
    })


    //delete Contact route
    app.delete("/deleteContact/:id", async(req,res)=>
    {
        let {id}=req.params
        await Contact.findByIdAndDelete(id)
        res.redirect("/")
    })
    

    // get Contact route
    app.get("/getContact/:id", async(req,res)=>

    {
        let {id}=req.params
        const contact = await Contact.findById(id)
        res.render("Contacts/showDetails.ejs", {contact})
    })

    app.get("/update/:id", async(req,res)=>
    {

        let {id }=req.params
        const contact = await Contact.findById(id)
        res.render("Contacts/updateContact.ejs", {contact})
    })

    // update Contact Route
    app.put("/updateContact/:id", async(req,res)=>
    {
        let {id}=req.params
        let {first, last, email,mobile}=req.body
        const updateContact = 
        {
            fisrt_name:first,
            last_name:last,
            email:email,
            mobile_Number:mobile, 
        }
        await Contact.findByIdAndUpdate(id, updateContact);
     res.redirect("/")
    })


    //twilio IVR 
    
   app.post("/ivr", (req,res)=>
{
    const response = new VoiceResponse();
    response.play('https://ect82q.bn.files.1drv.com/y4mGYURLog88TliAQzjx2o-VVvuPFqH5VpPhp94ha_9lvoKiack4PwOHLaSyluMnLwBHoOZSM2sD1BrnHGtqB1vxc3z6F9C1DgE8FCh7OFnF9Kin2GY60PYca53fTrOkDd7l-An-AJHhUHzrckxYwL47_rmJajno_iZeCWeNWjLo2mzqT1qh11EtXoHHjouyVSvjJLhJvdahEfKn0kNE_pbbA');
    
response.gather({
    numDigits:1,
    action:"/handlekey",
    method:'POST',
    timeout:10
})

    console.log(response.toString());
    // res.type("text/xml")
    res.send(response.toString())


})

app.post("/handlekey", (req,res)=>
{
    const response = new VoiceResponse()
    const digit= req.body.Digits

    if(digit=== '1')
    {
        response.say("Thank you for pressing 1.Please check your SMS for interview link ")
        client.messages
    .create({
        body: 'Here is your interview Link - https://v.personaliz.ai/?id=9b697c1a&uid=fe141702f66c760d85ab&mode=test',
        from:  process.env.TWILIO_PHONE_NUMBER,

              to: process.env.PHONE_NUMBER
    })
    .then(message => console.log(message.sid)).catch(error=>console.error("Error sending message", error));
    }

    else 
    {
        response.say("Thank your for your time")
    }

    res.type("text/xml")
    res.send(response.toString())
})

async function createCall() {
    const call = await client.calls.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.PHONE_NUMBER,
      url: "https://freshsales-contacts.onrender.com/ivr",
    });
  
    console.log(call.sid);
  }
  
  createCall();