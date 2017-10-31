angular.module("myFactory", []).factory("factoryTools", ["$http", "$filter", function($http, $filter){
    /**
     * emps is an array of emp [emp, emp, emp, ...]
     *
     * one emp object contains attributes {id: String(0~...), name: String, title: String, sex: String, startDate: timeStamp,
     * officePhone: String, cellPhone: String, SMS: String, email: String, manager: emp, directReports: emp subarray}
     *
     * function processEmps, will mainly transform the emps array in following ways:
     *      1 img: url, set male and female default image if empty string provided
     *      2 manager: id, transform the id to an emp object
     *      3 directReports: according to the subordination relationship by manager pointer to form an emps subarray including emp objects
     * */
    var empsPerPage = 5;  // each page, we show 5 employees
    var states = {
        filtered: "",
        sorted: -1,  // sorting index from 0 to 7, total 8 sorting rules
        curPage: 1,
        showDirectReports: [],
        // showManager: "",  // if "" do not show the manager in the view, else if "manager_id" show the specific manager
        // showDirectReports: "",  // if "" do not show the reports direct reports list, else if "emp_id" show this users' subordinates
    };
    // for "View All" button in list of emps page
    var initStates = {
        filtered: "",
        sorted: -1,
        curPage: 1,
        // showManager: "",
        showDirectReports: [],
    };
    var sortingRules = [
        {rule: "name", reverse: false},
        {rule: "name", reverse: true},
        {rule: "title", reverse: false},
        {rule: "title", reverse: true},
        {rule: "manager", reverse: false},
        {rule: "manager", reverse: true},
        {rule: "directReports", reverse: false},
        {rule: "directReports", reverse: true},
    ];
    return {
        // emps: emps,
        states: states,
        // my_id: my_id,
        getStates: function(){
            var newStates = {};
            angular.forEach(states, function(value, key){
                newStates[key] = value;
            });
            return newStates;
        },
        getInitStates: function(){  // initStates can only be get not set
            return initStates;
        },
        getEmpsPerPage: function(){
            return empsPerPage;
        },
        getEmp: function(id){
            // var idx = 0;
            // angular.forEach(emps, function(value, key){
            //     if (id === value.id) {
            //         idx = key;
            //     }
            // });
            // return this.processEmp([emps[idx]])[0];
            return $http({
                method: "GET",
                url: "/emp/" + id,
            })
        },
        getEmps: function(){
            return $http({
                method: "GET",
                url: "/emps",
                // header: {"Content-Type": "application/json"},
            });
        },
        getCount: function(){
            return $http({
                method: "GET",
                url: "/count"
            });
        },
        getSubordinates: function(id){
            return $http({
                method: "GET",
                url: "/subordinates/" + id,
            });
        },
        /**get all the potential managers of the emp with id
         * two possible attributes: potential and current(if no current manager, this attribute will be undefined)
         * */
        getManagers: function(id){
            return $http({
                method: "GET",
                url: "/managers/" + id,
            });
        },
        /**
         * get direct reports of emp_id
         * */
        getEmpsByLimit: function(tEmps){
            // this.processEmp(tEmps);
            var limit = states.curPage * empsPerPage;
            return $filter("limitTo")(tEmps, limit, 0);

            // var start = (states.curPage - 1) * empsPerPage;
            // this.processEmp(tEmps);
            // return tEmps.slice(0, start + empsPerPage - 1);
        },
        getFilteredEmps: function(emps1){
            // emps1 = this.processEmp(emps1);
            if (states.showDirectReports.length > 0) {  // states.showDirectReports里存放的都是实在的对象
                emps1 = states.showDirectReports;
            }
            var text = states.filtered;
            function filterFn (emp, index) {
                var contents = [];
                angular.forEach(emp, function(value, key){
                    switch(key) {
                        case "id":
                        case "startDate":
                        case "officePhone":
                        case "cellPhone":
                        case "SMS":
                        case "email":
                            break;
                        case "manager":
                            contents.push(value.name);
                            break;
                        case "directReports":
                            contents.push("" + value.length);
                            break;
                        default:
                            contents.push("" + value);
                    }
                });
                if (emp.id === "0") console.log(contents);
                for (var i = 0; i < contents.length; i ++) {
                    if (typeof contents[i] === "string" && contents[i].toLowerCase().indexOf(text.toLowerCase()) !== -1) {
                        return true;
                    }
                }
                return false;
            }
            return $filter("filter")(emps1, filterFn);
            // return this.myFilterFn(emps1, states.filtered);
        },
        getSortedEmps: function(emps1){
            if (states.sorted === -1) {
                return this.getEmpsByLimit(emps1);
            } else {
                if (sortingRules[states.sorted].rule === "manager") {
                    emps1 = $filter("orderBy")(emps1, function(emp){
                        return emp.manager.name;
                    }, sortingRules[states.sorted].reverse);
                } else if (sortingRules[states.sorted].rule === "directReports") {
                    emps1 = $filter("orderBy")(emps1, function(emp){
                        return emp.directReports.length;
                    }, sortingRules[states.sorted].reverse);
                } else {
                    emps1 = $filter("orderBy")(emps1, sortingRules[states.sorted].rule, sortingRules[states.sorted].reverse);
                }
                // emps1 = $filter("orderBy")(emps1, sortingRules[states.sorted].rule, sortingRules[states.sorted].reverse);
                return this.getEmpsByLimit(emps1);
            }
        },
        getFilteredSortedEmps: function(emps){
            return this.getSortedEmps(this.getFilteredEmps(emps));
        },
        removeEmp: function(id){
            return $http({
                method: "DELETE",
                url: "/emp/" + id,
            })
        },
        saveChanges: function(emp){
            return $http({
                method: "PUT",
                url: "/emp/" + emp._id,
                header: {"Content-Type": "application/json"},
                data: emp,
            });
        },
        addEmp: function(emp){
            return $http({
                method: "POST",
                url: "/emp",
                header: {"Content-Type": "application/json"},
                data: emp,
            });
        },
        upload: function(id, fileFormData){
            return $http({
                method: "POST",
                url: "/file/" + id,
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined},
                data: fileFormData,
            })
        },
        getManagers1: function(_id, emps){  // get all potential managers for the specific emp_id
            var temp = [];
            var tObj = {};
            var obj = {};
            emps.forEach(function(e){  // 做一个map，_id: empObject
                obj[e._id] = e;
                if (e.manager !== "") {  // 将所有的，有下属的元素的id都放入temp
                    temp.push(e.manager);
                }
            });
            for (var key in obj) {  // tObj是对obj的拷贝
                tObj[key] = obj[key];
            }
            temp.forEach(function(id){  // 那么tObj删除这些manager后，剩下的就是叶节点或孤立节点
                delete tObj[id];
            });
            temp = [];  // 清空temp, 用来存放那些不可能作为目标元素的manager的人
            angular.forEach(tObj, function(e){  // 遍历tObj，对于这些叶节点或孤立节点向上回溯他们的manager，看看是否能找到目标id
                // var temp_id = "";
                // var next = {};
                var count = 0;
                var next = e;
                var found = false;
                while (true) {
                    if (next.manager === "") {
                        break;
                    }
                    if (next.manager === _id) {
                        temp.push(next);
                        count ++;
                        found = true;
                        break;
                    }
                    temp.push(next);
                    count ++;
                    next = obj[next.manager];
                }
                if (! found) {
                    while (count > 0) {
                        temp.pop();
                        count --;
                    }
                }
            });
            for (var i = 0; i < emps.length; i ++) {
                if (emps[i] === obj[_id]) {
                    emps.splice(i, 1);
                }
            }
            temp.forEach(function(tEmp){
                for (var i = 0; i < emps.length; i ++) {
                    if (emps[i] === tEmp) {
                        emps.splice(i, 1);
                    }
                }
            });
            return emps;
        },
        /**
         * processEmp accept an array of emps and return the processed array
         * function:
         *      1 check if img is empty, then give default img path according to sex
         *      2 check if manager is string, then set it as manager obj
         *      3 check if it has directReports array, if not create the array
         * */
        processEmp: function(emps1){
            emps1 = this.getDeepCopy(emps1);
            emps1.forEach(function(emp){
                angular.forEach(emp, function(value, key){
                    if (key === "img") {
                        emp[key] = value !== "" ? value : emp.sex === "male" ? "./img/male-default.png" : "./img/female-default.png";
                    }
                    if (key === "manager" && typeof value === "string") {  // transform the manager id to a manager object
                        var manager = {_id: "", name: "",};
                        var _id = value;
                        // emps.forEach(function(tEmp){
                        //     if (tEmp.id === id) {
                        //         manager.id = tEmp.id;
                        //         manager.name = tEmp.name;
                        //         // emp[key] = {id: tEmp.id, name: tEmp.name};
                        //     }
                        // });
                        if (_id !== "") {
                            for (var i = 0; i < emps1.length; i ++) {
                                if (emps1[i]._id === _id) {
                                    manager._id = _id;
                                    manager.name = emps1[i].name;
                                    break;
                                }
                            }
                        }
                        emp[key] = manager;
                    }
                });
                // direcReports right now is not an attribute of emp object
                // var subordinates = [];
                // emps1.forEach(function(tEmp){
                //     if (tEmp.manager.id === emp.id) {
                //         subordinates.push(tEmp.id);
                //     }
                // });
                // emp.directReports = subordinates;
                // console.log(emp);
            });
            if (emps1.length > 0 && emps1[0].directReports === undefined) {
                emps1.forEach(function(emp){
                    var subordinates = [];
                    emps1.forEach(function(tEmp){
                        if (tEmp.manager._id === emp._id) subordinates.push(tEmp);
                    });
                    emp.directReports = subordinates;
                    // console.log(emp.directReports);
                });
            }
            return emps1;
        },
        myFilterFn: function(tEmps, text){
            var tEmpsCopy = [];
            tEmps.forEach(function(tEmp){
                var myEmp = {};
                angular.forEach(tEmp, function(value, key){
                    myEmp[key] = value;
                    if (key === "directReports") {
                        myEmp[key] = value.length;
                    }
                    if (key === "manager" && value.name !== undefined) {
                        myEmp[key] = value.name;
                    }
                });
                tEmpsCopy.push(myEmp);
            });

            // var myEmps = [];
            // tEmps.forEach(function(emp){
            //     if (emp.directReports !== undefined) {
            //         emp.directReports = emp.directReports.length;
            //     }
            //     if (emp.manager.name !== undefined) {
            //         emp.manager = emp.manager.name;
            //     }
            //     myEmps.push(emp);
            // });
            return $filter('filter')(tEmpsCopy, text);
        },
        getDeepCopy: function(tEmps){
            var ret = [];
            tEmps.forEach(function(t){
                var emp = {};
                angular.forEach(t, function(value, key){
                    emp[key] = value;
                });
                ret.push(emp);
            });
            return ret;
        },
        simplify: function(emp){
            emp.manager = emp.manager.id;
            if (emp.img === "./img/male-default.png" || emp.img === "./img/female-default.png") emp.img = "";
            delete emp.directReports;
        },

    };
}]);
