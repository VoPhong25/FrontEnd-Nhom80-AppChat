import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    infor: {
        name: "",
        email: "",
        friends: [],
        groups: [],
    },
    status: "unauth",
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action) {
            state.infor = {
                ...state.infor,   // giữ friends, groups
                ...action.payload
            };
            state.status = "auth";
        },

        logout(state) {
            return initialState;
        },

        setFriends(state, action) {
            const { name, type, actionTime, avatarUrl } = action.payload.item;

            if (!Array.isArray(state.infor.friends)) {
                state.infor.friends = [];
            }

            if (state.infor.friends.some(f => f.name === name)) return;

            state.infor.friends.push({
                name,
                type,
                actionTime,
                avatarUrl,
                listmessage: [],
            });
        },

        saveMessage(state, action) {
            const { name, mess } = action.payload;
            const friend = state.infor.friends.find(f => f.name === name);
            if (!friend) return;

            friend.listmessage.push({
                text: mess.text,
                sender: mess.sender,
                isSentByUser: mess.sender === state.infor.email,
                time: new Date().toISOString(),
            });
        },

        setGroups(state, action) {
            const { name, type = 1, actionTime = "" } = action.payload.item;
            if (state.infor.groups.some(g => g.nameGroup === name)) return;

            state.infor.groups.push({
                nameGroup: name,
                type,
                actionTime,
                listmessage: [],
            });
        },

        saveGroupMess(state, action) {
            const { nameGroup, messGroup } = action.payload;
            const group = state.infor.groups.find(g => g.nameGroup === nameGroup);
            if (!group) return;

            group.listmessage.push({
                text: messGroup.text,
                sender: messGroup.sender,
                isSentByUser: messGroup.isSentByUser,
                time: messGroup.createdAt,
            });
        },
    },
});

export const {
    setUser,
    logout,
    setFriends,
    setGroups,
    saveMessage,
    saveGroupMess,
} = userSlice.actions;

export default userSlice.reducer;
