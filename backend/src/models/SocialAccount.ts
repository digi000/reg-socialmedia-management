export interface SocialAccount {
  id: string;
  platform: 'instagram' | 'facebook';
  platformUserId: string;
  accessToken: string;
  refreshToken: string;
  username: string;
  isActive: boolean;
  lastSynced: Date;
}
