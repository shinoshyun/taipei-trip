let footer = document.querySelector(".footer");
let getData = false;
let searchBar = document.getElementById("search-bar");
let searchBtn = document.querySelector(".search_btn");

getDatadata(0, "");
searchBar.addEventListener('mousedown', (event) => {
    document.querySelector(".dropdown-content").classList.toggle("show");

    if (getData == true) {
        return;
    }
    //往下fetch = else
    fetch("/api/categories").then(function (response) {
        return response.json();
    }).then(function (categories_data) {
        // 取出景點陣列 //取出陣列的長度(也就是有幾筆資料，要跑for迴圈，放入<li></li>)
        let categories = categories_data.data
        let dataCount = Object.keys(categories).length;

        for (let i = 0; i < dataCount; i++) {
            let category = categories[i];

            let categoryBox = document.createTextNode(category);
            let li = document.createElement("li");
            li.className = "options"
            li.appendChild(categoryBox);
            let li_element = document.querySelector(".dropdown-content ul");
            li_element.appendChild(li);

        }
        getData = true;

        //把搜到的資料放進input欄位裡
        let searchBar = document.getElementById("search-bar");
        let options = document.getElementsByClassName("options");
        //optinos裡有很多項目，設option獲得每一個項目，獲得的文字再放入searchBar裡
        for (option of options) {
            option.onmousedown = function (element) {
                searchBar.value = element.target.textContent;
            }
        }
    })

});


//把searchBar關閉
searchBar.addEventListener('blur', (event) => {
    document.querySelector(".dropdown-content").classList.remove("show");
});


// -------------------------------找到資料庫所有的資料---------------------------------
function getDatadata(page, keyword) {
    fetch(`/api/attractions?page=${page}&keyword=${keyword}`).then(function (response) {
        return response.json();
    }).then(function (attractions_data) {

        let data = attractions_data.data

        let dataCount = Object.keys(data).length;

        for (let i = 0; i < dataCount; i++) {
            let data_id = data[i].id;
            let a = document.createElement("a");


            let data_name = data[i].name;

            // 創一個<h3></h3>  //再創一個 取出json資料內的name(景點)  //把name放進h3內
            let h3 = document.createElement("h3");
            let name = document.createTextNode(data_name);
            h3.appendChild(name);

            let jpg = data[i].images[0];
            let imgSrc = document.createElement("img");
            imgSrc.setAttribute("src", jpg);
            // ---------------------------------------

            let data_mrt = data[i].mrt;

            let p_mrt = document.createElement("p");
            let mrt = document.createTextNode(data_mrt);
            p_mrt.appendChild(mrt);



            let data_category = data[i].category;

            let p_category = document.createElement("p");
            let category = document.createTextNode(data_category);
            p_category.appendChild(category);


            let category_item = document.createElement("div");
            category_item.className = "category_item";
            category_item.appendChild(p_mrt);
            category_item.appendChild(p_category);


            let item = document.createElement("a");
            item.className = "item";
            item.setAttribute("href", "/attraction/" + data_id);
            item.appendChild(imgSrc);
            item.appendChild(h3);
            item.appendChild(category_item);
            item.appendChild(a);

            //找到HTML content的位置  //依序把上面裝好imgSrc和h3放入
            let images_element = document.querySelector(".content");
            images_element.appendChild(item);


        }

        if (attractions_data.nextPage != null) {
            observe(attractions_data.nextPage, keyword);
        }
    })
}



function observe(page, keyword) {
    const configs = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5,
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {

            if (entry.isIntersecting) {
                fetch(`/api/attractions?page=${page}&keyword=${keyword}`).then(function (response) {
                    return response.json();
                }).then(function (attractions_data) {
                    let data = attractions_data.data

                    let dataCount = Object.keys(data).length;

                    for (let i = 0; i < dataCount; i++) {
                        let data_id = data[i].id;
                        let a = document.createElement("a");

                        let data_name = data[i].name;

                        // 創一個<h3></h3>  //再創一個 取出json資料內的name(景點)  //把name放進h3內
                        let h3 = document.createElement("h3");
                        let name = document.createTextNode(data_name);
                        h3.appendChild(name);

                        let jpg = data[i].images[0];
                        let imgSrc = document.createElement("img");
                        imgSrc.setAttribute("src", jpg);
                        // ---------------------------------------

                        let data_mrt = data[i].mrt;

                        let p_mrt = document.createElement("p");
                        let mrt = document.createTextNode(data_mrt);
                        p_mrt.appendChild(mrt);



                        let data_category = data[i].category;

                        let p_category = document.createElement("p");
                        let category = document.createTextNode(data_category);
                        p_category.appendChild(category);



                        let category_item = document.createElement("div");
                        category_item.className = "category_item";
                        category_item.appendChild(p_mrt);
                        category_item.appendChild(p_category);


                        let item = document.createElement("a");
                        item.className = "item";
                        item.setAttribute("href", "/attraction/" + data_id);
                        item.appendChild(imgSrc);
                        item.appendChild(h3);
                        item.appendChild(category_item);
                        item.appendChild(a);

                        //找到HTML content的位置  //依序把上面裝好imgSrc和h3放入
                        let images_element = document.querySelector(".content");
                        images_element.appendChild(item);
                    }
                    if (attractions_data.nextPage != null) {
                        page = attractions_data.nextPage;
                    } else {
                        observer.unobserve(footer);
                    }
                })
            }
        });
    }, configs);
    observer.observe(footer);

    searchBtn.addEventListener("click", function () {
        observer.unobserve(footer);
    })
}

searchBtn.addEventListener("click", function () {
    let content = document.querySelector(".search-bar").value;
    let content2 = document.querySelector(".content")
    content2.innerHTML = "";
    getDatadata(0, content);
    //抓到值keyword //清空原有的內容 content.innerHTML="" //呼叫getDatadata(0, keyword)
})

// ------------------------searchBar-------------------------

// function observe(page, keyword) {
//     const configs = {
//         root: null,
//         rootMargin: '0px',
//         threshold: 0.5,
//     }

//     const observer = new IntersectionObserver(function (entries) {
//         entries.forEach(entry => {
//             function search() {
//                 fetch(`/api/attractions?page${page}&keyword=${keyword}`).then(function (response) {
//                     return response.json();
//                 }).then(function (attractions_data) {
//                     let data = attractions_data.data
//                     if (data[0] == undefined) {
//                         alert("查無此景點");
//                     } else {
//                         let items = document.querySelectorAll(".item")
//                         for (let i = 0; i < items.length; i++) {
//                             items[i].remove()
//                         }

//                         let data = attractions_data.data

//                         let dataCount = Object.keys(data).length;
//                         for (let i = 0; i < dataCount; i++) {
//                             let data_name = data[i].name;

//                             let h3 = document.createElement("h3");
//                             let name = document.createTextNode(data_name);
//                             h3.appendChild(name);

//                             let jpg = data[i].images[0];
//                             let imgSrc = document.createElement("img");
//                             imgSrc.setAttribute("src", jpg);
//                             // ---------------------------------------

//                             let data_mrt = data[i].mrt;

//                             let p_mrt = document.createElement("p");
//                             let mrt = document.createTextNode(data_mrt);
//                             p_mrt.appendChild(mrt);



//                             let data_category = data[i].category;

//                             let p_category = document.createElement("p");
//                             let category = document.createTextNode(data_category);
//                             p_category.appendChild(category);



//                             let category_item = document.createElement("div");
//                             category_item.className = "category_item";
//                             category_item.appendChild(p_mrt);
//                             category_item.appendChild(p_category);


//                             let item = document.createElement("div");
//                             item.className = "item";
//                             item.appendChild(imgSrc);
//                             item.appendChild(h3);
//                             item.appendChild(category_item);
//                             // console.log(item);
//                             let images_element = document.querySelector(".content");
//                             images_element.appendChild(item);
//                         }
//                         if (attractions_data.nextPage != null) {
//                             page = attractions_data.nextPage;
//                         } else {
//                             observer.unobserve(footer);
//                         }
//                     }
//                 })
//             }
//         });
//     }, configs);
// }