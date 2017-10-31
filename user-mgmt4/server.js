var express = require("express");
var path = require("path");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var fileUpload = require("../../node_modules/express-fileupload");
var fs = require("fs");
var stream = require("stream");
mongoose.Promise = global.Promise;
var Emp = require("./Model/emp");
var init = require("./Model/init");
mongoose.connect("mongodb://eric:1234@ds227525.mlab.com:27525/emps_eric", {useMongoClient: true});
// mLab: mongodb://eric:1234@ds227525.mlab.com:27525/emps_eric
// local: mongodb://localhost/db1
mongoose.connection.on('connected', function(){
    console.log(myTime() + " MongoDB connected Successfully");
});
mongoose.connection.on('error', function(){
    console.log(myTime() + " MongoDB connect failed");
});
mongoose.connection.on('disconnected', function(){
    console.log(myTime() + " MongoDB disconnected");
});
app.use(express.static(path.join(__dirname, "/view")));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload());
/** for initializing the mongodb database, run init.init() first, then comment out init.init(), run init.buildRelation()*/
    init();

/** get all emps*/
app.get("/emps", function(req, res){
    Emp.find(function(err, emps){
        if (err) res.send(err);
        console.log(myTime() + " retrieved all employees\n\r");
        if (emps.length === 0) res.json(emps);
        var count = [0];
        var ret = [];
        emps.forEach(function(emp){
            emp = emp.toObject();
            if (emp.img === "") emp.img = emp.sex === "male" ? "./img/default/male-default.png" : "./img/default/female-default.png";
            Emp.find({manager: emp.id}, function(err, subordinates){
                if (err) res.send(err);
                emp.directReports = subordinates;
                if (emp.manager === "") {
                    emp.manager = {_id: "", name: ""};
                    complete(count, emp, emps, res, ret);
                } else {
                    Emp.findById(emp.manager, function(err, manager){
                        if (err) res.send(err);
                        emp.manager = manager;
                        complete(count, emp, emps, res, ret);
                    });
                }
            });
        });
        // res.json(emps);
    });
    console.log(myTime() + " try to retrieve all employees");
});
function complete(count, emp, emps, res, ret){
    count[0] ++;
    ret.push(emp);
    if (count[0] === emps.length) {
        res.json(ret);
    }
}
// get one emp
app.get("/emp/:id", function(req, res){
    Emp.findById(req.params.id, function(err, emp){
        if (err) res.send(err);
        emp = emp.toObject();  /**transform to normal javascript object*/
        if (emp.img === "") emp.img = emp.sex === "male" ? "./img/male-default.png" : "./img/female-default.png";
        console.log(myTime() + " retrieved the employee with _id=" + req.params.id + "\n\r");
        Emp.find({manager: req.params.id}, function(err, subordinates){
            if (err) res.send(err);
            emp.directReports = subordinates;
            if (emp.manager === "") {
                emp.manager = {_id: "", name: ""};
                res.json(emp);
            } else {
                Emp.findById(emp.manager, function(err, manager){
                    if (err) res.send(err);
                    emp.manager = manager;
                    res.json(emp);
                });
            }
        });
    });
    console.log(myTime() + " try to retrieve employee with _id=" + req.params.id);
});
// find all possible managers for the emp with id
app.get("/managers/:id", function(req, res){
    Emp.aggregate([{$match: {"id": req.params.id}},{
        $graphLookup: {
            from: "emps",  // local database collection name, or change to mLab database collection name
            startWith: "$id",
            connectFromField: "id",
            connectToField: "manager",
            as: "subordinates",
        }
    }], function(err, emps){
        if (err) res.send(err);
        /**these are all the direct or indirect subordinates that are not possible to be the manager of this emp*/
        var ids = [emps[0].id, emps[0].manager];  // first push the id of himself in, he cannot be the manager or himself
        // then, remove the current manager id, we would add this to the manager.current
        emps[0].subordinates.forEach(function(emp){
            ids.push(emp.id);
        });
        Emp.find({"id": {$nin: ids}}, function(err, tEmps){  /**求已知id集合的补集，所有的不含ids内id的emp的集合*/
            if (err) res.send(err);
            var managers = {  // if do not has manager, then managers.current will be undefined
                potential: tEmps,
            };
            if (emps[0].manager !== "") {
                Emp.findById(emps[0].manager, function(err, emp){
                    if (err) res.send(err);
                    managers.current = emp;
                    console.log(myTime() + " retrieved all managers of emp with _id: " + req.params.id);
                    res.json(managers);
                });
            } else {
                console.log(myTime() + " retrieved all managers of emp with _id: " + req.params.id);
                res.json(managers);
            }
        });
        // res.json(emp[0].subordinates);
    });
    console.log(myTime() + " try to retrieve all managers of emp with _id: " + req.params.id);
});
// get all the subordinates of one emp
app.get("/subordinates/:id", function(req, res){
    var id = req.params.id;
    Emp.find({manager: id}, function(err, emps){
        if (err) res.send(err);
        console.log(myTime() + " retrieved all subordinates of the employee with _id=" + id + "\n\r");
        var count = [0];
        var ret = [];
        emps.forEach(function(emp){
            emp = emp.toObject();
            if (emp.img === "") emp.img = emp.sex === "male" ? "./img/male-default.png" : "./img/female-default.png";
            Emp.find({manager: emp.id}, function(err, subordinates){
                if (err) res.send(err);
                emp.directReports = subordinates;
                if (emp.manager === "") {
                    emp.manager = {_id: "", name: ""};
                    complete(count, emp, emps, res, ret);
                } else {
                    Emp.findById(emp.manager, function(err, manager){
                        if (err) res.send(err);
                        emp.manager = manager;
                        complete(count, emp, emps, res, ret);
                    });
                }
            });
        });
        // res.json(emps);
    });
    console.log(myTime() + " try to retrieve all subordinates of emp with _id=" + id);
});
app.get("/count", function(req, res){
    Emp.count(function(err, num){
        if (err) res.send(err);
        res.json(num);
    });
});
/**delete one emp, and to link the emp's subordinates to his managers, ensure the hierarchy*/
app.delete("/emp/:id", function(req, res){  // delete the user which has a index in delete request
    var id = req.params.id;
    Emp.findById(id, function(err, emp){
        if (err) res.send(err);
        var manager_id = emp.manager;
        console.log("manager_id: " + manager_id);
        Emp.find({manager: id}, function(err, subordinates){
            if (err) res.send(err);
            var hasSubordinates = subordinates.length > 0;
            if (hasSubordinates) {
                console.log(subordinates);
                Emp.update({"manager": id},{"$set": {"manager": manager_id}}, {multi: true}, function(err, count){
                    if (err) res.send(err);
                    console.log(count);
                })
            }
            Emp.remove({
                _id: id
            }, function(err, emp) {
                if (err) res.send(err);
                console.log(myTime() + " deleted the employee with _id=" + req.params.id + "\n\r");
                res.json({ state: 200, message: 'Successfully deleted' });
            });
            console.log(myTime() + " try to delete employee with _id=" + req.params.id);
        });
    });
});
// edit one emp
app.put("/emp/:id", function(req, res){
    // 尝试直接update
    Emp.update({"_id": req.params.id}, {"$set": req.body}, function(err, count){
        if (err) res.send(err);
        res.send({state: 200, count: count, message: "update successfully"});
    });
    console.log(myTime() + " try to update employee with _id=" + req.params.id);
});
// create one emp
app.post("/emp", function(req, res){
    var emp = new Emp();      // create a new instance of the Emp model
    for (var key in req.body) {
        emp[key] = req.body[key];
    }
    emp.save(function(err, e, numAffected){
        if (err) res.send(err);
        console.log(myTime() + " created an emp ");
        Emp.update({"_id": e._id}, {$set: {"id": e._id.toString()}}, function(err, count){
            if (err) res.send(err);
            res.json({state: 200, emp: e, message: "create successfully"});
        });
    });
});
app.post("/file/:id", function(req, res){
    if (!req.files) res.json({state: 400, message: "No file uploaded"});
    var id = req.params.id;
    var myPath = __dirname + "/view/img/personnel";
    if (! fs.existsSync(myPath)) fs.mkdirSync(myPath);  // img文件夹不存在就创建
    var myFile = req.files.file;
    var extension = path.extname(myFile.name);  // myFile.name.split(".")[myFile.name.split(".").length - 1];  // 文件扩展名
    var filename = id + "_" + new Date().getTime() + extension;
    var readStream = new stream.PassThrough();
    readStream.end(myFile.data);
    // var readStream = fs.createReadStream(myFile.data);
    var writeStream = fs.createWriteStream(myPath + path.sep + filename);
    readStream.pipe(writeStream);
    res.json({state: 200, message: "successfully uploaded", filename: filename});
});



function myTime(){
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " "
        + (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + ":"
        + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()) +
        ":" + (d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds());
}
app.listen(8888, function(){
    console.log(myTime() + " server launched successfully \n\r");
});

















/**
 * mongoose 发回的数据时mongoose document object，不能修改，发回之后如果要修改需要用emp.toObject()转换，或者用.toJSON()或.lean().exec()
 *
 * */