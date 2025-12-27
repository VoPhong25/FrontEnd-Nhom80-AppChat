import Reducer from "./Reducer"; // giá trị trả về từ combineReducers
import { applyMiddleware, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";
const persistConfig = { key: "root", version: 1, storage };
const reducer = combineReducers({
    reducer: Reducer,
});
const persistedReducer = persistReducer(persistConfig, reducer);
const store = configureStore({ reducer: persistedReducer }, applyMiddleware);
export default store;