import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
        this.setState({ error });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>Что-то пошло не так</h2>
                    <p>Произошла ошибка при загрузке этого раздела.</p>
                    {this.state.error?.message && (
                        <pre style={{ textAlign: 'left', maxWidth: 900, margin: '1rem auto', padding: '1rem', background: '#111', color: '#eee', borderRadius: 8, overflow: 'auto' }}>
                            {String(this.state.error.message)}
                        </pre>
                    )}
                    <button className="btn btn-primary" onClick={() => this.setState({ hasError: false })}>
                        Попробовать снова
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
