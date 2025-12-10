import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-table',
  imports: [CommonModule],
  templateUrl: './user-table.html',
  styleUrl: './user-table.css',
})
export class UserTable {
  users = input.required<User[]>();

  edit = output<User>();
  delete = output<string>();
  register = output<void>();

  readonly roleBadges: Record<string, string> = {
    admin: 'bg-primary-subtle text-primary border-primary',
    resident: 'bg-success-subtle text-success border-success',
  };

  readonly defaultBadge = 'bg-secondary-subtle text-secondary';
}
