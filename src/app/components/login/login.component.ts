import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FatigoonStore } from '../../store/fatigoon.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
//   styleUrl: './login.component.css'
})
export class LoginComponent {
  readonly store = inject(FatigoonStore);
  private router = inject(Router);

  username = signal('');

  onLogin(): void {
    const value = this.username().trim();
    if (value) {
      this.store.login(value);
      this.router.navigate(['/']);
    }
  }
}