import exp from 'express';
import jwt from 'jsonwebtoken';
import studentModel from './student.model.js';
import { RequestModel } from './request.model.js';
import { verifyToken } from './verifyToken.middleware.js';

export const adminRouter = exp.Router();

function verifyAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.student?.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        next();
    });
}

// Admin login
adminRouter.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
        { username, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({ success: true, message: 'Admin login successful', data: token });
});

// Admin logout
adminRouter.post('/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true });
    res.status(200).json({ success: true, message: 'Admin logout successful' });
});

// Get all students
adminRouter.get('/users', verifyAdmin, async (req, res) => {
    const students = await studentModel.find().select('-password');
    res.status(200).json({ success: true, message: 'All students fetched successfully', data: students });
});

// Activate or deactivate a student
adminRouter.put('/users/:id/:action', verifyAdmin, async (req, res) => {
    const { id, action } = req.params;

    if (!['activate', 'deactivate'].includes(action)) {
        return res.status(400).json({ success: false, message: 'Action must be activate or deactivate' });
    }

    const student = await studentModel.findByIdAndUpdate(
        id,
        { active: action === 'activate' },
        { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
        success: true,
        message: `Student ${action}d successfully`,
        data: student
    });
});

// Delete a student
adminRouter.delete('/users/:id', verifyAdmin, async (req, res) => {
    const student = await studentModel.findByIdAndDelete(req.params.id);

    if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await RequestModel.deleteMany({ requester: req.params.id });
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
});

// Get all help requests
adminRouter.get('/help-requests', verifyAdmin, async (req, res) => {
    const requests = await RequestModel.find()
        .populate('requester', '-password')
        .populate('requestTo', '-password');

    res.status(200).json({ success: true, message: 'All help requests fetched successfully', data: requests });
});

// Get a specific help request
adminRouter.get('/help-requests/:id', verifyAdmin, async (req, res) => {
    const request = await RequestModel.findById(req.params.id)
        .populate('requester', '-password')
        .populate('requestTo', '-password');

    if (!request) {
        return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    res.status(200).json({ success: true, message: 'Help request fetched successfully', data: request });
});

// Update a help request status or active state
adminRouter.put('/help-requests/:id/moderate', verifyAdmin, async (req, res) => {
    const allowedFields = ['status', 'active'];
    const updates = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: 'Provide a valid status or active value' });
    }

    const request = await RequestModel.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!request) {
        return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    res.status(200).json({ success: true, message: 'Help request moderated successfully', data: request });
});

// Activate or deactivate a help request
adminRouter.put(['/help-requests/:id/:action', '/requests/:id/:action'], verifyAdmin, async (req, res) => {
    const { id, action } = req.params;

    if (!['activate', 'deactivate'].includes(action)) {
        return res.status(400).json({ success: false, message: 'Action must be activate or deactivate' });
    }

    const request = await RequestModel.findByIdAndUpdate(
        id,
        { active: action === 'activate' },
        { new: true, runValidators: true }
    );

    if (!request) {
        return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    res.status(200).json({
        success: true,
        message: `Help request ${action}d successfully`,
        data: request
    });
});

// Delete a help request
adminRouter.delete('/help-requests/:id', verifyAdmin, async (req, res) => {
    const request = await RequestModel.findByIdAndDelete(req.params.id);

    if (!request) {
        return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    res.status(200).json({ success: true, message: 'Help request deleted successfully' });
});
