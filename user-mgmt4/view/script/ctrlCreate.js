angular.module("myApp").controller("ctrlCreate", ["$scope", "factoryTools", "$location", function($scope, factoryTools, $location){
    var tools = factoryTools;
    $scope.date1 = new Date();
    angular.element(document).off("scroll");
    $scope.emp = {
        name: "",
        title: "",
        sex: "male",
        img: "",  // in database, if no image, the img field is empty string. when get response from the server, no image
        // will be transformed to default image according to sex
        startDate: $scope.date1.getTime(),
        officePhone: "",
        cellPhone: "",
        SMS: "",
        email: "",
        manager: ""
        // directReports: 0
    };
    tools.getEmps().then(function(res){
        $scope.managers = res.data.concat([]);
    });
    $scope.upload = function(){
        var file = $scope.myImg;
        if (file !== undefined) {
            var fileFormData = new FormData();
            fileFormData.append('file', file);
            tools.upload($scope.id, fileFormData).then(function(res){
                console.log(res.data);
                $scope.emp.img = "./img/personnel/" + res.data.filename;
            });
        }
    };
    $scope.create = function(){
        // $scope.emp.id = "" + tools.my_id;
        // tools.my_id ++;
        // tools.emps.push($scope.emp);
        // console.log(tools.emps);
        // $scope.emp.startDate = $scope.emp.startDate.getTime();
        tools.addEmp($scope.emp).then(function(res){
            console.log(res.data);
            $location.url("/");
        });
    };
    // $scope.myFormData = [
    //     {myFor: "name", myType: "text", myModel: $scope.newEmp.name, transcludedContent: "Name"},
    //     {myFor: "sex", myType: "text", myModel: $scope.newEmp.sex, transcludedContent: "Sex"},
    //     {myFor: "title", myType: "text", myModel: $scope.newEmp.title, transcludedContent: "Title"},
    //     {myFor: "date1", myType: "date", myModel: $scope.newEmp.startDate, transcludedContent: "Start Date"},
    //     {myFor: "officePhone", myType: "text", myModel: $scope.newEmp.officePhone, transcludedContent: "Office Phone"},
    //     {myFor: "cellPhone", myType: "text", myModel: $scope.newEmp.cellPhone, transcludedContent: "Cell Phone"},
    //     {myFor: "SMS", myType: "text", myModel: $scope.newEmp.SMS, transcludedContent: "SMS"},
    //     {myFor: "email", myType: "email", myModel: $scope.newEmp.email, transcludedContent: "Email"},
    //     {myFor: "image", myType: "file", myModel: $scope.newEmp.img, transcludedContent: "Image"},
    // ];


}]);
