import { Component, inject, effect, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FatigoonService } from '../../services/fatigoon.service';
import { FatigoonStore } from '../../store/fatigoon.store';

@Component({
  selector: 'app-guild-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guild-details.component.html',
  styleUrl: './guild-details.component.css'
})
export class GuildDetailsComponent {
  readonly store = inject(FatigoonStore);
  private readonly service = inject(FatigoonService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Effect pour charger les détails du serveur quand la route change
    effect(() => {
      const guildId = this.route.snapshot.paramMap.get('id');
      if (guildId) {
        this.store.loadGuildDetails(guildId);
      }
    });

    // Cleanup quand on quitte le composant
    this.destroyRef.onDestroy(() => {
      this.store.clearSelectedGuild();
    });
  }

  goBack(): void {
    this.store.clearSelectedGuild();
    this.router.navigate(['/']);
  }

  getInitials(name?: string): string {
    return this.service.getInitials(name);
  }

  getAvatarColor(name?: string): string {
    return this.service.getAvatarColor(name);
  }
}

