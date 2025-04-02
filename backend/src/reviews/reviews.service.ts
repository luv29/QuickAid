import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, SenderType } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly db: DatabaseService) { }

  async createReview({
    serviceRequestId,
    reviewerType,
    rating,
    comment,
  }: {
    serviceRequestId: string;
    reviewerType: SenderType;
    rating: number;
    comment?: string;
  }) {
    const serviceRequest = await this.db.serviceRequest.findUnique({
      where: { id: serviceRequestId },
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    const existingReview = await this.db.review.findFirst({
      where: {
        serviceRequestId,
        reviewerType,
      },
    });

    if (existingReview) {
      throw new BadRequestException('A review from this reviewer already exists for this service request');
    }

    return await this.db.review.create({
      data: {
        serviceRequestId,
        reviewerType,
        rating,
        comment,
      },
      include: {
        serviceRequest: {
          include: {
            user: true,
            mechanic: true,
          },
        },
      },
    });
  }

  async updateReview({
    reviewId,
    rating,
    comment,
  }: {
    reviewId: string;
    rating?: number;
    comment?: string;
  }) {
    const existingReview = await this.db.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      throw new NotFoundException('Review not found');
    }

    return await this.db.review.update({
      where: { id: reviewId },
      data: {
        rating: rating !== undefined ? rating : existingReview.rating,
        comment: comment !== undefined ? comment : existingReview.comment,
      },
      include: {
        serviceRequest: {
          include: {
            user: true,
            mechanic: true,
          },
        },
      },
    });
  }

  async getReviewsByUser(userId: string) {
    const serviceRequests = await this.db.serviceRequest.findMany({
      where: { userId },
      select: {
        id: true,
      },
    });

    const serviceRequestIds = serviceRequests.map(req => req.id);

    return await this.db.review.findMany({
      where: {
        serviceRequestId: { in: serviceRequestIds },
        reviewerType: SenderType.USER,
      },
      include: {
        serviceRequest: {
          include: {
            mechanic: true,
          },
        },
      },
    });
  }

  async getReviewsByMechanic(mechanicId: string) {
    const serviceRequests = await this.db.serviceRequest.findMany({
      where: { mechanicId },
      select: {
        id: true,
      },
    });

    const serviceRequestIds = serviceRequests.map(req => req.id);
    console.log(serviceRequestIds)

    return await this.db.review.findMany({
      where: {
        serviceRequestId: { in: serviceRequestIds },
        reviewerType: SenderType.MECHANIC,
      },
      include: {
        serviceRequest: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async getReviewsAboutUser(userId: string) {
    const serviceRequests = await this.db.serviceRequest.findMany({
      where: { userId },
      select: {
        id: true,
      },
    });

    const serviceRequestIds = serviceRequests.map(req => req.id);

    return await this.db.review.findMany({
      where: {
        serviceRequestId: { in: serviceRequestIds },
        reviewerType: SenderType.MECHANIC,
      },
      include: {
        serviceRequest: {
          include: {
            mechanic: true,
          },
        },
      },
    });
  }

  async getReviewsAboutMechanic(mechanicId: string) {
    const serviceRequests = await this.db.serviceRequest.findMany({
      where: { mechanicId },
      select: {
        id: true,
      },
    });

    const serviceRequestIds = serviceRequests.map(req => req.id);

    return await this.db.review.findMany({
      where: {
        serviceRequestId: { in: serviceRequestIds },
        reviewerType: SenderType.USER,
      },
      include: {
        serviceRequest: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async getReviewsByServiceRequest(serviceRequestId: string) {
    return await this.db.review.findMany({
      where: { serviceRequestId },
      include: {
        serviceRequest: {
          include: {
            user: true,
            mechanic: true,
          },
        },
      },
    });
  }

  async deleteReview(reviewId: string) {
    const review = await this.db.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return await this.db.review.delete({
      where: { id: reviewId },
    });
  }
}