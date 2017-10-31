angular.module("myApp").controller("ctrlEdit", ["$scope", "$routeParams", "factoryTools", "$location", function($scope, $routeParams, factoryTools, $location){
    var tools = factoryTools;
    angular.element(document).off("scroll");
    $scope.id = $routeParams.id;
    tools.getEmp($scope.id).then(function(res){
        $scope.emp = res.data;
        tools.getManagers($scope.id).then(function(res){
            $scope.managers = [];
            if (res.data.current) {
                $scope.managers.push(res.data.current)
            }
            $scope.managers = $scope.managers.concat(res.data.potential);
            $scope.date1 = new Date($scope.emp.startDate);
            $scope.myFormData = [
                {myFor: "name", myType: "text", myModel: $scope.emp.name, transcludedContent: "Name"},
                {myFor: "sex", myType: "radio", myModel: $scope.emp.sex, transcludedContent: "Sex"},
                {myFor: "title", myType: "text", myModel: $scope.emp.title, transcludedContent: "Title"},
                {myFor: "date1", myType: "date", myModel: $scope.date1, transcludedContent: "Start Date"},
                {myFor: "officePhone", myType: "text", myModel: $scope.emp.officePhone, transcludedContent: "Office Phone"},
                {myFor: "cellPhone", myType: "text", myModel: $scope.emp.cellPhone, transcludedContent: "Cell Phone"},
                {myFor: "SMS", myType: "text", myModel: $scope.emp.SMS, transcludedContent: "SMS"},
                {myFor: "email", myType: "email", myModel: $scope.emp.email, transcludedContent: "Email"},
                {myFor: "image", myType: "file", myModel: $scope.emp.img, transcludedContent: "Image"},
            ];
            // $scope.managers = tools.getManagers($scope.id);
        });
    });
    $scope.$watch("myImg", function(newValue){
        console.log(newValue);
    });
    $scope.upload = function(){
        var file = $scope.myImg;
        if (file !== undefined) {
            var fileFormData = new FormData();
            fileFormData.append('file', file);
            tools.upload($scope.id, fileFormData).then(function(res){
                console.log(res.data);
                // 当上传成功之后，修改本地的照片显示，已知的是照片的名称会用 id.扩展名显示
                $scope.emp.img = "./img/personnel/" + res.data.filename;

            });
        }
    };
    function getFilePath(file){
        var name = file.name;

    }
    $scope.save = function(){
        // console.log($scope.emp);
        $scope.emp.startDate = $scope.date1.getTime();
        tools.simplify($scope.emp);
        tools.saveChanges($scope.emp).then(function(res){
            console.log(res.data);
            $location.url("/");
        });
    };
    // console.log($scope.emp.sex);

}]);
