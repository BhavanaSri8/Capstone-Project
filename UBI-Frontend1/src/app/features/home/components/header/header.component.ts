import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  mobileMenuOpen = false;

  constructor(private router: Router) { }

  ngOnInit(): void { }

  navigateTo(path: string): void {
    this.mobileMenuOpen = false;
    this.router.navigate([path]);
  }

  scrollToSection(sectionId: string): void {
    this.mobileMenuOpen = false;

    const scroll = () => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (this.router.url !== '/') {
      this.router.navigate(['/'], { fragment: sectionId }).then(() => {
        setTimeout(scroll, 120);
      });
      return;
    }

    scroll();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
