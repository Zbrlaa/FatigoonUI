import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import requis
import { FatigoonService } from '../../services/fatigoon.service';

@Component({
	selector: 'app-user-detail',
	standalone: true,
	imports: [CommonModule], // Ajoutez CommonModule ici
	templateUrl: './user-detail.component.html'
})
export class UserDetailComponent implements OnInit {
	private route = inject(ActivatedRoute);
	protected fatigoonService = inject(FatigoonService);

	user: any;
	ownerGuilds: any[] = [];
	memberGuilds: any[] = [];

	ngOnInit() {
		const username = this.route.snapshot.paramMap.get('username');
		if (username) {
			this.fatigoonService.getUserByUsername(username).subscribe({
				next: (userData) => {
					this.user = userData;
					this.loadGuildsData();
				},
				error: (err) => console.error("Erreur User:", err)
			});
		}
	}

	loadGuildsData() {
		// Note: les IDs sont maintenant des strings grâce à votre modification backend
		if (this.user.ownedGuildIds?.length > 0) {
			this.fatigoonService.getGuildsByIds(this.user.ownedGuildIds).subscribe(data => {
				this.ownerGuilds = data;
			});
		}

		const otherGuildIds = this.user.guildIds?.filter(
			(id: string) => !this.user.ownedGuildIds?.includes(id)
		);

		if (otherGuildIds?.length > 0) {
			this.fatigoonService.getGuildsByIds(otherGuildIds).subscribe(data => {
				this.memberGuilds = data;
			});
		}
	}
}