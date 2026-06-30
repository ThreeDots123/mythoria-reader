"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { MessageSquare } from "lucide-react";
import CommentForm from "./comment-form";
import CommentItem, { CommentData } from "./comment-item";
import {
  getSeriesCommentsAction,
  getChapterCommentsAction,
} from "@/server-actions/comment";
import { useAuth } from "@/contexts/auth-context";

interface CommentSectionProps {
  seriesId?: string;
  chapterId?: string;
  currentUserId?: string;
}

export default function CommentSection({
  seriesId,
  chapterId,
  currentUserId: propCurrentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const currentUserId = propCurrentUserId || user?.id;

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (seriesId) {
        result = await getSeriesCommentsAction(seriesId);
      } else if (chapterId) {
        result = await getChapterCommentsAction(chapterId);
      } else {
        setError("Series or chapter ID is required");
        return;
      }

      if (!result.success) {
        setError(result.error);
        return;
      }

      const transformedComments = (result.data || []).map((comment: any) => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
        updatedAt: new Date(comment.updatedAt),
        replies: comment.replies
          ? comment.replies.map((reply: any) => ({
              ...reply,
              createdAt: new Date(reply.createdAt),
              updatedAt: new Date(reply.updatedAt),
            }))
          : undefined,
      }));

      setComments(transformedComments);
    } catch (err) {
      setError("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [seriesId, chapterId]);

  const handleCommentAdded = () => {
    loadComments();
  };

  const handleCommentDeleted = () => {
    loadComments();
  };

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-6">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">
          Comments
          {!isLoading && !error && (
            <span className="text-muted-foreground font-normal text-base ml-2">
              {comments.length}
            </span>
          )}
        </h2>
      </div>

      <div className="mb-6">
        <CommentForm
          seriesId={seriesId}
          chapterId={chapterId}
          onCommentAdded={handleCommentAdded}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-border/20 bg-card/30">
          <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onCommentAdded={handleCommentAdded}
              onCommentDeleted={handleCommentDeleted}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
