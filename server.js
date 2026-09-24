import 'dotenv/config';
import exp from 'express';
import { connect } from 'mongoose';
import { studentRouter } from './student.router.js';
import { adminRouter } from './admin.router.js';
import { cookieParserMiddleware } from './cookie-parser.middleware.js';

const app = exp();
const PORT = process.env.PORT || 3000;

app.use(cookieParserMiddleware);
app.use(exp.json());
app.use('/students-api', studentRouter);
app.use('/admin-api', adminRouter);

async function connectToDb() {
    try {
        await connect(process.env.DbURL);
        console.log('Connected to DB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to DB:', error);
    }
}

connectToDb();

app.use((err, req, res, next) => {
    console.log("Error is:", err);
    res.json({ success: false, message: err.message });
});