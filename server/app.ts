import AuthenticatingConcept from "./concepts/authenticating";
import DeadliningConcept from "./concepts/deadlining";
import DependingConcept from "./concepts/depending";
import GroupItemConcept from "./concepts/grouping";
import NotifyingConcept from "./concepts/notifying";
import ProjectConcept from "./concepts/projects";
import RewardingConcept from "./concepts/rewarding";
import SessioningConcept from "./concepts/sessioning";
import TaskingConcept from "./concepts/tasking";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Depending = new DependingConcept("dependencies");
export const Notifying = new NotifyingConcept("notifications");
export const Deadlining = new DeadliningConcept("deadlines");
export const Rewarding = new RewardingConcept("rewards");

export const Project = new ProjectConcept("projects");
export const ProjectMember = new GroupItemConcept("projectmembers");

// task stores description, associated project, and completion
export const Task = new TaskingConcept("tasks");
