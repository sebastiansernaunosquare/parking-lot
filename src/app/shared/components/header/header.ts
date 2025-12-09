import { Component, inject, computed } from '@angular/core';
import { Auth } from '../../../core/auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  public authService = inject(Auth);

  currentUser = this.authService.currentUser;

  homeRoute = computed(() => {
    return this.currentUser()?.role === 'admin' ? '/admin' : '/portal';
  });

  roleLabel = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'admin' ? 'Admin' : 'Resident';
  });

  roleBadgeClass = computed(() => {
    return this.currentUser()?.role === 'admin' ? 'bg-primary' : 'bg-success';
  });
}
