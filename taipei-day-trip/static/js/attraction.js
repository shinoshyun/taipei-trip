
const pathArray = window.location.pathname.split('/');
const attraction = pathArray[2];

let imagesSum = 0;

fetch(`/api/attraction/${attraction}`).then(function (response) {
    return response.json();
}).then(function (attraction_data) {
    let data = attraction_data.data;

    let name = data.name;
    let nameInput = document.createTextNode(name);
    let nameElement = document.querySelector("#title");
    nameElement.appendChild(nameInput);

    let category = data.category;
    let categoryInput = document.createTextNode(category);
    let categoryElement = document.querySelector("#category");
    categoryElement.appendChild(categoryInput);

    let mrt = data.mrt;
    let mrtInput = document.createTextNode(mrt);
    let mrtElement = document.querySelector("#mrt");
    mrtElement.appendChild(mrtInput);

    let description = data.description;
    let descriptionInput = document.createTextNode(description);
    let descriptionElement = document.querySelector("#description");
    descriptionElement.appendChild(descriptionInput);

    let address = data.address;
    let addressInput = document.createTextNode(address);
    let addressElement = document.querySelector("#address");
    addressElement.appendChild(addressInput);

    let transport = data.transport;
    let transportInput = document.createTextNode(transport);
    let transportElement = document.querySelector("#transport");
    transportElement.appendChild(transportInput);


    // -------取出images-------
    let images = data.images;
    for (let i = 0; i < images.length; i++) {
        let jpg = images[i];

        let imgSrc = document.createElement("img");
        imgSrc.setAttribute("src", jpg);
        let slider = document.createElement("div");
        slider.className = "slider";
        slider.appendChild(imgSrc);
        let imagesElement = document.querySelector(".slideshow-container");
        imagesElement.appendChild(slider);
    };

    for (let i = 1; i < images.length + 1; i++) {
        let li = document.createElement("li");
        li.className = "dot";

        li.setAttribute("onclick", "currentSlide(" + i + ")");

        let liElement = document.querySelector(".dots");
        liElement.appendChild(li);
    };
    showSlides(slideIndex);
})

let slideIndex = 1;

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}


function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slider");
    let dot = document.getElementsByClassName("dot");
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dot.length; i++) {
        dot[i].className = dot[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dot[slideIndex - 1].className += " active";
}


// -----------radio-----------
let result = document.querySelector('#result');
document.body.addEventListener('change', function (element) {
    let target = element.target;
    let message;
    switch (target.id) {
        case 'morning':
            message = '新台幣 2000 元';
            break;
        case 'afternoon':
            message = '新台幣 2500 元';
            break;
    }
    result.textContent = message;
});