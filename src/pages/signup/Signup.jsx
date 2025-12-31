import "../login/Login.css";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";

import {
    isPassValid,
    isConfirmPass,
    isNotEmpty,
} from "../../validate/checkInput";

import { WebSocketContext } from "../../socket/WebSocketContext";
import { REGISTER } from "../../api/action";
import {useToast} from "@chakra-ui/react";


const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const toast = useToast();

    const navigate = useNavigate();
    const [hasSubmitted, setHasSubmitted] = useState(false);


    // lấy dữ liệu từ WebSocket
    const { isReady, messages, sendJsonMessage } =
        useContext(WebSocketContext);

    const handleNavigate = () => navigate("/");

    useEffect(() => {
        if (!hasSubmitted) return;
        if (!messages.length) return;

        const lastMsg = messages[messages.length - 1];

        if (lastMsg.event !== "REGISTER") return;

        if (lastMsg.status === "success") {
            toast({
                title: "Đăng ký thành công!",
                description: "Bạn đã đăng ký tài khoản thành công.",
                status: "success",
                duration: 6000,
                isClosable: true
            });

            setHasSubmitted(false);
            setTimeout(() => navigate("/"), 1500);
        } else {
            toast({
                title: "Đăng ký thất bại!",
                description: "Tên đăng nhập đã tồn tại.",
                status: "error",
                duration: 6000,
                isClosable: true
            });
            setHasSubmitted(false);
        }
    }, [messages, hasSubmitted]);
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        console.log("websocket", isReady)
        if (!isNotEmpty(username)) {
            setError("Vui lòng nhập tên đăng nhập");
            return;
        }

        if (!isPassValid(password)) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        if (!isConfirmPass(confirmPassword, password)) {
            setError("Mật khẩu nhập lại không khớp");
            return;
        }
        if (!isReady) {
            setError("WebSocket chưa sẵn sàng, vui lòng thử lại");
            return;
        }
        setHasSubmitted(true);
        sendJsonMessage(REGISTER(username, password));
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Đăng ký</h2>

                {error && <p className="text-red-500 mb-2">{error}</p>}

                <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Nhập lại mật khẩu</label>
                    <input
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Đăng ký</button>

                <p className="mt-3">
                    Bạn đã có tài khoản?
                    <span
                        onClick={handleNavigate}
                        className="ml-2 text-blue-600 cursor-pointer"
                    >
                        Đăng nhập
                    </span>
                </p>
            </form>
        </div>
    );
};

export default Signup;
