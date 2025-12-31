import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        info: {
            name: "",
            email: "",
            friends: [],
            groups: [],
            messages: [],
        },
        status: "unauth",
    },
    reducers: {
        setUser: (state, action) => {
            state.info = action.payload;
            state.status = "auth";
        },
        logout: (state) => {
            state.info = {
                name: "",
                email: "",
                friends: [],
                groups: [],
                messages: [],
            };
            state.status = "unauth";
        },
    },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
