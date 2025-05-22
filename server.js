// backend/server.js
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const axios = require('axios');
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const todos = []; // In-memory storage for simplicity

// GET /todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// POST /todos
app.post('/todos', (req, res) => {
  const { title } = req.body;
  const newTodo = { id: Date.now(), title };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(todo => todo.id === id);
  if (index !== -1) {
    todos.splice(index, 1);
    res.status(204).end();
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

// POST /summarize
app.post('/summarize', async (req, res) => {
  try {
    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const todoTitles = todos.map(todo => `- ${todo.title}`).join('\n');
    const prompt = `Summarize the following to-do items:\n${todoTitles}`;

    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 150,
    });

    const summary = completion.data.choices[0].text.trim();

    // Send to Slack
    await axios.post(process.env.SLACK_WEBHOOK_URL, { text: summary });

    res.json({ message: 'Summary sent to Slack successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate summary or send to Slack.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
