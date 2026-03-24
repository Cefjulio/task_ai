import React from 'react';
import { Providers } from './providers';
import { AppRoutes } from './routes';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';

const App: React.FC = () => {
    // Keep internal app state in sync with Supabase Realtime
    useSupabaseRealtime();

    return (
        <Providers>
            <AppRoutes />
        </Providers>
    );
};

export default App;
