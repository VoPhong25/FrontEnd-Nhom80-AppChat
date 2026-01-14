import React, { useContext, useMemo, useState, useEffect, useRef } from "react";
import { useToast } from "@chakra-ui/react";
import { WebSocketContext } from "../../socket/WebSocketContext";
import {
    CREATE_ROOM,
    JOIN_ROOM,
    GET_ROOM_CHAT_MES,
    SEND_CHAT_TO_ROOM,
    RE_LOGIN
} from "../../api/action";
import { useSelector, useDispatch } from "react-redux";
import { saveGroupMess } from "../../redux/userSlice";

import { Phone, Video, Menu, Smile, Paperclip, Send, Users } from "lucide-react"; 
import EmojiPicker from "emoji-picker-react";
import "../chat/Chat.css"; 
// -----------------------------

const GroupComponet = ({ group }) => {
    const { isReady, messages, sendJsonMessage } = useContext(WebSocketContext);
    const toast = useToast();
    const dispatch = useDispatch();
    const user = useSelector((s) => s.user || {});


    const [roomName, setRoomName] = useState("");
    const [currentRoom, setCurrentRoom] = useState("");
    const [outMessage, setOutMessage] = useState("");
    const [pendingCreate, setPendingCreate] = useState(false);
    const [pendingJoin, setPendingJoin] = useState(false);
    
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesBoxRef = useRef(null);

    const myId = (user.infor && (user.infor.name || user.infor.email)) || "";

    const createRoom = async () => {
        if (!roomName) return;
        const payload = CREATE_ROOM(roomName);
        if (sendJsonMessage) {
            sendJsonMessage(payload);
            setPendingCreate(true);
        } else {
            toast({ title: "WebSocket not ready", status: "error", duration: 3000 });
        }
    };

    const joinRoom = async () => {
        if (!roomName) return;
        const payload = JOIN_ROOM(roomName);
        if (sendJsonMessage) {
            sendJsonMessage(payload);
            setPendingJoin(true);
        } else {
            toast({ title: "WebSocket not ready", status: "error", duration: 3000 });
        }
    };

    const sendMessageToRoom = () => {
        if (!currentRoom || !outMessage.trim()) return;
        if (!sendJsonMessage) return;

        try {
            const createdAt = new Date().toISOString();
            dispatch(
                saveGroupMess({
                    nameGroup: currentRoom,
                    messGroup: {
                        text: outMessage,
                        sender: myId,
                        isSentByUser: true,
                        createdAt,
                    },
                })
            );
        } catch (e) {}

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


    useEffect(() => {
        if (group && group.nameGroup) {
            setCurrentRoom(group.nameGroup);
            setRoomName(group.nameGroup);
            if (sendJsonMessage) sendJsonMessage(GET_ROOM_CHAT_MES(group.nameGroup));
        }
    }, [group]);

    useEffect(() => {
        if (!messages.length) return;
        const last = messages[messages.length - 1];
        if (!last) return;
        
        const evt = last.event || (last.data && last.data.event);
        const status = last.status;
        const payload = last.data ? last.data.data || last.data : last;

        if (!evt) return;

        if (evt === "ACTION_NOT_EXIT" || evt === "AUTH") {
             toast({ title: evt, description: payload.mes || "Error", status: "error", duration: 3000 });
             setPendingCreate(false); setPendingJoin(false);
             return;
        }

        if (evt === "CREATE_ROOM" && pendingCreate && payload.name === roomName) {
            setPendingCreate(false);
            if (status === "success") toast({ title: `Created '${roomName}'`, status: "success" });
        }

        if (evt === "JOIN_ROOM" && pendingJoin && payload.name === roomName) {
            setPendingJoin(false);
            if (status === "success") {
                setCurrentRoom(payload.name);
                toast({ title: `Joined '${payload.name}'`, status: "success" });
            }
        }
    }, [messages]);

    const roomMessages = useMemo(() => {
        if (!currentRoom) return [];
        return messages.filter(m => {
            try {
                const evt = m.event || (m.data && m.data.event);
                const p = m.data ? (m.data.data || m.data) : m;
    
                if ((evt === "SEND_CHAT" || !evt) && p.type === "room" && p.to === currentRoom) return true;
                if (evt === "GET_ROOM_CHAT_MES" && (p.name === currentRoom || p.to === currentRoom)) return true;
                return false;
            } catch(e) { return false; }
        }).map((m, i) => ({ id: i, raw: m }));
    }, [messages, currentRoom]);

    const displayMessages = useMemo(() => {

        const groups = (user.infor && user.infor.groups) || [];
        const g = groups.find((gg) => gg.nameGroup === currentRoom);
        
        if (g && Array.isArray(g.listmessage) && g.listmessage.length) {
            return g.listmessage.map(m => ({
                text: m.text,
                sender: m.sender,
                time: m.time,
                isSentByUser: m.sender === myId 
            }));
        }

        const out = [];
        roomMessages.forEach(entry => {
             const raw = entry.raw;
             const evt = raw.event || (raw.data && raw.data.event);
             const p = raw.data ? (raw.data.data || raw.data) : raw;
             
             if (evt === "GET_ROOM_CHAT_MES") {
                 const list = p.chatData || (p.data && p.data.chatData) || [];
                 if(Array.isArray(list)) list.forEach(c => out.push({
                     text: c.mes, sender: c.name, time: c.createAt, isSentByUser: c.name === myId
                 }));
             } else {
                 const sender = p.from || p.name || p.sender;
                 out.push({
                     text: p.mes, sender: sender, time: p.createAt || new Date().toISOString(), isSentByUser: sender === myId
                 });
             }
        });
        return out;
    }, [roomMessages, user, currentRoom, myId]);

    useEffect(() => {
        if(messagesBoxRef.current) messagesBoxRef.current.scrollTop = messagesBoxRef.current.scrollHeight;
    }, [displayMessages.length]);


    return (
        <div className="chatContainer" style={{height: '100%'}}>
            <div className="header" style={{justifyContent:'space-between'}}>
                <div className="item">
                    <div className="img">
                     
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/681/681494.png" 
                            alt="group-avatar"
                        />
                    </div>
                    <div className="name">
                        <span>{currentRoom || "Chưa chọn phòng"}</span>

                        <div style={{fontSize: 11, display:'flex', gap: 5, marginTop: 2}}>
                            <input 
                                placeholder="Nhập tên phòng..." 
                                value={roomName} 
                                onChange={e => setRoomName(e.target.value)}
                                style={{border:'1px solid #ddd', borderRadius:4, padding:'2px 5px', width: 120}}
                            />
                            {!currentRoom && (
                                <>
                                    <button onClick={createRoom} disabled={!isReady} style={{cursor:'pointer', padding:'2px 6px', fontSize:10, background:'#eee', border:'none', borderRadius:4}}>Tạo</button>
                                    <button onClick={joinRoom} disabled={!isReady} style={{cursor:'pointer', padding:'2px 6px', fontSize:10, background:'#eee', border:'none', borderRadius:4}}>Vào</button>
                                </>
                            )}
                        </div>
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
                        <div key={i} className={`message ${m.isSentByUser ? 'right' : 'left'}`}>
                        
                            {!m.isSentByUser && (
                                <div style={{fontSize: 10, fontWeight: 'bold', marginBottom: 2, color: '#444'}}>
                                    {m.sender}
                                </div>
                            )}
                            <div className="messageText">{m.text}</div>
                        </div>
                    ))
                ) : (
                    <div style={{textAlign:'center', color:'#999', marginTop: 20}}>
                        {currentRoom ? "Chưa có tin nhắn nào." : "Hãy nhập tên phòng để tham gia."}
                    </div>
                )}
            </div>

            {showEmojiPicker && (
                <div className="emojiPicker">
                    <EmojiPicker onEmojiClick={handleEmojiClick} height={350} width="100%" />
                </div>
            )}

            <div className="footer">
                <input
                    className="input"
                    placeholder={currentRoom ? `Nhắn tin tới ${currentRoom}...` : "Chọn phòng trước"}
                    value={outMessage}
                    onChange={(e) => setOutMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!currentRoom}
                />

                <div className="sendItem">
                    <Smile
                        size={20}
                        className="icon"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                    />
                    
                    <label style={{cursor: 'pointer', display:'flex'}}>
                        <Paperclip size={20} className="icon" />
                        <input type="file" hidden disabled={!currentRoom}/>
                    </label>

                    <Send
                        size={20}
                        className="icon"
                        onClick={sendMessageToRoom}
                        style={{color: (currentRoom && outMessage) ? '#2563eb' : '#ccc'}}
                    />
                </div>
            </div>
        </div>
    );
};

export default GroupComponet;