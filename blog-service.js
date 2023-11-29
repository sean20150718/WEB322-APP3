const fs = require('fs');
const data = [];
 const getPosts = () => {
   const postsData = fs.readFileSync('./data/posts.json');
   return JSON.parse(postsData);
 };
// const getPosts = (category) => {
//   const allPosts = getAllPosts();
//   console.log("i am in getposts");
//   if (category) {
//     return allPosts.filter(post => post.category === parseInt(category));
//   } else {
//     return allPosts;
//   }
// };
//add a line
const getPublishedPostsSync = () => {
  const postsData = getPosts();
 return postsData.filter(post => post.published === true);
};

const getCategoriesSync = () => {
  const categoriesData = fs.readFileSync('./data/categories.json');
  return JSON.parse(categoriesData);
};

let posts = [];
let categories = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/posts.json', 'utf8', (err, data) => {
      if (err) {
        reject('Unable to read posts.json');
      } else {
        try {
          posts = JSON.parse(data);
          fs.readFile('./data/categories.json', 'utf8', (err, data) => {
            if (err) {
              reject('Unable to read categories.json');
            } else {
              try {
                categories = JSON.parse(data);
                resolve();
              } catch (err) {
                reject('Error parsing categories.json');
              }
            }
          });
        } catch (err) {
          reject('Error parsing posts.json');
        }
      }
    });
  });
}

function getAllPosts() {
  return new Promise((resolve, reject) => {
    if (posts.length > 0) {
      resolve(posts);
    } else {
      reject('No results returned');
    }
  });
}

function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter(post => post.published === true);
    if (publishedPosts.length > 0) {
      resolve(publishedPosts);
    } else {
      reject('No results returned');
    }
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) {
      resolve(categories);
    } else {
      reject('No results returned');
    }
  });
}

function addPost(postData) {
  return new Promise((resolve, reject) => {
    postData.published = postData.published === undefined ? false : true;
    postData.id = posts.length + 1;
    postData.postDate = new Date().toISOString().slice(0, 10);
    posts.push(postData);
    console.log(postData);
    resolve(postData);
  });
}
//  console.log('Received POST request to add new blog post');
//  addPost(postData).then((newPost) => {
//    console.log('New blog post added:', newPost);
//    res.redirect('/posts');
//  }).catch((err) => {
//    console.log('Error adding new blog post:', err);
//    res.redirect('/error');
//  });
function getPostsByCategory(category) {
   return posts.filter(post => post.category === category);
}
function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/posts.json', 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const posts = JSON.parse(data);
          const filteredPosts = posts.filter(post => post.category === category);
          if (filteredPosts.length > 0) {
            resolve(filteredPosts);
          } else {
            reject(new Error('No posts found for category'));
          }
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}

function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const minDate = new Date(minDateStr);
    const minDatePosts = posts.filter(post => new Date(post.postDate) >= minDate);
    if (minDatePosts.length > 0) {
      resolve(minDatePosts);
    } else {
      reject('No results returned');
    }
  });
}
//function getPostById(id) {
   // return posts.find(post => post.id ===parseInt(id));
//}
function getPostById(id) {
  return new Promise((resolve, reject) => {
      const post = posts.find(post => post.id === parseInt(id));
          if (post) {
      resolve(post);
    } else {
      reject('No result returned with the id of ${req.parmas.id}');
    }
  });
}
function getPublishedPostsByCategory(category) {
  return blogData.filter(post => post.published && post.category === category);
}
module.exports = {
initialize,
 getAllPosts,
getPublishedPosts,
getCategories,
getPosts, 
getPublishedPostsSync, 
getCategoriesSync,
addPost,
getPostsByCategory,
getPostsByMinDate,
getPostById,
getPublishedPostsByCategory,
  };
