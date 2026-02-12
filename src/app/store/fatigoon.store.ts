import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { FatigoonService } from '../services/fatigoon.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, forkJoin, of, tap, map } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { User } from '../models/user.model';
import { Guild } from '../models/guild.model';

export const FatigoonStore = signalStore(
  { providedIn: 'root' },

  withState({
    currentUser: null as User | null,
    userGuilds: [] as Guild[],
    isLoading: false,
    error: null as string | null,
  }),

  withComputed(({ currentUser, userGuilds }) => ({
    ownedGuilds: computed(() =>
      userGuilds().filter(g => g.ownerId === currentUser()?.id)
    ),

    memberGuilds: computed(() =>
      userGuilds().filter(g => g.ownerId !== currentUser()?.id)
    ),
  })),

  withMethods((store, service = inject(FatigoonService)) => ({
    login: rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, { isLoading: true, error: null })
        ),

        switchMap(username =>
          service.getUserByUsername(username).pipe(

            switchMap(user => {
              const allIds = [
                ...(user.guildIds ?? []),
                ...(user.ownedGuildIds ?? []),
              ];

              if (allIds.length === 0) {
                return of({ user, guilds: [] });
              }

              return forkJoin(
                allIds.map(id => service.getGuildById(id))
              ).pipe(
                map(guilds => ({ user, guilds }))
              );
            }),

            tapResponse({
              next: ({ user, guilds }) => {
                patchState(store, {
                  currentUser: user,
                  userGuilds: guilds,
                  isLoading: false,
                });
              },
              error: (err) => {
                console.error(err);
                patchState(store, {
                  error: 'Erreur lors de la connexion ou du chargement des serveurs',
                  isLoading: false,
                });
              },
            })
          )
        )
      )
    ),
  }))
);