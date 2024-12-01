import AuthenticatingConcept from "./concepts/authenticating";
import DeadliningConcept from "./concepts/deadlining";
import DependingConcept from "./concepts/depending";
import FriendingConcept from "./concepts/friending";
import GroupItemConcept from "./concepts/grouping";
import NotifyingConcept from "./concepts/notifying";
import PostingConcept from "./concepts/posting";
import ProjectConcept from "./concepts/projects";
import SessioningConcept from "./concepts/sessioning";
import TaskingConcept from "./concepts/tasking";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("posts");
export const Friending = new FriendingConcept("friends");
export const Depending = new DependingConcept("dependencies");
export const Notifying = new NotifyingConcept("notifications");
export const Deadlining = new DeadliningConcept("deadlines");

export const Project = new ProjectConcept("projects");
export const ProjectMember = new GroupItemConcept("projectmembers");

// task stores description, associated project, and completion
export const Task = new TaskingConcept("tasks");
