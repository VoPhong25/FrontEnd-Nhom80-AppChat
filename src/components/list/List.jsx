import { useContext, useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useRef } from "react";
import { WebSocketContext } from "../../socket/WebSocketContext";
import {
    GET_PEOPLE_CHAT_MES,
    GET_ROOM_CHAT_MES,
    SEND_CHAT,
    SEND_CHAT_TO_ROOM,
    CREATE_ROOM,
    JOIN_ROOM,
    Logout, CHECK_USER_ONLINE,
} from "../../api/action";

import {
    saveMessage,
    saveGroupMess,
    logout, clearMessages, clearGroupMessages, checkOnline, setFriends,
} from "../../redux/userSlice";

import Friend from "../friend/Friend";
import ShowGroup from "../group/GroupShow";
import "./List.css";

const List = ({ setChatUser, selectedUser }) => {

    const { isReady, messages, sendJsonMessage } =
        useContext(WebSocketContext);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();

    const user = useSelector((state) => state.user || {});
    const infor = user.infor || {};
    const friends = infor.friends || [];
    const groups = infor.groups || [];
    const checkStatusQueue = useRef([]);

    //gop friend và group thanh 1 lisst chung
    const all = [...friends, ...groups].sort((a, b) => {
        const timeA = new Date(a.lastMessage?.time || a.actionTime || 0);
        const timeB = new Date(b.lastMessage?.time || b.actionTime || 0);

        return timeB - timeA;
    });

    console.log("list user, groud: ", all)

    const [searchValue, setSearchValue] = useState("");
    const [expandedGroup, setExpandedGroup] = useState(null);

    //louot
    const handleLogout = () => {
        if (isReady) sendJsonMessage(Logout());
        dispatch(logout());
        toast({
            title: "Đăng xuất thành công",
            status: "success",
            duration: 2000,
        });
        navigate("/");
    };

    const checkAllFriendsStatus = () => {
        if (!isReady || all.length === 0) return;
        checkStatusQueue.current = [];

        all.forEach((friend) => {
            if (friend.type === 0) {
                checkStatusQueue.current.push(friend.name);
                sendJsonMessage(CHECK_USER_ONLINE(friend.name));
            }
        });
    };

    //
    useEffect(() => {
        if (isReady && all.length > 0) {
            checkAllFriendsStatus();
            const intervalId = setInterval(() => {
                checkAllFriendsStatus();
            }, 30000);

            return () => clearInterval(intervalId);
        }
    }, [isReady, friends.length]);

    // //xử ly khi chọn user hoặc group để lấy tin nhanw
    // const handleItemClick = (item) => {
    //     if (item.type === 0) {
    //         sendJsonMessage(GET_PEOPLE_CHAT_MES(item.name));
    //         setExpandedGroup(null);
    //     } else {
    //         sendJsonMessage(GET_ROOM_CHAT_MES(item.nameGroup));
    //         setExpandedGroup(item.nameGroup);
    //     }
    //     setChatUser(item);
    // };
// Xử lý khi chọn user hoặc group để lấy tin nhắn
    const handleItemClick = (item) => {
        // CASE 1: Click vào User (Bạn bè)
        if (item.type === 0) {
            sendJsonMessage(GET_PEOPLE_CHAT_MES(item.name));
            setExpandedGroup(null);
            setChatUser(item);
        } 
        // CASE 2: Click vào Group (Nhóm)
        else {
            // Kiểm tra xem user hiện tại đã tham gia nhóm này chưa
            // (So sánh tên nhóm được click với danh sách nhóm trong Redux)
            const isJoined = groups.some(g => g.nameGroup === item.nameGroup);

            if (isJoined) {
                // Nếu đã tham gia: Lấy tin nhắn và hiển thị bình thường
                sendJsonMessage(GET_ROOM_CHAT_MES(item.nameGroup));
                
                // Toggle mở/đóng danh sách thành viên (nếu cần)
                setExpandedGroup(prev => (prev === item.nameGroup ? null : item.nameGroup));
                
                setChatUser(item);
            } else {
                // Nếu chưa tham gia: Yêu cầu Join
                const confirmJoin = window.confirm(
                    `Bạn chưa là thành viên của nhóm "${item.nameGroup}". Bạn có muốn tham gia ngay không?`
                );

                if (confirmJoin) {
                    if (isReady) {
                        sendJsonMessage(JOIN_ROOM(item.nameGroup));
                        toast({
                            title: "Đang tham gia nhóm...",
                            status: "info",
                            duration: 2000,
                        });
                        // Tùy chọn: Có thể setChatUser luôn để người dùng thấy giao diện ngay
                        // setChatUser(item); 
                    } else {
                        toast({
                            title: "Lỗi kết nối",
                            description: "WebSocket chưa sẵn sàng",
                            status: "error",
                            duration: 3000,
                        });
                    }
                }
                // Nếu chọn Cancel thì không làm gì cả (không load tin nhắn)
            }
        }
    };
    const handleGetPeopleChatMes = (payload) => {
        if (selectedUser?.name) {
            dispatch(clearMessages({ name: selectedUser.name }));
        }
        const sorted = [...payload.data].sort(
            (a, b) => new Date(a.createAt) - new Date(b.createAt)
        );

        sorted.forEach(({ name, to, mes, createAt }) => {
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
                    isHistory: true
                })
            );
        });
    };

    const handleGetRoomChatMes = (payload) => {

        const data = payload.data;
        const roomName = data.name;
        const chatData = data.chatData || [];

        if (!roomName) return;
        //xoa tin nhan cu trong rudux để render lai
        dispatch(clearGroupMessages({ nameGroup: roomName }));
        const sorted = [...chatData].sort(
            (a, b) => new Date(a.createAt) - new Date(b.createAt)
        );
        sorted.forEach((msg) => {
            const isSentByMe = msg.name === infor.name;

            dispatch(
                saveGroupMess({
                    nameGroup: roomName,
                    messGroup: {
                        text: msg.mes,
                        sender: msg.name,
                        createdAt: msg.createAt,
                        isSentByUser: isSentByMe,
                    },
                    isHistory: true,
                })
            );
        });
    };
    const handleSendChat = (payload) => {
        const data = payload.data;
        const isSentByMe = data.name === infor.name;

        if (!isSentByMe) {
            dispatch(
                saveMessage({
                    name: data.name,
                    mess: {
                        text: data.mes,
                        sender: data.name,
                        isSentByUser: false,
                        createAt: data.createAt,
                    },
                })
            );
        }
    };

    // Xử lý khi nhận được tin nhắn tư nhóm
    const handleSendChatToRoom = (payload) => {

        const data = payload.data || payload;

        const isSentByMe = data.from === infor.name;
        if (!isSentByMe) {
            dispatch(
                saveGroupMess({
                    nameGroup: data.to,
                    messGroup: {
                        text: data.mes,
                        sender: data.name,
                        createdAt: data.createAt,
                        isSentByUser: false,
                    },
                })
            );
        }
    };
    useEffect(() => {
        if (!messages.length) return;

        const raw = messages[messages.length - 1];
        const evt = raw.event || raw.data?.event;
        const payload = raw.data ? raw : raw;

        if (!evt) return;

        switch (evt) {
            case "GET_PEOPLE_CHAT_MES":
                handleGetPeopleChatMes(payload);
                break;

            case "GET_ROOM_CHAT_MES":
                handleGetRoomChatMes(payload);
                break;

            case "SEND_CHAT": {

                const coreData = payload.data || {};

                const isGroupMessage =
                    payload.type === "room" ||
                    coreData.type === 1 ||
                    coreData.type === "room";

                if (isGroupMessage) {
                    handleSendChatToRoom(payload);
                } else {
                    handleSendChat(payload);
                }
                break;
            }
            case "CHECK_USER_ONLINE": {

                const isOnline = payload.data?.status;
                const userCheck = checkStatusQueue.current.shift();
                if (userCheck) {
                    dispatch(checkOnline({
                        user: userCheck,
                        status: isOnline
                    }));
                }
                break;
            }
            default:
                break;
        }
    }, [messages]);

    // tìm và mo khung chat user
    const findFriend = () => {
        const nameFriend = searchValue.trim();

        if (!nameFriend) return;
        if (nameFriend === infor.name) {
            toast({ title: "Bạn không thể thêm chính mình", status: "warning", duration: 2000 });
            return;
        }
        const isExist = all.find(f => f.name === nameFriend);
        console.log("friend có ton tai trong danh sach bạn bè: ", isExist)
        if (isExist) {
            handleItemClick(isExist);
            setSearchValue("");
            return;
        }

        const newFriend = {
            name: nameFriend,
            type: 0,
            lastMessage: null,
            actionTime: new Date().toISOString()
        };
        dispatch(setFriends({ item: newFriend }));

        // mơ khung chaty
        handleItemClick(newFriend);

        setSearchValue("");
        toast({ title: `Đã thêm ${nameFriend}`, status: "success", duration: 3000 });
    };


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
                                isOnline={item.isOnline}
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
