import { Dispatch, SetStateAction, useState } from "react";
import type { TodoListType } from "../App";
import { Reorder } from "framer-motion";
import useWindowDimensions from "../hooks/useWindowDimensions";

const TodoList = (props: { todoList: TodoListType; setTodoList: Dispatch<SetStateAction<TodoListType>> }) => {
    const [filter, setFilter] = useState<"all" | true | false>("all");
    const [hover, setHover] = useState(-1);
    const { width } = useWindowDimensions();

    return (
        <>
            <Reorder.Group className="todo-list" axis="y" values={props.todoList} onReorder={props.setTodoList}>
                {props.todoList.map(
                    (item, index) =>
                        (filter === "all" || filter === item.completed) && (
                            <Reorder.Item
                                className="todo-row"
                                key={item.id}
                                value={item}
                                onHoverStart={() => setHover(index)}
                                onHoverEnd={() => setHover(-1)}>
                                <div
                                    className={item.completed ? "complete-check completed-todo" : "complete-check"}
                                    onClick={() => {
                                        let updatedTodo = { id: item.id, content: item.content, completed: item.completed === true ? false : true };
                                        let updatedList = props.todoList.map(todo => todo);
                                        updatedList.splice(index, 1, updatedTodo);
                                        props.setTodoList(updatedList);
                                    }}>
                                    {item.completed && <img src="/images/icon-check.svg" alt="check completed" />}
                                </div>
                                <div className={item.completed === true ? "todo completed-content" : "todo"}>{item.content}</div>
                                <div
                                    className="delete"
                                    onClick={() => props.setTodoList(props.todoList.filter(todo => props.todoList.indexOf(todo) !== index))}>
                                    {(hover === index || width < 1250) && <img src="/images/icon-cross.svg" alt="delete" />}
                                </div>
                            </Reorder.Item>
                        )
                )}
                <div className="actions-row">
                    <div className="left">{props.todoList.length + (props.todoList.length === 1 ? " item left" : " items left")}</div>
                    <div className="filter">
                        <button className={filter === "all" ? "all filter-selected" : "all"} onClick={() => setFilter("all")}>
                            All
                        </button>
                        <button className={filter === false ? "active filter-selected" : "active"} onClick={() => setFilter(false)}>
                            Active
                        </button>
                        <button className={filter === true ? "completed filter-selected" : "completed"} onClick={() => setFilter(true)}>
                            Completed
                        </button>
                    </div>

                    <button
                        className="clear"
                        onClick={() => {
                            props.setTodoList(props.todoList.filter(todo => todo.completed !== true));
                        }}>
                        Clear Completed
                    </button>
                </div>
            </Reorder.Group>
            {
                <div className="filter-mobile">
                    <button className={filter === "all" ? "all filter-selected" : "all"} onClick={() => setFilter("all")}>
                        All
                    </button>
                    <button className={filter === false ? "active filter-selected" : "active"} onClick={() => setFilter(false)}>
                        Active
                    </button>
                    <button className={filter === true ? "completed filter-selected" : "completed"} onClick={() => setFilter(true)}>
                        Completed
                    </button>
                </div>
            }
        </>
    );
};

export default TodoList;
