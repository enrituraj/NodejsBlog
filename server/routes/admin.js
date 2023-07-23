const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin'
const jwtSecret = process.env.JWT_SCERET

const authMiddleware = (req,res,next) =>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:'unauthorized'})
    }
    try {
        const decode = jwt.verify(token,jwtSecret);
        req.userId = decode.userId;
        next()
    } catch (error) {
        return res.status(401).json({message:'unauthorized'})
    }
}


router.get('/admin',(req,res)=>{
    try {
        res.render('admin/index',{layout:adminLayout})
    } catch (error) {
        console.log(error);
    }
})

router.post('/admin',async(req,res)=>{
    try {

        const {username,password} = req.body;

        const user = await User.findOne({username});
        if(!user){
            return res.status(401).json({message:"invalid credentials"});
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(401).json({message:"invalid credentials"});
        }


        const token = jwt.sign({userId:user._id},jwtSecret);
        res.cookie('token',token,{httpOnly:true})
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }
})

router.get('/dashboard',authMiddleware, async (req,res)=>{

    try {
        const locals = {
            title:'node js blog',
            description:'Simple blog created with nodejs,express & mongodb'
        }
        const data = await Post.find();
    res.render('admin/dashboard',{locals,data,layout:adminLayout})

    } catch (error) {
        
    }

})

router.get('/add-post',authMiddleware, async (req,res)=>{

    try {
        const locals = {
            title:'Add posts',
            description:'Simple blog created with nodejs,express & mongodb'
        }
    res.render('admin/add-post',{locals,layout:adminLayout})

    } catch (error) {
        
    }

})


router.post('/add-post',authMiddleware,async(req,res)=>{
    try {
        const {title,body} = req.body;

        try{
            const post = await Post.create({title,body});
            res.redirect('/dashboard');
        }catch(error){
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
})


router.get('/edit-post/:id',authMiddleware, async (req,res)=>{
    try {

        const locals = {
            title:'View / Edit Posts',
            description:'Simple blog created with nodejs,express & mongodb'
        }
        const data = await Post.findOne({_id:req.params.id});
        res.render('admin/edit-post',{data,locals,layout:adminLayout})
    } catch (error) {
        console.log(error);
    }
})
router.put('/edit-post/:id',authMiddleware, async (req,res)=>{
    try {

        await Post.findByIdAndUpdate({_id:req.params.id},{
            title:req.body.title,
            body:req.body.body,
            updatedAt: Date.now()
        })

        res.redirect(`/edit-post/${req.params.id}`)
    } catch (error) {
        console.log(error);
    }
})


router.delete('/delete-post/:id',authMiddleware, async (req,res)=>{
    try {
        await Post.deleteOne({_id:req.params.id})
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
    }
})

router.post('/register',async(req,res)=>{
    try {
        const {username,password} = req.body;
        const hashPassword = await bcrypt.hash(password,10);

        try{
            const user = await User.create({username,password:hashPassword});
            res.status(201).json({message:'user created',user});
        }catch(error){
            if(error.code === 11000){
                res.status(409).json({message:'user already created'})
            }
            res.status(500).json({message:'internal server error.'})
        }


    } catch (error) {
        console.log(error);
    }
})


router.get('/logout',(req,res)=>{
    res.clearCookie('token');
    res.redirect('/');
})

module.exports = router