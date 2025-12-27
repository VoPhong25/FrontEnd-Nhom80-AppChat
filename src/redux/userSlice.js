import {createSlice} from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        infor: {name: "", email: "", friends: [], groups: [], messages: []},
        status: "",
    },
    reducers: {
        setName: (state, action) => {
            state.infor.name = action.payload;
            state.status = "Auth";
        },
        setEmail: (state, action) => {
            state.infor.email = action.payload;
            state.status = "Auth";
        }
    },
});
export const {
    setName,
    setEmail
} = userSlice.actions;

export default userSlice.reducer;