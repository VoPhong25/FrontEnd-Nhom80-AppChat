import React from "react";
import "./Friend.css";

const Friend = ({name, time, lastMessage, isActive, onClick }) => {
    return (
        <div
            className={`friend ${isActive ? "active" : ""}`}
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
                        </div>
                        <div className="text">
                            <span>{lastMessage}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Friend;