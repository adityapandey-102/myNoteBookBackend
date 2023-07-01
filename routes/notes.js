const express =require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');



//ROUTE 1 :Get all the notes using:  GET "/api/auth//fetchAllNotes".login required.
router.get('/fetchAllNotes',fetchuser,async(req,res)=>{
    try {
        const notes=await Notes.find({user :req.user.id})
        res.json(notes)
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error ocurred");
    }
})

//ROUTE 2 :Add all the notes using:  POST "/api/notes/addNotes".login required.
router.post('/addNotes',fetchuser,[
    body('title',"Enter a valid title").isLength({ min: 3 }),
    body('description',"Enter a valid description").isLength({ min: 5 })
],async(req,res)=>{

    try {
        
    
        //Validation : If there are errors return bad request and errors
    
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {title,description,tag}=req.body;
    
        //Creating new note....
    
        const note=new Notes({
            title, description, tag, user:req.user.id
        })
    
        const savedNote=await note.save();
        res.send(savedNote)
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error ocurred");
    }

})


//ROUTE 3 :Update your the notes using:  POST "/api/notes/updateNotes".login required.
router.put('/updateNotes/:id',fetchuser,async(req,res)=>{

    try {
        
        const {title,description,tag}=req.body;
    
        //Creating new note....
    
        const newNote={}
        if(title){newNote.title=title};
        if(description){newNote.description=description};
        if(tag){newNote.tag=tag};
    //Find by id and update notes
        const note=await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")}
        //Allow updation if user own this notes
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed")
        }

        const updatedNotes = await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
        res.json({updatedNotes})
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error ocurred");
    }

})


//ROUTE 4 :Delete your the notes using: DELETE "/api/notes/deleteNotes/:id".login required.
router.delete('/deleteNotes/:id',fetchuser,async(req,res)=>{

    try {
    
    //Find by id and delete it
        let note=await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")}
        //Allow deletion if user own this notes
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed")
        }

        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({"sucess":"Note has been deleted",note:note})
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error ocurred");
    }

})

module.exports=router