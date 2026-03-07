import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Bool "mo:core/Bool";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  /// Types

  type SiteContentKey = Text;
  type CategoryId = Text;
  type VideoId = Text;

  public type SiteContent = {
    key : SiteContentKey;
    value : Text;
  };

  public type Category = {
    id : CategoryId;
    name : Text;
    order : Nat;
    createdAt : Int;
  };

  public type Video = {
    id : VideoId;
    title : Text;
    description : Text;
    categoryId : CategoryId;
    isYoutube : Bool;
    youtubeUrl : ?Text;
    blobId : ?Text;
    thumbnailBlobId : ?Text;
    featured : Bool;
    order : Nat;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  module Video {
    public func compare(video1 : Video, video2 : Video) : Order.Order {
      switch (Int.compare(video1.createdAt, video2.createdAt)) {
        case (#equal) { Text.compare(video1.id, video2.id) };
        case (order) { order };
      };
    };
  };

  module Category {
    public func compare(category1 : Category, category2 : Category) : Order.Order {
      switch (Int.compare(category1.createdAt, category2.createdAt)) {
        case (#equal) { Text.compare(category1.id, category2.id) };
        case (order) { order };
      };
    };
  };

  /// Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  /// Blob Storage
  include MixinStorage();

  /// Persistent State
  let siteContent = Map.empty<SiteContentKey, SiteContent>();
  let categories = Map.empty<Text, Category>();
  let videos = Map.empty<Text, Video>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  /// User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  /// Site Content CRUD (Admin-only Write)
  public shared ({ caller }) func setSiteContent(key : Text, value : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set site content");
    };

    let content = { key; value };
    siteContent.add(key, content);
  };

  public query func getSiteContent(key : Text) : async ?SiteContent {
    siteContent.get(key);
  };

  public query func getAllSiteContent() : async [SiteContent] {
    siteContent.values().toArray();
  };

  /// Category CRUD (Admin-only Write)
  public shared ({ caller }) func createCategory(id : Text, name : Text, order : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };

    let newCategory : Category = {
      id;
      name;
      order;
      createdAt = Time.now();
    };

    categories.add(id, newCategory);
  };

  public shared ({ caller }) func updateCategory(id : Text, name : Text, order : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };

    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?existing) {
        let updatedCategory : Category = {
          id;
          name;
          order;
          createdAt = existing.createdAt;
        };
        categories.add(id, updatedCategory);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };

    categories.remove(id);
  };

  public query func getCategory(id : Text) : async ?Category {
    categories.get(id);
  };

  public query func getAllCategories() : async [Category] {
    categories.values().toArray().sort();
  };

  /// Video CRUD (Admin-only Write)
  public shared ({ caller }) func createVideo(
    id : Text,
    title : Text,
    description : Text,
    categoryId : Text,
    isYoutube : Bool,
    youtubeUrl : ?Text,
    blobId : ?Text,
    thumbnailBlobId : ?Text,
    featured : Bool,
    order : Nat,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create videos");
    };

    let newVideo : Video = {
      id;
      title;
      description;
      categoryId;
      isYoutube;
      youtubeUrl;
      blobId;
      thumbnailBlobId;
      featured;
      order;
      createdAt = Time.now();
    };

    videos.add(id, newVideo);
  };

  public shared ({ caller }) func updateVideo(
    id : Text,
    title : Text,
    description : Text,
    categoryId : Text,
    isYoutube : Bool,
    youtubeUrl : ?Text,
    blobId : ?Text,
    thumbnailBlobId : ?Text,
    featured : Bool,
    order : Nat,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update videos");
    };

    switch (videos.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?existing) {
        let updatedVideo : Video = {
          id;
          title;
          description;
          categoryId;
          isYoutube;
          youtubeUrl;
          blobId;
          thumbnailBlobId;
          featured;
          order;
          createdAt = existing.createdAt;
        };
        videos.add(id, updatedVideo);
      };
    };
  };

  public shared ({ caller }) func deleteVideo(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete videos");
    };

    videos.remove(id);
  };

  public query func getVideo(id : Text) : async ?Video {
    videos.get(id);
  };

  public query func getAllVideos() : async [Video] {
    videos.values().toArray().sort();
  };

  public query func getVideosByCategory(categoryId : Text) : async [Video] {
    videos.values().toArray().sort().filter(func(v) { v.categoryId == categoryId });
  };

  /// Init with Default Data
  public shared ({ caller }) func initialize() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can initialize");
    };

    // Default Site Content
    siteContent.add("siteTitle", { key = "siteTitle"; value = "Dominykas Video Editor Portfolio" });
    siteContent.add("siteDescription", { key = "siteDescription"; value = "Welcome to my portfolio site, featuring my best work as a video editor." });
    siteContent.add("heroTitle", { key = "heroTitle"; value = "Transforming Vision Into Reality" });
    siteContent.add("heroSubtitle", { key = "heroSubtitle"; value = "Professional Video Editing Services" });

    // Default Categories
    let timestamp = Time.now();
    categories.add("youtube-edits", { id = "youtube-edits"; name = "YouTube Edits"; order = 1; createdAt = timestamp });
    categories.add("short-form-content", { id = "short-form-content"; name = "Short Form Content"; order = 2; createdAt = timestamp });
    categories.add("cinematic-edits", { id = "cinematic-edits"; name = "Cinematic Edits"; order = 3; createdAt = timestamp });
    categories.add("motion-graphics", { id = "motion-graphics"; name = "Motion Graphics"; order = 4; createdAt = timestamp });
  };
};
