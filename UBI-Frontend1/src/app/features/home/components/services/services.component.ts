import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Service {
  id: number;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html'
})
export class ServicesComponent {
  services: Service[] = [
    {
      id: 1,
      icon: 'shield',
      title: 'Real-Time Protection',
      description: 'Our AI-powered system monitors your driving in real-time, providing instant alerts and personalized coaching to keep you safe on the road.'
    },
    {
      id: 2,
      icon: 'chart',
      title: 'Smart Premium Calculation',
      description: 'Your premium adjusts monthly based on your actual driving behavior, not your age or zip code. Drive safely, save more.'
    },
    {
      id: 3,
      icon: 'clock',
      title: '24/7 Support',
      description: 'Round-the-clock customer support team ready to assist you with claims, policy questions, or roadside emergencies.'
    },
    {
      id: 4,
      icon: 'phone',
      title: 'Mobile App Integration',
      description: 'Seamless integration with our DriveIQ mobile app for tracking trips, viewing premiums, and managing policies on the go.'
    },
    {
      id: 5,
      icon: 'award',
      title: 'Award-Winning Service',
      description: 'Recognized for innovation in telematics insurance and customer satisfaction across India.'
    },
    {
      id: 6,
      icon: 'location',
      title: 'Nationwide Coverage',
      description: 'Coverage and support available across all major cities and highways nationwide.'
    }
  ];
}
