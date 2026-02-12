export interface Guild {
  id: string;
  name: string;
  ownerId: string;
  userIds: string[];
  roleIds: string[];
  channelIds: string[];
  invitationIds: string[];
}