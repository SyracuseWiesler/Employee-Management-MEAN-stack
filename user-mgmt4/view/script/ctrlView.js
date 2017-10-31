angular.module("myApp").controller("ctrlView", ["$scope", "$routeParams", "factoryTools", "$location", function($scope, $routeParams, factoryTools, $location){
    var tools = factoryTools;
    angular.element(document).off("scroll");
    $scope.id = $routeParams.id;
    $scope.emp = {};
    tools.getEmp($scope.id).then(function(res){
        $scope.emp = tools.processEmp([res.data])[0];  // processEmp accept an array and return an array
        console.log($scope.emp);
    });
    $scope.$watch("emp", function(){
        $scope.date1 = new Date($scope.emp.startDate);
        $scope.myFormData = [
            {myFor: "name", myType: "text", myModel: $scope.emp.name, transcludedContent: "Name"},
            {myFor: "sex", myType: "text", myModel: $scope.emp.sex, transcludedContent: "Sex"},
            {myFor: "title", myType: "text", myModel: $scope.emp.title, transcludedContent: "Title"},
            {myFor: "date1", myType: "date", myModel: $scope.date1, transcludedContent: "Start Date"},
            // {myFor: "officePhone", myType: "text", myModel: $scope.emp.officePhone, transcludedContent: "Office Phone"},
            // {myFor: "cellPhone", myType: "text", myModel: $scope.emp.cellPhone, transcludedContent: "Cell Phone"},
            // {myFor: "SMS", myType: "text", myModel: $scope.emp.SMS, transcludedContent: "SMS"},
            // {myFor: "email", myType: "email", myModel: $scope.emp.email, transcludedContent: "Email"},
            // {myFor: "manager", myType: "text", myModel: $scope.emp.manager.name === "" ? "None" : $scope.emp.manager.name, transcludedContent: "Manager"},
            // {myFor: "directReports", myType: "number", myModel: $scope.emp.directReports.length, transcludedContent: "Direct Reports"},
        ];
    });
    $scope.doViewManager = function(id){
        if (id !== "") {
            console.log(id);
            $location.url('/view/' + id);
        }
    };
    $scope.doViewDirectReports = function(directReportsArray){
        if (directReportsArray.length > 0) {
            tools.getSubordinates($scope.id).then(function(res){
                $location.url("/");
                tools.states.showDirectReports = res.data;
                tools.sorted = -1;
                tools.filtered = "";
                // $scope.states = tools.getStates();
            });
            // tools.states.showDirectReports = directReportsArray;
            // tools.sorted = -1;
            // tools.filtered = "";
            // $scope.states = tools.getStates();
        }
    };

}]);
