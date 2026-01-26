import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FatigoonService {
	private http = inject(HttpClient);
	private apiUrl = 'http://localhost:8080/v1';

	getUserByUsername(username: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/users/by-username/${username}`);
	}

	// Récupère les détails d'une guilde (ID en string pour la précision)
	getGuildById(guildId: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/guilds/${guildId}`);
	}

	// Récupère plusieurs guildes en parallèle
	getGuildsByIds(ids: string[]): Observable<any[]> {
		if (!ids || ids.length === 0) return of([]);
		// Liste de requêtes
		const requests = ids.map(id => this.getGuildById(id.toString()));
		return forkJoin(requests);
	}

	// Utilitaires de style
	getInitials(name: string): string {
		if (!name) return '??';
		return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
	}

	getAvatarColor(name: string): string {
		const colors = ['#5865f2', '#ed4245', '#3ba55c', '#faa61a', '#eb459e'];
		let hash = 0;
		for (let i = 0; i < (name?.length || 0); i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
		return colors[Math.abs(hash) % colors.length];
	}
}