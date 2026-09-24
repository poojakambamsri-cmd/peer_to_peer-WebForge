import {Schema, model} from 'mongoose';
const studentSchema = new Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        minlength: [3, 'Name must be at least 3 characters'],
        maxlength: [50, 'Name must be at most 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    branch: {
        type: String,
        minlength: [2, 'Branch must be at least 2 characters'],
        maxlength: [50, 'Branch must be at most 50 characters']
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [1, 'Year must be a positive number'],
        max: [4, 'Year must be between 1 and 4']
    },
    skills: {
        type: [String],
        default: []
    },
    myrequests: [{
        type: Schema.Types.ObjectId,
        ref: 'request'
    }],
    requestsToMe: [{
        type: Schema.Types.ObjectId,
        ref: 'request'
    }],
    active: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true,
    versionKey: false,
    strict:'throw'
})

export const studentModel = model('student', studentSchema);
export default studentModel;