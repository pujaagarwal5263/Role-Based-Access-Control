var mongoose=require("mongoose");

mongoose.connect("mongodb://localhost:27017/RBAC",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}).then(()=>{
    console.log("Database Connected Successfully");
}).catch((err)=>{
    console.log("No Connection to Database");
})

