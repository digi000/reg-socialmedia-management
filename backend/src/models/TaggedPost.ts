export interface TaggedPost {
  id: string;
  socialAccountId: string; // References SocialAccount
  employeeId: string;      // References Employee
  platformPostId: string;  // Original post ID on Instagram/Facebook
  platform: 'instagram' | 'facebook'; // 'instagram' or 'facebook'
  postUrl: string;         // Direct link to the post
  content?: string;        // Optional: post text/content
  mediaType: string;       // 'image', 'video', 'carousel', etc.
  taggedAt: Date;          // When the employee was tagged
  engagement: {            // Basic engagement metrics
    likes: number;
    comments: number;
  };
  postOwner: string;       // Username of person who created the post
  createdAt: Date;         // When we stored this record
}
