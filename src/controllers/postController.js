const {
  createNewPosts,
  updatePostByCode,
  deletePostByCode,
  getAllPosts,
  getPostByCode,
  getSearchedPosts,
  getAllActivePosts,
} = require("../models/postModel");
const {
  getReactionCounts,
  getUserReaction,
} = require("../models/postLikesModel");

const createPostHandler = async (req, res) => {
  try {
    const admin = req.session.admin;
    if (!admin) {
      return res.redirect("/admin/login");
    }

    const data = req.body;
    if (!data) {
      return res.render("admin/newPost.njk", {
        title: "Add New Post",
        error: "No data is provided",
      });
    }

    const createdPosts = await createNewPosts({
      ...data,
      posted_by: admin.email,
    });

    if (createdPosts.success) {
      // HTML form → redirect
      if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.redirect("/admin/posts?success=1");
      }
      // API client → JSON
      return res.status(200).json({ post: createdPosts.post });
    } else {
      if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.render("admin/newPost.njk", {
          title: "Add New Post",
          error: createdPosts.message,
        });
      }
      return res.status(500).json({ message: createdPosts.message });
    }
  } catch (error) {
    console.error("❌ Error in createNewPosts:", error.message);

    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.render("admin/newPost.njk", {
        title: "Add New Post",
        error: "Something went wrong, please try again.",
      });
    }

    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

const getAllPostsHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const postsData = await getAllActivePosts();
    if (!postsData.success) {
      return res.status(500).json({ message: postsData.message });
    }

    const posts = postsData.posts;

    // Fetch like/dislike counts for each post
    const postsWithReactions = await Promise.all(
      posts.map(async (post) => {
        const counts = await getReactionCounts(post.post_code);
        const userReaction = await getUserReaction(post.post_code, userId);
        return {
          ...post,
          like_count: counts.success ? counts.like_count : 0,
          dislike_count: counts.success ? counts.dislike_count : 0,
          liked_by_you: userReaction.success ? userReaction.likedByUser : false,
          disliked_by_you: userReaction.success
            ? userReaction.dislikedByUser
            : false,
        };
      })
    );

    return res.status(200).json({ posts: postsWithReactions });
  } catch (error) {
    console.error("❌ Error in getAllPostsHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

const getSearchedPostsHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query } = req.query; // get search text from query parameter

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const postsData = await getSearchedPosts(query);
    if (!postsData.success) {
      return res.status(500).json({ message: postsData.message });
    }

    const posts = postsData.posts;

    // Fetch like/dislike counts for each post
    const postsWithReactions = await Promise.all(
      posts.map(async (post) => {
        const counts = await getReactionCounts(post.post_code);
        const userReaction = await getUserReaction(post.post_code, userId);
        return {
          ...post,
          like_count: counts.success ? counts.like_count : 0,
          dislike_count: counts.success ? counts.dislike_count : 0,
          liked_by_you: userReaction.success ? userReaction.likedByUser : false,
          disliked_by_you: userReaction.success
            ? userReaction.dislikedByUser
            : false,
        };
      })
    );

    return res.status(200).json({ posts: postsWithReactions });
  } catch (error) {
    console.error("❌ Error in getSearchedPostsHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

const getPostsWithReactions = async () => {
  try {
    const postsData = await getAllPosts();
    if (!postsData.success) {
      return { success: false, message: postsData.message };
    }

    const posts = postsData.posts;

    // Attach like/dislike counts
    const postsWithReactions = await Promise.all(
      posts.map(async (post) => {
        const counts = await getReactionCounts(post.post_code);
        return {
          ...post,
          like_count: counts.success ? counts.like_count : 0,
          dislike_count: counts.success ? counts.dislike_count : 0,
        };
      })
    );

    return { success: true, posts: postsWithReactions };
  } catch (error) {
    console.error("❌ Error in getPostsWithReactions:", error.message);
    return { success: false, message: "Try again later after sometime" };
  }
};

const getPostByCodeHandler = async (req, res) => {
  try {
    const postCode = req.params.id;

    const postData = await getPostByCode(postCode);

    if (postData.success) {
      return res.status(200).json({ post: postData.post });
    } else if (postData.status === 404) {
      return res.status(404).json({ message: postData.message });
    } else {
      return res.status(500).json({ message: postData.message });
    }
  } catch (error) {
    console.error("❌ Error in getPostByCodeHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

const updatePostHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ message: "post_code is required in params" });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }

    const updatedPost = await updatePostByCode(id, data);

    if (!updatedPost.success) {
      return res.status(404).json({ message: updatedPost.message });
    }

    return res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost.post,
    });
  } catch (error) {
    console.error("❌ Error in updatePostHandler:", error.message);
    return res.status(500).json({
      message: "Try again later after sometime",
    });
  }
};

const deletePostHandler = async (req, res) => {
  try {
    const { id: post_code } = req.params;

    if (!post_code) {
      return res
        .status(400)
        .json({ message: "post_code is required in params" });
    }

    const deletedPost = await deletePostByCode(post_code);

    if (!deletedPost.success) {
      return res.status(404).json({ message: deletedPost.message });
    }

    return res.status(200).json({
      message: "Post deleted successfully",
      post: deletedPost.post,
    });
  } catch (error) {
    console.error("❌ Error in deletePostHandler:", error.message);
    return res.status(500).json({
      message: "Try again later after sometime",
    });
  }
};

module.exports = {
  createPostHandler,
  updatePostHandler,
  deletePostHandler,
  getAllPostsHandler,
  getPostByCodeHandler,
  getPostsWithReactions,
  getSearchedPostsHandler,
};
