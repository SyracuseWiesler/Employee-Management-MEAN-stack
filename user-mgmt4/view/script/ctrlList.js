angular.module("myApp").controller("ctrlList", ["$scope", "$filter", "factoryTools", "$location", function($scope, $filter, factoryTools, $location){
    var tools = factoryTools;
    // $scope.states = tools.getStates();
    $scope.text = "";
    $scope.emps = [];
    $scope.currentEmps = [];
    tools.getEmps().then(function(res){
        // var emps = res.data;
        $scope.emps = res.data.concat([]);
        console.log($scope.emps);
    });
    $scope.$watch("emps", function(){
        $scope.states = tools.getStates();
    });
    $scope.$watch("states", function(){
        // 要用不一样的user来获取
        // $scope.emps = tools.getFilteredSortedEmps();
        $scope.currentEmps = tools.getFilteredSortedEmps($scope.emps);
        console.log($scope.currentEmps, $scope.states);
        // console.log($scope.emps, $scope.states);
        // $scope.emps = tools.simplyfyEmps($scope.logicEmps);
        // processEmps($scope.emps);
    });
    $scope.doEditEmp = function(id){
        $location.url("/edit/" + id);
    };
    $scope.doViewDirectReports = function(emp){
        if (emp.directReports.length > 0) {
            tools.getSubordinates(emp.id).then(function(res){
                tools.states.showDirectReports = res.data;
                tools.sorted = -1;
                tools.filtered = "";
                $scope.states = tools.getStates();
            });
        }
    };
    $scope.doViewAll = function(){
        var initStates = tools.getInitStates();
        for (var key in initStates) {
            tools.states[key] = initStates[key];
        }
        $scope.states = tools.getStates();
        // $location.url("/");
    };
    /**
     * sorting part
     * */
    $scope.activeSortingRule = -1;
    $scope.sort = function(idx){
        $scope.activeSortingRule = idx;
        tools.states.sorted = idx;
        $scope.states = tools.getStates();
    };
    /**
     * filtering part
     * */
    $scope.$watch("text", function(){
        tools.states.filtered = $scope.text;
        $scope.states = tools.getStates();
        // $scope.emps = $filter("filter")(tools.emps, $scope.text);
    });
    /**
     * removing part
     * */
    $scope.removeEmp = function(id){
        tools.removeEmp(id).then(function(res){
            console.log(res.data);
            console.log(tools.states.showDirectReports.length);
            for (var i = 0; i < tools.states.showDirectReports.length; i ++) {
                if (tools.states.showDirectReports[i].id === id) {
                    tools.states.showDirectReports.splice(i, 1);
                    $scope.states = tools.getStates();
                    console.log($scope.emps, $scope.states);
                }
            }
            if (tools.states.showDirectReports.length === 0) {
                tools.getEmps().then(function(res){
                    $scope.emps = res.data.concat([]);
                    $scope.doViewAll();
                });
            }

            // tools.getEmps().then(function(res){
            //     $scope.emps = res.data.concat([]);
            // });
            // $scope.states = tools.getStates();
        });
    };


    // function processEmps(emps){
    //     emps.forEach(function(emp){
    //         angular.forEach(emp, function(value, key){
    //             if (key === "img") {
    //                 emp[key] = value !== "" ? value : emp.sex === "male" ? "./img/male-default.png" : "./img/female-default.png";
    //             }
    //             if (key === "manager") {  // transform the manager id to a manager object
    //                 var id = Number.parseInt(value);
    //                 emp[key] = emps[id];
    //             }
    //         });
    //         // direcReports right now is not an attribute of emp object
    //         var subordinates = [];
    //         emps.forEach(function(tEmp){
    //             if (tEmp !== emp && tEmp.manager === emp) {  // 如果你设计的足够好，每个用户不能选自己做manager，那么第一个判断没有必要
    //                 subordinates.push(tEmp);
    //             }
    //         });
    //         emp.directReports = subordinates;
    //     });
    // }
}]);
