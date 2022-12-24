const haventBooking = document.querySelector(".haventBooking");
const haveBooking = document.querySelector(".haveBooking");
const deleteBox = document.querySelector(".deleteBox");

fetch('/api/user/auth', {
    method: "GET"
}).then(function (response) {
    return response.json()
}).then(function (data) {
    // console.log(data);
    if (data.data == null) {
        location.href = "/";
    }
    else {
        memberName = data.data.name
        document.querySelector("#memberName").textContent = memberName;
    }
})



fetch('/api/booking', {
    method: "GET"
}).then(function (response) {
    return response.json()
}).then(function (data) {

    if (data.data == null) {
        return;
    }
    else {
        haventBooking.style.display = "none";
        haveBooking.style.display = "block";
        const attractionInfo = data.data.attraction;
        const dateInfo = data.data;

        document.getElementById("infoName").textContent = attractionInfo.name;
        document.querySelector(".place h3").textContent = attractionInfo.address;
        document.querySelector(".date h3").textContent = dateInfo.date;

        const price = dateInfo.price;
        if (price == 2000) {
            document.querySelector(".money h3").textContent = "新台幣 " + price + " 元";
            document.querySelector(".pay h2").textContent = "總價：新台幣 " + price + " 元";
        } else {
            document.querySelector(".money h3").textContent = "新台幣 " + price + " 元";
            document.querySelector(".pay h2").textContent = "總價：新台幣 " + price + " 元";
        }

        const time = dateInfo.time;
        if (time == "morning") {
            document.querySelector(".time h3").textContent = "早上 9 點到下午 4 點";
        } else {
            document.querySelector(".time h3").textContent = "下午 1 點到晚上 8 點";
        }

        const image = attractionInfo.image;
        const imgSrc = document.createElement("img");
        imgSrc.setAttribute("src", image);
        document.querySelector(".picture").appendChild(imgSrc);
    }
})

deleteBox.addEventListener("click", function () {
    fetch('/api/booking', {
        method: "DELETE"
    }).then(function (response) {
        if (response.status !== 200) {
            return;
        } else {
            location.reload();
        }
    })
})



