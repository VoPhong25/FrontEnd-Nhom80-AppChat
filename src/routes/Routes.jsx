import {Route, Routes} from "react-router-dom";
import Login from "../pages/login/Login.jsx";
import Signup from "../pages/signup/Signup.jsx";
import Home from "../pages/home/Home.jsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/home" element={<Home/>}/>
        </Routes>)
}
export default AppRoutes;