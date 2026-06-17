import { useState } from 'react'

function CreateTaskForm({ onCreateTask }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onCreateTask(title.trim(), description.trim())
    setTitle('')
    setDescription('')
  }

  return (
    <form className="create-task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <button type="submit">Add Task</button>
    </form>
  )
}

export default CreateTaskForm
