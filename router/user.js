let router = require('express').Router();
const {check, validationResult} = require('express-validator');
let userModel = require('./../model/userModel');
let jwt = require('jsonwebtoken');

router.get('/', (req, res)=>{
    res.send('this is a user api')
});

router.post('/signup', [ check('email').isEmail() ],  (req, res)=>{
    let email = req.body.email;
    let password = req.body.password;
    let errors = validationResult(req);
    console.log(errors)
    
    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    } else{
        let user = new userModel({
            email : email,
            password : password
        });

        user.save((err, data)=>{
            if(err) res.status(500).json({error: true, errmsg: err});
            else res.status(200).json({save: true, user: data });
        })
    }
});

router.post('/login', (req, res)=>{
    let email = req.body.email;
    let password = req.body.password;

    userModel.findOne({email}, (err, user)=>{
        if(err) res.status(500).json({error: err});
        else if(!user) res.status(402).json({error: 'user not found'});
        else{
            user.verifyPassword(password, (err, result)=>{
                if(err) return res.status(500).json({error: err})
                else if(!result) res.status(402).json({error: 'password not matching'})
                else{
                    let token = jwt.sign({
                        email : user.email
                    }, 'SecretforToken', {expiresIn: '1h'});
                    res.status(200).json({login: true, token: token});
                }
            })
        }
    })
});

router.put('/update', checkAuth, (req, res)=>{
    let email = req.body.email;
    let password = req.body.email;
    let userEmail = req.userEmail;
    
    userModel.findOne({email: userEmail}, (err, userData)=>{
        if(err){
            res.status(500).json({error: err})
        } else{
            let newUserData = {
                email: (email != undefined) ? email : userData.email,
                password: (password != undefined) ? password : userData.password
            }
            userModel.findByIdAndUpdate(userData._id, newUserData, (err, data)=>{
                if(err){
                    res.status(500).json({error: err})
                } else{
                    res.status(200).json(data);
                }
            })
        }
        
    })
});

function checkAuth(req, res, next){
    if('token' in req.headers){
        let token = req.headers['token'];
        jwt.verify(token, 'SecretforToken', (err, decoded)=>{
            if(err){
                res.status(402).json({token : false, error: 'not a valid Token'})
            } else{
                req.userEmail = decoded.email;
                next();
            }
        });
    } else{
        res.status(402).json({token : false, error: 'Token missing'});
    }
}

module.exports = router;
