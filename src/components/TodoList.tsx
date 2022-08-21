import { Dispatch, SetStateAction, useEffect, useState } from "react";
import type { Todo, TodoListType } from "../App";
import { motion, Reorder } from "framer-motion";
import useWindowDimensions from "../hooks/useWindowDimensions";
import axios from "axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const TodoList = (props: { todoList: TodoListType; setTodoList: Dispatch<SetStateAction<TodoListType>> }) => {
    const [filter, setFilter] = useState<"all" | true | false>("all");
    const [hover, setHover] = useState(-1);
    const { width } = useWindowDimensions();
    const queryClient = useQueryClient();

    const updateTodo = useMutation(
        async (data: Todo): Promise<Todo> => {
            return await axios
                .post("/updateTodo", {
                    id: ~~data.id,
                    completed: data.completed === true ? false : true,
                    content: data.content,
                    displayOrder: data.displayOrder,
                })
                .then(res => res.data);
        },
        {
            onSuccess: resTodo => {
                let updatedTodoIndex = props.todoList.findIndex(todo => todo.id === resTodo.id);
                let updatedTodo = {
                    id: resTodo.id,
                    completed: resTodo.completed,
                    content: resTodo.content,
                    displayOrder: resTodo.displayOrder,
                };
                let updatedList = props.todoList.map(todo => todo);
                updatedList.splice(updatedTodoIndex, 1, updatedTodo);
                queryClient.setQueryData(["todos"], updatedList);
                queryClient.invalidateQueries(["todo"]);
            },
        }
    );

    const clearCompleted = useMutation(
        async () => {
            return axios.get("/clearCompleted");
        },
        {
            onSuccess: () => {
                let updatedList = props.todoList.filter(todo => todo.completed !== true);
                queryClient.setQueryData(["todos"], updatedList);
                queryClient.invalidateQueries(["todos"]);
            },
        }
    );

    const deleteTodo = useMutation(
        id => {
            return axios.post("/deleteTodo", {
                id: ~~id,
            });
        },
        {
            onSuccess: data => {
                queryClient.setQueryData(
                    ["todos"],
                    props.todoList.filter(todo => todo.id !== data.data[0])
                );
                /* queryClient.invalidateQueries(["todos"]); */
            },
        }
    );

    const updateOrder = useMutation(async (data: { id: string; dOrder: number }): Promise<[]> => {
        return await axios
            .post("/updatePositions", {
                id: ~~data.id,
                dOrder: data.dOrder,
            })
            .then(data => data.data);
    });

    const manageUpdateOrder = () => {
        let reorderedList: TodoListType = queryClient.getQueryData(["todos"]) as TodoListType;
        reorderedList.forEach((todo, i) => updateOrder.mutate({ id: todo.id, dOrder: i }));
    };

    return (
        <>
            <Reorder.Group
                className="todo-list"
                axis="y"
                values={props.todoList}
                onReorder={reordered => queryClient.setQueryData(["todos"], reordered)}>
                {props.todoList
                    /* .sort((a, b) => a.displayOrder - b.displayOrder) */
                    .map(
                        (item, index) =>
                            (filter === "all" || filter === item.completed) && (
                                <Reorder.Item
                                    className="todo-row"
                                    key={item.id}
                                    value={item}
                                    onHoverStart={() => setHover(index)}
                                    onHoverEnd={() => setHover(-1)}
                                    onDragEnd={() => manageUpdateOrder()}>
                                    <div
                                        className={item.completed ? "complete-check completed-todo" : "complete-check"}
                                        onClick={() => {
                                            updateTodo.mutate({
                                                id: item.id,
                                                completed: item.completed,
                                                content: item.content,
                                                displayOrder: item.displayOrder,
                                            });
                                        }}>
                                        {item.completed && <img src="/images/icon-check.svg" alt="check completed" />}
                                    </div>
                                    <div className={item.completed === true ? "todo completed-content" : "todo"}>{item.content}</div>
                                    <motion.div
                                        className="delete"
                                        onClick={() => {
                                            deleteTodo.mutate(item.id as any);
                                        }}
                                        whileHover={{ scale: 1.2 }}>
                                        {(hover === index || width < 1250) && <img src="/images/icon-cross.svg" alt="delete" />}
                                    </motion.div>
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
                            clearCompleted.mutate();
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
