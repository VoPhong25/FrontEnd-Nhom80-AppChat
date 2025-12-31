function isEmail(value) {
    const regex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return value && regex.test(value);
}

function isPassValid(value) {
    return value && value.length >= 5;
}

function isConfirmPass(confirm, pass) {
    return confirm && confirm === pass;
}

function isNotEmpty(value) {
    return value && value.length > 0;
}

export { isEmail, isPassValid, isConfirmPass, isNotEmpty };
