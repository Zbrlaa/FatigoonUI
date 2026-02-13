import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { User } from '../models/user.model';
import { Guild } from '../models/guild.model';
import { Invitation } from '../models/invitation.model';
import { Role } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class FatigoonService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/v1';

  // --- Users ---
  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/by-username/${username}`);
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

  // --- Guilds ---
  getGuildById(guildId: string): Observable<Guild> {
    return this.http.get<Guild>(`${this.apiUrl}/guilds/${guildId}`);
  }

  // --- Invitations ---
  getInvitations(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.apiUrl}/invitations`);
  }

  getInvitationById(id: number): Observable<Invitation> {
    return this.http.get<Invitation>(`${this.apiUrl}/invitations/${id}`);
  }

  createInvitation(guildId: string, discordCode: string): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.apiUrl}/invitations`, { guildId, discordCode });
  }

  deleteInvitation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/invitations/${id}`);
  }

  addRoleToInvitation(invitationId: number, roleId: string): Observable<Invitation> {
    return this.http.put<Invitation>(`${this.apiUrl}/invitations/${invitationId}/roles/${roleId}`, {});
  }

  removeRoleFromInvitation(invitationId: number, roleId: string): Observable<Invitation> {
    return this.http.delete<Invitation>(`${this.apiUrl}/invitations/${invitationId}/roles/${roleId}`);
  }

  // --- Roles ---
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  getRoleById(roleId: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/roles/${roleId}`);
  }

  // Utilitaires
  getInitials(name?: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getAvatarColor(name?: string): string {
    const colors = ['#5865f2', '#ed4245', '#095f24', '#faa61a', '#eb459e'];
    let hash = 0;
    if (name) {
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}