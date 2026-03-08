import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type CommentId = string;
export interface Comment {
    id: CommentId;
    content: string;
    author: UserId;
    timestamp: bigint;
}
export interface Story {
    id: StoryId;
    media: ExternalBlob;
    expiresAt: bigint;
    author: UserId;
    timestamp: bigint;
}
export type StoryId = string;
export type PostId = string;
export interface Report {
    id: ReportId;
    reportedPost?: PostId;
    reportedUser?: UserId;
    timestamp: bigint;
    reporter: UserId;
    reason: string;
}
export type UserId = Principal;
export type ReportId = string;
export type MessageId = string;
export interface Post {
    id: PostId;
    media: Array<ExternalBlob>;
    content: string;
    author: UserId;
    likes: Array<UserId>;
    timestamp: bigint;
    comments: Array<Comment>;
    visibility: Visibility;
}
export type NotificationId = string;
export interface Notification {
    id: NotificationId;
    content: string;
    userId: UserId;
    isRead: boolean;
    timestamp: bigint;
}
export interface Message {
    id: MessageId;
    content: string;
    recipient: UserId;
    isRead: boolean;
    sender: UserId;
    timestamp: bigint;
}
export interface UserProfile {
    bio: string;
    username: string;
    profilePhoto?: ExternalBlob;
    followers: Array<UserId>;
    following: Array<UserId>;
    visibility: Visibility;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Visibility {
    pub = "pub",
    priv = "priv"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    commentOnPost(postId: PostId, content: string): Promise<CommentId>;
    createNotification(userId: UserId, content: string): Promise<NotificationId>;
    createPost(content: string, media: Array<ExternalBlob>, visibility: Visibility): Promise<PostId>;
    createStory(media: ExternalBlob): Promise<StoryId>;
    deletePost(postId: PostId): Promise<void>;
    followUser(targetUser: UserId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFollowers(userId: UserId): Promise<Array<UserId>>;
    getFollowing(userId: UserId): Promise<Array<UserId>>;
    getMessages(otherUser: UserId): Promise<Array<Message>>;
    getNotifications(): Promise<Array<Notification>>;
    getPublicPosts(): Promise<Array<Post>>;
    getReports(): Promise<Array<Report>>;
    getUserProfile(user: UserId): Promise<UserProfile | null>;
    getUserStories(userId: UserId): Promise<Array<Story>>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: PostId): Promise<void>;
    markMessageAsRead(messageId: MessageId, sender: UserId): Promise<void>;
    markNotificationAsRead(notificationId: NotificationId): Promise<void>;
    reportContent(reportedUser: UserId | null, reportedPost: PostId | null, reason: string): Promise<ReportId>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsers(searchTerm: string): Promise<Array<UserProfile>>;
    sendMessage(recipient: UserId, content: string): Promise<MessageId>;
    unfollowUser(targetUser: UserId): Promise<void>;
}
