TPDirect.setupSDK(126935, 'app_KbfQN6i1plwtNwkzIF2kjMjPsDDmGaylF4OWWFCf6XmROw42hpaSnJHQeixh', 'sandbox')

const payBtn = document.querySelector(".pay button");
const cardNumber = document.querySelector(".creditName h3");
const cardDate = document.querySelector(".creditEmail h3");
const cardCCV = document.querySelector(".creditPassword h3");

let attractionInfo = {};
let dateInfo = {};
let prime = "";



TPDirect.card.setup({
    fields: {
        number: {
            element: '#card-number',
            placeholder: '**** **** **** ****',
            value: '4242 4242 4242 4242'
        },
        expirationDate: {
            element: document.getElementById('card-expiration-date'),
            placeholder: 'MM / YY',
            value: 01 / 23
        },
        ccv: {
            element: '#card-ccv',
            placeholder: 'ccv',
            value: '123'
        }
    },

    styles: {
        "input": {
            'color': '#666666'
        },
        'input.ccv': {
            'font-size': '16px'
        },
        'input.expiration-date': {
            'font-size': '16px'
        },
        'input.card-number': {
            'font-size': '16px'
        },
        ':focus': {
            'color': '#666666'
        },
        '.valid': {
            'color': 'green'
        },
        '.invalid': {
            'color': 'red'
        },
    },
    // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11
    }
});

TPDirect.card.onUpdate(function (update) {
    // update.canGetPrime === true
    // --> you can call TPDirect.card.getPrime()
    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        // submitButton.removeAttribute('disabled')
    } else {
        // Disable submit Button to get prime.
        // submitButton.setAttribute('disabled', true)
    }

    if (update.cardType === 'visa') {
    }

    // number 欄位是錯誤的
    if (update.status.number === 2) {
        cardNumber.textContent = "輸入錯誤";
        cardNumber.style.color = "red";

    } else if (update.status.number === 0) {
        cardNumber.textContent = "輸入成功";
        cardNumber.style.color = "green";
    }

    if (update.status.expiry === 2) {
        cardDate.textContent = "輸入錯誤";
        cardDate.style.color = "red";
    } else if (update.status.expiry === 0) {
        cardDate.textContent = "輸入成功";
        cardDate.style.color = "green";
    }

    if (update.status.ccv === 2) {
        cardCCV.textContent = "輸入錯誤";
        cardCCV.style.color = "red";
    } else if (update.status.ccv === 0) {
        cardCCV.textContent = "輸入成功";
        cardCCV.style.color = "green";
    }
});

payBtn.addEventListener("click", function (event) {
    const contactName = document.querySelector(".contactName input").value;
    const contactEmail = document.querySelector(".contactEmail input").value;
    const contactPhone = document.querySelector(".contactPhone input").value;

    event.preventDefault()
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()
    if (tappayStatus.canGetPrime === false) {
        console.log('can not get prime');
        return;
    }
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            console.log('get prime error ' + result.msg);
            return;
        } else {
            prime = result.card.prime;
            // console.log('get prime 成功，prime: ' + prime);
        }

        fetch('/api/booking', {
            method: "GET"
        }).then(function (response) {
            return response.json()
        }).then(function (data) {
            if (data.data == null) {
                return;
            } else {
                attractionInfo = data.data.attraction;
                dateInfo = data.data;
            }
            let entry = {
                "prime": prime,
                "order": {
                    "price": dateInfo.price,
                    "trip": {
                        "attraction": attractionInfo,
                        "date": dateInfo.date,
                        "time": dateInfo.time
                    },
                    "contact": {
                        "name": contactName,
                        "email": contactEmail,
                        "phone": contactPhone
                    }
                }
            };

            // console.log(entry.order.trip.attraction['id'])
            fetch('/api/orders', {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(entry),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })
            }).then(function (response) {
                // console.log(response)
                return response.json()
            }).then(function (data) {
                if (data.data !== null) {
                    let orderNumber = data.data.number;
                    // console.log(data.data.number);
                    location.href = `/thankyou?number=${orderNumber}`;
                    return;
                } else {
                    console.log(data.message);
                    return;
                }
            })
        })
    })
});
