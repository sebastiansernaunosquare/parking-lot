import { Component, OnInit, inject, viewChild, signal } from '@angular/core';
import { Header } from '../../../shared/components/header/header';
import { User } from '../../../core/models/user.model';
import { Raffle } from '../../../core/models/raffle.model';
import { UserTable } from '../user-management/user-table/user-table';
import { UserService } from '../../../core/services/user';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserForm } from '../user-management/user-form/user-form';
import { RaffleService } from '../../../core/services/raffle';
import { RaffleForm } from '../raffle-form/raffle-form';

interface AlertState {
  type: 'success' | 'danger';
  message: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [Header, UserTable, CommonModule, UserForm, RaffleForm],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private userService = inject(UserService);
  private raffleService = inject(RaffleService);
  users$!: Observable<User[]>;
  formComponent = viewChild(UserForm);
  raffleFormComponent = viewChild(RaffleForm);
  selectedUser = signal<User | null>(null);
  alertSignal = signal<AlertState | null>(null);
  activeRaffle$!: Observable<Raffle | null>;

  ngOnInit() {
    this.loadResidents();
    this.loadRaffleStatus();
  }

  openCreateModal() {
    this.selectedUser.set(null);
    this.formComponent()?.openModal();
  }

  openEditModal(user: User) {
    this.selectedUser.set(user);
    setTimeout(() => this.formComponent()?.openModal(), 0);
  }

  handleDelete(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.loadResidents();
          this.showAlert('User deleted successfully!', 'success');
        },
        error: (err) => {
          console.error(err);
          this.showAlert('Failed to delete user. Please try again.', 'danger');
        },
      });
    }
  }

  loadResidents() {
    this.users$ = this.userService.getUsersByRole('resident');
  }

  onUserSaved() {
    this.loadResidents();
    this.showAlert('User information saved successfully!', 'success');
  }

  private showAlert(message: string, type: 'success' | 'danger') {
    this.alertSignal.set({ message, type });

    setTimeout(() => {
      this.closeAlert();
    }, 5000);
  }

  closeAlert() {
    this.alertSignal.set(null);
  }

  runRaffle() {
    if (!confirm('This will assign parking spots randomly. Continue?')) return;

    this.raffleService.executeRaffle().subscribe({
      next: () => {
        this.showAlert(
          'Raffle completed! Winners have been assigned.',
          'success'
        );
        this.loadResidents();
        this.loadRaffleStatus();
      },
      error: (err) => {
        console.error(err);
        if (err.message === 'NO_REGISTRATIONS') {
          this.showAlert(
            'Cannot run raffle: No residents registered.',
            'danger'
          );
        } else {
          this.showAlert('An error occurred during the raffle.', 'danger');
        }
      },
    });
  }

  loadRaffleStatus() {
    this.activeRaffle$ = this.raffleService.getActiveRaffle();
  }

  openNewRaffleModal() {
    this.raffleFormComponent()?.openModal();
  }

  // EVENT HANDLER: Called when raffle is created successfully
  onRaffleCreated() {
    this.loadRaffleStatus();
    this.showAlert('New raffle period started!', 'success');
  }
}
