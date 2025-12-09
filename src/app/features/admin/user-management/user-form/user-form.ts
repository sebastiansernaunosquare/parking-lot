import {
  Component,
  input,
  output,
  OnChanges,
  SimpleChanges,
  inject,
  ElementRef,
  viewChild,
  signal,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user';

declare var bootstrap: any;

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm implements OnChanges, AfterViewInit {
  userToEdit = input<User | null>();
  saveCompleted = output();

  modalElement = viewChild<ElementRef>('modalElement');

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private modalInstance: any;

  residentForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    unit: ['', Validators.required],
    password: ['', Validators.required],
    role: ['resident'],
  });

  isEditMode = signal(false);
  isLoading = signal(false);

  ngAfterViewInit() {
    this.modalInstance = new bootstrap.Modal(
      this.modalElement()?.nativeElement
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userToEdit']) {
      const user = changes['userToEdit'].currentValue;
      if (user) {
        this.isEditMode.set(true);
        this.residentForm.patchValue(user);
        this.residentForm.get('password')?.clearValidators();
      } else {
        this.isEditMode.set(false);
        // assign a default password
        this.residentForm.reset({ role: 'resident', password: '123' });
      }
    }
  }

  openModal() {
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance.hide();
  }

  onSubmit() {
    if (this.residentForm.invalid) return;

    this.isLoading.set(true);
    const formData = this.residentForm.value;

    const user = this.userToEdit();
    if (this.isEditMode() && user) {
      this.userService.updateUser(user.id, formData).subscribe(() => {
        this.handleSuccess();
      });
    } else {
      this.userService.createUser(formData).subscribe(() => {
        this.handleSuccess();
      });
    }
  }

  onCancel() {
    this.residentForm.reset({ role: 'resident', password: '123' });
  }

  private handleSuccess() {
    this.isLoading.set(false);
    this.closeModal();
    this.saveCompleted.emit();
    this.residentForm.reset({ role: 'resident', password: '123' });
  }

  get nameControl() {
    return this.residentForm.get('name');
  }

  get emailControl() {
    return this.residentForm.get('email');
  }

  get unitControl() {
    return this.residentForm.get('unit');
  }

  get passwordControl() {
    return this.residentForm.get('password');
  }
}
