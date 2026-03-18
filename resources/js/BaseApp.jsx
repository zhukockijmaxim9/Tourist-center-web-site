import React from 'react';

const App = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h1 className="text-3xl font-bold text-blue-600 mb-4">Laravel + React + Vite</h1>
                <p className="text-gray-600 mb-6">
                    Это базовая страница, переделанная на React. Все работает через Vite!
                </p>
                <div className="flex space-x-4">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        onClick={() => alert('React работает!')}
                    >
                        Проверить React
                    </button>
                    <a
                        href="https://laravel.com/docs"
                        target="_blank"
                        className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition"
                    >
                        Документация
                    </a>
                </div>
            </div>
        </div>
    );
};

export default App;
