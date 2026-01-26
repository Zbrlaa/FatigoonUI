import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FatigoonService } from '../../services/fatigoon.service';

@Component({
	selector: 'app-user-detail',
	standalone: true,
	imports: [CommonModule],
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
			console.log(`Fetching data for user: ${username}`);
			this.fatigoonService.getUserByUsername(username).subscribe(u => {
				this.user = u;
				console.log('User data:', u);
				// this.fatigoonService.getUserGuilds(u.id).subscribe(guilds => {
				// 	this.ownerGuilds = guilds.filter(g => g.ownerId === u.id);
				// 	this.memberGuilds = guilds.filter(g => g.ownerId !== u.id);
				// });
			});
		}
	}
}