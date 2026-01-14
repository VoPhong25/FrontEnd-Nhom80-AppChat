import { useContext, useEffect, useState, useRef } from "react";
import { useToast } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { LogOut } from "lucide-react";

import { WebSocketContext } from "../../socket/WebSocketContext";
import {
    GET_PEOPLE_CHAT_MES,
    GET_ROOM_CHAT_MES,
    SEND_CHAT,
    SEND_CHAT_TO_ROOM,
    CREATE_ROOM,
    JOIN_ROOM,
    Logout,
} from "../../api/action";

import {
    setFriends,
    setGroups,
    saveMessage,
    saveGroupMess,
    logout, clearMessages,
} from "../../redux/userSlice";

import Friend from "../friend/Friend";
import ShowGroup from "../group/GroupShow";
import "./List.css";

const List = ({ setChatUser, selectedUser }) => {

    const { isReady, messages, sendJsonMessage } =
        useContext(WebSocketContext);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const lastIndexRef = useRef(-1);
    const toast = useToast();

    const user = useSelector((state) => state.user || {});
    const infor = user.infor || {};
    const friends = infor.friends || [];
    const groups = infor.groups || [];

    //gop friend và group thanh 1 lisst chung
    const all = [...friends, ...groups];
    console.log("list user, groud: ", all)

    const [searchValue, setSearchValue] = useState("");
    const [expandedGroup, setExpandedGroup] = useState(null);

    //louot
    const handleLogout = () => {
        if (isReady) sendJsonMessage(Logout());
        dispatch(logout());
        navigate("/");
    };

    //xử ly khi chọn user hoặc group để lấy tin nhanw
    const handleItemClick = (item) => {
        if (item.type === 0) {
            sendJsonMessage(GET_PEOPLE_CHAT_MES(item.name));
            setExpandedGroup(null);
        } else {
            sendJsonMessage(GET_ROOM_CHAT_MES(item.nameGroup));
            setExpandedGroup(item.nameGroup);
        }
        setChatUser(item);
    };

    const handleGetPeopleChatMes = (payload) => {
        // clear existing messages for the selected user (if any)
        if (selectedUser?.name) dispatch(clearMessages({ name: selectedUser.name }));

        // payload may already be normalized (payload) or wrapped ({ data: [...] })
        const list = (payload && (payload.data || payload)) || [];
        if (!Array.isArray(list)) return;
        const myId = infor.name || infor.email;
        list.forEach(({ name, to, mes, createAt, createdAt }) => {
            const isSentByUser = name === myId;
            dispatch(
                saveMessage({
                    name: isSentByUser ? to : name,
                    mess: {
                        text: mes,
                        sender: name,
                        isSentByUser,
                        createAt: createAt || createdAt,
                    },
                })
            );
        });
    };

    const handleGetRoomChatMes = (payload) => {
        // payload may be normalized to the inner data object or wrapped
        const myId = infor.name || infor.email;
        const data = (payload && (payload.data || payload)) || {};
        const chatData = data.chatData || (data.data && data.data.chatData) || [];
        const roomName = data.name || (data.data && data.data.name) || null;
        if (!Array.isArray(chatData)) return;
        chatData.forEach(({ name, mes, createAt, createdAt }) => {
            dispatch(
                saveGroupMess({
                    nameGroup: roomName,
                    messGroup: {
                        text: mes,
                        sender: name,
                        isSentByUser: name === myId,
                        createdAt: createAt || createdAt,
                    },
                })
            );
        });
    };

    //xu lý gửi tin nhắn cho user (people)
    const handleSendChat = (payload) => {
        try {
            const d = (payload && (payload.data && (payload.data.data || payload.data))) || payload;
            const text = d.mes || d.message || d.msg || "";
            const from = d.from || d.name || d.sender || null;
            const to = d.to || null;
            const createAt = d.createAt || d.createdAt || null;
            if (!text || !from) return;
            // determine conversation partner: if the message is from me -> partner is 'to', else partner is 'from'
            const myId = infor.name || infor.email;
            const partner = from === myId ? to : from;
            if (!partner) return;
            dispatch(
                saveMessage({
                    name: partner,
                    mess: {
                        text,
                        sender: from,
                        isSentByUser: from === myId,
                        createAt,
                    },
                })
            );
        } catch (e) {
            // ignore
        }
    };
    //xu ly gyuwir tin nhắn cho group
        const handleSendChatToRoom = (payload) => {
            // payload may contain message info for room sends
            try {
                const d = (payload && (payload.data && (payload.data.data || payload.data))) || payload;
                const nameGroup = d.to || d.name || (payload.data && payload.data.name) || null;
                const text = d.mes || d.message || d.msg || "";
                const sender = d.from || d.name || d.sender || (payload.data && payload.data.from) || null;
                const createdAt = d.createAt || d.createdAt || new Date().toISOString();
                if (!nameGroup || !text) return;
                const myId = infor.name || infor.email;
                dispatch(
                    saveGroupMess({
                        nameGroup,
                        messGroup: {
                            text,
                            sender,
                            isSentByUser: sender === myId,
                            createdAt,
                        },
                    })
                );
            } catch (e) {
                // ignore parse errors
            }
        };

    useEffect(() => {
        if (!messages.length) return;
        const currentIndex = messages.length - 1;

        // avoid processing same message multiple times
        if (currentIndex === lastIndexRef.current) return;

        lastIndexRef.current = currentIndex;
        const raw = messages[currentIndex];

        // normalize event / status / payload
        const evt = raw.event || (raw.data && raw.data.event) || (raw.action && raw.action.event);
        const status = raw.status || (raw.data && raw.data.status) || null;
        const payload = raw.data ? (raw.data.data || raw.data) : raw;

        if (status && status !== "success") return;

        if (!evt) return;

        if (evt === "GET_PEOPLE_CHAT_MES") {
            handleGetPeopleChatMes(payload);
        } else if (evt === "GET_ROOM_CHAT_MES") {
            handleGetRoomChatMes(payload);
        } else if (evt === "SEND_CHAT") {
            // server may use SEND_CHAT for both people and room messages
            const d = (payload && (payload.data || payload)) || payload;
            const type = d.type || (d.data && d.data.type) || null;
            if (type === "room") {
                handleSendChatToRoom({ data: d });
            } else {
                handleSendChat({ data: d });
            }
        } else if (evt === "SEND_CHAT_TO_ROOM") {
            // fallback if server uses a specific event
            handleSendChatToRoom(payload);
        }
    }, [messages]);

    const findFriend = () => {
        if (!searchValue.trim()) return;
        sendJsonMessage(SEND_CHAT(searchValue, "add friend"));
        setSearchValue("");
    };
    // xu li nhập tên nhóm để vào
    const joinGroup = () => {
        if (!isReady) {
            toast({ title: "WebSocket chưa sẵn sàng", status: "error", duration: 3000 });
            return;
        }
        const room = window.prompt("Nhập tên nhóm để vào:");
        if (!room) return;

        setChatUser({ nameGroup: room, type: 1 });

        sendJsonMessage(JOIN_ROOM(room));
    };
    // xu li nhập tên nhóm để tạo
    const createGroup = () => {
        if (!isReady) {
                toast({ title: "WebSocket chưa sẵn sàng", status: "error", duration: 3000 });
            return;
        }
        const room = window.prompt("Nhập tên nhóm để tạo:");
        if (!room) return;
        setChatUser({ nameGroup: room, type: 1 });
        sendJsonMessage(CREATE_ROOM(room));
    };

    return (
        <div className="list">
            <div className="list_header">
                <Link to="/infor" className="user-name">
                    {infor.name}
                </Link>

                {/* logout */}
                <LogOut
                    size={20}
                    className="logout-icon"
                    onClick={handleLogout}
                />
            </div>

            <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search..."
            />

            <div className="allbtn">
                <button onClick={findFriend}>Tìm bạn</button>
                <button onClick={joinGroup}>Vào nhóm</button>
                        <button onClick={createGroup}>Tạo nhóm</button>

            </div>


            <div className="chatList">
                {all
                    .filter(
                        (item) =>
                            item.type !== 0 || item.name !== infor.name
                    )
                    .map((item) =>
                        item.type === 0 ? (
                            <Friend
                                key={`friend-${item.name}`}
                                name={item.name}
                                lastMessage={
                                    item.lastMessage
                                        ? item.lastMessage.isSentByUser
                                            ? `Bạn: ${item.lastMessage.text}`
                                            : item.lastMessage.text
                                        : ""
                                }
                                time={item.lastMessage?.time}
                                isActive={
                                    selectedUser?.type === 0 &&
                                    selectedUser?.name === item.name
                                }
                                onClick={() => handleItemClick(item)}
                            />

                        ) : (
                            <div key={`group-wrap-${item.nameGroup}`}>
                                <ShowGroup
                                    key={`group-${item.nameGroup}`}
                                    nameGroup={item.nameGroup}
                                    lastMessage={
                                        item.lastMessage
                                            ? `${item.lastMessage.sender}: ${item.lastMessage.text}`
                                            : ""
                                    }
                                    time={item.lastMessage?.time}
                                    isActive={
                                        selectedUser?.type === 1 &&
                                        selectedUser?.nameGroup === item.nameGroup
                                    }
                                    onClick={() => handleItemClick(item)}
                                />
                                {/* Hien thi danh sach thanh vien co trong nhom */}
                                {expandedGroup === item.nameGroup && (
                                    <div className="group-members">
                                        {(() => {
                                            const groupObj = groups.find((g) => g.nameGroup === item.nameGroup) || { listmessage: [] };
                                            const members = Array.from(new Set((groupObj.listmessage || []).map((m) => m.sender))).filter(Boolean);
                                            if (!members.length) {
                                                return (
                                                    <div className="member-empty">
                                                        <div>No members yet</div>

                                                    </div>
                                                );
                                            }
                                            return members.map((m) => (
                                                <div key={`member-${m}`} className="member-item">
                                                    <div className="member-avatar" />
                                                    <div className="member-name">{m}</div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                )}
                            </div>

                        )
                    )}
            </div>
        </div>
    );
};

export default List;
