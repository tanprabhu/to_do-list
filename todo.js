const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todo");

document.addEventListener('DOMContentLoaded', async () => {
    const userid = sessionStorage.getItem('userid');
    if (!userid) {
        window.location.href = 'index.html';
    } else {
        document.getElementById('userid').value = userid;
        fetchTodos(userid);
    }
});

todoButton.addEventListener("click", addTodo);
todoList.addEventListener("click", deleteCheck);
filterOption.addEventListener("change", filterTodo);

async function addTodo(event) {
    event.preventDefault();
    const todoText = todoInput.value.trim(); // Trim whitespace from input
    
    if (!todoText) {
        return; // If input is empty, do nothing
    }

    const data = {
        item: todoText,
        userid: document.getElementById('userid').value // Get userid from input field
    };

    try {
        const response = await fetch('http://localhost:3000/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            const todoItem = {
                item_id: result.item_id,
                item: data.item,
                status: 0 // Initial status, 0 means not completed
            };
            addTodoToList(todoItem);
            todoInput.value = ""; // Clear input field after adding todo
        } else {
            console.error('Error adding to-do item');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function addTodoToList(todo) {
    const todoDiv = document.createElement('div');
    todoDiv.classList.add('todo');
    todoDiv.dataset.id = todo.item_id;

    const newTodo = document.createElement('li');
    newTodo.innerText = todo.item;
    newTodo.classList.add('todo-item');
    todoDiv.appendChild(newTodo);

    const completedButton = document.createElement('button');
    completedButton.innerHTML = '<i class="fas fa-check-circle"></i>';
    completedButton.classList.add('complete-btn');
    completedButton.addEventListener('click', () => updateTodoStatus(todo.item_id, todoDiv));
    todoDiv.appendChild(completedButton);

    const trashButton = document.createElement('button');
    trashButton.innerHTML = '<i class="fas fa-trash"></i>';
    trashButton.classList.add('trash-btn');
    trashButton.addEventListener('click', () => deleteTodoItem(todo.item_id, todoDiv));
    todoDiv.appendChild(trashButton);

    if (todo.status) {
        todoDiv.classList.add('completed');
    }

    todoList.appendChild(todoDiv);
}

async function updateTodoStatus(item_id, todoDiv) {
    const isCompleted = todoDiv.classList.toggle('completed');
    const status = isCompleted ? 1 : 0;

    try {
        const response = await fetch(`http://localhost:3000/todos/${item_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }) // Send status as JSON body
        });

        if (!response.ok) {
            console.error('Error updating to-do item status');
            todoDiv.classList.toggle('completed'); // Revert the UI change if update fails
        }
    } catch (error) {
        console.error('Error:', error);
        // todoDiv.classList.toggle('completed'); // Revert the UI change if update fails
    }
}

async function deleteTodoItem(item_id, todoDiv) {
    try {
        const response = await fetch(`http://localhost:3000/todos/${item_id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            todoDiv.remove();
            console.log("Deleted item successfully");
        } else {
            console.error('Error deleting to-do item');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchTodos(userid) {
    try {
        const response = await fetch(`http://localhost:3000/todos/${userid}`);
        if (response.ok) {
            const todos = await response.json();
            todos.forEach(todo => {
                addTodoToList(todo);
            });
        } else {
            console.error('Error fetching to-do items');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function deleteCheck(e) {
    const item = e.target;

    if (item.classList.contains("trash-btn")) {
        const todo = item.parentElement;
        todo.classList.add("slide");

        todo.addEventListener("transitionend", function () {
            deleteTodoItem(todo.dataset.id, todo); // Delete todo from UI and database
        });
    } else if (item.classList.contains("complete-btn")) {
        const todo = item.parentElement;
        todo.addEventListener("strike-through",function() {
            updateTodoStatus(todo.dataset.id, todo); // Update todo status in UI and database
        });
        
    }
}

function filterTodo() {
    const todos = todoList.childNodes;
    todos.forEach(function (todo) {
        switch (filterOption.value) {
            case "all":
                todo.style.display = "flex";
                break;
            case "completed":
                if (todo.classList.contains("completed")) {
                    todo.style.display = "flex";
                } else {
                    todo.style.display = "none";
                }
                break;
            case "incomplete":
                if (!todo.classList.contains("completed")) {
                    todo.style.display = "flex";
                } else {
                    todo.style.display = "none";
                }
                break;
        }
    });
}
