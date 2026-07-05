package com.gamesphere.review.service;

import com.gamesphere.review.entity.Review;
import com.gamesphere.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public Review createReview(Review review) {
        if (review.getUpvotes() == null) review.setUpvotes(0);
        if (review.getDownvotes() == null) review.setDownvotes(0);
        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByGameId(Long gameId) {
        return reviewRepository.findByGameIdOrderByCreatedAtDesc(gameId);
    }

    public List<Review> getReviewsByUserId(Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Review upvoteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setUpvotes(review.getUpvotes() + 1);
        return reviewRepository.save(review);
    }

    public Review downvoteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setDownvotes(review.getDownvotes() + 1);
        return reviewRepository.save(review);
    }
}
