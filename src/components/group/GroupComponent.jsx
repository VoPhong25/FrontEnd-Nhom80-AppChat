import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
import {
    Phone,
    Video,
    Menu,
    Smile,
    Paperclip,
    Send,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import { WebSocketContext } from "../../socket/WebSocketContext";
import {
    GET_ROOM_CHAT_MES,
    SEND_CHAT_TO_ROOM,
} from "../../api/action";

import { saveGroupMess } from "../../redux/userSlice";
import "../chat/Chat.css";

const GroupComponent = ({ group }) => {
    const { isReady, sendJsonMessage } = useContext(WebSocketContext);
    const dispatch = useDispatch();
    const toast = useToast();
    const messagesBoxRef = useRef(null);

    const { infor } = useSelector((state) => state.user);

    const [currentRoom, setCurrentRoom] = useState("");
    const [outMessage, setOutMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const groupData = useSelector((s) =>
        s.user.infor.groups.find((g) => g.nameGroup === currentRoom)
    );

    const displayMessages = groupData?.listmessage || [];

    useEffect(() => {
        if (!group?.nameGroup || !isReady) return;

        setCurrentRoom(group.nameGroup);
        sendJsonMessage(GET_ROOM_CHAT_MES(group.nameGroup));
    }, [group, isReady, sendJsonMessage]);

    useEffect(() => {
        if (messagesBoxRef.current) {
            messagesBoxRef.current.scrollTop =
                messagesBoxRef.current.scrollHeight;
        }
    }, [displayMessages.length]);

    const sendMessageToRoom = () => {
        if (!currentRoom || !outMessage.trim()) return;
        if (!isReady) {
            toast({
                title: "WebSocket chưa sẵn sàng",
                status: "error",
                duration: 2000,
            });
            return;
        }

        const createdAt = new Date().toISOString();
        dispatch(
            saveGroupMess({
                nameGroup: currentRoom,
                messGroup: {
                    text: outMessage,
                    sender: infor.name,
                    createdAt,
                },
            })
        );

        sendJsonMessage(SEND_CHAT_TO_ROOM(currentRoom, outMessage));
        setOutMessage("");
        setShowEmojiPicker(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessageToRoom();
        }
    };

    const handleEmojiClick = (e) => {
        setOutMessage((prev) => prev + e.emoji);
    };

    return (
        <div className="chatContainer" style={{ height: "100%" }}>
            <div className="header" style={{ justifyContent: "space-between" }}>
                <div className="item">
                    <div className="img">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/681/681494.png"
                            alt="group"
                        />
                    </div>
                    <div className="name">
                        <span>{currentRoom || "Chưa chọn nhóm"}</span>
                    </div>
                </div>

                <div className="icons">
                    <Phone size={18} />
                    <Video size={18} />
                    <Menu size={18} />
                </div>
            </div>

            <div className="main" ref={messagesBoxRef}>
                {displayMessages.length > 0 ? (
                    displayMessages.map((m, i) => (
                        <div
                            key={i}
                            className={`message ${
                                m.isSentByUser ? "right" : "left"
                            }`}
                        >
                            {!m.isSentByUser && (
                                <div
                                    style={{
                                        fontSize: 10,
                                        fontWeight: "bold",
                                        marginBottom: 2,
                                        color: "#444",
                                    }}
                                >
                                    {m.sender}
                                </div>
                            )}
                            <div className="messageText">{m.text}</div>
                        </div>
                    ))
                ) : (
                    <div
                        style={{
                            textAlign: "center",
                            color: "#999",
                            marginTop: 20,
                        }}
                    >
                        {currentRoom
                            ? "Chưa có tin nhắn nào."
                            : "Chọn nhóm để bắt đầu chat."}
                    </div>
                )}
            </div>

            {showEmojiPicker && (
                <div className="emojiPicker">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        height={350}
                        width="100%"
                    />
                </div>
            )}

            <div className="footer">
                <input
                    className="input"
                    placeholder={
                        currentRoom
                            ? `Nhắn tin tới ${currentRoom}...`
                            : "Chọn nhóm trước"
                    }
                    value={outMessage}
                    onChange={(e) => setOutMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!currentRoom}
                />

                <div className="sendItem">
                    <Smile
                        size={20}
                        className="icon"
                        onClick={() =>
                            setShowEmojiPicker((prev) => !prev)
                        }
                    />

                    <label style={{ cursor: "pointer", display: "flex" }}>
                        <Paperclip size={20} className="icon" />
                        <input type="file" hidden disabled />
                    </label>

                    <Send
                        size={20}
                        className="icon"
                        onClick={sendMessageToRoom}
                        style={{
                            color:
                                currentRoom && outMessage
                                    ? "#2563eb"
                                    : "#ccc",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default GroupComponent;
