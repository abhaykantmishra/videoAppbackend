import 'dotenv/config'
import {connectDB} from "./db/connection.js";
import app from "./app.js";

// DB_NAME for a collections in Db =>
const DB_NAME = "video-app";
const PORT = process.env.PORT || 3000;

// connecting mongo-db =>
const mongoDB_uri = `${process.env.MONGODB_URI}/${DB_NAME}`

connectDB(mongoDB_uri)
.then(() => {
    app.listen(PORT , ()=>{
        console.log(`Server started at http://localhost:${PORT}`);
    })
})
.catch((err) => {
    console.log(`connection failed : ${err}`);
});