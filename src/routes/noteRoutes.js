const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/notesController");

router.use(auth);
router.get("/", ctrl.listNotes);
router.post("/", ctrl.createNote);
router.delete("/:id", ctrl.deleteNote);

module.exports = router;
