import React, { useContext, useMemo, useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { WebSocketContext } from "../../socket/WebSocketContext";
import {
    CREATE_ROOM,
    JOIN_ROOM,
    GET_ROOM_CHAT_MES,
    SEND_CHAT_TO_ROOM,
} from "../../api/action";
import "../friend/Friend.css";
import { useSelector } from "react-redux";

const GroupComponet = ({ group }) => {
    const { isReady, messages, sendJsonMessage } = useContext(WebSocketContext);
    const toast = useToast();

    const [roomName, setRoomName] = useState("");
    const [currentRoom, setCurrentRoom] = useState("");
    // subscribedRooms removed — history is auto-loaded on group select
    const [outMessage, setOutMessage] = useState("");
    const [pendingCreate, setPendingCreate] = useState(false);
    const [pendingJoin, setPendingJoin] = useState(false);
    const user = useSelector((s) => s.user || {});

    const createRoom = async () => {
        if (!roomName) return;
        const payload = CREATE_ROOM(roomName);
        console.log("Sending CREATE_ROOM:", payload);
        if (!sendJsonMessage) {
            toast({ title: "WebSocket send not ready", status: "error", duration: 3000 });
            return;
        }
        sendJsonMessage(payload);
        setPendingCreate(true);
    };

    const joinRoom = async () => {
        if (!roomName) return;
        const payload = JOIN_ROOM(roomName);
        console.log("Sending JOIN_ROOM:", payload);
        if (!sendJsonMessage) {
            toast({ title: "WebSocket send not ready", status: "error", duration: 3000 });
            return;
        }
        sendJsonMessage(payload);
        setPendingJoin(true);
    };

    // history load removed as it's requested automatically on group change

    const sendMessageToRoom = () => {
        if (!currentRoom || !outMessage) return;
        sendJsonMessage(SEND_CHAT_TO_ROOM(currentRoom, outMessage));
        setOutMessage("");
    };
    useEffect(() => {
        if (group && group.nameGroup) {
            setCurrentRoom(group.nameGroup);
            setRoomName(group.nameGroup);
            try {
                if (sendJsonMessage) sendJsonMessage(GET_ROOM_CHAT_MES(group.nameGroup));
            } catch (e) {
                // ignore
            }
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
            const serverMessage = last.message || last.mes || payload.message || payload.mes || JSON.stringify(last);
            toast({ title: evt, description: serverMessage, status: "error", duration: 6000 });

            setPendingCreate(false);
            setPendingJoin(false);
            return;
        }

        if (evt === "CREATE_ROOM") {
            if (pendingCreate && payload && payload.name === roomName) {
                setPendingCreate(false);
                if (status === "success") {
                    toast({ title: `Room '${roomName}' created`, status: "success", duration: 3000 });
                } else if (status === "error") {
                    toast({ title: `Create room failed: ${last.message || "server error"}`, status: "error", duration: 4000 });
                }
            }
        }

        if (evt === "JOIN_ROOM") {
            if (pendingJoin && payload && payload.name === roomName) {
                setPendingJoin(false);
                if (status === "success") {
                    setCurrentRoom(payload.name);
                    toast({ title: `Joined '${payload.name}'`, status: "success", duration: 3000 });
                } else if (status === "error") {
                    toast({ title: `Join room failed: ${last.message || "server error"}`, description: JSON.stringify(last), status: "error", duration: 6000 });
                }
            }
        }
    }, [messages]);

    const roomMessages = useMemo(() => {
        if (!currentRoom) return [];
        return messages
            .filter((m) => m && m.data)
            .filter((m) => {
                try {
                    const evt = m.data.event || (m.action && m.action.event);
                    const payload = m.data.data || m.data;
                    if (!evt && payload && payload.type === "room" && payload.to === currentRoom) return true;
                    if (evt === "SEND_CHAT") {
                        const d = m.data.data || {};
                        return d.type === "room" && d.to === currentRoom;
                    }
                    if (evt === "GET_ROOM_CHAT_MES") {
                        const d = m.data.data || {};
                        try {
                            // removed pendingHistory/subscribedRooms handling — history is considered requested on group open
                        } catch (e) {
                           
                        }
                        return d.name === currentRoom || d.to === currentRoom;
                    }
                    if (evt === "CREATE_ROOM" || evt === "JOIN_ROOM") {
                        const d = m.data.data || {};
                        return d.name === currentRoom || d.to === currentRoom;
                    }
                } catch (e) {
                    return false;
                }
                return false;
            })
            .map((m, i) => ({ id: i, raw: m }));
    }, [messages, currentRoom]);

    // produce a simplified list of messages for UI bubbles (from websocket raw messages)
    const wsDisplayMessages = useMemo(() => {
        const out = [];
        roomMessages.forEach((entry) => {
            const raw = entry.raw;
            const evt = raw.event || (raw.data && raw.data.event);
            const payload = raw.data ? raw.data.data || raw.data : raw;
            if (evt === "GET_ROOM_CHAT_MES" && payload && Array.isArray(payload.chatData)) {
                payload.chatData.forEach((c) => out.push({ text: c.mes, sender: c.name, time: c.createAt }));
            } else if (evt === "SEND_CHAT") {
                const d = raw.data.data || {};
                if (d.type === "room") out.push({ text: d.mes, sender: d.from || d.name, time: d.createAt || new Date().toISOString() });
            } else if (payload && payload.mes) {
                out.push({ text: payload.mes, sender: payload.name || payload.sender, time: payload.createAt || payload.createdAt });
            }
        });
        return out;
    }, [roomMessages]);

    // Prefer messages saved in Redux (List.jsx parses server responses and saved them there)
    const reduxGroupMessages = useMemo(() => {
        try {
            const groups = (user.infor && user.infor.groups) || [];
            const g = groups.find((gg) => gg.nameGroup === currentRoom) || null;
            if (!g || !Array.isArray(g.listmessage) || !g.listmessage.length) return [];
            return g.listmessage.map((m) => ({ text: m.text, sender: m.sender, time: m.time }));
        } catch (e) {
            return [];
        }
    }, [user, currentRoom]);

    const displayMessages = reduxGroupMessages.length ? reduxGroupMessages : wsDisplayMessages;

    return (
        <div className="groupPanel">
            <h3 style={{marginBottom:8}}>Group chat</h3>

            <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:10}}>
                <input
                    placeholder="Room name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    style={{flex:1, padding:8}}
                />
                {!currentRoom && (
                    <>
                        <button onClick={createRoom} disabled={!isReady || !roomName}>Create</button>
                        <button onClick={joinRoom} disabled={!isReady || !roomName}>Join</button>
                    </>
                )}
            </div>

            <div style={{marginBottom:8}}><strong>Current:</strong> {currentRoom || '(none)'}</div>

            <div style={{border:'1px solid #eee', padding:12, borderRadius:8, height:280, overflowY:'auto', background:'#fafafa'}}>
                {displayMessages.length ? displayMessages.map((m, i) => (
                    <div key={i} style={{display:'flex', justifyContent: (m.sender === 'me')? 'flex-end':'flex-start', marginBottom:8}}>
                        <div style={{maxWidth:'70%', padding:10, borderRadius:12, background: (m.sender === 'me')? '#DCF8C6':'#fff', boxShadow:'0 1px 1px rgba(0,0,0,0.06)'}}>
                            <div style={{fontSize:14, marginBottom:6}}>{m.text}</div>
                            <div style={{fontSize:11, color:'#666', textAlign:'right'}}>{m.sender || ''}</div>
                        </div>
                    </div>
                )) : (
                    <div style={{color:'#666'}}>No messages yet for this room.</div>
                )}
            </div>

            <div style={{display:'flex', gap:8, marginTop:10}}>
                <input placeholder="Type a message" value={outMessage} onChange={(e)=>setOutMessage(e.target.value)} style={{flex:1, padding:8}} disabled={!currentRoom} />
                <button onClick={sendMessageToRoom} disabled={!currentRoom || !outMessage}>Send</button>
            </div>
        </div>
    );
};

export default GroupComponet;