export interface Invitation {
  id: number;
  discordCode: string;
  guildId: string;
  roleIds: string[];
}