import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, switchMap, Observable, throwError, map } from 'rxjs';
import { User } from '../models/user.model';
import { Registration } from '../models/registration.model';
import { Raffle } from '../models/raffle.model';

export interface RegistrationWithRaffle extends Registration {
  raffle: Raffle;
}

@Injectable({
  providedIn: 'root',
})
export class RaffleService {
  private http = inject(HttpClient);
  private apiUrl = '/api';

  getActiveRaffle(): Observable<Raffle | null> {
    return this.http
      .get<Raffle[]>(`${this.apiUrl}/raffles?status=OPEN`)
      .pipe(map((raffles) => (raffles.length > 0 ? raffles[0] : null)));
  }

  createRaffle(data: {
    period: string;
    totalSpots: number;
  }): Observable<Raffle> {
    const newRaffle = {
      ...data,
      status: 'OPEN',
    };
    return this.http.post<Raffle>(`${this.apiUrl}/raffles`, newRaffle);
  }

  executeRaffle(): Observable<any> {
    return this.http.get<Raffle[]>(`${this.apiUrl}/raffles?status=OPEN`).pipe(
      switchMap((raffles) => {
        if (raffles.length === 0) {
          return throwError(() => new Error('NO_OPEN_RAFFLE'));
        }
        const currentRaffle = raffles[0];

        return this.http
          .get<Registration[]>(
            `${this.apiUrl}/registrations?raffleId=${currentRaffle.id}`
          )
          .pipe(
            switchMap((registrations) => {
              if (registrations.length === 0) {
                return throwError(() => new Error('NO_REGISTRATIONS'));
              }

              const shuffled = this.fisherYatesShuffle(registrations);

              const winners = shuffled.slice(0, currentRaffle.totalSpots);

              const tasks: Observable<any>[] = [];

              winners.forEach((winner) => {
                tasks.push(
                  this.http.patch(`${this.apiUrl}/registrations/${winner.id}`, {
                    isWinner: true,
                  })
                );
              });

              tasks.push(
                this.http.patch(`${this.apiUrl}/raffles/${currentRaffle.id}`, {
                  status: 'CLOSED',
                })
              );

              return forkJoin(tasks);
            })
          );
      })
    );
  }

  registerResident(userId: string, raffleId: string): Observable<Registration> {
    const newRegistration = {
      userId: userId,
      raffleId: raffleId,
      registrationDate: new Date().toISOString(),
      isWinner: false,
    };
    return this.http.post<Registration>(
      `${this.apiUrl}/registrations`,
      newRegistration
    );
  }

  getRegistrationHistory(
    userId: string | number
  ): Observable<RegistrationWithRaffle[]> {
    return this.http.get<RegistrationWithRaffle[]>(
      `${this.apiUrl}/registrations?userId=${userId}&_expand=raffle&_sort=registrationDate&_order=desc`
    );
  }

  checkRegistration(userId: string, raffleId: string): Observable<boolean> {
    return this.http
      .get<Registration[]>(
        `${this.apiUrl}/registrations?userId=${userId}&raffleId=${raffleId}`
      )
      .pipe(map((regs) => regs.length > 0));
  }

  /**
   * Standard unbiased shuffling algorithm
   */
  private fisherYatesShuffle<T>(users: T[]): T[] {
    const shuffled = [...users];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
