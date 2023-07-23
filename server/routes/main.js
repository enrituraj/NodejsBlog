const express = require('express');
const router  = express.Router();
const Post = require('./../models/Post');

router.get('/',async(req,res)=>{
   
    try {
        const locals = {
            title:'node js blog',
            description:'Simple blog created with nodejs,express & mongodb'
        }

        let perpage = 10;
        let page = req.query.page || 1;
        const data = await Post.aggregate([{$sort:{createdAt:-1}}])
            .skip(perpage*page - perpage)
            .limit(perpage)
            .exec();
        
        const count = await Post.count();
        const nextPage = parseInt(page) +1;

        const hasNextPage = nextPage <= Math.ceil(count/perpage);

        res.render("index",{
            locals,
            data,
            current:page,
            nextPage:hasNextPage ? nextPage : null
        });

    } catch (error) {
        console.log(error)
    }


})

router.get('/post/:id',async(req,res)=>{
    try {
        let slug = req.params.id;
        const data = await Post.findById({_id:slug});
        const locals = {
            title:data.title,
            description:'Simple blog created with nodejs,express & mongodb'
        }
        res.render('post',{locals,data})

    } catch (error) {
        console.log(error);
    }
})
 
router.post('/search',async (req,res) =>{
    try {
        const locals = {
            title:"search",
            description:'Simple blog created with nodejs,express & mongodb'
        }
        let searchTerm = req.body.searchTerm;
        const searchSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"");
        const data = await Post.find({
            $or: [
                { title: {$regex: new RegExp(searchSpecialChar,'i') }},
                { body: {$regex: new RegExp(searchSpecialChar,'i') }}
            ]
        })

        res.render('search',{
            locals,data
        })

    } catch (error) {
        console.log(error);
    }
})


router.get('/about',(req,res)=>{
    res.render('about');
})

module.exports = router;