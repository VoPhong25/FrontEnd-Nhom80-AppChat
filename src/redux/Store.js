import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import Reducer from "./Reducer";

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["user"], // chỉ persist user
};

const persistedReducer = persistReducer(persistConfig, Reducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);
