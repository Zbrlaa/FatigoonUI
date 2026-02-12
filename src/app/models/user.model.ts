export interface User {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
  readonly guildIds: string[];
  readonly ownedGuildIds: string[];
  readonly roleIds: string[];
}