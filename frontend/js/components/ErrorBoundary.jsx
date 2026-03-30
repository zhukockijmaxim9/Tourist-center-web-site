import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>Что-то пошло не так</h2>
                    <p>Произошла ошибка при загрузке этого раздела.</p>
                    <button className="btn btn-primary" onClick={() => this.setState({ hasError: false })}>
                        Попробовать снова
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
