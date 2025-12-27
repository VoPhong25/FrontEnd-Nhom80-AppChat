const REGISTER = (user, pass) => {
    return {
        action: "onchat",
        data: {
            event: "REGISTER",
            data: {
                user,
                pass,
            },
        },
    };
};

const Login = (user, pass) => {
    return {
        action: "onchat",
        data: {
            event: "LOGIN",
            data: {
                user,
                pass,
            },
        },
    };
};

const RE_LOGIN = (user) => {
    return {
        action: "onchat",
        data: {
            event: "RE_LOGIN",
            data: {
                user,
                code: "nlu_2055829137",
            },
        },
    };
};
export {
    REGISTER,
    Login,
    RE_LOGIN};