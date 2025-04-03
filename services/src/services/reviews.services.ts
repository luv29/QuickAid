import { AxiosInstance } from "axios";
import { api } from "../api.js";

export class ReviewsService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = api(baseURL);
  }

  async createReview(reviewData: {
    serviceRequestId: string;
    reviewerType: string;
    rating: number;
    comment?: string;
  }) {
    return await this.api.post("api/reviews", reviewData);
  }

  async updateReview(reviewId: string, updateData: {
    rating?: number;
    comment?: string;
  }) {
    return await this.api.put(`api/reviews/update/${reviewId}`, updateData);
  }

  async getReviewsByUser(userId: string) {
    return await this.api.get(`api/reviews/user/${userId}`);
  }

  async getReviewsByMechanic(mechanicId: string) {
    return await this.api.get(`api/reviews/mechanic/${mechanicId}`);
  }

  async getReviewsAboutUser(userId: string) {
    return await this.api.get(`api/reviews/reviews-about-user/${userId}`);
  }

  async getReviewsAboutMechanic(mechanicId: string) {
    return await this.api.get(`api/reviews/reviews-about-mechanic/${mechanicId}`);
  }

  async getReviewsByServiceRequest(serviceRequestId: string) {
    return await this.api.get(`api/reviews/service-request/${serviceRequestId}`);
  }

  async deleteReview(reviewId: string) {
    return await this.api.delete(`api/reviews/delete/${reviewId}`);
  }
}
