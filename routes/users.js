const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/fb');
const plm = require('passport-local-mongoose');
const userSchema = mongoose.Schema({
    name: String,
    Profile: {
        type: Array,
        default: ['def.jpg']
    },
    username: String,
    password: String,
    email:String,
    totalpost: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts"
    }],
    secret:{
        type:String
    },
    expiry:{
        type:Date
    }
});
userSchema.plugin(plm);
module.exports = mongoose.model('users', userSchema);