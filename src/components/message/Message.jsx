import React, { useEffect, useRef } from "react";
import "./Message.css";

const Message = ({ text, isSentByUser }) => {
    const messageRef = useRef(null);



    useEffect(() => {
        // Cuộn tới in nhắn cuối cùng
        if (messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [text]); // Theo dõi thay đổi của tin nhắn để cuộn

    return (
        <div ref={messageRef} className={`messageContainer ${isSentByUser ? "sent" : "received"}`}>
            {!isSentByUser && (
                <div className="avatar">
                    <img src={ "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"} alt="avatar"/>
                </div>
            )}
            <div className={`messageBox ${isSentByUser ? "sentMessage" : "receivedMessage"}`}>
                <p className="messageText">{text}</p>
            </div>
        </div>
    );
};

export default Message;