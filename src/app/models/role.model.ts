export interface Role {
  id: string;
  name: string;
  permissions: string;
  guildId: string;
  userIds: string[];
  accessibleChannelIds: string[];
  invitationIds: string[];
}