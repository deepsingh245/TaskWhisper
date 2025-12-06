import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { loginUser, logoutUser } from './thunks/authThunks';
import { fetchTasks, createVoiceTask } from './thunks/taskThunks';

export const ExampleComponent = () => {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const { list: tasks, isLoading } = useAppSelector((state) => state.tasks);

    // 1. Login
    const handleLogin = async () => {
        try {
            await dispatch(loginUser({ email: 'test@example.com', password: 'password' })).unwrap();
            console.log('Logged in successfully');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    // 2. Logout
    const handleLogout = () => {
        dispatch(logoutUser());
    };

    // 3. Fetch Tasks Conditionally (Handled by thunk condition, but here is how to call it)
    useEffect(() => {
        if (isAuthenticated) {
            // The thunk itself checks if data is stale or missing before fetching
            dispatch(fetchTasks());
        }
    }, [dispatch, isAuthenticated]);

    // 4. Voice Task Creation
    const handleVoiceTask = async (parsedJsonFromBackend: any) => {
        // Assuming backend returned a parsed task object
        try {
            await dispatch(createVoiceTask(parsedJsonFromBackend)).unwrap();
            console.log('Voice task added to store');
        } catch (error) {
            console.error('Failed to add voice task:', error);
        }
    };

    return (
        <div>
            <h1>Redux Usage Examples</h1>
            {isAuthenticated ? (
                <>
                    <p>Welcome, {user?.name}</p>
                    <button onClick={handleLogout}>Logout</button>

                    <h2>Tasks ({tasks.length})</h2>
                    {isLoading && <p>Loading tasks...</p>}
                    <ul>
                        {tasks.map(task => (
                            <li key={task.id}>{task.title}</li>
                        ))}
                    </ul>
                </>
            ) : (
                <button onClick={handleLogin}>Login</button>
            )}
        </div>
    );
};
