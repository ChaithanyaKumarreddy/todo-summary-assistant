// frontend/src/components/TodoList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const fetchTodos = async () => {
    const response = await axios.get('http://localhost:5000/todos');
    setTodos(response.data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (title.trim() === '') return;
    await axios.post('http://localhost:5000/todos', { title });
    setTitle('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`http://localhost:5000/todos/${id}`);
    fetchTodos();
  };

  const summarizeTodos = async () => {
    try {
      const response = await axios.post('http://localhost:5000/summarize');
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Failed to send summary to Slack.');
    }
  };

  return (
    <div>
      <h1>Todo Summary Assistant</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter todo"
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.title}{' '}
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={summarizeTodos}>Summarize & Send to Slack</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TodoList;
