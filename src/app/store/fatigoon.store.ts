import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { FatigoonService } from '../services/fatigoon.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, forkJoin, of, tap, map } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { User } from '../models/user.model';
import { Guild } from '../models/guild.model';
import { Invitation } from '../models/invitation.model';
import { Role } from '../models/role.model';

export const FatigoonStore = signalStore(
  { providedIn: 'root' },

  withState({
    currentUser: null as User | null,
    userGuilds: [] as Guild[],
    isLoading: false,
    error: null as string | null,
    selectedGuild: null as Guild | null,
    selectedGuildMembers: [] as User[],
    selectedGuildInvitations: [] as Invitation[],
    selectedGuildRoles: [] as Role[],
    selectedGuildLoading: false,
    selectedGuildError: null as string | null,
  }),

  withComputed(({ currentUser, userGuilds, selectedGuild, selectedGuildInvitations, selectedGuildRoles }) => ({
    ownedGuilds: computed(() =>
      userGuilds().filter(g => g.ownerId === currentUser()?.id)
    ),

    memberGuilds: computed(() =>
      userGuilds().filter(g => g.ownerId !== currentUser()?.id)
    ),

    isSelectedGuildOwner: computed(() => {
      const guild = selectedGuild();
      const user = currentUser();
      return guild && user ? guild.ownerId === user.id : false;
    }),

    selectedGuildInvitationsWithRoles: computed(() => {
      const invites = selectedGuildInvitations();
      const roles = selectedGuildRoles();
      return invites.map(inv => ({
        ...inv,
        roles: roles.filter(r => inv.roleIds.includes(r.id))
      }));
    }),
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

    loadGuildDetails: rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, { selectedGuildLoading: true, selectedGuildError: null })
        ),

        switchMap(guildId =>
          service.getGuildById(guildId).pipe(
            switchMap(guild => {
              // Charger les membres, invitations et rôles en parallèle
              return forkJoin({
                members: guild.userIds.length > 0
                  ? forkJoin(guild.userIds.map(id => service.getUserById(id)))
                  : of([]),
                invitations: guild.invitationIds.length > 0
                  ? forkJoin(guild.invitationIds.map(id => service.getInvitationById(parseInt(id, 10))))
                  : of([]),
                roles: guild.roleIds.length > 0
                  ? forkJoin(guild.roleIds.map(id => service.getRoleById(id)))
                  : of([])
              }).pipe(
                map(({ members, invitations, roles }) => ({
                  guild,
                  members,
                  invitations,
                  roles
                }))
              );
            }),

            tapResponse({
              next: ({ guild, members, invitations, roles }) => {
                patchState(store, {
                  selectedGuild: guild,
                  selectedGuildMembers: members,
                  selectedGuildInvitations: invitations,
                  selectedGuildRoles: roles,
                  selectedGuildLoading: false,
                });
              },
              error: (err) => {
                console.error(err);
                patchState(store, {
                  selectedGuildError: 'Erreur lors du chargement des détails du serveur',
                  selectedGuildLoading: false,
                });
              },
            })
          )
        )
      )
    ),

    clearSelectedGuild: () => {
      patchState(store, {
        selectedGuild: null,
        selectedGuildMembers: [],
        selectedGuildInvitations: [],
        selectedGuildRoles: [],
        selectedGuildLoading: false,
        selectedGuildError: null,
      });
    },
  }))
);