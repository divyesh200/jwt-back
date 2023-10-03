const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

mongoose.connect("mongodb+srv://divyeshmak20:jwt20100@clusterjwt.rsesnm1.mongodb.net/jwtdata", {
    useNewUrlParser: true,
}).then(() => {
    console.log("DB Conection Done....");
}).catch((error) => {
    console.log("error", error);
})