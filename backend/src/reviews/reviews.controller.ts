import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  Delete,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { SenderType } from '@prisma/client';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async createReview(
    @Body()
    createReviewDto: {
      serviceRequestId: string;
      reviewerType: SenderType;
      rating: number;
      comment?: string;
    },
  ) {
    return await this.reviewsService.createReview(createReviewDto);
  }

  @Put('update/:reviewId')
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body()
    updateReviewDto: {
      rating?: number;
      comment?: string;
    },
  ) {
    return await this.reviewsService.updateReview({
      reviewId,
      ...updateReviewDto,
    });
  }

  @Get('user/:userId')
  async getReviewsByUser(@Param('userId') userId: string) {
    return await this.reviewsService.getReviewsByUser(userId);
  }

  @Get('mechanic/:mechanicId')
  async getReviewsByMechanic(@Param('mechanicId') mechanicId: string) {
    return await this.reviewsService.getReviewsByMechanic(mechanicId);
  }

  @Get('reviews-about-user/:userId')
  async getReviewsAboutUser(@Param('userId') userId: string) {
    return await this.reviewsService.getReviewsAboutUser(userId);
  }

  @Get('reviews-about-mechanic/:mechanicId')
  async getReviewsAboutMechanic(@Param('mechanicId') mechanicId: string) {
    return await this.reviewsService.getReviewsAboutMechanic(mechanicId);
  }

  @Get('service-request/:serviceRequestId')
  async getReviewsByServiceRequest(
    @Param('serviceRequestId') serviceRequestId: string,
  ) {
    return await this.reviewsService.getReviewsByServiceRequest(
      serviceRequestId,
    );
  }

  @Delete('delete/:reviewId')
  async deleteReview(@Param('reviewId') reviewId: string) {
    return await this.reviewsService.deleteReview(reviewId);
  }
}
