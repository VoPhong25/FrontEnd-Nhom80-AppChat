import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { WebSocketContext } from "../../socket/WebSocketContext";
import { setFriends, setGroups } from "../../redux/userSlice";

import Chat from "../../components/chat/Chat.jsx";
import List from "../../components/list/List.jsx";
import GroupComponent from "../../components/group/GroupComponent.jsx";
import "./Home.css";

function Home() {
    const { isReady, messages, sendJsonMessage } = useContext(WebSocketContext);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector((state) => state.user);
    console.log('user', user)
    const [selectedUser, setSelectedUser] = useState(null);
    const inputRef = useRef(null);

    // neu chưa login thì đá về trang login
    useEffect(() => {
        if (user.status !== "auth") {
            navigate("/");
        }
    }, [user.status, navigate]);

    //Lấy message mới nhất
    useEffect(() => {
        if (!messages.length) return;

        const lastMessage = messages[messages.length - 1];

        if (lastMessage.status === "success") {
            handleSuccessEvent(lastMessage);
        }

        if (lastMessage.status === "error") {
            handleErrorEvent(lastMessage);
        }
    }, [messages]);

    //event 'success'
    const handleSuccessEvent = (payload) => {
        switch (payload.event) {
            case "GET_USER_LIST":
                handleUserList(payload.data);
                break;
            case "CREATE_ROOM":
            case "JOIN_ROOM":
                handleCreateOrJoinRoom(payload.data);
                break;

            default:
                break;
        }
    };

    //xử ly khi gặp lỗi
    const handleErrorEvent = (payload) => {
        switch (payload.event) {
            case "JOIN_ROOM":
                alert("Room không tồn tại");
                break;
            default:
                break;
        }
    };
    //type === 0 là friend, type===1 là group
    const handleUserList = (list) => {
        list.forEach((item) => {
            if (item.type === 0) {
                dispatch(setFriends({ item }));
            } else {
                dispatch(setGroups({ item }));
            }
        });
    };

    const handleCreateOrJoinRoom = (data) => {
       // TODO ??
    };

    //xoa chat cu khi chọn người mới
    const clearChatInput = () => {
        if (inputRef.current) {
            inputRef.current.clearInput();
        }
    };

    //set Usser khi chọn user mới
    const handleSelectUser = (user) => {
        setSelectedUser(user);
        clearChatInput();
    };
    return (
        <div className="home">
            <div className="content-container">
                {/* home left */}
                <div className="list-container">
                    <List setChatUser={handleSelectUser}
                          selectedUser={selectedUser}/>
                </div>

                {/* home right */}
                <div className="chat-container">
                    {!selectedUser && (
                        <div className="empty-chat">Trống</div>
                    )}
                    {selectedUser?.type === 0 && (
                        <Chat ref={inputRef} friend={selectedUser} />
                    )}
                    {selectedUser?.type === 1 && (
                        <GroupComponent ref={inputRef} group={selectedUser} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
