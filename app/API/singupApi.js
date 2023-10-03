const express = require('express');
const app = express();
const router = express.Router();
app.use(express.json());
const data = require('./data.json');

// JWT token 
const jwt = require('jsonwebtoken');
const jwtKey = 'ramesh';

const singup = require('../Schema/singupSchema');

router.post('/add-user', async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;
        const addAdmin = await singup.create({
            username: username,
            email: email,
            phone: phone,
            password: password,
            count: 0
        })
        console.log('addAdmin::: ', addAdmin);
        res.send({ message: "user added...", token: addAdmin._id });
    } catch (error) {
        console.log('error::: ', error);
        return res.send(error)
    }
})

router.post('/user-login', async (req, res, next) => {
    try {
        const loginValidate = await singup.findOne({
            username: req.body.username,
            password: req.body.password
        });
        if (loginValidate && loginValidate.count <= 3) {

            jwt.sign({ loginValidate }, jwtKey, { expiresIn: "1min" }, async (error, token) => {
                if (error) {
                    return res.send({ error: "User in invalid" });
                } else {
                    console.log('token::: ', token);
                    loginValidate.count = 0;
                    await loginValidate.save();
                    return res.send({ massage: "Login success...", auth: token });
                }
            })
        } else {
            const userNameFind = await singup.findOne({ username: req.body.username });
            if (userNameFind) {
                userNameFind.count = userNameFind.count + 1;
                await userNameFind.save();
                if (userNameFind.count < 3) {
                    return res.send({ massage: `User password is incorrect try ${3 - userNameFind.count}` })
                } else {
                    // await userNameFind.deleteOne();
                    return res.send({ massage: 'User is locked...' })
                }
            } else {
                return res.send({ massage: 'User is not found...' })
            }
        }
    } catch (error) {
        console.log('error::: ', error);
        return res.send({ massage: error });
    }
})

router.get('/all-data', verify, async (req, res) => {
    return res.send({ code: 200, data: data });
})


// Middleware
function verify(req, res, next) {
    const tokenValidation = req.headers['authentication'];
    if (tokenValidation) {
        const validTokenD = tokenValidation;
        jwt.verify(validTokenD, jwtKey, (error, valid) => {
            if (error) {
                console.log('error::: ', error);
                res.send(403, { massage: "Authentication failed..." });
            } else { next(); }
        })
    } else {
        res.send(403, { err: "Authentication not found error..." });
    }
}
module.exports = router;