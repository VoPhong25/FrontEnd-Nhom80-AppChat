import "./Login.css";
import { useState } from "react";
import {useNavigate} from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Username:", username);
        console.log("Password:", password);
        // TODO: gọi API login ở đây
    };
    const handleNavigate = () => navigate("/signup")

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2 >Đăng nhập</h2>

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
                <p className="mt-3">Bạn chưa có tài khoản?  <span onClick={handleNavigate} className='ml-2  text-blue-600 cursor-pointer'>Đăng ký</span></p>
            </form>
        </div>
    );
};

export default Login;
