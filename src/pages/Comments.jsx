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
import { useLanguage } from "../providers/LanguageProvider";

// Fetch comments from Firestore
const fetchComments = async (firestore, articleId) => {
  const docRef = doc(firestore, "articles", articleId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().comments || [];
  } else {
    throw new Error("Məqalə tapılmadı!");
  }
};

// Add comment function
const addComment = async ({
  firestore,
  articleId,
  userData,
  comment,
  parentCommentId = null,
}) => {
  const articleRef = doc(firestore, "articles", articleId);
  const newComment = {
    id: Date.now(),
    userId: userData.uid,
    userName:  [userData.Name, userData.Surname].join(" "),
    userPhoto: userData.photoUrl,
    content: comment,
    date: new Date().toISOString(),
    parentCommentId,
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
  const { userData, firestore } = useAuthContext();
  const [newComment, setNewComment] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState(null); // Track which comment is being replied to
  const [replyContent, setReplyContent] = useState({}); // Track reply content for each parent comment
  const queryClient = useQueryClient();
  const { translations } = useLanguage();

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
      toast.error("Yorum əlavə olunmadı!");
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
    if (!userData) {
      toast.error("Zəhmət olmasa, öncə giriş edin!");
      return;
    }

    // Add the new comment or reply
    commentMutation.mutate({
      firestore,
      articleId: articleId,
      userData,
      comment: newComment,
      parentCommentId: null,
    });
  };

  // Handle reply submission
  const handleReplySubmit = (e, parentCommentId) => {
    e.preventDefault();
    if (!userData) {
      toast.error("Zəhmət olmasa, öncə giriş edin!");
      return;
    }

    // Add the reply
    commentMutation.mutate({
      firestore,
      articleId: articleId,
      userData,
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
    if (userData.email === "alyvdev@gmail.com" || userData.uid === comment.userId) {
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
          className={`mb-4 p-2 rounded-lg shadow transition duration-200 ${
            parentId ? "bg-[#232323]" : "bg-[#383838]"
          } hover:shadow-lg`}
        >
          {/* Comment UI */}
          <div className="flex items-center mb-3">
            <img
              src={comment.userPhoto || "https://via.placeholder.com/50"}
              alt={comment.userName}
              className="w-10 h-10 rounded-full mr-4 border-2"
            />
            <div>
              <p className="font-semibold text-lg">{comment.userName}</p>
              <p className="text-sm text-gray-500">
                {new Date(comment.date).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-[#232323] p-2 rounded-md mb-3 text-white shadow-inner flex flex-col items-start gap-2">
            {comment.content}
            {parentId && ( // Show reply context only if it's a reply
              <span className="text-xs font-bold text-gray-200 mt-2">
                {/* Add the replying user's name here */}
                @{
                  comments.find((c) => c.id === comment.parentCommentId)
                    ?.userName
                }
              </span>
            )}
            <div className="flex items-center gap-2">
              {/* Reply button */}
              {userData && (
                <button
                  onClick={() => handleReplyClick(comment.id)}
                  className="p-2 rounded-lg bg-[#383838] text-blue-400 hover:bg-blue-400 hover:text-[#383838]  focus:outline-none focus:ring focus:ring-blue-300 transition text-sm"
                >
                  {translations.reply}
                </button>
              )}

              {/* Delete button for admin/comment author */}
              {userData &&
                (userData.email === "alyvdev@gmail.com" ||
                  userData.uid === comment.userId) && (
                  <button
                    onClick={() => handleDeleteComment(comment)}
                    className="p-2 rounded-lg bg-[#383838] text-red-500 hover:bg-red-500 hover:text-[#383838] transition duration-200 text-sm"
                  >
                    {translations.delete}
                  </button>
                )}
            </div>
          </div>

          {/* Reply textarea */}
          {replyToCommentId === comment.id && (
            <form
              onSubmit={(e) => handleReplySubmit(e, comment.id)}
              className="mt-3 bg-[#232323] p-2 rounded-md"
            >
              <textarea
                value={replyContent[comment.id] || ""}
                onChange={(e) => handleReplyContentChange(e, comment.id)}
                placeholder={translations.yourComment}
                className="w-full p-2 rounded-md shadow focus:outline-none bg-[#383838]"
                rows="1"
                required
                maxLength="200"
              />
              <div className="flex justify-between mt-2">
                <button
                  type="submit"
                  className="text-sm text-blue-500 py-2 transition duration-200 hover:text-blue-600"
                >
                  {translations.comment}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyToCommentId(null)} // Close the reply form
                  className="text-sm text-red-500 hover:underline transition duration-200"
                >
                  {translations.cancel}
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
    <section>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="p-2 rounded-lg shadow-md bg-[#232323]">
        {userData ? (
          <form onSubmit={handleCommentSubmit} className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={translations.yourComment}
              className="w-full p-3 focus:border-gray-300 bg-[#383838] rounded-lg"
              rows="2"
              required
              maxLength="500"
            />
            <button
              type="submit"
              className="my-4 text-white flex items-center gap-2 bg-[#383838] hover:text-[#383838] hover:bg-white p-2 rounded-lg"
            >
              <FaComment /> {translations.comment}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-gray-400">
            {translations.forComment}{" "}
            <NavLink to="/auth/login" className="text-blue-400 hover:underline">
              {translations.plsLogin}
            </NavLink>
            .
          </p>
        )}

        {/* List comments and replies */}
        <div className="">
          {comments.length > 0 ? (
            renderComments(comments)
          ) : (
            <p className="text-gray-500">{translations.noComments}</p>
          )}
        </div>
      </div>
    </section>
  );
};
