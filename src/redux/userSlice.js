import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    infor: {
        name: "",
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
                ...state.infor,
                ...action.payload
            };
            state.status = "auth";
        },

        logout(state) {
            return initialState;
        },

        setFriends(state, action) {
            const { name, type, actionTime } = action.payload.item;

            if (!Array.isArray(state.infor.friends)) {
                state.infor.friends = [];
            }

            let friend = state.infor.friends.find(f => f.name === name);

            // chưa có thì thêm mới
            if (!friend) {
                state.infor.friends.push({
                    name,
                    type,
                    actionTime,
                    listmessage: [],
                    lastMessage: null,
                });
            }
        },

        saveMessage(state, action) {
            const { name, mess, isHistory } = action.payload;
            const friends = state.infor.friends;

            const index = friends.findIndex(f => f.name === name);
            if (index === -1) return;

            const friend = friends[index];

            const newMessage = {
                text: mess.text,
                sender: mess.sender,
                isSentByUser: mess.sender === state.infor.name,
                time: mess.createAt,
            };

            friend.listmessage.push(newMessage);
            friend.lastMessage = newMessage;

            if (isHistory) return;
            //đưa ngươi đang nhăn lên đàu danh sách
            friends.splice(index, 1);
            friends.unshift(friend);
        },

        setGroups(state, action) {

            if (!state.infor) state.infor = { name: "", email: "", friends: [], groups: [] };
            if (!Array.isArray(state.infor.groups)) state.infor.groups = [];

            const item = action && action.payload && action.payload.item;
            if (!item) return;

            const { name, type = 1, actionTime = "" } = item;
            if (!name) return;

            if (state.infor.groups.some((g) => g.nameGroup === name)) return;

            state.infor.groups.push({
                nameGroup: name,
                type,
                actionTime,
                listmessage: [],
                lastMessage: null,
            });
        },

        saveGroupMess(state, action) {
            const { nameGroup, messGroup } = action.payload;
            const group = state.infor.groups.find(g => g.nameGroup === nameGroup);
            if (!group) return;
            // dedupe: avoid pushing duplicate messages (same text + sender + recent time)
            const msgTime = messGroup.createdAt || messGroup.time || new Date().toISOString();
            let exists = false;
            try {
                exists = (group.listmessage || []).some(m => {
                    const t1 = new Date(m.time || 0).getTime();
                    const t2 = new Date(msgTime).getTime();
                    const sameText = m.text === messGroup.text;
                    const sameSender = m.sender === messGroup.sender;
                    const closeTime = Math.abs(t1 - t2) < 5000; // within 5 seconds
                    return sameText && sameSender && closeTime;
                });
            } catch (e) {
                exists = false;
            }
            if (!exists) {
                const newMessage = {
                    text: messGroup.text,
                    sender: messGroup.sender,
                    isSentByUser: !!messGroup.isSentByUser,
                    time: msgTime,
                };
                group.listmessage.push(newMessage);
                group.lastMessage = newMessage;
            }
        },

        clearMessages(state, action) {
            const { name } = action.payload;
            const friend = state.infor.friends.find(f => f.name === name);
            if (!friend) return;

            friend.listmessage = [];
        }


    },
});

export const {
    setUser,
    logout,
    setFriends,
    setGroups,
    saveMessage,
    saveGroupMess,
    clearMessages
} = userSlice.actions;

export default userSlice.reducer;
