const id01 = document.getElementById('id01');
const id02 = document.getElementById('id02');

const signup_BTN = document.querySelector('.signup_btn');
const close = document.querySelector('.close');
const toSignup = document.querySelector('.toSignup');
const toSignin = document.querySelector('.toSignin')
const logoutBtn = document.querySelector(".logoutBtn")

signup_BTN.onclick = function () {
    id01.style.display = "block";
}

close.onclick = function (event) {
    if (event.target == close) {
        id01.style.display = "none";
    }
}

toSignup.onclick = function () {
    id01.style.display = "none";
    id02.style.display = "block";
}

toSignin.onclick = function () {
    id01.style.display = "block";
    id02.style.display = "none";
}


// -------------------------------------------------

const signupbtn = document.querySelector(".signupbtn");
const ok = document.getElementsByClassName("ok");
const notok = document.getElementsByClassName("notok");

signupbtn.addEventListener("click", function () {
    const signup_name = document.querySelector(".signup_name").value;
    const signup_email = document.querySelector(".signup_email").value;
    const signup_password = document.querySelector(".signup_password").value;

    let entry = {
        name: signup_name,
        email: signup_email,
        password: signup_password
    };

    fetch('/api/user', {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(entry),
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        })
    }).then(function (response) {
        if (response.status !== 200) {
            // console.log(`Response status was not 200:${response.status}`)
            document.getElementById("registerText").textContent = "註冊失敗，Email已被註冊過或未輸入";
            document.getElementById("registerTextOK").textContent = "";
            // return;
        } else {
            response.json().then(function (data) {
                document.getElementById("registerTextOK").textContent = "註冊成功，歡迎光臨";
                document.getElementById("registerText").textContent = "";
            })
        }
    })
});



const signinbtn = document.querySelector(".signinbtn");
signinbtn.addEventListener("click", function () {
    const login_email = document.querySelector(".login_email").value;
    const login_password = document.querySelector(".login_password").value;
    let entry = {
        email: login_email,
        password: login_password
    };

    fetch('/api/user/auth', {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(entry),
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        })
    }).then(function (response) {
        if (response.status !== 200) {
            // console.log(`Response status was not 200:${response.status}`)
            document.getElementById("messageText").textContent = '登入失敗，帳號或密碼錯誤'
            ok.style.display = "none";
            notok.style.display = "block";
            return;
        } else {
            response.json().then(function () {
                location.reload();
            })
        }
    })
})



window.addEventListener("load", function () {
    fetch('/api/user/auth', {
        method: "GET"
    }).then(function (response) {
        return response.json()
    }).then(function (data) {

        if (data.data == null) {
            return;
        }
        else {
            logoutBtn.style.display = "block";
            signup_BTN.style.display = "none";
        }
    })
})

logoutBtn.addEventListener("click", function () {
    fetch('/api/user/auth', {
        method: "DELETE"
    }).then(function (response) {
        if (response.status == 200) {
            logoutBtn.style.display = "none";
            signup_BTN.style.display = "block";
        }
    })
})