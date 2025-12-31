import { createContext } from "react";

export const WebSocketContext = createContext({
    isReady: false,
    messages: [],
    sendJsonMessage: () => {},
});
