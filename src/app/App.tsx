import React from 'react';
import { Providers } from './providers';
import { AppRoutes } from './routes';

const App: React.FC = () => {
    return (
        <Providers>
            <AppRoutes />
        </Providers>
    );
};

export default App;
