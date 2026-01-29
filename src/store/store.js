import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import complaintReducer from './slices/complaintSlice';
import trainingAppReducer from './slices/trainingAppSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        complaints: complaintReducer,
        trainingApps: trainingAppReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
