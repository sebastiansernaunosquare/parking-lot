import { Component, inject, signal } from '@angular/core';
import {
  RaffleService,
  RegistrationWithRaffle,
} from '../../../core/services/raffle';
import { Raffle } from '../../../core/models/raffle.model';
import { Auth } from '../../../core/auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { Header } from '../../../shared/components/header/header';

@Component({
  selector: 'app-portal',
  imports: [CommonModule, Header],
  templateUrl: './portal.html',
  styleUrl: './portal.css',
})
export class Portal {
  private raffleService = inject(RaffleService);
  private authService = inject(Auth);

  currentUser = this.authService.currentUser;
  activeRaffle = signal<Raffle | null>(null);
  history = signal<RegistrationWithRaffle[]>([]);

  isRegistered = signal(false);
  isLoading = signal(false);
  currentRegistration = signal<RegistrationWithRaffle | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    this.raffleService.getRegistrationHistory(userId).subscribe((data) => {
      this.history.set(data);
    });

    this.raffleService.getActiveRaffle().subscribe((raffle) => {
      this.activeRaffle.set(raffle);

      if (raffle) {
        this.raffleService
          .checkRegistration(userId, raffle.id)
          .subscribe((isReg) => {
            this.isRegistered.set(isReg);
          });
      }
    });
  }

  register() {
    const user = this.currentUser();
    const raffle = this.activeRaffle();

    if (!user || !raffle) return;

    if (
      confirm(
        `Are you confirming your registration for the period's draw ${raffle.period}?`
      )
    ) {
      this.isLoading.set(true);

      this.raffleService.registerResident(user.id, raffle.id).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isRegistered.set(true);
          this.loadData();
          alert('Registration is successful');
        },
        error: () => {
          this.isLoading.set(false);
          alert(`There's been an error. Try again.`);
        },
      });
    }
  }
}
