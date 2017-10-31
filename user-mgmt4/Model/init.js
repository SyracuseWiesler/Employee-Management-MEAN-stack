var Emp = require("./emp");
var fs = require("fs");
var path = require("path");
function init(){
    var emps = [
        {name: "John Smith", title: "Eng", sex: "male", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "j.h@gmail.com", manager: ""},
        {name: "Caroline Pim", title: "Eng", sex: "female", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "k.p@gmail.com", manager: ""},
        {name: "Sal Smith", title: "Eng", sex: "male", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "s.s@gmail.com", manager: ""},
        {name: "Jack Jones", title: "Eng", sex: "male", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "j.j@gmail.com", manager: ""},
        {name: "John Doe", title: "Eng", sex: "male", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "j.d@gmail.com", manager: ""},

        {name: "Peter Pan", title: "Eng", sex: "male", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "p.p@gmail.com", manager: ""},
        {name: "Bandi Abbe", title: "Eng", sex: "male", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "b.a@gmail.com", manager: ""},
        {name: "Barak Adev", title: "Eng", sex: "male", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "b.ad@gmail.com", manager: ""},
        {name: "Eliza Band", title: "Eng", sex: "female", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "g.b@gmail.com", manager: ""},
        {name: "Garisson Banker", title: "Eng", sex: "male", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "g.banker@gmail.com", manager: ""},

        {name: "Jackson Bean", title: "Eng", sex: "male", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "j.b@gmail.com", manager: ""},
        {name: "Ellen Cater", title: "Eng", sex: "female", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "m.c@gmail.com", manager: ""},
        {name: "Peter Parker", title: "Eng", sex: "male", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "p.p@gmail.com", manager: ""},
        {name: "Hege Pege", title: "Eng", sex: "male", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "h.p@gmail.com", manager: ""},
        {name: "Donald Evan", title: "Eng", sex: "male", img: "", startDate: new Date().getTime(), officePhone: "001989767353",
            cellPhone: "001989767353", SMS: "001989767353", email: "d.e@gmail.com", manager: ""},
    ];
    /** 将personnel文件夹下图片清空，重新向内拷入图片内容并按照id来修改图片名称， */
    var imgDirPath = path.join(path.dirname(__dirname), "view", "img");
    var initDirPath = imgDirPath + path.sep + "init_img";
    var personnelDirPath = imgDirPath + path.sep + "personnel";
    fs.readdir(personnelDirPath, function(err, files) {
        if (err) throw err;
        var len = files.length;
        if (len > 0) {
            for (var file of files) {
                fs.unlink(path.join(personnelDirPath, file), function (err) {
                    if (err) throw err;
                    len--;
                    if (len === 0) {
                        copyImgs(initDirPath, personnelDirPath, emps);
                    }
                });
            }
        } else {
            copyImgs(initDirPath, personnelDirPath, emps);
        }
    });
    // /** 先清空原来的数据库collection */
    // /**根据已有的数组包裹的对象创建数据库中的对象，多重插入*/
    // Emp.remove({}, function(err, res){
    //     if(err) console.log(err);
    //     Emp.create(emps, function(err, rEmps){
    //         if (err) console.log(err);
    //         var updateCounts = rEmps.length;
    //         rEmps.forEach(function(e){
    //             Emp.update({"_id": e._id},{"$set": {"id": e._id}}, function(err, count){
    //                 if (err) console.log(err);
    //                 updateCounts --;
    //                 if (updateCounts === 0) {
    //                     console.log("collection emps have been built");
    //                     buildRelation();
    //                 }
    //             });
    //         });
    //     });
    // });
}
function copyImgs (oldPath, newPath, emps){
    fs.readdir(oldPath, function(err, files){
        if (err) console.log(err);
        var len = files.length;
        for (var file of files) {
            fs.createReadStream(path.join(oldPath, file)).pipe(fs.createWriteStream(path.join(newPath, file), {flags: "w+"}));
            len --;
            if (len === 0) prepareDB(newPath, emps);
        }
    });
}
function prepareDB(newPath, emps){
    /** 先清空原来的数据库collection */
    /**根据已有的数组包裹的对象创建数据库中的对象，多重插入*/
    Emp.remove({}, function(err, res){
        if(err) console.log(err);
        Emp.create(emps, function(err, rEmps){
            if (err) console.log(err);
            var updateCounts = rEmps.length;
            rEmps.forEach(function(e){
                var filename = "";
                var arr = e.name.split(" ");
                filename = arr[0].toLowerCase() + "_" + arr[1].toLowerCase();
                fs.renameSync(path.join(newPath, filename + ".jpg"), path.join(newPath, e._id + ".jpg"));
                Emp.update({"_id": e._id},{"$set": {"id": e._id, "img": path.join("./img/personnel",e._id + ".jpg")}}, function(err, count){
                    if (err) console.log(err);
                    updateCounts --;
                    if (updateCounts === 0) {
                        console.log("collection emps have been built");
                        buildRelation();
                    }
                });
            });
        });
    });
}
function link (subordinate, manager, size){
    Emp.find({name: subordinate}, function(err, emp){
        if (err) console.log(err);
        Emp.find({name: manager}, function(err, m){
            // console.log("Emp是: " + emp);
            // console.log("manager是: " + m);
            emp[0].manager = m[0]._id;
            emp[0].save().then(function(err){
                if (err) console.log(err);
                size[0] --;  /**这里也是将异步转换为异步监听的办法，当所有的异步的query更新完毕后再做后续操作*/
                if (size[0] === 0) {
                    console.log("collection emps subordinating relationship has been built")
                }
            });
        });
    });
}
function linkByObj (obj) {
    var size = [Object.keys(obj).length];
    for(var key in obj) {
        var subordinate = key;
        var manager = obj[key];
        link(subordinate, manager, size);
    }
}
function buildRelation(){
    // 构建关系
    linkByObj({
        "Caroline Pim": "John Smith",
        "Sal Smith": "John Smith",
        "Jack Jones": "Caroline Pim",
        "Barak Adev": "Sal Smith",
        "Peter Pan": "Sal Smith",
        "John Doe": "Sal Smith",
        "Jackson Bean": "Jack Jones",
        "Ellen Cater": "Jackson Bean",
        "Peter Parker": "Jackson Bean",
        "Bandi Abbe": "Jackson Bean",
        "Hege Pege": "Ellen Cater",
        "Donald Evan": "Ellen Cater",
    });
}
module.exports = init;