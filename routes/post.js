const mongoose = require('mongoose')
const postSchema = mongoose.Schema({
    content: String,
    imageurl: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    likes: [],
    comment:[{type: mongoose.Schema.Types.ObjectId, ref: 'comments'}]
});
module.exports = mongoose.model('posts', postSchema);