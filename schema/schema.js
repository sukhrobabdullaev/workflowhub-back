import { gql } from "graphql-tag";

export const typeDefs = gql`
  type TeamMember {
    name: String!
    avatar: String
  }

  type Project {
    id: ID!
    title: String!
    description: String
    status: ProjectStatus!
    progress: Int!
    team: [TeamMember!]!
    dueDate: String
    daysRemaining: Int
    taskCount: Int
    completedTaskCount: Int
    tasks: [Task!]
    createdAt: String!
    updatedAt: String!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    priority: Priority!
    assignee: TeamMember!
    projectId: ID!
    project: Project
    dueDate: String
    daysRemaining: Int
    estimatedHours: Int
    actualHours: Int!
    tags: [String!]
    completionPercentage: Int!
    createdAt: String!
    updatedAt: String!
  }

  enum ProjectStatus {
    planning
    active
    completed
    on_hold
  }

  enum TaskStatus {
    todo
    in_progress
    done
  }

  enum Priority {
    low
    medium
    high
  }

  input TeamMemberInput {
    name: String!
    avatar: String
  }

  input ProjectInput {
    title: String!
    description: String
    status: ProjectStatus
    progress: Int
    team: [TeamMemberInput!]
    dueDate: String
  }

  input TaskInput {
    title: String!
    description: String
    status: TaskStatus
    priority: Priority
    assignee: TeamMemberInput!
    projectId: ID!
    dueDate: String
    estimatedHours: Int
    actualHours: Int
    tags: [String!]
  }

  input ProjectUpdateInput {
    title: String
    description: String
    status: ProjectStatus
    progress: Int
    team: [TeamMemberInput!]
    dueDate: String
  }

  input TaskUpdateInput {
    title: String
    description: String
    status: TaskStatus
    priority: Priority
    assignee: TeamMemberInput
    dueDate: String
    estimatedHours: Int
    actualHours: Int
    tags: [String!]
  }

  type Query {
    # Project queries
    projects(
      status: ProjectStatus
      limit: Int
      offset: Int
      sortBy: String
      sortOrder: String
    ): [Project!]!
    project(id: ID!): Project
    projectByStatus(status: ProjectStatus!): [Project!]!

    # Task queries
    tasks(
      projectId: ID
      status: TaskStatus
      priority: Priority
      assignee: String
      limit: Int
      offset: Int
      sortBy: String
      sortOrder: String
    ): [Task!]!
    task(id: ID!): Task
    tasksByProject(projectId: ID!): [Task!]!
    tasksByAssignee(assignee: String!): [Task!]!

    # Dashboard queries
    dashboardStats: DashboardStats!
  }

  type Mutation {
    # Project mutations
    createProject(input: ProjectInput!): Project!
    updateProject(id: ID!, input: ProjectUpdateInput!): Project!
    deleteProject(id: ID!): Boolean!

    # Task mutations
    createTask(input: TaskInput!): Task!
    updateTask(id: ID!, input: TaskUpdateInput!): Task!
    deleteTask(id: ID!): Boolean!

    # Bulk operations
    bulkUpdateTaskStatus(taskIds: [ID!]!, status: TaskStatus!): [Task!]!
  }

  type DashboardStats {
    totalProjects: Int!
    totalTasks: Int!
    completedTasks: Int!
    activeProjects: Int!
    overdueTasks: Int!
    projectsByStatus: [StatusCount!]!
    tasksByStatus: [StatusCount!]!
    tasksByPriority: [PriorityCount!]!
  }

  type StatusCount {
    status: String!
    count: Int!
  }

  type PriorityCount {
    priority: String!
    count: Int!
  }
`;
