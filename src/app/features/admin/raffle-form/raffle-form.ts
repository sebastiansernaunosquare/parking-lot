import { Component, ElementRef, inject, signal, viewChild, output, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RaffleService } from '../../../core/services/raffle'

declare var bootstrap: any;

@Component({
  selector: 'app-raffle-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './raffle-form.html',
  styleUrl: './raffle-form.css',
})
export class RaffleForm implements AfterViewInit {
  raffleCreated = output<void>();
  modalElement = viewChild.required<ElementRef>('modalElement');

  private fb = inject(FormBuilder);
  private raffleService = inject(RaffleService);
  private modalInstance: any;

  isLoading = signal(false);

  raffleForm = this.fb.group({
    period: ['', Validators.required],
    totalSpots: [10, [Validators.required, Validators.min(1)]],
  });

  get periodControl() {
    return this.raffleForm.get('period');
  }
  get spotsControl() {
    return this.raffleForm.get('totalSpots');
  }

  ngAfterViewInit() {
    const el = this.modalElement().nativeElement;
    this.modalInstance = new bootstrap.Modal(el);
  }

  openModal() {
    this.raffleForm.reset({ totalSpots: 10 });
    this.modalInstance.show();
  }

  onSubmit() {
    if (this.raffleForm.invalid) return;

    this.isLoading.set(true);

    const formData = this.raffleForm.value as {
      period: string;
      totalSpots: number;
    };

    this.raffleService.createRaffle(formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.modalInstance.hide();
        this.raffleCreated.emit();
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        alert('Failed to create raffle.');
      },
    });
  }
}
