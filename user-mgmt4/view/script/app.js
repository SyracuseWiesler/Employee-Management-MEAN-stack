/**
 * app.js used to define ngRoute and its configuration and create necessary directives
 * */
angular.module("myApp", ["ngRoute", "ngAnimate", "myFactory"])
    .config(function($routeProvider){
        $routeProvider.when("/", {
            templateUrl: "list_emp.html",
            controller: "ctrlList",
        }).when("/create", {
            templateUrl: "create_emp.html",
            controller: "ctrlCreate",
        }).when("/edit/:id", {
            templateUrl: "edit_emp.html",
            controller: "ctrlEdit",
        }).when("/view/:id", {
            templateUrl: "view_emp.html",
            controller: "ctrlView",
        }).otherwise({
            redirectTo: "/"
        });
    })
    .directive("mySort", function(){
        return {
            replace: true,
            scope: {
                rule: "@",
                reverse: "=",
            },
            template: "<i class='fa fa-sort-{{rule}}-{{order}}' aria-hidden='true'></i>",
            link: function(scope, element, attrs){
                scope.order = "asc";
                if (attrs.reverse) {
                    scope.order = "desc";
                }
            },
        }
    });
/**
 * scrollWatch directive is mainly responsible for watch if the employee list page scroll to the bottom and update state
 * to retrieve more employees
 * also, when all the employees have been loaded, the scroll event listener will be off
 * */
angular.module("myApp").directive("scrollWatch", ["factoryTools", "$location",function(factoryTools, $location){
    return {
        restrict: "AE",
        scope: false,
        link: function(scope, element, attrs){
            angular.element(document).on("scroll", scrollBinding);
            function scrollBinding(){
                if (Math.ceil(angular.element(document).find("body")[0].scrollTop) >= angular.element(document).find("html")[0].scrollHeight - angular.element(document).find("html")[0].clientHeight) {
                    console.log("bottom, the curPage is: " + factoryTools.states.curPage);
                    /**
                     * if reach the length of the emps array, the scroll event will not trigger any changes to the states
                     * */
                    // if (factoryTools.states.curPage * factoryTools.getEmpsPerPage() < factoryTools.emps.length) {
                    factoryTools.getCount().then(function(res){
                        var count = parseInt(res.data);
                        if (factoryTools.states.curPage * factoryTools.getEmpsPerPage() < count) {
                            console.log("在app.js中 " + factoryTools.states.curPage);
                            factoryTools.states.curPage ++;
                            // binded = false;
                            scope.states = factoryTools.getStates();
                            // so this part of code is based on jQuery event binding, so it must be outside context of angular
                        }
                    });
                    // if (factoryTools.states.curPage * factoryTools.getEmpsPerPage() < factoryTools.getFilteredEmps(factoryTools.emps).length) {
                    //     factoryTools.states.curPage ++;
                    //     scope.states = factoryTools.getStates();
                    //     scope.$apply();  // you need to call $apply if you do anything outside angular context
                    //     // so this part of code is based on jQuery event binding, so it must be outside context of angular
                    // }
                }
            }
        },
    }
}]);
angular.module("myApp").directive("record", ["$location", "$window", function($location, $window){
    return {
        restrict: "E",
        replace: false,
        transclude: true,
        scope: {
            myFor: "@",
            myType: "@",
            myModel: "=",
            editable: "=",
            myCol: "=",
        },
        templateUrl: "myRecord",
        link: function(scope, element, attrs){
            //     // element.off("click");
                scope.$watch("emp", function(newEmp){
                    console.log(element.find("input"));
                });
                // console.log(scope.myModel);
                // console.log(scope.date1);
        }
    };
}]);
angular.module("myApp").directive("disappearWatch", function(){
    return {
        restrict: "A",
        scope: false,
        link: function(scope, element, attrs){
            element.find(".fa-trash").on("click", function(){
                // element.fadeOut();
                // element.css({
                //     background: "red",
                // })
            });
        }
    };
});
angular.module("myApp").directive("hoverWatch", function(){
    return {
        restrict: "A",
        scope: false,
        link: function(scope, element, attrs){
            element.on({
                "mouseenter": function(){
                    element.find(".fa-pencil").addClass("hovered");
                },
                "mouseleave": function(){
                    element.find(".fa-pencil").removeClass("hovered");
                }
            })
        },
    }
});
angular.module("myApp").directive("pageHeightWatch", function(){
    return {
        restrict: "A",
        priority: 0,
        scope: false,
        link: function(scope, element, attrs){
            var clientHeight = angular.element(document).find("html")[0].clientHeight;  // on my laptop, browser full screen is 591
            scope.$watch("currentEmps", function(newEmps){
                // console.log(angular.element(document).find("html")[0].clientHeight);
                if (newEmps.length < 4) {
                    element.css({height: clientHeight + "px"});
                } else {
                    element.css({height: ""});
                }
            });
        }
    };
});
angular.module("myApp").directive('demoFileModel', ["$parse", function ($parse) {
    return {
        restrict: 'A', //the directive can be used as an attribute only

        /*
         link is a function that defines functionality of directive
         scope: scope associated with the element
         element: element on which this directive used
         attrs: key value pair of element attributes
         */
        link: function (scope, element, attrs) {
            var model = $parse(attrs.demoFileModel),
                modelSetter = model.assign; //define a setter for demoFileModel

            //Bind change event on the element
            element.bind('change', function () {
                //Call apply on scope, it checks for value changes and reflect them on UI
                scope.$apply(function () {
                    //set the model value
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

angular.module("myApp").filter("myFilter", ["$filter", function($filter){
    return function(tEmps, text){
        tEmps = tEmps.concat([]);
        var myEmps = [];
        tEmps.forEach(function(emp){
            emp.directReports = emp.directReports.length;
            myEmps.push(emp);
        });
        return $filter('filter')(myEmps, text);
    };
}]);