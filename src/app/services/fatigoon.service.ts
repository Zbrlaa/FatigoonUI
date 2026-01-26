import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FatigoonService {
	private http = inject(HttpClient);
	private apiUrl = 'http://localhost:8080/v1';

	getUserByUsername(username: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/users/by-username/${username}`);
	}

	getUserGuilds(userId: number): Observable<any[]> {
		return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/guilds`);
	}

	// Logique pour les initiales
	getInitials(name: string): string {
		return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
	}

	// Logique pour une couleur aléatoire par serveur
	getAvatarColor(name: string): string {
		const colors = ['#5865f2', '#ed4245', '#3ba55c', '#faa61a', '#eb459e'];
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	}
}