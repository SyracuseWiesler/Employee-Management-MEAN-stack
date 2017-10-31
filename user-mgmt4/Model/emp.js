var mongoose = require("mongoose");
/**好像在一个数据库中，每定义一个对象都对应着一个符合这个对象的schema的collection
 * 然后操作时，只会操作这个数据库中的这个collection
 * 如果你操作数据库时不想用Emp. ...()也可以用mongoose.model(...).来操作确定的collection
 * */
var Schema = mongoose.Schema;
var EmpSchema = new Schema({
    id: String,
    name: String,
    title: String,
    sex: String,
    img: String,  // depends on image storage method; local URL(images in static folder), reference(images in web host)
    startDate: Number,  // time stamp
    officePhone: String,
    cellPhone: String,
    SMS: String,
    email: String,
    manager: String,  // manager id
});
module.exports = mongoose.model("Emp", EmpSchema);