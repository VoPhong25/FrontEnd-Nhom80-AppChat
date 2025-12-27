import "../login/Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    isPassValid,
    isConfirmPass,
    isNotEmpty,
} from "../../validate/checkInput";

const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const handleNavigate = () => navigate("/")

    const handleSubmit = (e) => {
        console.log("SUBMIT CLICKED");

        e.preventDefault();
        setError("");

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

        // TODO: xử lý gọi api đăng ký
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

                <p className="mt-3">Bạn đã có tài khoản?  <span onClick={handleNavigate} className='ml-2  text-blue-600 cursor-pointer'>Đăng nhập</span></p>

            </form>
        </div>
    );
};

export default Signup;
