import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styles: [`
    .notification-dropdown {
      max-height: 400px;
      overflow-y: auto;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  isOpen = signal(false);

  constructor(
    public notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notificationService.refresh();
  }

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
    this.closeDropdown();
    
    // Simple navigation logic
    if (notification.type.startsWith('POLICY')) {
      this.router.navigate(['/underwriter/orders']); // or customer view if role matches
    } else if (notification.type.startsWith('CLAIM')) {
      this.router.navigate(['/claims']);
    }
  }

  getTypeIcon(type: string): string {
    if (type.includes('APPROVAL')) return 'check_circle';
    if (type.includes('REJECTION')) return 'cancel';
    if (type.includes('DOCUMENT')) return 'description';
    if (type.includes('NEW')) return 'fiber_new';
    return 'notifications';
  }

  getTypeColor(type: string): string {
    if (type.includes('APPROVAL')) return 'text-emerald-500 bg-emerald-50';
    if (type.includes('REJECTION')) return 'text-red-500 bg-red-50';
    if (type.includes('DOCUMENT')) return 'text-amber-500 bg-amber-50';
    if (type.includes('NEW')) return 'text-blue-500 bg-blue-50';
    return 'text-slate-500 bg-slate-50';
  }
}
