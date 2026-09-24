import mongoose from "mongoose";
import {bcrypt} from "bcryptjs";
import dotenv from "dotenv";
import { UserModel } from "./user.model.js";

dotenv.config();


async function seedDatabase() {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");


        const userPassword = await bcrypt.hash(
            "user123456",
            10
        );

        const adminPassword = await bcrypt.hash(
            "admin123456",
            10
        );


        await UserModel.findOneAndUpdate(

            {
                email: "user@gmail.com"
            },

            {
                name: "Test User",
                email: "user@gmail.com",
                password: userPassword,
                role: "user",
                active: true
            },

            {
                upsert: true,
                new: true
            }

        );


        await UserModel.findOneAndUpdate(

            {
                email: "admin@gmail.com"
            },

            {
                name: "Admin User",
                email: "admin@gmail.com",
                password: adminPassword,
                role: "admin",
                active: true
            },

            {
                upsert: true,
                new: true
            }

        );


        console.log("Seed data created successfully");

        console.log("");
        console.log("USER LOGIN");
        console.log("Email: user@gmail.com");
        console.log("Password: user123456");

        console.log("");

        console.log("ADMIN LOGIN");
        console.log("Email: admin@gmail.com");
        console.log("Password: admin123456");


        await mongoose.disconnect();

    } catch (err) {

        console.log("Seed error:", err.message);

    }

}

seedDatabase();
export default seedDatabase;