import exp from 'express';
import studentModel from './student.model.js';
import { hash, compare } from 'bcrypt'; 
import jwt from 'jsonwebtoken';
import { verifyToken } from './verifyToken.middleware.js';
import { RequestModel } from './request.model.js';

export const studentRouter = exp.Router();

//signup student
studentRouter.post('/students', async (req, res) => {
    let newStudentObj = req.body;
    let hashedPassword = await hash(newStudentObj.password, 10);
    newStudentObj.password = hashedPassword;
    let newStudent = await studentModel.create(newStudentObj);
    res.status(201).json({message: 'Student created successfully', data: newStudent});
})

//login student
studentRouter.post('/students/login', async (req, res) => {
    let studentObj = req.body;
    let studentInDb = await studentModel.findOne({email: studentObj.email});
    //email verification
    if(!studentInDb){
        return res.status(401).json({success: false, message: 'Invalid Email'});
    }
    //password verification
    let result = await compare(studentObj.password, studentInDb.password);
    if(!result){
        return res.status(401).json({success: false, message: 'Invalid Password'});
    }
    //generate token
    let signedToken = jwt.sign({ id: studentInDb._id }, process.env.JWT_SECRET, { expiresIn: '10d' });
    res.cookie('token', signedToken, { httpOnly: true });
    res.status(200).json({success: true, message: 'Login success', data: signedToken});
});

//logout student
studentRouter.post('/students/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true });
    res.status(200).json({success: true, message: 'Logout success'});
});

//view student own profile
studentRouter.get('/students/:id', verifyToken, async (req, res) => {
    let studentId = req.params.id;
    const idFromToken = req.student?._id || req.student?.id;
    if(studentId !== idFromToken){
        return res.status(401).json({success: false, message: 'You can only view your own profile.'});
    }
    let student = await studentModel.findById(studentId);
    if(!student){
        return res.status(404).json({success: false, message: 'Student not found'});
    }
    else {
        res.status(200).json({success: true,message: 'Student found', data: student});
    } 
})

//update student own profile
studentRouter.put('/students/update/:id', verifyToken, async (req, res) => {
    let studentId = req.params.id;
    const idFromToken = req.student?._id || req.student?.id;
    if(studentId !== idFromToken){
        return res.status(401).json({success: false, message: 'You can only update your own profile.'});
    }
    let student = await studentModel.findById(studentId);
    if(!student){
        return res.status(404).json({success: false, message: 'Student not found'});
    }
    else {
        let { name, email, password, branch, year } = req.body;
        let updatedStudent = await studentModel.findByIdAndUpdate(studentId, { name, email, password, branch, year }, { new: true, runValidators: true });
        res.status(200).json({success: true, message: 'Student updated', data: updatedStudent});
    } 
})

//update student own password
studentRouter.put('/students/update-password/:id', verifyToken, async (req, res) => {
    let studentId = req.params.id;
    const idFromToken = req.student?._id || req.student?.id;
    if(studentId !== idFromToken){
        return res.status(401).json({success: false, message: 'You can only update your own profile.'});
    }
    let student = await studentModel.findById(studentId);
    if(!student){
        return res.status(404).json({success: false, message: 'Student not found'});
    }
    else {
        let newStudentObj = req.body;
        let hashedPassword = await hash(newStudentObj.password, 10);
        let updatedStudent = await studentModel.findByIdAndUpdate(studentId, { password: hashedPassword }, { new: true, runValidators: true });
        res.status(200).json({success: true, message: 'Student password updated', data: updatedStudent});
    } 
})

//add skill to student
studentRouter.put('/students/:id/skills', verifyToken, async (req, res) => {
    let studentId =req.params.id;
    const idFromToken = req.student?._id || req.student?.id;
    if(studentId !== idFromToken){
        return res.status(401).json({success: false, message: 'You can only add skills to your own profile.'});
    }
    let student = await studentModel.findById(studentId);
    if(!student){
        return res.status(404).json({success: false, message: 'Student not found'});
    }

    let { skill } = req.body;
    if(!skill){
        return res.status(400).json({success: false, message: 'Skill is required'});
    }
    let updatedStudent = await studentModel.findByIdAndUpdate(studentId, 
        { $addToSet: { skills: skill} }, 
        { new: true, runValidators: true });

    res.status(200).json({success: true, message: 'Skill added to student', data: updatedStudent});

})

//read student by id
studentRouter.get('/view-students/:id', verifyToken, async (req, res) => {
    let studentId = req.params.id;
    let student = await studentModel.findById(studentId);
    if(!student){
        return res.status(404).json({success: false, message: 'Student not found'});
    }
    else {
        res.status(200).json({success: true,message: 'Student found', data: student});
    }
})

//read all students with a specific skill
studentRouter.get('/students/skill/:skill', verifyToken, async (req, res) => {
    let skill = req.params.skill;
    let students = await studentModel.find({ skills: skill });
    if(students.length === 0){
        return res.status(404).json({success: false, message: 'No students found with this skill'});
    }
    else {
        res.status(200).json({success: true,message: 'Students found', data: students});
    }
})

//read all students
studentRouter.get('/view-students', verifyToken, async (req, res) => {
    let students = await studentModel.find();   
    if(students.length === 0){
        return res.status(404).json({success: false, message: 'No students found'});
    }
    else {
        res.status(200).json({success: true,message: 'Students found', data: students});
    } 
})

//post a request
studentRouter.post('/students/:id/requests', verifyToken, async (req, res) => {
    let studentId = req.params.id;
    const idFromToken = req.student?._id || req.student?.id;
    if(studentId !== idFromToken){
        return res.status(401).json({success: false, message: 'You can only post requests for your own profile.'});
    }

    let student = await studentModel.findById(studentId);
    if(!student){
        return res.status(404).json({success: false, message: 'Student not found'});
    }   

    let { title, description, skill } = req.body;
    if(!title || !description || !skill){
        return res.status(400).json({success: false, message: 'Title, description and skill are required'});
    }
    let newRequest = await RequestModel.create({ title, description, skill, requester: studentId, requestTo: null });
    student.myrequests.push(newRequest._id);
    await student.save();
    res.status(201).json({success: true, message: 'Request created successfully', data: newRequest});
}
)

//change requestTo of a request
studentRouter.put('/students/:id/requests/:requestId', verifyToken, async (req, res) => {
    let studentId = req.params.id;
    const idFromToken = req.student?._id || req.student?.id;
    if(studentId !== idFromToken){
        return res.status(401).json({success: false, message: 'You can only update requests for your own profile.'});
    }
    let student = await studentModel.findById(studentId);
    if(!student){
        return res.status(404).json({success: false, message: 'Student not found'});
    }
    let requestId = req.params.requestId;
    let request = await RequestModel.findById(requestId);
    if(!request){   
        return res.status(404).json({success: false, message: 'Request not found'});
    }
    let { requestTo } = req.body;
    if(!requestTo){
        return res.status(400).json({success: false, message: 'requestTo is required'});
    }   
    let requestToStudent = await studentModel.findById(requestTo);
    if(!requestToStudent){
        return res.status(404).json({success: false, message: 'requestTo student not found'});
    }   
    let updatedRequest = await RequestModel.findByIdAndUpdate(requestId, { requestTo }, { new: true, runValidators: true });
    requestToStudent.requestsToMe.push(updatedRequest._id);
    await requestToStudent.save();
    res.status(200).json({success: true, message: 'Request updated successfully', data: updatedRequest});
}
)

//get all requests of a student
studentRouter.get('/students/:id/requests', verifyToken, async (req, res) => {
    let studentId = req.params.id;
    const idFromToken = req.student?._id || req.student?.id;
    if(studentId !== idFromToken){
        return res.status(401).json({success: false, message: 'You can only view requests for your own profile.'});
    }
    let student = await studentModel.findById(studentId).populate('myrequests').populate('requestsToMe');
    if(!student){
        return res.status(404).json({success: false, message: 'Student not found'});
    }   
    res.status(200).json({success: true, message: 'Requests found', data: { myrequests: student.myrequests, requestsToMe: student.requestsToMe }});
}
)

//accept or reject a request 
studentRouter.put('/students/:id/requests/:requestId/status', verifyToken, async (req, res) => {
    let studentId = req.params.id;
    const idFromToken = req.student?._id || req.student?.id;
    if(studentId !== idFromToken){
        return res.status(401).json({success: false, message: 'You can only update requests on your own profile.'});
    }
    let student = await studentModel.findById(studentId);
    if(!student){
        return res.status(404).json({success: false, message: 'Student not found'});
    }
    let requestId = req.params.requestId;
    let request = await RequestModel.findById(requestId);
    if(!request){
        return res.status(404).json({success: false, message: 'Request not found'});
    }
    if(request.requestTo.toString() !== studentId){
        return res.status(401).json({success: false, message: 'You can only update requests that are assigned to you.'});
    }
    let { status } = req.body;
    if(!status || !['Open', 'Accepted', 'Closed'].includes(status)){
        return res.status(400).json({success: false, message: 'Status is required and must be one of Open, Accepted or Closed'});
    }
    let updatedRequest = await RequestModel.findByIdAndUpdate(requestId, { status }, { new: true, runValidators: true });
    res.status(200).json({success: true, message: 'Request status updated successfully', data: updatedRequest});
}
)

//delete a request
studentRouter.delete('/students/:id/requests/:requestId', verifyToken, async (req, res) => {
    let studentId = req.params.id;
    const idFromToken = req.student?._id || req.student?.id;
    if(studentId !== idFromToken){
        return res.status(401).json({success: false, message: 'You can only delete requests for your own profile.'});
    }
    let student = await studentModel.findById(studentId);
    if(!student){
        return res.status(404).json({success: false, message: 'Student not found'});
    }
    let requestId = req.params.requestId;
    let request = await RequestModel.findById(requestId);
    if(!request){
        return res.status(404).json({success: false, message: 'Request not found'});
    }
    if(request.requester.toString() !== studentId){
        return res.status(401).json({success: false, message: 'You can only delete requests that you have created.'});
    }
    await RequestModel.findByIdAndDelete(requestId);
    student.myrequests.pull(requestId);
    await student.save();
    res.status(200).json({success: true, message: 'Request deleted successfully'});
}
)

//delete student own profile
studentRouter.delete('/students/:id', verifyToken, async (req, res) => {
    let studentId = req.params.id;
    const idFromToken = req.student?._id || req.student?.id;
    if(studentId !== idFromToken){
        return res.status(401).json({success: false, message: 'You can only delete your own profile.'});
    }
    let student = await studentModel.findById(studentId);
    if(!student){
        return res.status(404).json({success: false, message: 'Student not found'});
    }
    //delete all requests created by the student
    await RequestModel.deleteMany({ requester: studentId });
    //delete all requests assigned to the student
    await RequestModel.deleteMany({ requestTo: studentId });
    await studentModel.findByIdAndDelete(studentId);
    res.status(200).json({success: true, message: 'Student deleted successfully'});
}
)

//view request status of a student
studentRouter.get('/students/:id/requests/status', verifyToken, async (req, res) => {
    let studentId = req.params.id;
    const idFromToken = req.student?._id || req.student?.id;
    if(studentId !== idFromToken){
        return res.status(401).json({success: false, message: 'You can only view requests for your own profile.'});
    }
    let student = await studentModel.findById(studentId).populate('myrequests').populate('requestsToMe');
    if(!student){
        return res.status(404).json({success: false, message: 'Student not found'});
    }
    let myRequestsStatus = student.myrequests.map(request => ({ id: request._id, title: request.title, status: request.status }));
    let requestsToMeStatus = student.requestsToMe.map(request => ({ id: request._id, title: request.title, status: request.status }));
    res.status(200).json({success: true, message: 'Requests status found', data: { myRequestsStatus, requestsToMeStatus }});
})