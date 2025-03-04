const express  = require("express")
const authvalidator = require("../middlewere")
const { Balance } = require("../db")
const { default: mongoose } = require("mongoose")
const router = express.Router()


router.get("/balance",authvalidator, async (req,res)=>{
     const info = await Balance.findOne({ userId: req.userId });
    res.json({
    balance:info.balance
    })
})

router.post("/transfer",authvalidator, async (req,res)=>{
    const session = await  mongoose.startSession()
    session.startTransaction();
const {amount,to} = req.body
const account = await Balance.findOne({userId:req.userId}).session(session)
const toacc= await Balance.findOne({userId:to}).session(session)

if(!account||account.balance<amount){
    await session.abortTransacion();
    console.log("Insufficient balance or failure in the db")
  res.status(400).json({
    message:"Insufficient balance or failure in the db"
  })
}
if(!toacc){
    await session.abortTransacion();
    console.log("can not find the recievers account")
    res.status(400).json({
        message:"can not find the recievers account"
    }) 
}
await Balance.updateOne({userId:req.userId},{$inc:{balance:-amount}}).session(session)
await Balance.updateOne({userId:to},{$inc:{balance:amount}}).session(session)

await session.commitTransaction();
console.log("transaction done successfully!")
res.json({
    message:"transaction done successfully!"
})
session.endSession()
})


module.exports = router