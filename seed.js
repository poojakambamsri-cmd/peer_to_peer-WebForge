import mongoose from "mongoose";
import dotenv from "dotenv";
import { hash } from "bcrypt";
import studentModel from "./student.model.js";

dotenv.config();


async function seedDatabase() {
    try {
        if (!process.env.DbURL) {
            throw new Error("DbURL is not configured");
        }

        await mongoose.connect(process.env.DbURL);
        console.log("MongoDB connected");

        const password = await hash("user123456", 10);
        await studentModel.findOneAndUpdate(
            { email: "user@gmail.com" },
            {
                name: "Test User",
                email: "user@gmail.com",
                password,
                branch: "Computer Science",
                year: 1,
                active: true
            },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );

        console.log("Seed data created successfully");
        console.log("USER LOGIN");
        console.log("Email: user@gmail.com");
        console.log("Password: user123456");
    } catch (err) {
        console.error("Seed error:", err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedDatabase();
export default seedDatabase;