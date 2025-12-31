import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

const Reducer = combineReducers({
    user: userReducer,
});

export default Reducer;
