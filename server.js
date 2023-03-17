/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: _Shao Qiao____ Student ID: 145954210_ Date: 2023-03-16_
*
*  Online (Cyclic) Link: https://zany-teal-donkey-cape.cyclic.app
*
********************************************************************************/ 

var express = require("express");
var app = express();
var HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));
const blogService = require('./blog-service');
const { initialize } = require('./blog-service');
const path=require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const postsData = require('./data/posts.json');
const upload = multer();
const storage = multer.memoryStorage();
app.use(express.static("public"));
//const upload = multer({ dest: "uploads/" });
const { getAllPosts,
getPublishedPosts,
getCategories,
getPosts, 
getPublishedPostsSync, 
getCategoriesSync,
addPost,
getPostsByCategory,
getPostsByMinDate,
getPostById,
getPublishedPostsByCategory, } = require('./blog-service');
cloudinary.config({
  cloud_name: 'dvogv4xnj',
  api_key: '372426185215898',
  api_secret: 'Yyt_I6jU5XAQofQgyFhnmaD9TBQ',
  secure: true
});
const exphbs=require("express-handlebars");
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');
const Handlebars = require('handlebars');
const stripJs = require('strip-js');
//3.1.4
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});
app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  helpers: { navLink: function(url, options){
    return '<li' + 
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
},
equal: function (lvalue, rvalue, options) {
  if (arguments.length < 3)
      throw new Error("Handlebars Helper equal needs 2 parameters");
  if (lvalue != rvalue) {
      return options.inverse(this);
  } else {
      return options.fn(this);
  }
},
safeHTML: function(context){
  return stripJs(context);
}
}
}));

app.get('/', function(req, res) {
  res.redirect('/blog');
});
// app.get('/about', function(req, res) {
//   res.sendFile(__dirname + '/views/about.html');
// });
app.get('/about', function(req, res) {
  res.render('about', {
    title: 'About Me'
  });
});
app.get('/blog', async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};
  try{
      // declare empty array to hold "post" objects
      let posts = [];
      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
          }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
        }
      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
      // get the latest post from the front of the list (element 0)
        let post = posts[0]; 
      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;
  }catch(err){
      viewData.message = "no results";
  }
  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }
  // render the "blog" view with all of the data (viewData)
        res.render("blog", {data: viewData})
});
// app.get('/blog', (req, res) => {
//     const posts = blogService.getPublishedPostsSync();
//   res.send(posts);
// });

app.post('/posts/add', upload.single('featureImage'), (req, res) => {
  let streamUpload = (req) => {
    console.log("hello1");
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
  }

  upload(req).then((uploaded) => {
    req.body.featureImage = uploaded.url;
    req.body.published = req.body.published || false;
        let postData = req.body;
    postData.id = blogService.posts.length + 1;
    if (postObject.category) {
      addPost(postObject);
    }
    res.redirect("/posts");
  })
    .catch((err) => {
    res.send(err);
  });
});
// app.post("/posts/add", upload.single("featureImage"), async (req, res) => {
//   let result = await streamUpload(req);
//   req.body.featureImage = result.url;
//   req.body.published = req.body.published === undefined ? false : true;
//   req.body.id = posts.length + 1;
//   posts.push(req.body);
//   res.redirect("/posts");
// });
// blogService.initialize();
// app.post('/posts/add', upload.single('featureImage'), (req, res) => {
//   console.log("addpost");
//   let postData = req.body;
//   // Set the published property to false if it's undefined
//   console.log("step1app.post is running")
//   postData.published = postData.published || false;
//   // Set the id property
//   postData.id = posts.length + 1;
//   // Add the post to the posts array
//   addPost(postData)
//     .then((newPost) => {
//       console.log('New blog post added:', newPost);
//       res.redirect('/posts');
//     })
//     .catch((err) => {
//       console.log('Error adding new blog post:', err);
//       res.redirect('/error');
//     });
// });
//app.get('/posts', (req, res) => {
  //const posts = blogService.getPosts();
 // res.send(posts);
//});
app.get('/posts', (req, res) => {
  const { category } = req.query;
 //console.log(req.query);
  let filteredPosts = postsData;
  if (category) {
    filteredPosts = filteredPosts.filter(post => post.category === parseInt(category));
  }
  if (filteredPosts.length === 0) {
    res.render('posts', { message: 'No results' });
  } else {
    res.render('posts', { posts: filteredPosts });
  }
});
// app.get('/posts', (req, res) => {
//   const { category, minDate } = req.query;
//   let promiseObj;
//   if (category) {
//     promiseObj = blogService.getPostsByCategory(parseInt(category));
//   } else if (minDate) {
//     promiseObj = blogService.getPostsByMinDate(minDate);
//   } else {
//     promiseObj = blogService.getAllPosts();
//   }
//   promiseObj
//     .then(posts => {
//       if (posts.length === 0) {
//         res.status(404).json({ error: 'No posts found' });
//       } else {
//         res.json(posts);
//       }
//     })
//     .catch(err => {
//       res.status(500).json({ error: err.message });
//     });
// });

app.get('/post/:id', (req, res) => {
    const { id } = req.params;
  blogService.getPostById(id)
  .then(post => res.json(post))
    .catch(err => res.status(err.status || 500).json({ error: err.message }));
});


app.get('/categories', (req, res) => {
  try {
    const categories = blogService.getCategoriesSync();
    res.render("categories", {categories: categories});
  } catch (err) {
    res.render("categories", {message: "no results"});
  }
});
// app.get('/posts/add', function(req, res) {
//   res.sendFile(path.join(__dirname, '/views/addPost.html'));
//   });
app.get('/posts/add', function(req, res) {
  res.render('addPost',{
      title: 'Add Post'
    });
  }); 
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

app.get('/blog/:id', async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};
  try{
      // declare empty array to hold "post" objects
      let posts = [];
      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogData.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogData.getPublishedPosts();
      }
      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
  }catch(err){
      viewData.message = "no results";
  }
  try{
      // Obtain the post by "id"
      viewData.post = await blogData.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }
  try{
      // Obtain the full list of "categories"
      let categories = await blogData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }
  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
});


initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server is listening on port ${HTTP_PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Failed to initialize data: ${error}`);
  });
