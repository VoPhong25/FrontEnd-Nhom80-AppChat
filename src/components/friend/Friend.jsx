import React from "react";
import "./Friend.css";

const Friend = ({ img, name, time, message, unread,isActive, onClick }) => {
    return (
        <div
            className={`friend ${unread > 0 ? "unread" : ""} ${isActive ? "active" : ""}`}
            onClick={onClick}
        >
            <div className="friendItem">
                <div className="item">
                    <div className="img">
                        <img src= "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" alt=""/>
                    </div>
                    <div className="name">
                        <div className="info">
                            <span>{name}</span>
                            <span>{time}</span>
                        </div>
                        <div className="text">
                            <span>{message}</span>
                            {unread > 0 && <div className="unread">{unread}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Friend;