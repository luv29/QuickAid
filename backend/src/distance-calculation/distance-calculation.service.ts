import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface OSRMRouteResponse {
  code: string;
  routes: {
    distance: number;
    duration: number;
    legs: any[];
  }[];
  waypoints: any[];
}

export interface DistanceResult {
  distanceInMeters: number;
  distanceText: string;
  durationInSeconds: number;
  durationText: string;
}

@Injectable()
export class DistanceCalculationService {
  private readonly osrmBaseUrl: string;

  constructor() {
    // OSRM server URL - this can be a self-hosted instance or a public one
    this.osrmBaseUrl =
      process.env.OSRM_BASE_URL || 'http://router.project-osrm.org';
    console.log('Using OSRM base URL:', this.osrmBaseUrl);

    if (!this.osrmBaseUrl) {
      throw new Error(
        'OSRM_BASE_URL is not defined in the environment variables',
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
      // OSRM uses a different API structure than Google Maps
      // The format is /route/v1/driving/{coordinates}
      const coordinates = `${originLng},${originLat};${destinationLng},${destinationLat}`;
      const response = await axios.get<OSRMRouteResponse>(
        `${this.osrmBaseUrl}/route/v1/driving/${coordinates}`,
        {
          params: {
            overview: 'false', // We don't need the route geometry
            steps: 'false', // We don't need the steps
            annotations: 'false', // We don't need annotations
          },
        },
      );

      console.log('OSRM API response:', response.data);

      if (response.data.code !== 'Ok') {
        throw new Error(`OSRM Routing API error: ${response.data.code}`);
      }

      if (response.data.routes.length === 0) {
        throw new Error('No route found between the specified points');
      }

      const route = response.data.routes[0];

      // Format distance and duration texts similar to Google Maps API
      const distanceInMeters = Math.round(route.distance);
      const distanceText = this.formatDistance(distanceInMeters);
      const durationInSeconds = Math.round(route.duration);
      const durationText = this.formatDuration(durationInSeconds);

      return {
        distanceInMeters,
        distanceText,
        durationInSeconds,
        durationText,
      };
    } catch (error) {
      console.error('Error calculating distance with OSRM:', error);
      throw new HttpException(
        'Failed to calculate distance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  convertMetersToKilometers(meters: number): number {
    return parseFloat((meters / 1000).toFixed(2));
  }

  // Helper methods to format distance and duration similar to Google Maps API
  private formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters} m`;
    } else {
      const km = this.convertMetersToKilometers(meters);
      return `${km} km`;
    }
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
    } else {
      return `${minutes} min`;
    }
  }
}
