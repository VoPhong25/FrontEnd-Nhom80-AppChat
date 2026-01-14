import { useContext, useEffect, useState, useRef } from "react";
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

    const user = useSelector((state) => state.user || {});
    const infor = user.infor || {};
    const friends = infor.friends || [];
    const groups = infor.groups || [];

    //gop friend và group thanh 1 lisst chung
    const all = [...friends, ...groups];
    console.log("list user, groud: ", all)

    const [searchValue, setSearchValue] = useState("");

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
        } else {
            sendJsonMessage(GET_ROOM_CHAT_MES(item.nameGroup));
        }
        setChatUser(item);
    };

    const handleGetPeopleChatMes = (payload) => {
        dispatch(clearMessages({ name: selectedUser.name }));
        payload.data.forEach(({ name, to, mes, createAt }) => {
            console.log("time gửi tin: ", createAt)
            const isSentByUser = name === infor.name;
            dispatch(
                saveMessage({
                    name: isSentByUser ? to : name,
                    mess: {
                        text: mes,
                        sender: name,
                        isSentByUser,
                        createAt
                    },
                })
            );
        });
    };

    const handleGetRoomChatMes = (payload) => {
        payload.data.chatData.forEach(({ name, mes, createAt }) => {
            dispatch(
                saveGroupMess({
                    nameGroup: payload.data.name,
                    messGroup: {
                        text: mes,
                        sender: name,
                        isSentByUser: name === infor.name,
                        createAt,
                    },
                })
            );
        });
    };

    //xu lý gửi tin nhắn cho user
    const handleSendChat = (payload) => {
        dispatch(setFriends({ item: payload.data }));
        // sendJsonMessage(SEND_CHAT(payload.data.name, ""));
    };
    //xu ly gyuwir tin nhắn cho group
    const handleSendChatToRoom = (payload) => {
        dispatch(setGroups({ item: payload.data }));
    };

    useEffect(() => {
        if (!messages.length) return;

        const currentIndex = messages.length - 1;

        //tranh xu ly 1 message nhiều làm
        if (currentIndex === lastIndexRef.current) return;

        lastIndexRef.current = currentIndex;
        const payload = messages[currentIndex];

        if (payload.status !== "success") return;

        switch (payload.event) {
            case "GET_PEOPLE_CHAT_MES":
                handleGetPeopleChatMes(payload);
                break;

            case "GET_ROOM_CHAT_MES":
                handleGetRoomChatMes(payload);
                break;

            case "SEND_CHAT":
                handleSendChat(payload);
                break;

            case "SEND_CHAT_TO_ROOM":
                handleSendChatToRoom(payload);
                break;

            default:
                break;
        }
    }, [messages]);

    const findFriend = () => {
        if (!searchValue.trim()) return;
        sendJsonMessage(SEND_CHAT(searchValue, "add friend"));
        setSearchValue("");
    };

    const joinGroup = () => {
        // làm tiếp vào đây
        // TODO
    };

    const createGroup = () => {
        // làm tiếp vào đây
        // TODO
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

                        )
                    )}
            </div>
        </div>
    );
};

export default List;
