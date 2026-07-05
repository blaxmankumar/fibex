package com.gamesphere.comment.repository;

import com.gamesphere.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByReviewIdOrderByCreatedAtDesc(Long reviewId);
}
