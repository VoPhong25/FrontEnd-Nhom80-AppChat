import { useState, useEffect } from "react";
import { WebSocketContext } from "./WebSocketContext";
import useWebSocket from "react-use-websocket";
import {RE_LOGIN} from "../api/action.js";

function WebSocketProvider({ children }) {
    const [isReady, setIsReady] = useState(false);
    const [messages, setMessages] = useState([]);

    const { sendJsonMessage, lastJsonMessage } = useWebSocket("wss://chat.longapp.site/chat/chat", {
        onOpen: () => {
            setIsReady(true);
            console.log("WebSocket connected");
        },
        onClose: () => {
            setIsReady(false);
            console.log("WebSocket disconnected");
        },
    });
    useEffect(() => {
        if (lastJsonMessage) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMessages((prev) => [...prev, lastJsonMessage]);
        }
    }, [lastJsonMessage]);

    const ret = {
        isReady,
        messages,
        sendJsonMessage,
    };

    return (
        <WebSocketContext.Provider value={ret}>
            {children}
        </WebSocketContext.Provider>
    );
}

export default WebSocketProvider;
