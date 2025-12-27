import { combineReducers } from "redux";
import userReducer from "./userSlice";
const Reducer = combineReducers({
    user: userReducer,
});
export default Reducer;