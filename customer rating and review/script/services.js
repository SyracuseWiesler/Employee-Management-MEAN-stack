angular.module("serviceModule", []).factory("myServices", ["$filter", function($filter){
    /**
     * stars array represents how many 1 ~ 5 stars this product has
     * the default comments associated with stars from 1 ~ 5, comments['Worst','Bad','Average','Good','Fantastic']
     * the final rating score = (stars[0] * 1 + stars[1] * 2 + stars[2] * 3 + stars[3] * 4 + stars[4] * 5) / sum(stars)
     * */
    var products = [  // other attributes generated when retrieved: score, fullStars, emptyStars
        {name: "echo", price: 99.99, stars: getStarsArray(), img: "./img/echo.jpg"},
        {name: "echo plus", price: 149.99, stars: getStarsArray(), img: "./img/echo plus.jpg"},
        {name: "echo spot", price: 129.99, stars: getStarsArray(), img: "./img/echo sport.jpg"},
        {name: "fire TV", price: 69.99, stars: getStarsArray(), img: "./img/fire tv.jpg"},
        {name: "echo connect", price: 34.99, stars: getStarsArray(), img: "./img/echo connect.png"},
        {name: "echo button", price: 99.99, stars: getStarsArray(), img: "./img/echo button.jpg"},
        {name: "Dell XPS", price: 1499.99, stars: getStarsArray(), img: "./img/dell xps.jpg"},
        {name: "Nespresso Machine", price: 189.95, stars: getStarsArray(), img: "./img/nespresso.png"},
        {name: "Ninja Coffee Bar", price: 109.99, stars: getStarsArray(), img: "./img/ninja.jpg"},
        {name: "Kindle", price: 114.97, stars: getStarsArray(), img: "./img/kindle.jpg"},
        {name: "NetGear WIFI Router", price: 69.99, stars: getStarsArray(), img: "./img/netgear.jpeg"},
        {name: "iPad mini", price: 175.00, stars: getStarsArray(), img: "./img/ipad mini.jpeg"},

    ];
    function getRand(lower, upper){
        return Math.floor(Math.random() * (upper - lower + 1) + lower);
    }
    function getStarsArray () {
        var lower = 0;
        var upper = 50;
        var stars = [];
        for(var i = 0; i < 5; i ++) {
            stars[i] = getRand(lower, upper);
        }
        return stars;
    }
    var states = {
        filtered: "",
        sorted: {
            rule: "",
            reverse: false,
        },
        beforeEdit: false,
        afterEdit: false,
        beforeCreate: false,
        afterCreate: false,
        curPage: 1
    };
    var removedProducts = [];
    var filteredProducts = $filter("filter")(products, states.filtered);
    var currentProducts = $filter("limitTo")(filteredProducts, 8, (states.curPage - 1) * 10 - 2 < 0 ? 0 : (states.curPage - 1) * 10 - 2);  // each page show 8 products
    function getPageNum (products) {
        return products.length === 0 ? 1 : Math.ceil(products.length / 8);
    }
    return {
        states: states,
        getStarsArray: getStarsArray,
        getRand: getRand,
        getScore: function(stars){
            var total = 0;
            stars.forEach(function(num){
                total += num;
            });
            var score = stars[0] * 1 + stars[1] * 2 + stars[2] * 3 + stars[3] * 4 + stars[4] * 5;
            score /= total;
            return score.toFixed(2);
        },
        getSubArray: function (stars, score){
            var arr = [];
            var arr1 = [];
            var arr2 = [];
            for (var i = 0; i < Math.round(score); i ++) {
                arr1.push(i);
            }
            for (var j = Math.round(score); j < stars.length; j ++) {
                arr2.push(j);
            }
            // arr.push(stars.slice(0, Math.round(score)));
            // arr.push(stars.slice(Math.round(score)));
            arr.push(arr1);
            arr.push(arr2);
            return arr;
        },
        initializeProducts : function(){
            for (var i = 0; i < products.length; i ++) {
                var total = 0;
                products[i].stars.forEach(function(num){
                    total += num;
                });
                products[i].total = total;
                products[i].score = this.getScore(products[i].stars);
                var arr = this.getSubArray(products[i].stars, products[i].score);
                products[i].fullStars = arr[0];
                products[i].emptyStars = arr[1];
            }
        },
        products: products,
        getProducts: function(){
            // for (var i = 0; i < products.length; i ++) {
            //     var total = 0;
            //     products[i].stars.forEach(function(num){
            //         total += num;
            //     });
            //     products[i].total = total;
            //     products[i].score = this.getScore(products[i].stars);
            //     var arr = this.getSubArray(products[i].stars, products[i].score);
            //     products[i].fullStars = arr[0];
            //     products[i].emptyStars = arr[1];
            // }
            return products;
        },
        getPageNum: getPageNum,
        removedProducts: removedProducts,
        getStates: function(){
            var newStates = {};
            for(var key in this.states) {
                newStates[key] = this.states[key];
            }
            return newStates;
        },
        getFilteredProducts: function(states){
            filteredProducts = $filter("filter")(this.getProducts(), states.filtered);
            return filteredProducts;
        },
        getCurrentProducts: function(states){
            currentProducts = $filter("orderBy")(this.getFilteredProducts(states), states.sorted.rule, states.sorted.reverse);
            currentProducts = $filter("limitTo")(currentProducts, 8, (states.curPage - 1) * 10 - 2 < 0 ? 0 : (states.curPage - 1) * 10 - 2);
            return currentProducts;
        },
        addProduct: function(newProduct){
            this.getProducts().push(newProduct);
        },
        removeProduct: function(idx){
            var pendingProduct = currentProducts[idx];
            for (var i = 0; i < this.getProducts().length; i ++) {
                if (this.getProducts()[i] === pendingProduct) {
                    this.getProducts().splice(i, 1);
                    break;
                }
            }
            this.removedProducts.push(pendingProduct);
        },
        editProduct: function(idx, product){
            var pendingProduct = currentProducts[idx];
            for (var i = 0; i < this.getProducts().length; i ++) {
                if (this.getProducts()[i] === pendingProduct) {
                    this.getProducts().splice(i, 1, product);
                    break;
                }
            }
        },
        getComment: function(starLevel){
            var comment = "";
            switch(starLevel){
                case 1:
                    comment = "Worst";
                    break;
                case 2:
                    comment = "Bad";
                    break;
                case 3:
                    comment = "Average";
                    break;
                case 4:
                    comment = "Good";
                    break;
                case 5:
                    comment = "Fantastic";
                    break;
            }
            return comment;
        },

    };
}]);