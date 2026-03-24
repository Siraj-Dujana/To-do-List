const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

// GET all todos
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a todo
router.post("/", async (req, res) => {
  try {
    const todo = new Todo({
      text: req.body.text,
      priority: req.body.priority,
    });
    const saved = await todo.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH toggle complete / update
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a todo
router.delete("/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;