import "./Login.css";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useToast } from "@chakra-ui/react";

import { WebSocketContext } from "../../socket/WebSocketContext";
import {LOGIN, GET_USER_LIST } from "../../api/action";
import { setUser } from "../../redux/userSlice";
import {isNotEmpty, isPassValid} from "../../validate/checkInput";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const toast = useToast();
    const [error, setError] = useState("");

    const { isReady, messages, sendJsonMessage } =
        useContext(WebSocketContext);

    useEffect(() => {
        if (!hasSubmitted) return;
        if (!messages.length) return;

        const lastMsg = messages[messages.length - 1];
        console.log("status: ", lastMsg.status)

        if (lastMsg.event !== "LOGIN") return;

        if (lastMsg.status === "success") {
            const reloginCode = lastMsg.data.RE_LOGIN_CODE;

            localStorage.setItem("RE_LOGIN_CODE", reloginCode);
            localStorage.setItem("USERNAME", username);

            dispatch(setUser({ name: username }));

            toast({
                title: "Đăng nhập thành công",
                status: "success",
                duration: 2000,
            });
            sendJsonMessage(GET_USER_LIST())
            setHasSubmitted(false);
            navigate("/home");
        } else {
           setError("Tên đăng nhập hoặc mật khẩu không đúng.")
            setHasSubmitted(false);
        }
    }, [messages, hasSubmitted]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isNotEmpty(username)) {
            setError("Vui lòng nhập tên đăng nhập");
            return;
        }

        if (!isPassValid(password)) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        if (!isReady) {
            setError("WebSocket chưa sẵn sàng, vui lòng thử lại");
            return;
        }
        setHasSubmitted(true);
        sendJsonMessage(LOGIN(username, password));
    };


    const handleNavigate = () => navigate("/signup");

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Đăng nhập</h2>
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

                <button type="submit">Đăng nhập</button>

                <p className="mt-3">
                    Bạn chưa có tài khoản?
                    <span
                        onClick={handleNavigate}
                        className="ml-2 text-blue-600 cursor-pointer"
                    >
                        Đăng ký
                    </span>
                </p>
            </form>
        </div>
    );
};

export default Login;
