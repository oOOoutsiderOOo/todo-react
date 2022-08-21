import axios from "axios";
import { nanoid } from "nanoid";
import { FC, useEffect, useState } from "react";
import TodoList from "./components/TodoList";
import useWindowDimensions from "./hooks/useWindowDimensions";
import { useQuery, QueryClientProvider, useMutation, QueryClient, useQueryClient } from "@tanstack/react-query";

let initTodos: TodoListType = [{ id: "1", content: "Create my first todo", completed: false, displayOrder: 1 }];

export type Todo = {
    id: string;
    content: string;
    completed: boolean;
    displayOrder: number;
};
export type TodoListType = Todo[];

const App: FC = () => {
    const [todoListo, setTodoList] = useState<TodoListType>([]);
    const [newTodo, setNewTodo] = useState("");
    const [fetching, setFetching] = useState(true);
    const [theme, setTheme] = useState("");
    const { width } = useWindowDimensions();
    const queryClient = useQueryClient();

    const {
        data: todoList,
        isLoading,
        isError,
    } = useQuery(["todos"], async () => {
        return await axios
            .get("http://localhost:3000/getTodos")
            .then(res => (res.data as TodoListType).sort((a, b) => a.displayOrder - b.displayOrder));
    });

    useEffect(() => {
        const initFetch = async () => {
            !localStorage.getItem("theme") && localStorage.setItem("theme", "dark");
            /*  (await axios.post("http://localhost:3000/newTodo", { content: initTodos[0].content, dOrder: initTodos[0].displayOrder })); */
            let fetchedTheme = localStorage.getItem("theme") as string;
            setTheme(fetchedTheme);
        };

        setFetching(true);
        initFetch();
        setFetching(false);
    }, []);

    useEffect(() => {
        fetching === false && localStorage.setItem("theme", theme);
    }, [theme]);

    const postNewTodo = useMutation(
        newTodo => {
            let sortedList = (todoList as TodoListType).map(todo => todo);
            sortedList.reverse();
            let newDOrder = sortedList[0] ? sortedList[0].displayOrder : 0;

            return axios.post("http://localhost:3000/newTodo", { content: newTodo, dOrder: newDOrder + 1 });
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["todos"]);
                setNewTodo("");
            },
        }
    );

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
                        onKeyDown={async e => {
                            if (e.key === "Enter") {
                                if (newTodo !== "") {
                                    postNewTodo.mutate(newTodo as any);
                                }
                            }
                        }}
                    />
                </div>
                {!isLoading && !isError && <TodoList todoList={todoList} setTodoList={setTodoList} />}
            </div>
            <div className="message">Drag and drop to reorder list</div>
        </div>
    );
};

export default App;
