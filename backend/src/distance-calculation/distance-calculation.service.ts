import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface DistanceMatrixResponse {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: {
    elements: {
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
      status: string;
    }[];
  }[];
  status: string;
}

export interface DistanceResult {
  distanceInMeters: number;
  distanceText: string;
  durationInSeconds: number;
  durationText: string;
}

@Injectable()
export class DistanceCalculationService {
  private readonly googleMapsApiKey: string;

  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY!;
    console.log('this is google map api key', process.env.GOOGLE_MAPS_API_KEY);
    if (!this.googleMapsApiKey) {
      throw new Error(
        'GOOGLE_MAPS_API_KEY is not defined in the environment variables',
      );
    }
  }

  async calculateDistance(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
  ): Promise<DistanceResult> {
    try {
      const response = await axios.get<DistanceMatrixResponse>(
        'https://maps.googleapis.com/maps/api/distancematrix/json',
        {
          params: {
            origins: `${originLat},${originLng}`,
            destinations: `${destinationLat},${destinationLng}`,
            key: this.googleMapsApiKey,
          },
        },
      );

      if (response.data.status !== 'OK') {
        throw new Error(
          `Google Distance Matrix API error: ${response.data.status}`,
        );
      }

      const element = response.data.rows[0].elements[0];
      if (element.status !== 'OK') {
        throw new Error(`Route calculation error: ${element.status}`);
      }

      return {
        distanceInMeters: element.distance.value,
        distanceText: element.distance.text,
        durationInSeconds: element.duration.value,
        durationText: element.duration.text,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to calculate distance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  convertMetersToKilometers(meters: number): number {
    return parseFloat((meters / 1000).toFixed(2));
  }
}
