import { useState } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery, useMutation, useQueryClient } from "react-query";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { FaComment } from "react-icons/fa";

// Fetch comments from Firestore
const fetchComments = async (firestore, articleId) => {
  const docRef = doc(firestore, "articles", articleId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().comments || []; // Return comments
  } else {
    throw new Error("Məqalə tapılmadı!");
  }
};

// Add comment function
const addComment = async ({
  firestore,
  articleId,
  user,
  comment,
  parentCommentId = null,
}) => {
  const articleRef = doc(firestore, "articles", articleId);
  const newComment = {
    id: Date.now(), // Ensure a unique ID for each comment
    userId: user.uid,
    userName: user.displayName,
    userPhoto: user.photoURL,
    content: comment,
    date: new Date().toISOString(),
    parentCommentId, // If it's a reply, include parent comment ID
  };

  // Add the new comment or reply to Firestore
  await updateDoc(articleRef, {
    comments: arrayUnion(newComment),
  });
};

// Delete comment function
const deleteComment = async ({ firestore, articleId, comment, allReplies }) => {
  const articleRef = doc(firestore, "articles", articleId);

  // Remove the parent comment
  await updateDoc(articleRef, {
    comments: arrayRemove(comment),
  });

  // Remove all replies associated with this comment
  if (allReplies) {
    await updateDoc(articleRef, {
      comments: arrayRemove(...allReplies), // Remove all replies
    });
  }
};

// Comments component
export const Comments = ({ articleId }) => {
  const { user, firestore } = useAuthContext();
  const [newComment, setNewComment] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState(null); // Track which comment is being replied to
  const [replyContent, setReplyContent] = useState({}); // Track reply content for each parent comment
  const queryClient = useQueryClient();

  // Fetch comments from Firestore
  const { data: comments = [] } = useQuery(
    ["comments", articleId],
    async () => {
      const fetchedComments = await fetchComments(firestore, articleId);
      return fetchedComments;
    },
    {
      staleTime: 60000,
    }
  );

  // Mutation for adding comment
  const commentMutation = useMutation(addComment, {
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", articleId]);
      setNewComment(""); // Clear comment field
      setReplyContent({}); // Clear reply fields
      setReplyToCommentId(null); // Reset reply state
    },
    onError: () => {
      toast.error("Yorum eklenemedi!");
    },
  });

  // Mutation for deleting comment
  const deleteMutation = useMutation(deleteComment, {
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", articleId]);
    },
    onError: () => {
      toast.error("Yorum silinemedi!");
    },
  });

  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Zəhmət olmasa, öncə giriş edin!");
      return;
    }

    // Add the new comment or reply
    commentMutation.mutate({
      firestore,
      articleId: articleId,
      user,
      comment: newComment,
      parentCommentId: null,
    });
  };

  // Handle reply submission
  const handleReplySubmit = (e, parentCommentId) => {
    e.preventDefault();
    if (!user) {
      toast.error("Zəhmət olmasa, öncə giriş edin!");
      return;
    }

    // Add the reply
    commentMutation.mutate({
      firestore,
      articleId: articleId,
      user,
      comment: replyContent[parentCommentId], // Get the reply content for this specific parent
      parentCommentId: parentCommentId,
    });
  };

  // Handle reply button click
  const handleReplyClick = (commentId) => {
    setReplyToCommentId(commentId); // Set the comment ID that we're replying to
  };

  // Handle reply content change
  const handleReplyContentChange = (e, parentCommentId) => {
    setReplyContent({ ...replyContent, [parentCommentId]: e.target.value }); // Update the reply content for the specific parent comment
  };

  const handleDeleteComment = (comment) => {
    if (user.email === "alyvdev@gmail.com" || user.uid === comment.userId) {
      // Find all replies to this comment
      const replies = comments.filter((c) => c.parentCommentId === comment.id);
      deleteMutation.mutate({
        firestore,
        articleId: articleId,
        comment,
        allReplies: replies,
      });
    } else {
      toast.error("Bu yorumu silmək üçün yetkiniz yoxdur.");
    }
  };

  // Recursive function to render comments and replies
  const renderComments = (comments, parentId = null) => {
    if (!comments || comments.length === 0) return null;

    return comments
      .filter((comment) => comment.parentCommentId === parentId)
      .map((comment) => (
        <div
          key={comment.id}
          className={`mb-4 p-2 border rounded-lg shadow-sm transition duration-200 ${
            parentId ? "ml-1 bg-gray-50" : "bg-white"
          } hover:shadow-md`}
        >
          {/* Comment UI */}
          <div className="flex items-center mb-3">
            <img
              src={comment.userPhoto || "https://via.placeholder.com/50"}
              alt={comment.userName}
              className="w-12 h-12 rounded-full mr-4 border-2"
            />
            <div>
              <p className="font-semibold text-lg">{comment.userName}</p>
              <p className="text-sm text-gray-500">
                {new Date(comment.date).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="bg-gray-100 p-2 rounded-md mb-3 text-gray-800 shadow-inner flex flex-col items-start gap-2 text-wrap">
            {comment.content}
            <div className="flex gap-1">
              {/* Reply button */}
              {user && (
                <button
                  onClick={() => handleReplyClick(comment.id)}
                  className="mr-2 text-blue-600 hover:underline focus:outline-none focus:ring focus:ring-blue-300 transition text-sm"
                >
                  Cavabla
                </button>
              )}

              {/* Delete button for admin/comment author */}
              {user &&
                (user.email === "alyvdev@gmail.com" ||
                  user.uid === comment.userId) && (
                  <button
                    onClick={() => handleDeleteComment(comment)}
                    className="text-red-500 hover:underline transition duration-200 text-sm"
                  >
                    Sil
                  </button>
                )}
            </div>
          </p>

          {/* Reply textarea */}
          {replyToCommentId === comment.id && (
            <form
              onSubmit={(e) => handleReplySubmit(e, comment.id)}
              className="mt-3 bg-gray-200 p-3 rounded-md"
            >
              <textarea
                value={replyContent[comment.id] || ""}
                onChange={(e) => handleReplyContentChange(e, comment.id)}
                placeholder="Rəyiniz..."
                className="w-full p-2 border border-gray-300 rounded-md shadow focus:outline-none focus:ring focus:ring-blue-300"
                rows="1"
                required
                maxLength="200"
              />
              <div className="flex justify-between mt-2">
                <button
                  type="submit"
                  className="text-sm text-blue-500 py-2 transition duration-200 hover:text-blue-600"
                >
                  Rəy bildir
                </button>
                <button
                  type="button"
                  onClick={() => setReplyToCommentId(null)} // Close the reply form
                  className="text-sm text-red-500 hover:underline transition duration-200"
                >
                  İptal
                </button>
              </div>
            </form>
          )}

          {/* Render replies recursively */}
          <div className="sm:ml-1 ml-3">
            {renderComments(comments, comment.id)}
          </div>
        </div>
      ));
  };

  Comments.propTypes = {
    articleId: PropTypes.string.isRequired,
  };

  return (
    <div>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="p-4" id="comments">
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Rəyiniz..."
              className="w-full p-2 border border-gray-300 rounded"
              rows="4"
              required
              maxLength="500"
            />
            <button
              type="submit"
              className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
            >
              <FaComment />
            </button>
          </form>
        ) : (
          <p className="mt-4">
            Rəy bildirmək üçün{" "}
            <NavLink to="/auth/login" className="text-blue-500 hover:underline">
              giriş edin
            </NavLink>
            .
          </p>
        )}

        {/* List comments and replies */}
        <div className="mt-2 max-h-64 overflow-y-auto">
          {comments.length > 0 ? renderComments(comments) : <>
          </>}
        </div>
      </div>
    </div>
  );
};
