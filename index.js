//console.log("hello world")
/* 
  client side
    template: static template
    logic(js): MVC(model, view, controller): used to server side technology, single page application
        model: prepare/manage data,
        view: manage view(DOM),
        controller: business logic, event bindind/handling

  server side
    json-server
    CRUD: create(post), read(get), update(put, patch), delete(delete)


*/

const APIs = (() => {
  const createTodo = newTodo => {
    return fetch("http://localhost:3000/todos", {
      method: "POST",
      body: JSON.stringify(newTodo),
      headers: { "Content-Type": "application/json" }
    }).then(res => res.json());
  };

  const deleteTodo = id => {
    return fetch("http://localhost:3000/todos/" + id, {
      method: "DELETE"
    }).then(res => res.json());
  };

  const editTodo = (id, content) => {
    return fetch("http://localhost:3000/todos/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content)
    }).then(res => res.json());
  };

  const getTodos = () => {
    return fetch("http://localhost:3000/todos").then(res => res.json());
  };

  return { createTodo, deleteTodo, getTodos, editTodo };
})();

//IIFE
//todos
/* 
    hashMap: faster to search
    array: easier to iterate, has order


*/
const Model = (() => {
  class State {
    #todos; //private field
    #onChange; //function, will be called when setter function todos is called
    constructor() {
      this.#todos = [];
    }
    get todos() {
      return this.#todos;
    }
    set todos(newTodos) {
      // reassign value
      console.log("setter function");
      this.#todos = newTodos;
      this.#onChange?.(); // rendering
    }

    subscribe(callback) {
      //subscribe to the change of the state todos
      this.#onChange = callback;
    }
  }
  const { getTodos, createTodo, deleteTodo, editTodo } = APIs;
  return {
    State,
    getTodos,
    createTodo,
    deleteTodo,
    editTodo
  };
})();

const View = (() => {
  const todolistEl = document.querySelector(".todo-list");
  const todolistComEl = document.querySelector(".completed-list");

  const submitBtnEl = document.querySelector(".submit-btn");

  const inputEl = document.querySelector(".input");

  const renderTodos = todos => {
    let todosTemplate = "";
    let completedTodosTemplate = "";
    todos.forEach(todo => {
      if (todo.completed === false) {
        const liTemplate = `<li><span>${todo.content}</span><button class="edit-btn" id="${todo.id}">Edit</button>
                    <button class="delete-btn" id="${todo.id}">Delete</button><button class="pending" id="${todo.id}">></button></li>`;
        todosTemplate += liTemplate;
      } else {
        const liTemplate = `<li><button class="completed" id="${todo.id}"><</button><span>${todo.content}</span><button class="edit-btn" id="${todo.id}">Edit</button>
                    <button class="delete-btn" id="${todo.id}">Delete</button></li>`;
        completedTodosTemplate += liTemplate;
      }
    });
    if (todos.length === 0) {
      todosTemplate = "<h4>no task to display!</h4>";
    }
    todolistEl.innerHTML = todosTemplate;
    todolistComEl.innerHTML = completedTodosTemplate;
  };

  const clearInput = () => {
    inputEl.value = "";
  };

  return {
    renderTodos,
    submitBtnEl,
    inputEl,
    clearInput,
    todolistEl,
    todolistComEl
  };
})();

const Controller = ((view, model) => {
  const state = new model.State();
  const init = () => {
    model.getTodos().then(todos => {
      todos.reverse();
      state.todos = todos;
      console.log(state.todos);
    });
  };
  let editCount = true;

  const handleSubmit = () => {
    view.submitBtnEl.addEventListener("click", event => {
      /* 
                1. read the value from input
                2. post request
                3. update view
            */
      const inputValue = view.inputEl.value;
      if (inputValue === "") {
        alert("please add tasks before submit");
      }
      if (inputValue !== "") {
        model
          .createTodo({ content: inputValue, completed: false })
          .then(data => {
            state.todos = [data, ...state.todos];
            view.clearInput();
          });
      }
    });
  };

  // duplicate logic
  const handleDelete = () => {
    if (event.target.className === "delete-btn") {
      const id = event.target.id;
      model.deleteTodo(+id).then(data => {
        state.todos = state.todos.filter(todo => todo.id !== +id);
      });
    }
  };

  const handleDeletePending = () => {
    view.todolistEl.addEventListener("click", event => {
      handleDelete();
    });
  };

  const handleDeleteCompleted = () => {
    view.todolistComEl.addEventListener("click", event => {
      handleDelete();
    });
  };

  const handleEdit = () => {
    if (event.target.className === "edit-btn") {
      if (editCount === true) {
        event.target.previousSibling.setAttribute("contentEditable", true);
        event.target.previousSibling.style.backgroundColor = "grey";
        editCount = !editCount;
      } else {
        event.target.previousSibling.setAttribute("contentEditable", false);
        let newContent = event.target.previousSibling.innerText;
        const id = event.target.id;

        model.editTodo(+id, { content: newContent }).then(data => {
          let index = state.todos.findIndex(item => item.id === +id);
          state.todos[index].content = newContent;
          view.renderTodos(state.todos);
        });
        editCount = !editCount;
      }
    }
  };

  const handleEditPending = () => {
    view.todolistEl.addEventListener("click", event => {
      handleEdit();
    });
  };

  const handleEditCompleted = () => {
    view.todolistComEl.addEventListener("click", event => {
      handleEdit();
    });
  };

  const handlePendingTask = () => {
    view.todolistEl.addEventListener("click", event => {
      if (event.target.className === "pending") {
        const id = event.target.id;

        model.editTodo(+id, { completed: true }).then(data => {
          let index = state.todos.findIndex(item => item.id === +id);
          state.todos[index].completed = true;
          view.renderTodos(state.todos);
        });
      }
    });
  };

  const handleCompletedTask = () => {
    view.todolistComEl.addEventListener("click", event => {
      if (event.target.className === "completed") {
        const id = event.target.id;

        model.editTodo(+id, { completed: false }).then(data => {
          let index = state.todos.findIndex(item => item.id === +id);
          state.todos[index].completed = false;
          view.renderTodos(state.todos);
        });
      }
    });
  };

  const bootstrap = () => {
    init();
    handleSubmit();
    handleDeletePending();
    handleDeleteCompleted();
    handleEditPending();
    handlePendingTask();
    handleCompletedTask();
    state.subscribe(() => {
      view.renderTodos(state.todos);
    });
  };
  return {
    bootstrap
  };
})(View, Model); //ViewModel

Controller.bootstrap();
