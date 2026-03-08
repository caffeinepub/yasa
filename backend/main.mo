import Time "mo:core/Time";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserId = Principal;
  type PostId = Text;
  type MediaId = Text;
  type StoryId = Text;
  type CommentId = Text;
  type NotificationId = Text;
  type ReportId = Text;
  type MessageId = Text;

  type Visibility = {
    #pub;
    #priv;
  };

  public type UserProfile = {
    username : Text;
    bio : Text;
    profilePhoto : ?Storage.ExternalBlob;
    visibility : Visibility;
    followers : [UserId];
    following : [UserId];
  };

  public type Post = {
    id : PostId;
    author : UserId;
    content : Text;
    timestamp : Int;
    media : [Storage.ExternalBlob];
    likes : [UserId];
    comments : [Comment];
    visibility : Visibility;
  };

  public type Comment = {
    id : CommentId;
    author : UserId;
    content : Text;
    timestamp : Int;
  };

  public type Story = {
    id : StoryId;
    author : UserId;
    media : Storage.ExternalBlob;
    timestamp : Int;
    expiresAt : Int;
  };

  public type Notification = {
    id : NotificationId;
    userId : UserId;
    content : Text;
    isRead : Bool;
    timestamp : Int;
  };

  public type Report = {
    id : ReportId;
    reporter : UserId;
    reportedUser : ?UserId;
    reportedPost : ?PostId;
    reason : Text;
    timestamp : Int;
  };

  public type Message = {
    id : MessageId;
    sender : UserId;
    recipient : UserId;
    content : Text;
    timestamp : Int;
    isRead : Bool;
  };

  let userProfiles = Map.empty<UserId, UserProfile>();
  let posts = Map.empty<PostId, Post>();
  let stories = Map.empty<UserId, List.List<Story>>();
  let notifications = Map.empty<UserId, List.List<Notification>>();
  let reports = Map.empty<ReportId, Report>();
  let messages = Map.empty<Text, List.List<Message>>();

  func comparePostsByTimestamp(p1 : Post, p2 : Post) : Order.Order {
    Int.compare(p2.timestamp, p1.timestamp);
  };

  func compareStoriesByTimestamp(s1 : Story, s2 : Story) : Order.Order {
    Int.compare(s2.timestamp, s1.timestamp);
  };

  func isFollowing(follower : UserId, target : UserId) : Bool {
    switch (userProfiles.get(follower)) {
      case (null) { false };
      case (?profile) {
        switch (profile.following.values().find(func(id) { id == target })) {
          case (null) { false };
          case (?_) { true };
        };
      };
    };
  };

  func canViewProfile(viewer : UserId, profileOwner : UserId) : Bool {
    if (viewer == profileOwner) {
      return true;
    };
    switch (userProfiles.get(profileOwner)) {
      case (null) { false };
      case (?profile) {
        profile.visibility == #pub or isFollowing(viewer, profileOwner);
      };
    };
  };

  func canViewPost(viewer : UserId, post : Post) : Bool {
    if (post.author == viewer) {
      return true;
    };
    if (post.visibility == #pub) {
      return true;
    };
    isFollowing(viewer, post.author);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : UserId) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    if (not canViewProfile(caller, user)) {
      Runtime.trap("Unauthorized: Cannot view private profile");
    };

    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func generateId() : Text {
    let timestamp = Time.now().toText();
    timestamp;
  };

  public shared ({ caller }) func createPost(content : Text, media : [Storage.ExternalBlob], visibility : Visibility) : async PostId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let postId = generateId();
    let newPost : Post = {
      id = postId;
      author = caller;
      content;
      timestamp = Time.now();
      media;
      likes = [];
      comments = [];
      visibility;
    };
    posts.add(postId, newPost);
    postId;
  };

  public query ({ caller }) func getPublicPosts() : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };

    posts.values().toArray().filter(
      func(post) {
        canViewPost(caller, post);
      }
    ).sort(
      comparePostsByTimestamp
    );
  };

  public shared ({ caller }) func likePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    if (not canViewPost(caller, post)) {
      Runtime.trap("Unauthorized: Cannot like this post");
    };

    let filteredLikes = post.likes.filter(
      func(userId) {
        userId != caller;
      }
    );
    let updatedLikes = filteredLikes.concat([caller]);
    let updatedPost = { post with likes = updatedLikes };
    posts.add(postId, updatedPost);
  };

  public shared ({ caller }) func commentOnPost(postId : PostId, content : Text) : async CommentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment on posts");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    if (not canViewPost(caller, post)) {
      Runtime.trap("Unauthorized: Cannot comment on this post");
    };

    let commentId = generateId();
    let newComment : Comment = {
      id = commentId;
      author = caller;
      content;
      timestamp = Time.now();
    };
    let updatedComments = post.comments.concat([newComment]);
    let updatedPost = { post with comments = updatedComments };
    posts.add(postId, updatedPost);
    commentId;
  };

  public shared ({ caller }) func createStory(media : Storage.ExternalBlob) : async StoryId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create stories");
    };

    let storyId = generateId();
    let newStory : Story = {
      id = storyId;
      author = caller;
      media;
      timestamp = Time.now();
      expiresAt = Time.now() + 86400000000;
    };

    switch (stories.get(caller)) {
      case (null) {
        let newList = List.empty<Story>();
        newList.add(newStory);
        stories.add(caller, newList);
      };
      case (?userStories) {
        userStories.add(newStory);
        stories.add(caller, userStories);
      };
    };
    storyId;
  };

  public query ({ caller }) func getUserStories(userId : UserId) : async [Story] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stories");
    };

    if (caller != userId and not isFollowing(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view stories of users you follow");
    };

    switch (stories.get(userId)) {
      case (null) { [] };
      case (?userStories) {
        userStories.toArray().filter(
          func(story) {
            story.expiresAt > Time.now();
          }
        ).sort(compareStoriesByTimestamp);
      };
    };
  };

  public query ({ caller }) func searchUsers(searchTerm : Text) : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search for other users");
    };

    userProfiles.values().toArray().filter(
      func(profile) {
        profile.username.contains(#text searchTerm) and profile.visibility == #pub;
      }
    );
  };

  public shared ({ caller }) func reportContent(
    reportedUser : ?UserId,
    reportedPost : ?PostId,
    reason : Text,
  ) : async ReportId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can report content");
    };

    let reportId = generateId();
    let newReport : Report = {
      id = reportId;
      reporter = caller;
      reportedUser;
      reportedPost;
      reason;
      timestamp = Time.now();
    };
    reports.add(reportId, newReport);
    reportId;
  };

  public query ({ caller }) func getReports() : async [Report] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view reports");
    };
    reports.values().toArray();
  };

  public shared ({ caller }) func deletePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete posts");
    };
    posts.remove(postId);
  };

  public shared ({ caller }) func followUser(targetUser : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow other users");
    };

    if (caller == targetUser) {
      Runtime.trap("Cannot follow yourself");
    };

    let currentUser = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user };
    };
    let target = switch (userProfiles.get(targetUser)) {
      case (null) { Runtime.trap("Target user not found") };
      case (?user) { user };
    };

    let updatedFollowers = switch (target.followers.values().find(func(id) { id == caller })) {
      case (null) { target.followers.concat([caller]) };
      case (?_) { target.followers };
    };

    let updatedTarget = { target with followers = updatedFollowers };

    let updatedFollowing = switch (currentUser.following.values().find(func(id) { id == targetUser })) {
      case (null) { currentUser.following.concat([targetUser]) };
      case (?_) { currentUser.following };
    };

    let updatedCurrentUser = { currentUser with following = updatedFollowing };

    userProfiles.add(targetUser, updatedTarget);
    userProfiles.add(caller, updatedCurrentUser);
  };

  public shared ({ caller }) func unfollowUser(targetUser : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow other users");
    };

    if (caller == targetUser) {
      return;
    };

    let currentUser = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user };
    };
    let target = switch (userProfiles.get(targetUser)) {
      case (null) { Runtime.trap("Target user not found") };
      case (?user) { user };
    };

    let updatedFollowers = target.followers.filter(func(id) { id != caller });
    let updatedTarget = { target with followers = updatedFollowers };

    let updatedFollowing = currentUser.following.filter(func(id) { id != targetUser });
    let updatedCurrentUser = { currentUser with following = updatedFollowing };

    userProfiles.add(targetUser, updatedTarget);
    userProfiles.add(caller, updatedCurrentUser);
  };

  public query ({ caller }) func getFollowers(userId : UserId) : async [UserId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view followers");
    };

    if (not canViewProfile(caller, userId)) {
      Runtime.trap("Unauthorized: Cannot view followers of private profile");
    };

    switch (userProfiles.get(userId)) {
      case (null) { [] };
      case (?user) { user.followers };
    };
  };

  public query ({ caller }) func getFollowing(userId : UserId) : async [UserId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view following list");
    };

    if (not canViewProfile(caller, userId)) {
      Runtime.trap("Unauthorized: Cannot view following list of private profile");
    };

    switch (userProfiles.get(userId)) {
      case (null) { [] };
      case (?user) { user.following };
    };
  };

  public shared ({ caller }) func sendMessage(recipient : UserId, content : Text) : async MessageId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (caller == recipient) {
      Runtime.trap("Cannot send message to yourself");
    };

    let messageId = generateId();
    let newMessage : Message = {
      id = messageId;
      sender = caller;
      recipient;
      content;
      timestamp = Time.now();
      isRead = false;
    };

    let key = caller.toText() # "_" # recipient.toText();
    switch (messages.get(key)) {
      case (null) {
        let newList = List.empty<Message>();
        newList.add(newMessage);
        messages.add(key, newList);
      };
      case (?messageList) {
        messageList.add(newMessage);
        messages.add(key, messageList);
      };
    };
    messageId;
  };

  public query ({ caller }) func getMessages(otherUser : UserId) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    let sentKey = caller.toText() # "_" # otherUser.toText();
    let receivedKey = otherUser.toText() # "_" # caller.toText();

    let sentMessages = switch (messages.get(sentKey)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };

    let receivedMessages = switch (messages.get(receivedKey)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };

    let allMessages = sentMessages.concat(receivedMessages);
    allMessages.sort(func(m1, m2) { Int.compare(m1.timestamp, m2.timestamp) });
  };

  public shared ({ caller }) func markMessageAsRead(messageId : MessageId, sender : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark messages as read");
    };

    let key = sender.toText() # "_" # caller.toText();
    switch (messages.get(key)) {
      case (null) { Runtime.trap("Message not found") };
      case (?messageList) {
        let updatedMessages = messageList.toArray().map(
          func(msg : Message) : Message {
            if (msg.id == messageId and msg.recipient == caller) {
              { msg with isRead = true };
            } else {
              msg;
            };
          }
        );
        let newList = List.empty<Message>();
        for (msg in updatedMessages.values()) {
          newList.add(msg);
        };
        messages.add(key, newList);
      };
    };
  };

  public shared ({ caller }) func createNotification(userId : UserId, content : Text) : async NotificationId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create notifications");
    };

    let notificationId = generateId();
    let newNotification : Notification = {
      id = notificationId;
      userId;
      content;
      isRead = false;
      timestamp = Time.now();
    };

    switch (notifications.get(userId)) {
      case (null) {
        let newList = List.empty<Notification>();
        newList.add(newNotification);
        notifications.add(userId, newList);
      };
      case (?notificationList) {
        notificationList.add(newNotification);
        notifications.add(userId, notificationList);
      };
    };
    notificationId;
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?notificationList) {
        notificationList.toArray().sort(func(n1, n2) { Int.compare(n2.timestamp, n1.timestamp) });
      };
    };
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : NotificationId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    switch (notifications.get(caller)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notificationList) {
        let updatedNotifications = notificationList.toArray().map(
          func(notif : Notification) : Notification {
            if (notif.id == notificationId and notif.userId == caller) {
              { notif with isRead = true };
            } else {
              notif;
            };
          }
        );
        let newList = List.empty<Notification>();
        for (notif in updatedNotifications.values()) {
          newList.add(notif);
        };
        notifications.add(caller, newList);
      };
    };
  };
};
