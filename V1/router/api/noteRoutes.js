const express = require("express");

const {createNote,getNotesByLead,updateNote,deleteNote} = require("../../controller/note.controller") 
const verifyToken = require('../../middleware/verifyToken')
const router = express.Router();

router.post("/:leadId/notes", verifyToken, createNote);
router.get("/:leadId/notes", verifyToken, getNotesByLead);
router.put("/notes/:noteId", verifyToken, updateNote);
router.delete("/notes/:noteId", verifyToken, deleteNote);


module.exports = router;
