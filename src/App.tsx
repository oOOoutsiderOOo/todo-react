import { nanoid } from "nanoid";
import { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import TodoList from "./components/TodoList";
import useWindowDimensions from "./hooks/useWindowDimensions";

let initTodos: TodoListType = [{ id: "1", content: "Create my first todo", completed: false }];

export type Todo = {
    id: string;
    content: string;
    completed: boolean;
};
export type TodoListType = Todo[];

const App: FC = () => {
    const [todoList, setTodoList] = useState<TodoListType>([]);
    const [newTodo, setNewTodo] = useState("");
    const [fetching, setFetching] = useState(true);
    const [theme, setTheme] = useState("");
    const { height, width } = useWindowDimensions();

    useEffect(() => {
        const initFetch = async () => {
            !localStorage.getItem("todos") && localStorage.setItem("todos", JSON.stringify(initTodos));
            !localStorage.getItem("theme") && localStorage.setItem("theme", "dark");
            let response: TodoListType = JSON.parse(localStorage.getItem("todos") as string);
            let fetchedTheme = localStorage.getItem("theme") as string;
            setTodoList(response);
            setTheme(fetchedTheme);
        };

        setFetching(true);
        initFetch();
        setFetching(false);
    }, []);

    useEffect(() => {
        fetching === false && localStorage.setItem("todos", JSON.stringify(todoList));
    }, [todoList]);

    useEffect(() => {
        fetching === false && localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <div className={theme !== "" ? (theme === "dark" ? "" : "light") : undefined}>
            <div className="background">
                {width > 650 && <img src={theme === "light" ? "/images/bg-desktop-light.jpg" : "/images/bg-desktop-dark.jpg"} alt="" />}
                {width <= 650 && <img src={theme === "light" ? "/images/bg-mobile-light.jpg" : "/images/bg-mobile-dark.jpg"} alt="" />}
            </div>
            <header className="header">
                <h1 className="title">TODO</h1>
                <button
                    className="theme-toggle"
                    onClick={() => {
                        theme === "dark" ? setTheme("light") : setTheme("dark");
                    }}>
                    <img src={theme === "dark" ? "/images/icon-sun.svg" : "/images/icon-moon.svg"} alt="" />
                </button>
            </header>
            <div className="app-wrapper">
                <div className="new-todo-row">
                    <input
                        className="new-todo-input"
                        type="text"
                        value={newTodo}
                        placeholder="Create a new todo..."
                        onChange={e => setNewTodo(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                if (newTodo !== "") {
                                    setTodoList([...todoList, { id: nanoid(10), content: newTodo, completed: false }]);
                                    setNewTodo("");
                                }
                            }
                        }}
                    />
                </div>
                <TodoList todoList={todoList} setTodoList={setTodoList} />
            </div>
            <div className="message">Drag and drop to reorder list</div>
        </div>
    );
};

export default App;
