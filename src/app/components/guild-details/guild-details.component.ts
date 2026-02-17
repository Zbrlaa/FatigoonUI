import { Component, inject, effect, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FatigoonService } from '../../services/fatigoon.service';
import { FatigoonStore } from '../../store/fatigoon.store';
import { Role } from '../../models/role.model';
import { computed } from '@angular/core';

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

  // Affichage du selecteur de rôles par invitation
  expandedInvitation = new Map<number, boolean>();
  showRoleSelector = new Map<number, boolean>();

  constructor() {
    // Effect pour charger les details du serveur quand la route change
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

  getAvailableRolesForInvitation(invitationId: number): Role[] {
    const invitation = this.store.selectedGuildInvitations().find(inv => inv.id === invitationId);
    if (!invitation) return [];
    
    return this.store.selectedGuildRoles().filter(role => !invitation.roleIds.includes(role.id));
  }

  getInvitationRoles(invitationId: number): Role[] {
    const invitation = this.store.selectedGuildInvitations().find(inv => inv.id === invitationId);
    if (!invitation) return [];
    
    return this.store.selectedGuildRoles().filter(role => invitation.roleIds.includes(role.id));
  }

  deleteInvitation(invitationId: number): void {
    if (confirm('etes-vous sûr de vouloir supprimer cette invitation ?')) {
      this.store.deleteInvitation(invitationId);
    }
  }

  addRoleToInvitation(invitationId: number, roleId: string): void {
    this.store.addRoleToInvitation({ invitationId, roleId });
    this.showRoleSelector.set(invitationId, false);
  }

  removeRoleFromInvitation(invitationId: number, roleId: string): void {
    this.store.removeRoleFromInvitation({ invitationId, roleId });
  }

  toggleRoleSelector(invitationId: number): void {
    this.showRoleSelector.set(invitationId, !this.showRoleSelector.get(invitationId));
  }

  toggleExpanded(invitationId: number): void {
    this.expandedInvitation.set(invitationId, !this.expandedInvitation.get(invitationId));
  }

  isExpanded(invitationId: number): boolean {
    return this.expandedInvitation.get(invitationId) ?? false;
  }

  generateInvitation(): void {
    const guildId = this.store.selectedGuild()?.id;
    if (guildId) {
      this.store.generateInvitation(guildId);
    }
  }

  clearGenerateError(): void {
    this.store.clearGenerateInvitationError();
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

