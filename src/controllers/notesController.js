const Note = require("../models/Note");

exports.createNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Note text required" });

    const note = await Note.create({ userId: req.user.id, text: text.trim() });
    return res.status(201).json({ note });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Cannot create note" });
  }
};

exports.listNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ notes });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Cannot fetch notes" });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Note.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Note not found" });
    return res.json({ message: "Deleted" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Cannot delete note" });
  }
};
