var mongoose = require("mongoose");
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