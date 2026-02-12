import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FatigoonService } from '../../services/fatigoon.service';
import { FatigoonStore } from '../../store/fatigoon.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
//   styleUrl: './home.component.css'
})
export class HomeComponent {
  readonly store = inject(FatigoonStore);
  private service = inject(FatigoonService);
  private router = inject(Router);

  // Computed signals pour catégoriser les serveurs
  readonly ownedGuilds$ = computed(() => {
    const currentUser = this.store.currentUser();
    if (!currentUser) return [];
    return this.store.userGuilds().filter(g => g.ownerId === currentUser.id);
  });

  readonly joinedGuilds$ = computed(() => {
    const currentUser = this.store.currentUser();
    if (!currentUser) return [];
    return this.store.userGuilds().filter(g => g.ownerId !== currentUser.id);
  });

  getInitials(name?: string) { return this.service.getInitials(name); }
  getBg(name?: string) { return this.service.getAvatarColor(name); }

  goToPrint() { this.router.navigateByUrl('/print'); }
}