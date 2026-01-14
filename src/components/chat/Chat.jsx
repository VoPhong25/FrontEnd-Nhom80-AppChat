import {
    forwardRef,
    useContext,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { SEND_CHAT } from "../../api/action";
import { saveMessage } from "../../redux/userSlice";
import Message from "../message/Message";
import { getTimeGapLabel } from "../untils/time";

import "./Chat.css";

const Chat = ({ friend }, ref) => {
    const { isReady, sendJsonMessage } = useContext(WebSocketContext);
    const dispatch = useDispatch();

    const { infor } = useSelector((state) => state.user);
    const friends = infor.friends || [];

    const currentFriend = friends.find(
        (f) => f.name === friend.name
    );
    // console.log("nguoi nhận: ", currentFriend)
    // console.log("friend : ", friend)

    const messages = [...(currentFriend?.listmessage || [])].sort(
        (a, b) => new Date(a.time) - new Date(b.time)
    );


    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const inputRef = useRef(null);

    //ham sen chat
    const handleSendMessage = () => {
        if (!isReady) return;

        let messageToSend = newMessage.trim();

        console.log("toan bọ tin nhắn: ", messageToSend)

        if (!messageToSend) return;

        dispatch(
            saveMessage({
                name: friend.name,
                mess: {
                    text: messageToSend,
                    sender: infor.name,
                    isSentByUser: true,
                    createAt: new Date().toISOString()
                },
            })
        );

        sendJsonMessage(
            SEND_CHAT(friend.name, messageToSend)
        );

        setNewMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleEmojiClick = (e) => {
            setNewMessage((prev) => prev + e.emoji);
        setShowEmojiPicker(false);
    };

    useImperativeHandle(ref, () => ({
        clearInput() {
            setNewMessage("");
        },
    }));

    return (
        <div className="chatContainer">
            <div className="header">
                <div className="item">
                    <div className="img">
                        <img
                            src="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
                            alt="avatar"
                        />
                    </div>

                    <div className="name">
                        <span>
                            {friend.name}
                        </span>
                    </div>

                    <div className="icons">
                        <Phone size={18} />
                        <Video size={18} />
                        <Menu size={18} />
                    </div>
                </div>
            </div>

            <div className="main">
                {messages.map((m, i) => {
                    const prevMessage = messages[i - 1];
                    const timeLabel = getTimeGapLabel(
                        prevMessage?.time,
                        m.time
                    );
// console.log("prevTime: ",   prevMessage?.time)
//                     console.log("m: ",   m.time)
                    return (
                        <div key={i}>
                            {timeLabel && (
                                <div className="timeSeparator">
                                    {timeLabel}
                                </div>
                            )}

                            <Message
                                text={m.text}
                                sender={m.sender}
                                isSentByUser={m.isSentByUser}
                                createAt={m.time}
                            />
                        </div>
                    );
                })}
            </div>

            {showEmojiPicker && (
                <div className="emojiPicker">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}

            <div className="footer">
                <input
                    ref={inputRef}
                    className="input"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <div className="sendItem">
                    <Smile
                        size={20}
                        className="icon"
                        onClick={() =>
                            setShowEmojiPicker((prev) => !prev)
                        }
                    />

                    <label htmlFor="fileInput">
                        <Paperclip size={20} className="icon" />
                    </label>

                    <input
                        id="fileInput"
                        type="file"
                        hidden
                    />

                    <Send
                        size={20}
                        className="icon"
                        onClick={handleSendMessage}
                    />
                </div>
            </div>
        </div>
    );
};

export default forwardRef(Chat);
