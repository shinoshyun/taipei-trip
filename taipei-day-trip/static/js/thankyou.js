const number = document.querySelector(".thxContainer h3");

const pathArray = location.href.split('=');

const orderNumber = pathArray[1];
number.textContent = "訂單編號：" + orderNumber;