const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

let UserSchema = new Schema({
    email : {
        type: String
    },
    password : String,
    secretSalt : String
});

UserSchema.pre('save', function(next){
    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(this.password, salt, (err, hash)=>{
            this.password = hash;
            this.secretSalt = salt;
            next();
        })
    })
})

UserSchema.methods.verifyPassword = function(password, next){
    bcrypt.compare(password, this.password, next);
}

module.exports = mongoose.model('user', UserSchema);
