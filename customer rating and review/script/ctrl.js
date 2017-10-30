var app = angular.module("myApp", ["ngRoute", "serviceModule"]);
app.config(function($routeProvider){
    $routeProvider.when("/", {
        templateUrl: "products.html",
        controller: "ctrl"
    }).when("/create", {
        templateUrl: "new_product.html",
        controller: "createCtrl"
    }).when("/edit/productIndex/:idx", {
        templateUrl: "edit_product.html",
        controller: "editCtrl"
    }).otherwise({
        redirectTo: "/"
    });
});
app.controller("ctrl",["$scope", "myServices", "$filter", function($scope, myServices, $filter){
    var ss = myServices;
    ss.initializeProducts();
    $scope.states = ss.getStates();
    $scope.pageNum = ss.getPageNum(ss.getProducts());
    $scope.products = ss.getProducts();
    $scope.getRand = ss.getRand;
    $scope.$watch("states", function(){
        $scope.filteredProducts = ss.getFilteredProducts($scope.states);  // for setting up pagination
        $scope.currentProducts = ss.getCurrentProducts($scope.states);  // for setting up the users on current page
        $scope.pageNum = ss.getPageNum($scope.filteredProducts);
        $scope.hottest = $filter("limitTo")($filter("orderBy")($scope.products, "total", true), 3, 0);
    });
    $scope.sortingRules = [["name", false], ["name", true], ["price", false], ["price", true], ["score", false], ["score", true]];
    $scope.getSortingRuleInHTML = function(rule){
        if (rule[0] === "name" && rule[1]) {
            return "from Z to A";
        } else if (rule[0] === "name" && ! rule[1]) {
            return "from A to Z";
        } else if (rule[0] === "price" && rule[1]) {
            return "from high to low";
        } else if (rule[0] === "price" && ! rule[1]){
            return "from low to high";
        } else if (rule[0] === "score" && rule[1]) {
            return "from high to low";
        } else {
            return "from low to high";
        }
    };
    /**
     * sort
     * */
    $scope.$watch("selectedRule", function(newVal){
        if (newVal !== undefined){
            ss.states.sorted.rule = $scope.sortingRules[newVal][0];
            ss.states.sorted.reverse = $scope.sortingRules[newVal][1];
            $scope.states = ss.getStates();
        }
    });
    /**
     * filter
     * */
    $scope.$watch("text", function(){
        ss.states.filtered = $scope.text;
        $scope.states = ss.getStates();
    });
    /**
     * remove a product
     * */
    $scope.remove = function(idx){
        ss.removeProduct(idx);
        $scope.states = ss.getStates();
    };
    /**
     * pagination
     * */
    var pagesLocal = [
        {symbol: "<<", className: "disabled"},
        {symbol: "<", className: "disabled"},
        {symbol: ">", className: ""},
        {symbol: ">>", className: ""}
    ];
    $scope.$watch("pageNum", function(){
        $scope.pages = [];
        pagesLocal.forEach(function(page){
            $scope.pages.push(page);
        });
        for (var i = 2; i < $scope.pageNum + 2; i ++) {
            var page = {symbol: i - 1, className: i - 1 === $scope.states.curPage ? "active" : ""};
            $scope.pages.splice(i, 0, page);
        }
        $scope.setCurPage($scope.pages[2]);  // always show the first page of current filtered users
    });
    $scope.setCurPage = function(p){
        $scope.pages.forEach(function(page){
            page.className = "";
        });
        if (/\d+/.test(p.symbol.toString())) {
            ss.states.curPage = p.symbol;
            $scope.pages[p.symbol + 1].className = "active";
        } else if (p.symbol === "<<") {
            ss.states.curPage = 1;
            $scope.pages[2].className = "active";
        } else if (p.symbol === "<") {
            ss.states.curPage = ss.states.curPage !== 1 ? ss.states.curPage - 1 : 1;
            $scope.pages[ss.states.curPage + 1].className = "active";
        } else if (p.symbol === ">") {
            ss.states.curPage = ss.states.curPage !== $scope.pageNum ? ss.states.curPage + 1 : $scope.pageNum;
            $scope.pages[$scope.curPage + 1].className = "active";
        } else {
            ss.states.curPage = $scope.pageNum;
            $scope.pages[$scope.pageNum + 1].className = "active";
        }
        setDisabled(ss.states.curPage);
        $scope.states = ss.getStates();
    };
    function setDisabled (pNum){
        if (pNum === 1) {
            $scope.pages[0].className = "disabled";
            $scope.pages[1].className = "disabled";
        } else if (pNum === $scope.pageNum) {
            $scope.pages[$scope.pageNum + 2].className = "disabled";
            $scope.pages[$scope.pageNum + 3].className = "disabled";
        }
    }
    /**
     * Weekly hottest products
     * */
    $scope.canVote = false;
    $scope.increase = function(idx){

        for (var i = 0; i < ss.products.length; i ++) {
            if (ss.products[i] === $scope.hottest[idx]) {
                ss.products[i].total ++;
                break;
            }
        }
        $scope.states = ss.getStates();
    };
    $scope.decrease = function(idx){
        for (var i = 0; i < ss.products.length; i ++) {
            if (ss.products[i] === $scope.hottest[idx]) {
                console.log();
                ss.products[i].total --;
                break;
            }
        }
        $scope.states = ss.getStates();
    }


}]);
angular.module("myApp").controller("createCtrl", ["$scope", "myServices", function($scope, myServices){
    var ss = myServices;
    $scope.name = "";
    $scope.price = 0;
    $scope.url = "";
    $scope.createProduct = function(){
        var p = {};
        p.name = $scope.name;
        p.price = $scope.price;
        p.img = $scope.url;
        p.stars = ss.getStarsArray();
        ss.addProduct(p);
    };
}]);
angular.module("myApp").controller("editCtrl", ["$scope", "myServices", "$routeParams", "$filter", function($scope, myServices, $routeParams, $filter){
    var ss = myServices;
    // $scope.states = ss.getStates();
    $scope.idx = $routeParams.idx;
    $scope.p = ss.getCurrentProducts(ss.getStates())[$scope.idx];
    $scope.name = $scope.p.name;
    $scope.price = $scope.p.price;
    $scope.url = $scope.p.img;
    $scope.stars = $scope.p.stars;
    $scope.dedupeDummyStars = [1, 2, 3, 4, 5];
    $scope.saveChanges = function(){
        $scope.p.name = $scope.name;
        $scope.p.price = $scope.price;
        $scope.p.img = $scope.url;
        ss.editProduct($scope.idx, $scope.p);
    };
    function totalReviews(){
        var total = 0;
        $scope.stars.forEach(function(num){
            total += num;
        });
        return total;
    }
    $scope.total = totalReviews();
    function getPercentage(idx){
        return Math.round($scope.stars[$scope.stars.length - 1 - idx] / $scope.total * 100) + "%";
    }
    $scope.getPercentArray = function(){
        var arr = [];
        var spaces = "";  // spaces used to dedupe, in order to avoid angular error message for same key same value in list
        for (var i = 0; i < 5; i ++) {
            spaces += " ";
            arr.push(getPercentage(i) + spaces);
        }
        return arr;
    };
    $scope.reviewArray = [];
    $scope.shownReviews = [];
    $scope.percentArray = $scope.getPercentArray();
    $scope.belowScoreShow = false;
    $scope.showReviews = false;
    var reviewCounter = 1;
    $scope.toggleReviews = function(){
        $scope.showReviews = !$scope.showReviews;
        var ref = ["Worst", "Bad", "Average", "Good", "Fantastic"];  // too many reviews for each product, just make some dummy
        // and same reviews, do not want to maintain other review API. If this is needed in future could be improved here
        for (var i = 0; i < $scope.p.stars.length; i ++) {
            for (var j = 0; j < $scope.p.stars[i]; j ++) {
                var d = new Date(ss.getRand(new Date("2008-8-8 08:08:08").getTime(), new Date().getTime()));
                var date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() +
                    ":" + d.getMinutes() + ":" + d.getSeconds();
                var myStars = [1, 2, 3, 4, 5];
                $scope.reviewArray.push({review: ref[i], date: date, myStars: myStars, myStarsRidge: i});
            }
        }
        $scope.reviewArray = orderByDate($scope.reviewArray);
        $scope.shownReviews = $scope.shownReviews.concat($filter("limitTo")($scope.reviewArray, reviewCounter * 5, 0));
    };
    $scope.loadMore = function(){
        reviewCounter ++;
        $scope.shownReviews = $scope.shownReviews.concat($filter("limitTo")($scope.reviewArray, reviewCounter * 5, 0));
    };
    $scope.myStars = [1, 2, 3, 4, 5];
    $scope.myStarsRidge = 0;
    $scope.setMyReviewStars = function(idx){
        $scope.myStarsRidge = idx;
    };
    $scope.myReview = "";
    $scope.sendMyReview = function(){
        var d = new Date();
        var date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() +
            ":" + d.getMinutes() + ":" + d.getSeconds();
        var newReview = {
            review: $scope.myReview,
            date: date,
            myStars: $scope.myStars,
            myStarsRidge: $scope.myStarsRidge
        };
        $scope.reviewArray.unshift(newReview);
        $scope.shownReviews = $filter("limitTo")($scope.reviewArray, reviewCounter * 5, 0);
        $scope.myReview = "";
    };
    function orderByDate (arr){
        return $filter("orderBy")(arr, "date", true);
    }
}]);

