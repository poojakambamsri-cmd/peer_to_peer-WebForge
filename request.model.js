import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },

    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 500
    },

    skill: {
        type: String,
        required: true
    },

    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },

    requestTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        default: null
    },

    status: {
        type: String,
        enum: ['Open', 'Accepted', 'Closed'],
        default: 'Open'
    },

    active: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true,
    versionKey: false
});

export const RequestModel = mongoose.model('request', requestSchema);
