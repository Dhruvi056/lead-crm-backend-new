const Note = require("../model/note");
const Lead = require("../model/lead");

const createNote = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Note content is required" });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const userId = req?.user?.userId || null;

    const newNote = await Note.create({
      leadId,
      userId,
      content,
    });

    res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: newNote,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create note",
      error: error.message,
    });
  }
};
const getNotesByLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { search } = req.query;

    let query = { leadId };

    if (search && search.trim() !== "") {
      query.content = { $regex: search.trim(), $options: "i" };
    }

    const notes = await Note.find(query)
      .populate("userId", "firstName email") 
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
      error: error.message,
    });
  }
};

const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const cleanNoteId = noteId.trim(); 
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Note content is required" });
    }

    const note = await Note.findById(cleanNoteId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    if (req?.user?.userId && note.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this note" });
    }

    note.content = content;
    await note.save();

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: note,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update note",
      error: error.message,
    });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    if (req?.user?.userId && note.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this note" });
    }
     await note.deleteOne();
    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete note",
      error: error.message,
    });
  }
};

module.exports = { createNote, getNotesByLead, updateNote, deleteNote };

