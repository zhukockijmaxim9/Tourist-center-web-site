import React from 'react';

const App = () => {
    return (
        <div className="app-container">
            <div className="card">
                <h1 className="title">Laravel + React + Vite</h1>
                <p className="description">
                    Это базовая страница, переделанная на React. Все работает через Vite!
                </p>
                <div className="button-group">
                    <button
                        className="btn btn-primary"
                        onClick={() => alert('React работает!')}
                    >
                        Проверить React
                    </button>
                    <a
                        href="https://laravel.com/docs"
                        target="_blank"
                        className="btn btn-outline"
                    >
                        Документация
                    </a>
                </div>
            </div>
        </div>
    );
};

export default App;
