import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, push, remove, update, orderByChild, query } from "firebase/database";
import styles from "./app.module.css";

export const App = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isSorted, setIsSorted] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);
    const delay = 300;

    // Функция для получения всех дел
    const fetchTodos = () => {
        const todosRef = ref(database, "todos");
        const q = query(todosRef, orderByChild('title'));
        onValue(q, (snapshot) => {
            const data = snapshot.val() || {};
            const formattedTodos = Object.entries(data).map(([id, todo]) => ({ id, ...todo }));
            setTodos(formattedTodos);
        });
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    // Добавление нового дела
    const addTodo = () => {
        if (!newTodo) return;

        const todosRef = ref(database, "todos");
        push(todosRef, { title: newTodo })
            .then(() => {
                setNewTodo(""); // Очищаем поле ввода
            })
            .catch((error) => console.error("Ошибка добавления дела:", error));
    };

    // Удаление дела
    const deleteTodo = (id) => {
        remove(ref(database, `todos/${id}`))
            .catch((error) => console.error("Ошибка удаления дела:", error));
    };

    // Изменение дела
    const updateTodo = (id, title) => {
        update(ref(database, `todos/${id}`), { title })
            .catch((error) => console.error("Ошибка изменения дела:", error));
    };

    // Поиск дел с использованием debounce
    const handleSearch = (e) => {
        clearTimeout(debounceTimer);
        const value = e.target.value;
        setSearchTerm(value);

        setDebounceTimer(
            setTimeout(() => {
                setSearchTerm(value);
            }, delay)
        );
    };

    // Сортировка дел
    const sortedTodos = isSorted
        ? [...todos].sort((a, b) => a.title.localeCompare(b.title))
        : todos;

    // Фильтрация по поисковому запросу
    const filteredTodos = sortedTodos.filter((todo) =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.app}>
            <h1>Список дел</h1>
            <input
                type="text"
                placeholder="Введите новое дело"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
            />
            <button onClick={addTodo}>Добавить</button>

            <input
                type="text"
                placeholder="Поиск..."
                onChange={handleSearch}
            />
            <button onClick={() => setIsSorted((prev) => !prev)}>
                {isSorted ? "Сортировка отключена" : "Сортировка по алфавиту"}
            </button>

            <ul>
                {filteredTodos.map(({ id, title }) => (
                    <li key={id} className={styles.todoItem}>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => updateTodo(id, e.target.value)}
                        />
                        <button onClick={() => deleteTodo(id)}>Удалить</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
