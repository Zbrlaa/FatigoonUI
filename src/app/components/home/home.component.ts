import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FatigoonService } from '../../services/fatigoon.service';
import { FatigoonStore } from '../../store/fatigoon.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
//   styleUrl: './home.component.css'
})
export class HomeComponent {
  readonly store = inject(FatigoonStore);
  private service = inject(FatigoonService);

  getInitials(name?: string) { return this.service.getInitials(name); }
  getBg(name?: string) { return this.service.getAvatarColor(name); }
}